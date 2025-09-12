const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('芙蘭朵露・斯卡蕾特要把人踢出群組（僅限管理員）')
        .addUserOption(option =>
            option.setName('target').setDescription('要踢出的倒楣蛋').setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason').setDescription('芙蘭朵露踢他的理由？').setRequired(false)
        ),
    async execute(interaction) {
        // 權限判斷
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff3366)
                        .setTitle('權限不夠唷！')
                        .setDescription('芙蘭朵露看得出你不是管理員，不能亂踢人啦！')
                        .setFooter({ text: '芙蘭朵露・斯卡蕾特 | 東方Project' })
                ],
                ephemeral: true
            });
        }

        const target = interaction.options.getUser('target', true);
        const reason = interaction.options.getString('reason') ?? '主人沒說理由，只是想踢踢看！';
        const member = await interaction.guild?.members.fetch(target.id).catch(() => null);

        if (!member) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xffc300)
                        .setTitle('找不到這個人唷～')
                        .setDescription(`芙蘭朵露找不到這位倒楣蛋（ID: ${target.id}），是不是躲起來了？`)
                        .setFooter({ text: '芙蘭朵露・斯卡蕾特 | 東方Project' })
                ],
                ephemeral: true
            });
        }

        if (!member.kickable) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xffc300)
                        .setTitle('踢不動QQ')
                        .setDescription('芙蘭朵露踢不動這位倒楣蛋（可能是權限太高啦）～')
                        .setFooter({ text: '芙蘭朵露・斯卡蕾特 | 東方Project' })
                ],
                ephemeral: true
            });
        }

        await member.kick(reason);

        const now = new Date();
        const embed = new EmbedBuilder()
            .setTitle('💢 芙蘭朵露踢人成功！')
            .setColor(0xff3366)
            .setDescription(
                `<@${target.id}> 被芙蘭朵露一腳踢出群組啦！\n大家安靜一點吧～`
            )
            .addFields(
                { name: '被踢的用戶', value: `${target.tag} (<@${target.id}>)`, inline: false },
                { name: '用戶ID', value: target.id, inline: true },
                { name: '原因', value: reason, inline: false },
                { name: '時間', value: now.toLocaleString('zh-TW', { hour12: false, timeZone: 'Asia/Taipei' }), inline: true }
            )
            .setFooter({ text: `操作管理員: ${interaction.user.tag} | 芙蘭朵露・斯卡蕾特`, iconURL: interaction.client.user.displayAvatarURL() });

        return interaction.reply({ embeds: [embed] }); // 公開顯示
    }
};
