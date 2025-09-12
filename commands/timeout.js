const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('暫時封印成員的發言權限！芙蘭大危險～')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('要封印的成員')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('minutes')
                .setDescription('封印多久（分鐘）')
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
        const minutes = interaction.options.getInteger('minutes');
        if (!member) return;

        // 判斷目標是否為群主或管理員
        const targetIsOwner = member.id === interaction.guild.ownerId;
        const targetIsAdmin = member.permissions.has('Administrator');
        if (targetIsOwner || targetIsAdmin) {
            const cantTargetEmbed = new EmbedBuilder()
                .setTitle('🛑 芙蘭的魔法被阻止了！')
                .setDescription(
                    targetIsOwner
                        ? '芙蘭不能對群組擁有者施展魔法唷！這樣太危險啦！'
                        : '芙蘭不能對管理員施展魔法唷，會被罵的！'
                )
                .setColor(0xe06666)
                .setThumbnail(client.user.displayAvatarURL())
                .setFooter({ text: 'By 芙蘭朵露・Flandre Scarlet 🧸' });
            return await interaction.reply({ embeds: [cantTargetEmbed], flags: 64 });
        }

        try {
            await member.timeout(minutes * 60 * 1000, `由 ${interaction.user.tag} 的芙蘭魔法 timeout`);
            const embed = new EmbedBuilder()
                .setTitle('✨ 芙蘭的封印魔法！✨')
                .setDescription(`噗哈哈！${member.user} 已被芙蘭封印 ${minutes} 分鐘啦！\n\n不要亂說話喔～不然會被封印更久唷！`)
                .setColor(0xff3b3b)
                .setThumbnail(client.user.displayAvatarURL())
                .setFooter({ text: 'By 芙蘭朵露・Flandre Scarlet 🧸' });
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setTitle('💔 芙蘭的魔法失敗啦……')
                .setDescription(`芙蘭沒辦法封印這位成員！\n\n可能原因：\n・芙蘭的權限不夠（需要「管理成員」權限）\n・目標角色太高了芙蘭碰不到\n・Discord 本身出問題了\n\n請主人幫芙蘭檢查一下機器人權限和成員身分組吧！`)
                .setColor(0x808080)
                .setThumbnail(client.user.displayAvatarURL())
                .setFooter({ text: 'By 芙蘭朵露・Flandre Scarlet 🧸' });
            await interaction.reply({ embeds: [errorEmbed], flags: 64 });
        }
    }
};
