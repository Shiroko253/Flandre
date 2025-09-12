module.exports = {
    name: 'messageCreate',
    once: false,
    /**
     * @param {import('discord.js').Message} message
     * @param {import('discord.js').Client} client
     */
    execute(message, client) {
        // 機器人不回覆自己
        if (message.author.bot) return;
        
        // 回覆 "嗨" 或 "hello"
        if (message.content === '嗨' || message.content.toLowerCase() === 'hello') {
            message.reply('你好！👋');
        }

        // 你可以依照需求加更多自訂回覆
        // if (message.content === '群組名') {
        //     message.reply('這是群組獨屬的自動回覆！');
        // }
    }
};
