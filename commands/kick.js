const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('💢 芙蘭朵露要把人踢出群組！（僅限管理員）')
        .addUserOption(option =>
            option.setName('target').setDescription('要踢出的倒楣蛋').setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason').setDescription('芙蘭朵露踢他的理由？').setRequired(false)
        ),
    async execute(interaction) {
        // 權限判斷
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            const noPermEmbed = new EmbedBuilder()
                .setColor(0xff3366)
                .setTitle('⛔ 權限不足！')
                .setDescription('芙蘭朵露看得出你不是管理員～這個命令你用不了唷！')
                .setFooter({ 
                    text: '芙蘭朵露・斯卡蕾特 | 東方Project', 
                    iconURL: interaction.client.user.displayAvatarURL() 
                });
            return interaction.reply({ embeds: [noPermEmbed], ephemeral: true });
        }

        const target = interaction.options.getUser('target', true);
        const reason = interaction.options.getString('reason') ?? '主人沒說理由，只是想踢踢看！';
        const member = await interaction.guild?.members.fetch(target.id).catch(() => null);

        // 找不到用戶
        if (!member) {
            const noUserEmbed = new EmbedBuilder()
                .setColor(0xffc300)
                .setTitle('❓ 找不到這個人！')
                .setDescription(`芙蘭朵露找不到這位倒楣蛋（ID: **${target.id}**）…是不是偷偷躲起來了呀？`)
                .setFooter({ 
                    text: '芙蘭朵露・斯卡蕾特 | 東方Project', 
                    iconURL: interaction.client.user.displayAvatarURL() 
                });
            return interaction.reply({ embeds: [noUserEmbed], ephemeral: true });
        }

        // 禁止踢：群主
        if (member.id === interaction.guild.ownerId) {
            const ownerEmbed = new EmbedBuilder()
                .setColor(0xffc300)
                .setTitle('👑 踢不到群主！')
                .setDescription('芙蘭朵露才不敢踢群主啦！會被處罰的！')
                .setFooter({ 
                    text: '芙蘭朵露・斯卡蕾特 | 東方Project', 
                    iconURL: interaction.client.user.displayAvatarURL() 
                });
            return interaction.reply({ embeds: [ownerEmbed], ephemeral: true });
        }

        // 禁止踢：管理員
        if (member.permissions.has(PermissionFlagsBits.Administrator)) {
            const adminEmbed = new EmbedBuilder()
                .setColor(0xffc300)
                .setTitle('🛡️ 踢不動管理員！')
                .setDescription('芙蘭朵露不敢亂踢管理員～會被罵的啦！')
                .setFooter({ 
                    text: '芙蘭朵露・斯卡蕾特 | 東方Project', 
                    iconURL: interaction.client.user.displayAvatarURL() 
                });
            return interaction.reply({ embeds: [adminEmbed], ephemeral: true });
        }

        // 禁止踢：bot
        if (member.user.bot) {
            if (member.id === interaction.client.user.id) {
                const selfBotEmbed = new EmbedBuilder()
                    .setColor(0xffc300)
                    .setTitle('🙅 芙蘭朵露不能踢自己！')
                    .setDescription('芙蘭朵露才不會自己把自己踢出去啦！')
                    .setFooter({ 
                        text: '芙蘭朵露・斯卡蕾特 | 東方Project', 
                        iconURL: interaction.client.user.displayAvatarURL() 
                    });
                return interaction.reply({ embeds: [selfBotEmbed], ephemeral: true });
            }
            const otherBotEmbed = new EmbedBuilder()
                .setColor(0xffc300)
                .setTitle('🤖 不能踢機器人！')
                .setDescription('芙蘭朵露不會亂踢機器人，大家要和平相處唷！')
                .setFooter({ 
                    text: '芙蘭朵露・斯卡蕾特 | 東方Project', 
                    iconURL: interaction.client.user.displayAvatarURL() 
                });
            return interaction.reply({ embeds: [otherBotEmbed], ephemeral: true });
        }

        // 無法踢（權限不足 / 身分組過高）
        if (!member.kickable) {
            const cantKickEmbed = new EmbedBuilder()
                .setColor(0xffc300)
                .setTitle('💢 踢不動！')
                .setDescription('芙蘭朵露踢不動這位倒楣蛋（可能身分組太高了）～')
                .setFooter({ 
                    text: '芙蘭朵露・斯卡蕾特 | 東方Project', 
                    iconURL: interaction.client.user.displayAvatarURL() 
                });
            return interaction.reply({ embeds: [cantKickEmbed], ephemeral: true });
        }

        // ✅ 踢出成功
        await member.kick(reason);

        const now = new Date();
        const successEmbed = new EmbedBuilder()
            .setTitle('💥 芙蘭朵露踢人成功！')
            .setColor(0xff3366)
            .setDescription(`使用者 <@${target.id}> 已被芙蘭朵露一腳踢飛啦！✨`)
            .addFields(
                { name: '👤 被踢的用戶', value: `${target.tag} (<@${target.id}>)`, inline: false },
                { name: '🆔 用戶ID', value: target.id, inline: true },
                { name: '📌 原因', value: reason, inline: false },
                { name: '⏰ 時間', value: now.toLocaleString('zh-TW', { hour12: false, timeZone: 'Asia/Taipei' }), inline: true }
            )
            .setFooter({ 
                text: `操作管理員: ${interaction.user.tag} | 芙蘭朵露・斯卡蕾特`, 
                iconURL: interaction.client.user.displayAvatarURL() 
            });

        return interaction.reply({ embeds: [successEmbed] }); // ✅ 公開顯示
    }
};
