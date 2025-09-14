const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('💥 芙蘭朵露要把某人丟出群組啦！（僅限管理員）')
        .addUserOption(option =>
            option.setName('target').setDescription('要炸飛的那個人～').setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason').setDescription('要不要告訴芙蘭為什麼要炸他？').setRequired(false)
        ),
    async execute(interaction) {
        // 🛑 權限判斷
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            const noPermEmbed = new EmbedBuilder()
                .setColor(0xff3366)
                .setTitle('欸欸欸！')
                .setDescription('芙蘭一眼就看出你不是管理員啦～不可以亂炸人喔！')
                .setFooter({ text: '芙蘭朵露・斯卡蕾特 | 東方Project', iconURL: interaction.client.user.displayAvatarURL() });
            return interaction.reply({ embeds: [noPermEmbed], flags: 64 });
        }

        const target = interaction.options.getUser('target', true);
        const reason = interaction.options.getString('reason') ?? '主人沒說理由，就想隨便炸炸看♪';
        const member = await interaction.guild?.members.fetch(target.id).catch(() => null);

        // 找不到對象
        if (!member) {
            const noUserEmbed = new EmbedBuilder()
                .setColor(0xffc300)
                .setTitle('咦？人不見了？')
                .setDescription(`芙蘭找不到這位小可憐（ID: ${target.id}），該不會偷偷跑掉了吧？`)
                .setFooter({ text: '芙蘭朵露・斯卡蕾特 | 東方Project', iconURL: interaction.client.user.displayAvatarURL() });
            return interaction.reply({ embeds: [noUserEmbed], flags: 64 });
        }

        // 不准炸自己
        if (member.id === interaction.user.id) {
            const selfBanEmbed = new EmbedBuilder()
                .setColor(0xffc300)
                .setTitle('哎呀，不可以！')
                .setDescription('芙蘭怎麼可能會讓你自己把自己炸飛呢！')
                .setFooter({ text: '芙蘭朵露・斯卡蕾特 | 東方Project', iconURL: interaction.client.user.displayAvatarURL() });
            return interaction.reply({ embeds: [selfBanEmbed], flags: 64 });
        }

        // 不准炸群主
        if (member.id === interaction.guild.ownerId) {
            const ownerEmbed = new EmbedBuilder()
                .setColor(0xffc300)
                .setTitle('危險危險！')
                .setDescription('芙蘭才不敢動群主呢！那樣會出大事的啦！')
                .setFooter({ text: '芙蘭朵露・斯卡蕾特 | 東方Project', iconURL: interaction.client.user.displayAvatarURL() });
            return interaction.reply({ embeds: [ownerEmbed], flags: 64 });
        }

        // 不准炸管理員
        if (member.permissions.has(PermissionFlagsBits.Administrator)) {
            const adminEmbed = new EmbedBuilder()
                .setColor(0xffc300)
                .setTitle('這個不行！')
                .setDescription('芙蘭才不敢隨便動管理員呢～會被主人罵的！')
                .setFooter({ text: '芙蘭朵露・斯卡蕾特 | 東方Project', iconURL: interaction.client.user.displayAvatarURL() });
            return interaction.reply({ embeds: [adminEmbed], flags: 64 });
        }

        // 不准炸 bot
        if (member.user.bot) {
            if (member.id === interaction.client.user.id) {
                const selfBotEmbed = new EmbedBuilder()
                    .setColor(0xffc300)
                    .setTitle('笨蛋！')
                    .setDescription('芙蘭才不會自己把自己炸出去啦！')
                    .setFooter({ text: '芙蘭朵露・斯卡蕾特 | 東方Project', iconURL: interaction.client.user.displayAvatarURL() });
                return interaction.reply({ embeds: [selfBotEmbed], flags: 64 });
            }
            const otherBotEmbed = new EmbedBuilder()
                .setColor(0xffc300)
                .setTitle('不行不行～')
                .setDescription('機器人之間要好好相處，芙蘭才不會亂炸機器人呢！')
                .setFooter({ text: '芙蘭朵露・斯卡蕾特 | 東方Project', iconURL: interaction.client.user.displayAvatarURL() });
            return interaction.reply({ embeds: [otherBotEmbed], flags: 64 });
        }

        // 無法 ban
        if (!member.bannable) {
            const cantBanEmbed = new EmbedBuilder()
                .setColor(0xffc300)
                .setTitle('欸？炸不動？')
                .setDescription('芙蘭沒辦法動這個人啦～大概是權限太高，像大人一樣！')
                .setFooter({ text: '芙蘭朵露・斯卡蕾特 | 東方Project', iconURL: interaction.client.user.displayAvatarURL() });
            return interaction.reply({ embeds: [cantBanEmbed], flags: 64 });
        }

        // 執行 ban
        await member.ban({ reason });

        const now = new Date();
        const embed = new EmbedBuilder()
            .setTitle('💥 轟隆！')
            .setColor(0xff3366)
            .setDescription(
                `呼呼～芙蘭成功把 <@${target.id}> 丟出群組啦！\n群組安靜好多呢♪`
            )
            .addFields(
                { name: '被炸飛的用戶', value: `${target.tag} (<@${target.id}>)`, inline: false },
                { name: '用戶ID', value: target.id, inline: true },
                { name: '原因', value: reason, inline: false },
                { name: '時間', value: now.toLocaleString('zh-TW', { hour12: false, timeZone: 'Asia/Taipei' }), inline: true }
            )
            .setFooter({ text: `操作管理員: ${interaction.user.tag} | 芙蘭朵露・斯卡蕾特`, iconURL: interaction.client.user.displayAvatarURL() });

        return interaction.reply({ embeds: [embed] });
    }
};
