const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banlist')
        .setDescription('📜 芙蘭朵露來幫你翻出封鎖名單！（僅限管理員）'),
    async execute(interaction) {
        // 🛑 權限檢查
        const member = interaction.guild.members.cache.get(interaction.user.id);
        if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const embed = new EmbedBuilder()
                .setTitle('欸欸，不行喔！')
                .setDescription('芙蘭想要打開封鎖名單，可是你不是管理員啦～乖乖等管理員來吧♪')
                .setColor(0xff3366)
                .setFooter({ text: '芙蘭朵露・斯卡蕾特 | 東方Project' });
            return interaction.reply({ embeds: [embed], flags: 64 });
        }

        // 📚 抓取封鎖名單
        const bans = await interaction.guild.bans.fetch();

        // 沒有封鎖紀錄
        if (!bans.size) {
            const embed = new EmbedBuilder()
                .setTitle('封鎖名單空空的！')
                .setDescription('哇～這裡超和平的耶！芙蘭也想要在這裡一起玩♡')
                .setColor(0xffc300)
                .setFooter({ text: '芙蘭朵露・斯卡蕾特 | 東方Project' });
            return interaction.reply({ embeds: [embed], flags: 64 });
        }

        // 有封鎖名單
        const embed = new EmbedBuilder()
            .setTitle('💥 封鎖名單翻出來啦！')
            .setDescription(
                bans.map(b => `• **${b.user.tag}** (\`${b.user.id}\`)`).join('\n')
            )
            .setColor(0xff3366)
            .setFooter({ text: `總共有 ${bans.size} 個人被炸飛～ | 芙蘭朵露・斯卡蕾特`, iconURL: interaction.client.user.displayAvatarURL() });

        await interaction.reply({ embeds: [embed], flags: 64 });
    }
};
