const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shutdown')
        .setDescription('🛑 關閉機器人（僅限主人）'),
    ownerOnly: true, // 可以在 index.js 做 ownerOnly 的全域判斷
    async execute(interaction) {
        const OWNER_ID = process.env.OWNER_ID || '你的 Discord UID';

        // 不是主人 → 拒絕
        if (interaction.user.id !== OWNER_ID) {
            return await interaction.reply({
                content: '⚠️ 只有主人才能關閉機器人！',
                flags: 64 // 私密回覆
            });
        }

        // 關閉訊息 Embed
        const embed = new EmbedBuilder()
            .setColor(0xFF3333)
            .setTitle('🛑 機器人關閉通知')
            .setDescription('芙蘭：主人，下次見囉～（正在關閉機器人）')
            .setFooter({
                text: 'Flandre Scarlet Bot',
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            flags: 64 // 關閉通知只讓主人看到
        });

        // 1 秒後安全關閉
        setTimeout(() => {
            interaction.client.destroy();
            process.exit(0);
        }, 1000);
    }
};
