const stringWidth = require('string-width');

module.exports = {
    name: 'clientReady',
    async execute(client) {
        // ✨ 一醒來先偷偷換個狀態，讓大家知道我在陪主人玩～
        client.user.setPresence({
            activities: [
                {
                    name: '和主人一起管理群組 (嘿嘿♪)',
                    type: 3 // Watching
                }
            ],
            status: 'idle' // 悠哉發呆中
        });

        const totalWidth = 54;
        const botName = `Bot 名稱 : ${client.user.tag}`;
        const status = '狀態     : 芙蘭已經準備好陪主人一起管理群組啦！';

        function padLine(str) {
            const realWidth = stringWidth(str);
            return str + ' '.repeat(totalWidth - realWidth);
        }

        // 🎀 輸出超可愛的啟動訊息框框
        console.log(`╔${'═'.repeat(totalWidth)}╗`);
        console.log(`║${padLine('  芙蘭朵露・斯卡蕾特從夢裡爬出來囉！')}║`);
        console.log(`║${'-'.repeat(totalWidth)}║`);
        console.log(`║${padLine('  ' + botName)}║`);
        console.log(`║${padLine('  ' + status)}║`);
        console.log(`╚${'═'.repeat(totalWidth)}╝`);
    }
};
