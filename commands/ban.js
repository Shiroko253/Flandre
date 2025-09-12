const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('芙蘭朵露・斯卡蕾特要把人丟出群組囉！（僅限管理員）')
        .addUserOption(option =>
            option.setName('target').setDescription('要封禁的小可憐').setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason').setDescription('芙蘭朵露為什麼要炸他？').setRequired(false)
        ),
    async execute(interaction) {
        // 權限判斷
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff3366)
                        .setTitle('欸欸欸！')
                        .setDescription('芙蘭朵露看得出你不是管理員喔～不能亂炸人啦！')
                        .setFooter({ text: '芙蘭朵露・斯卡蕾特 | 東方Project' })
                ],
                ephemeral: true
            });
        }

        const target = interaction.options.getUser('target', true);
        const reason = interaction.options.getString('reason') ?? '主人沒說理由，只是想炸炸看！';
        const member = await interaction.guild?.members.fetch(target.id).catch(() => null);

        if (!member) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xffc300)
                        .setTitle('找不到對象呢～')
                        .setDescription(`芙蘭朵露找不到這位小可憐（ID: ${target.id}），是不是躲起來了呀？`)
                        .setFooter({ text: '芙蘭朵露・斯卡蕾特 | 東方Project' })
                ],
                ephemeral: true
            });
        }

        if (!member.bannable) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xffc300)
                        .setTitle('炸失敗了QQ')
                        .setDescription('芙蘭朵露沒辦法炸這位小可憐（可能是大人或權限太高啦）～')
                        .setFooter({ text: '芙蘭朵露・斯卡蕾特 | 東方Project' })
                ],
                ephemeral: true
            });
        }

        await member.ban({ reason });

        const now = new Date();
        const embed = new EmbedBuilder()
            .setTitle('💥 芙蘭朵露，把人炸出去了！')
            .setColor(0xff3366)
            .setDescription(
                `呼呼！芙蘭朵露成功把 <@${target.id}> 丟出群組啦！\n` +
                '群組清靜了點呢～'
            )
            .addFields(
                { name: '被炸飛的用戶', value: `${target.tag} (<@${target.id}>)`, inline: false },
                { name: '用戶ID', value: target.id, inline: true },
                { name: '原因', value: reason, inline: false },
                { name: '時間', value: now.toLocaleString('zh-TW', { hour12: false, timeZone: 'Asia/Taipei' }), inline: true }
            )
            .setFooter({ text: `操作管理員: ${interaction.user.tag} | 芙蘭朵露・斯卡蕾特`, iconURL: interaction.client.user.displayAvatarURL() });

        return interaction.reply({ embeds: [embed] }); // 公開
    }
};
