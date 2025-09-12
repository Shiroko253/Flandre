const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shutdown')
        .setDescription('關閉機器人（僅限主人）'),
    ownerOnly: true, // 你可以在 index.js 處理 ownerOnly 判斷
    async execute(interaction) {
        // 檢查是否主人
        const OWNER_ID = process.env.OWNER_ID || '你的 Discord UID';
        if (interaction.user.id !== OWNER_ID) {
            return await interaction.reply({
                content: '只有主人才能關閉機器人！',
                flags: 64
            });
        }

        const embed = new EmbedBuilder()
            .setColor(0xFF3333)
            .setTitle('機器人關閉通知')
            .setDescription('芙蘭：主人，下次見囉～（正在關閉機器人）')
            .setFooter({
                text: 'Flandre Scarlet Bot',
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            flags: 64
        });

        setTimeout(() => {
            interaction.client.destroy();
            process.exit(0);
        }, 1000);
    }
};
