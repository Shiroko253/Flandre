require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

// 環境變數
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const OWNER_ID = process.env.OWNER_ID; // 你的 Discord UID

// 建立 Discord client
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

// 指令集合
client.commands = new Collection();

// 讀取指令並註冊
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    // 只註冊有 SlashCommandBuilder 的指令
    if (command.data && typeof command.data.toJSON === 'function') {
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
    }
}

// 註冊 slash commands 到指定 guild
const rest = new REST({ version: '10' }).setToken(TOKEN);
(async () => {
    try {
        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands }
        );
        console.log('Guild 專屬指令已註冊');
    } catch (error) {
        console.error('Guild 指令註冊失敗:', error);
    }
})();

// 讀取事件
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

// 指令執行/權限判斷
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    // ownerOnly 權限判斷
    if (command.ownerOnly) {
        if (interaction.user.id !== OWNER_ID) {
            return await interaction.reply({ content: '只有主人才能使用這個指令！', ephemeral: true });
        }
    }

    try {
        await command.execute(interaction, client);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: '執行指令時發生錯誤！', ephemeral: true });
        } else {
            await interaction.reply({ content: '執行指令時發生錯誤！', ephemeral: true });
        }
    }
});

// 登入
client.login(TOKEN);

// 關閉流程
process.on('SIGINT', () => require('./shutdown')(client));
process.on('SIGTERM', () => require('./shutdown')(client));
