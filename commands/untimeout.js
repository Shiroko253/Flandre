const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('untimeout')
        .setDescription('解除成員的封印！芙蘭大解放！')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('要解放的成員')
                .setRequired(true)
        ),

    async execute(interaction) {
        // 🔒 權限檢查：必須是管理員
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            const noPermEmbed = new EmbedBuilder()
                .setColor(0xff3366)
                .setTitle('🚫 權限不夠唷！')
                .setDescription('只有 **管理員** 才能使用這個指令，芙蘭才不會亂聽話呢！')
                .setFooter({
                    text: '芙蘭朵露・斯卡蕾特 | 東方Project',
                    iconURL: interaction.client.user.displayAvatarURL()
                });
            return interaction.reply({ embeds: [noPermEmbed], flags: 64 });
        }

        const member = interaction.options.getMember('user');
        if (!member) {
            const noUserEmbed = new EmbedBuilder()
                .setColor(0xffc300)
                .setTitle('❓ 找不到成員')
                .setDescription('芙蘭找不到這個人唷，要怎麼解放他呢？')
                .setFooter({
                    text: '芙蘭朵露・斯卡蕾特 | 東方Project',
                    iconURL: interaction.client.user.displayAvatarURL()
                });
            return interaction.reply({ embeds: [noUserEmbed], flags: 64 });
        }

        // ⏳ 檢查是否真的被 timeout
        if (!member.communicationDisabledUntil || member.communicationDisabledUntil < new Date()) {
            const notTimeoutEmbed = new EmbedBuilder()
                .setColor(0xffd700)
                .setTitle('🦋 芙蘭沒發現封印')
                .setDescription(`${member.user} 沒有被芙蘭封印，不需要解放啦！`)
                .setFooter({
                    text: '芙蘭朵露・斯卡蕾特 | 東方Project',
                    iconURL: interaction.client.user.displayAvatarURL()
                });
            return interaction.reply({ embeds: [notTimeoutEmbed], flags: 64 });
        }

        try {
            await member.timeout(null, `由 ${interaction.user.tag} 的芙蘭解封`);

            const now = new Date();
            const embed = new EmbedBuilder()
                .setColor(0xffd700)
                .setTitle('🦋 芙蘭的解放魔法！🦋')
                .setDescription(`恭喜！${member.user} 已經被芙蘭解放啦！\n可以快樂聊天囉，要乖一點唷～`)
                .addFields(
                    { name: '👤 成員', value: `${member.user}`, inline: true },
                    { name: '⏰ 時間', value: now.toLocaleString('zh-TW', { hour12: false, timeZone: 'Asia/Taipei' }), inline: true },
                    { name: '👮 操作管理員', value: interaction.user.tag, inline: false }
                )
                .setFooter({
                    text: '芙蘭朵露・斯卡蕾特 | 東方Project',
                    iconURL: interaction.client.user.displayAvatarURL()
                })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setColor(0x808080)
                .setTitle('💔 芙蘭的魔法失敗啦……')
                .setDescription('芙蘭沒辦法解放這位成員！\n請檢查機器人是否有 **管理成員** 權限，或身分組位置是否足夠高。')
                .setFooter({
                    text: '芙蘭朵露・斯卡蕾特 | 東方Project',
                    iconURL: interaction.client.user.displayAvatarURL()
                });
            await interaction.reply({ embeds: [errorEmbed], flags: 64 });
        }
    }
};
