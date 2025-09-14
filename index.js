require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

// ✨ 嘿嘿，先偷偷把祕密環境變數讀進來 ✨
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const OWNER_ID = process.env.OWNER_ID; // 嗯？就是主人的 UID 啦♪

// 🧩 建立 Discord client（intents 要小心設定，不然會炸掉喔）
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent // ← 少了這個就聽不到人說什麼啦！
    ]
});

// 🎀 把指令都收集起來，放進小盒子裡
client.commands = new Collection();

// 📚 現在開始翻 command 資料夾，找到能用的指令～
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const failList = [];

for (const file of commandFiles) {
    try {
        const command = require(`./commands/${file}`);
        // 只挑有 SlashCommandBuilder 的孩子才收
        if (command.data && typeof command.data.toJSON === 'function') {
            client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
        } else {
            // 咦？格式怪怪的，先丟進壞掉清單！
            failList.push({ file, name: command.data?.name || '(未知)' });
        }
    } catch (err) {
        // 讀取爆炸了 (砰！)
        failList.push({ file, name: '(讀取失敗)' });
    }
}

// 🪄 把指令註冊到伺服器裡去，咻～
const rest = new REST({ version: '10' }).setToken(TOKEN);
(async () => {
    try {
        const data = await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands }
        );
        console.log(`成功裝進去 ${data.length}/${commandFiles.length} 個指令了喔！`);
        if (failList.length > 0) {
            console.error('這些小傢伙註冊失敗了：');
            failList.forEach(fail => {
                console.error(`檔案：${fail.file}，名字：${fail.name}`);
            });
        } else {
            console.log('耶～所有指令都乖乖註冊成功了！');
        }
    } catch (error) {
        console.error('啊咧，Guild 註冊 API 爆炸啦:', error);
    }
})();

// 🎉 接下來翻 events 資料夾，把活動也綁好
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

// 🎀 有人戳 slash 指令了！快看快看～
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    // 只有主人才可以用的指令喔，哼哼
    if (command.ownerOnly) {
        if (interaction.user.id !== OWNER_ID) {
            return await interaction.reply({ content: '只有主人才能用這個啦！', ephemeral: true });
        }
    }

    try {
        await command.execute(interaction, client);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: '嗚嗚，剛剛執行指令時爆炸了！', ephemeral: true });
        } else {
            await interaction.reply({ content: '嗚嗚，剛剛執行指令時爆炸了！', ephemeral: true });
        }
    }
});

// 🌙 登入，進去伺服器裡陪大家玩囉！
client.login(TOKEN);

// 🌸 當主人叫我關閉的時候，我就乖乖收尾
process.on('SIGINT', () => require('./shutdown')(client));
process.on('SIGTERM', () => require('./shutdown')(client));
