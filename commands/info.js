const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('芙蘭朵露幫你偷看伺服器或用戶的秘密情報♡')
        .addSubcommand(sub =>
            sub.setName('server')
                .setDescription('查詢伺服器情報'))
        .addSubcommand(sub =>
            sub.setName('user')
                .setDescription('查詢用戶情報')
                .addUserOption(opt =>
                    opt.setName('target')
                        .setDescription('要偷看的小可愛（預設自己）')
                        .setRequired(false))),
    async execute(interaction, client) {
        // -------- 🌸 查詢伺服器資訊 --------
        if (interaction.options.getSubcommand() === 'server') {
            const guild = interaction.guild;
            if (!guild) return await interaction.reply({ content: '只能在伺服器裡用喔！', ephemeral: true });

            const owner = await guild.fetchOwner();
            const botStatus = client.user.presence?.status || '未知';
            const createdAt = `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`;
            const iconURL = guild.iconURL({ dynamic: true, size: 1024 });

            const embed = new EmbedBuilder()
                .setTitle(`🌸 伺服器情報大公開 ♡`)
                .setDescription(
                    `嘿嘿～芙蘭幫你偷看了一下 **${guild.name}** 的情報！\n\n` +
                    `👥 **成員總數**：${guild.memberCount}\n` +
                    `👑 **群主**：${owner.user.tag}\n` +
                    `🗓️ **創建日期**：${createdAt}\n` +
                    `✨ **Nitro 等級**：${guild.premiumTier}\n` +
                    `🔧 **BOT 狀態**：${botStatus}`
                )
                .setColor(0xff3366)
                .setThumbnail(iconURL || client.user.displayAvatarURL())
                .setFooter({ 
                    text: '芙蘭朵露・斯卡蕾特 | 東方Project', 
                    iconURL: client.user.displayAvatarURL() 
                });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('點我偷看伺服器頭像♡')
                    .setStyle(ButtonStyle.Link)
                    .setURL(iconURL || client.user.displayAvatarURL())
            );

            return await interaction.reply({ embeds: [embed], components: [row] });
        }

        // -------- 💖 查詢用戶資訊 --------
        if (interaction.options.getSubcommand() === 'user') {
            const guild = interaction.guild;
            if (!guild) return await interaction.reply({ content: '只能在伺服器裡查用戶唷～', ephemeral: true });

            const target = interaction.options.getUser('target') || interaction.user;
            const member = guild.members.cache.get(target.id) || await guild.members.fetch(target.id);
            const joinedAt = `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`;
            const createdAt = `<t:${Math.floor(target.createdTimestamp / 1000)}:F>`;
            const roles = member.roles.cache
                .filter(role => role.id !== guild.id)
                .map(role => role.toString())
                .join(' ') || '（沒有身分組唷～）';

            const avatarURL = target.displayAvatarURL({ dynamic: true, size: 1024 });

            const embed = new EmbedBuilder()
                .setTitle(`💖 用戶情報♡`)
                .setDescription(
                    `芙蘭幫你偷偷看了一下 **${target.tag}** 的小秘密～！\n\n` +
                    `👤 **用戶**：${target}\n` +
                    `🆔 **ID**：\`${target.id}\`\n` +
                    `🗓️ **加入群組**：${joinedAt}\n` +
                    `🚩 **註冊時間**：${createdAt}\n` +
                    `🎭 **身分組**：${roles}`
                )
                .setColor(0xff3366)
                .setThumbnail(avatarURL)
                .setFooter({ 
                    text: '芙蘭朵露・斯卡蕾特 | 東方Project', 
                    iconURL: client.user.displayAvatarURL() 
                });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('點我看頭像大圖♡')
                    .setStyle(ButtonStyle.Link)
                    .setURL(avatarURL)
            );

            return await interaction.reply({ embeds: [embed], components: [row] });
        }
    }
};
