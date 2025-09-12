const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('芙蘭朵露・斯卡蕾特準備放人出來！（僅限管理員）')
        .addStringOption(option =>
            option.setName('userid').setDescription('要放出來的小可憐ID').setRequired(true)
        ),
    async execute(interaction) {
        // 權限判斷
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff3366)
                        .setTitle('權限不夠唷！')
                        .setDescription('芙蘭朵露看得出你不是管理員，不能隨便放人出來啦！')
                        .setFooter({ text: '芙蘭朵露・斯卡蕾特 | 東方Project' })
                ],
                ephemeral: true
            });
        }

        const userId = interaction.options.getString('userid', true);

        try {
            await interaction.guild?.members.unban(userId);

            const now = new Date();
            const embed = new EmbedBuilder()
                .setTitle('🔓 芙蘭朵露把人放出來了！')
                .setColor(0xff3366)
                .setDescription(
                    `小可憐 <@${userId}> 已經被芙蘭朵露放出來啦！\n希望你這次要乖一點唷～`
                )
                .addFields(
                    { name: '用戶ID', value: userId, inline: true },
                    { name: '時間', value: now.toLocaleString('zh-TW', { hour12: false, timeZone: 'Asia/Taipei' }), inline: true }
                )
                .setFooter({ text: `操作管理員: ${interaction.user.tag} | 芙蘭朵露・斯卡蕾特`, iconURL: interaction.client.user.displayAvatarURL() });

            return interaction.reply({ embeds: [embed] }); // 公開
        } catch (error) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xffc300)
                        .setTitle('放不出來QQ')
                        .setDescription('芙蘭朵露沒辦法放這位小可憐出來，請確認用戶ID正確或他真的被封禁了唷！')
                        .setFooter({ text: '芙蘭朵露・斯卡蕾特 | 東方Project' })
                ],
                ephemeral: true
            });
        }
    }
};
