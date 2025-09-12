const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('untimeout')
        .setDescription('解除成員的封印！芙蘭大解放！')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('要解放的成員')
                .setRequired(true)),
    ownerOnly: false,
    async execute(interaction, client) {
        // 權限檢查：執行者必須是管理員
        if (!interaction.member.permissions.has('Administrator')) {
            const noPermEmbed = new EmbedBuilder()
                .setTitle('🚫 芙蘭魔法無效唷！')
                .setDescription('只有管理員才可以用這個指令喔，芙蘭才不會亂聽話呢！')
                .setColor(0x808080)
                .setThumbnail(client.user.displayAvatarURL())
                .setFooter({ text: 'By 芙蘭朵露・Flandre Scarlet 🧸' });
            return await interaction.reply({ embeds: [noPermEmbed], flags: 64 });
        }

        const member = interaction.options.getMember('user');
        if (!member) {
            const noUserEmbed = new EmbedBuilder()
                .setTitle('❓ 芙蘭找不到這個人唷！')
                .setDescription('指定的成員不存在，芙蘭要怎麼解放他呢？')
                .setColor(0x808080)
                .setThumbnail(client.user.displayAvatarURL())
                .setFooter({ text: 'By 芙蘭朵露・Flandre Scarlet 🧸' });
            return await interaction.reply({ embeds: [noUserEmbed], flags: 64 });
        }

        // 檢查目標是否有被 timeout
        if (!member.communicationDisabledUntil || member.communicationDisabledUntil < new Date()) {
            const notTimeoutEmbed = new EmbedBuilder()
                .setTitle('🦋 芙蘭沒發現封印！')
                .setDescription(`${member.user} 沒有被芙蘭封印，不用解放啦！`)
                .setColor(0xffd700)
                .setThumbnail(client.user.displayAvatarURL())
                .setFooter({ text: 'By 芙蘭朵露・Flandre Scarlet 🧸' });
            return await interaction.reply({ embeds: [notTimeoutEmbed], flags: 64 });
        }

        try {
            await member.timeout(null, `由 ${interaction.user.tag} 的芙蘭解封`);
            const embed = new EmbedBuilder()
                .setTitle('🦋 芙蘭的解放魔法！🦋')
                .setDescription(`恭喜！${member.user} 已被芙蘭解放啦！\n\n可以快樂聊天囉，要乖乖的唷(｡•̀ᴗ-)✧`)
                .setColor(0xffd700)
                .setThumbnail(client.user.displayAvatarURL())
                .setFooter({ text: 'By 芙蘭朵露・Flandre Scarlet 🧸' });
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setTitle('💔 芙蘭的魔法失敗啦……')
                .setDescription(`芙蘭沒辦法解放這位成員！\n\n請主人幫芙蘭檢查一下機器人權限和成員身分組吧！`)
                .setColor(0x808080)
                .setThumbnail(client.user.displayAvatarURL())
                .setFooter({ text: 'By 芙蘭朵露・Flandre Scarlet 🧸' });
            await interaction.reply({ embeds: [errorEmbed], flags: 64 });
        }
    }
};
