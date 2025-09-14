const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('💣 芙蘭朵露幫你清理群組訊息！（僅限管理員）')
        .addIntegerOption(opt =>
            opt.setName('amount')
               .setDescription('要清除幾則訊息呢？（2~100）')
               .setMinValue(2)
               .setMaxValue(100)
               .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        // 🔑 權限檢查
        const member = interaction.guild.members.cache.get(interaction.user.id);
        if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const embed = new EmbedBuilder()
                .setTitle('欸欸～權限不夠喔！')
                .setDescription('芙蘭想要用「砰！」把訊息清掉，但你不是管理員，芙蘭可不能亂玩炸彈啦♪')
                .setColor(0xff3366)
                .setFooter({ text: '芙蘭朵露・斯卡蕾特 | 東方Project' });
            return interaction.reply({ embeds: [embed], flags: 64 }); // 權限不足 → 還是只有自己看得到
        }

        const amount = interaction.options.getInteger('amount');

        try {
            const deleted = await interaction.channel.bulkDelete(amount, true);

            const embed = new EmbedBuilder()
                .setTitle('💥 砰！清理完成♡')
                .setDescription(`芙蘭剛剛「炸掉」了 **${deleted.size}** 則訊息唷！\n（只能清 14 天內的訊息，太久遠的回憶可不能亂炸掉～）`)
                .setColor(0xff3366)
                .setFooter({ text: '芙蘭朵露・斯卡蕾特 | 東方Project' });

            // ✅ 成功 → 改為公開回覆
            await interaction.reply({ embeds: [embed] });

        } catch (e) {
            const embed = new EmbedBuilder()
                .setTitle('嗚哇，炸彈失靈了！？')
                .setDescription('可能訊息太古老，或是芙蘭的炸彈沒拿到足夠的許可權，所以清不掉唷…')
                .setColor(0xff3366)
                .setFooter({ text: '芙蘭朵露・斯卡蕾特 | 東方Project' });

            return interaction.reply({ embeds: [embed], flags: 64 }); // 失敗 → 只給執行者看
        }
    }
};
