const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('💓 讓可愛的芙蘭朵露幫你測試 Discord API 延遲！'),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false }); // 公開回覆

        const delays = [];
        for (let i = 0; i < 5; i++) {
            const start = Date.now();
            await interaction.editReply({ content: `⌛ 第 ${i + 1} 次測量中…` });
            const delay = Date.now() - start;
            delays.push(delay);
            await new Promise(res => setTimeout(res, 300));
        }

        const avgDelay = (delays.reduce((a, b) => a + b, 0) / delays.length).toFixed(2);

        const embed = new EmbedBuilder()
            .setTitle('🔴 芙蘭朵露的延遲檢查')
            .setDescription(`呐呐～主人！芙蘭剛剛幫你測了 **5 次** 延遲結果唷 ♡`)
            .addFields(
                delays.map((delay, idx) => ({
                    name: `第 ${idx + 1} 次`,
                    value: `\`${delay} ms\``,
                    inline: true
                }))
            )
            .addFields({ name: '📊 平均延遲', value: `✨ **${avgDelay} ms** ✨`, inline: false })
            .setColor(0xff3366)
            .setFooter({
                text: '芙蘭朵露・斯卡蕾特 | 東方Project',
                iconURL: interaction.client.user.displayAvatarURL()
            });

        await interaction.editReply({ content: '', embeds: [embed] });
    },
};
