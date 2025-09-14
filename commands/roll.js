const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('🎲 芙蘭朵露幫你骰骰子！')
        .addIntegerOption(opt =>
            opt.setName('max')
               .setDescription('最大值，越大越刺激唷！（預設100）')
               .setMinValue(1)
               .setMaxValue(999999)
               .setRequired(false)),
    async execute(interaction) {
        const max = interaction.options.getInteger('max') || 100;
        const result = Math.floor(Math.random() * max) + 1;

        const embed = new EmbedBuilder()
            .setTitle('🎲 骰子結果出爐啦！')
            .setDescription(
                `芙蘭朵露・斯卡蕾特幫 <@${interaction.user.id}> 擲出了幸運骰子！\n\n` +
                `✨ 結果是 **${result}** ✨\n` +
                `（範圍：\`1 ~ ${max}\`）`
            )
            .setColor(0xff3366)
            .setFooter({
                text: '芙蘭朵露・斯卡蕾特 | 東方Project',
                iconURL: interaction.client.user.displayAvatarURL()
            });

        await interaction.reply({ embeds: [embed] }); // 改為公開訊息
    }
};
