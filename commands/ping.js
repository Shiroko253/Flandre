const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('讓可愛的芙蘭朵露幫你測試 Discord API 延遲 5 次！'),
    async execute(interaction) {
        await interaction.deferReply();

        const delays = [];
        for (let i = 0; i < 5; i++) {
            const start = Date.now();
            await interaction.editReply({ content: `測量第 ${i + 1} 次中...` });
            const delay = Date.now() - start;
            delays.push(delay);
            await new Promise(res => setTimeout(res, 300));
        }
        const avgDelay = (delays.reduce((a, b) => a + b, 0) / delays.length).toFixed(2);

        const embed = new EmbedBuilder()
            .setTitle('🔴 芙蘭朵露的延遲檢查')
            .setDescription(`呐呐，主人～\n讓芙蘭來幫你檢查 Discord API 的延遲吧！`)
            .addFields(
                delays.map((delay, idx) => ({
                    name: `第 ${idx + 1} 次`,
                    value: `${delay} ms`,
                    inline: true
                }))
            )
            .addFields({ name: '平均延遲', value: `✨ ${avgDelay} ms ✨`, inline: false })
            .setColor(0xE83845)
            .setFooter({
                text: '芙蘭朵露・斯卡蕾特在此為您服務！',
                iconURL: interaction.client.user.displayAvatarURL()
            });

        await interaction.editReply({ content: '', embeds: [embed] });
    },
};
