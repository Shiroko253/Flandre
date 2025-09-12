const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('芙蘭朵露・斯卡蕾特來報告群組情報！'),
    async execute(interaction, client) {
        const guild = interaction.guild;
        if (!guild) return await interaction.reply({ content: '這個指令只能在伺服器裡使用唷～', ephemeral: true });

        // 取得群組擁有者
        const owner = await guild.fetchOwner();

        // BOT 狀態（presence）
        const botStatus = client.user.presence?.status || 'unknown';

        // 芙蘭朵露的語氣 & 群組資訊
        const desc = [
            '芙蘭朵露・斯卡蕾特已經降臨這個群組了唷！',
            `👥 成員總數：**${guild.memberCount}**（大家都好可愛呢～）`,
            `✨ 推薦加成等級：**${guild.premiumTier}**（越高越閃亮！）`,
            `👑 群組擁有者：**${owner.user.tag}**（要聽主人的話喔！）`,
            `🔧 BOT 狀態：**${botStatus}**（隨時準備放大爆炸...欸不是啦！陪你管理群組啦！）`
        ].join('\n');

        // 東方 Flandre 主色（推薦亮紅色）
        const flandreColor = 0xff3366;

        const embed = new EmbedBuilder()
            .setTitle('芙蘭朵露的群組情報♡')
            .setDescription(desc)
            .setColor(flandreColor)
            .setThumbnail(client.user.displayAvatarURL())
            .setFooter({ text: '芙蘭朵露・斯卡蕾特 | 東方Project', iconURL: client.user.displayAvatarURL() });

        // 公開回覆
        await interaction.reply({ embeds: [embed] });
    }
};
