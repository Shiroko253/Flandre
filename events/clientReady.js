const stringWidth = require('string-width');

module.exports = {
    name: 'clientReady',
    async execute(client) {
        client.user.setPresence({
            activities: [
                {
                    name: '和主人一起管理群組',
                    type: 3
                }
            ],
            status: 'idle'
        });

        const totalWidth = 54;
        const botName = `Bot 名稱 : ${client.user.tag}`;
        const status = '狀態     : 已準備好陪主人一起管理群組！';

        function padLine(str) {
            const realWidth = stringWidth(str);
            return str + ' '.repeat(totalWidth - realWidth);
        }

        console.log(`╔${'═'.repeat(totalWidth)}╗`);
        console.log(`║${padLine('  芙蘭朵露・斯卡蕾特已經醒來囉！')}║`);
        console.log(`║${'-'.repeat(totalWidth)}║`);
        console.log(`║${padLine('  ' + botName)}║`);
        console.log(`║${padLine('  ' + status)}║`);
        console.log(`╚${'═'.repeat(totalWidth)}╝`);
    }
};
