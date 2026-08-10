const { EmbedBuilder } = require('discord.js');
const cron = require('node-cron'); // 🌸 引入 node-cron

const CHANNEL_ID = process.env.CHANNEL_ID;

// 沙撈越 + 沙巴重點城市
const CITIES = {
    'Kuching': { lat: 1.5533, lon: 110.3592 },
    'Sibu': { lat: 2.3000, lon: 111.8167 },
    'Miri': { lat: 4.3995, lon: 113.9914 },
    'Kota Kinabalu': { lat: 5.9804, lon: 116.0735 },
    'Sandakan': { lat: 5.8394, lon: 118.1139 },
};

function weatherDescription(code) {
    const map = {
        0: '晴朗 ☀️', 1: '大致晴朗 🌤️', 2: '局部多雲 ⛅', 3: '陰天 ☁️',
        45: '有霧 🌫️', 48: '霧凇 🌫️',
        51: '小毛毛雨 🌦️', 53: '毛毛雨 🌦️', 55: '大毛毛雨 🌧️',
        61: '小雨 🌧️', 63: '中雨 🌧️', 65: '大雨 🌧️',
        80: '陣雨 🌦️', 81: '中等陣雨 🌧️', 82: '強陣雨 ⛈️',
        95: '雷雨 ⛈️', 96: '雷雨伴冰雹 ⛈️', 99: '強雷雨伴冰雹 ⛈️',
    };
    return map[code] || `未知天氣 (${code})`;
}

function getWindDirection(degrees) {
    if (degrees == null) return '';
    const dirs = ['北風', '東北風', '東風', '東南風', '南風', '西南風', '西風', '西北風'];
    const index = Math.round(degrees / 45) % 8;
    return ` (${dirs[index]})`;
}

async function fetchWeather(city, lat, lon) {
    const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
        `&forecast_days=2` +
        `&timezone=Asia/Kuching`;

    try {
        const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
        if (!res.ok) return null;
        const data = await res.json();
        const c = data.current || {};
        const d = data.daily || {};
        
        return {
            city,
            temp: c.temperature_2m,
            feels: c.apparent_temperature,
            humidity: c.relative_humidity_2m,
            wind: c.wind_speed_10m,
            wind_dir: c.wind_direction_10m, 
            code: c.weather_code,
            tomorrow: { 
                code: d.weather_code?.[1],
                max: d.temperature_2m_max?.[1],
                min: d.temperature_2m_min?.[1],
                rain: d.precipitation_probability_max?.[1]
            }
        };
    } catch (e) {
        console.error(`[on_weather] 取得 ${city} 失敗:`, e.message);
        return null;
    }
}

async function runWeatherCheck(client) {
    if (!CHANNEL_ID) return;

    console.log('[on_weather] 開始獲取沙撈越與沙巴天氣...');
    const results = [];

    for (const [city, { lat, lon }] of Object.entries(CITIES)) {
        const data = await fetchWeather(city, lat, lon);
        if (data) results.push(data);
    }

    if (results.length === 0) {
        console.warn('[on_weather] 沒有成功取得任何天氣資料');
        return;
    }

    const embed = new EmbedBuilder()
        .setTitle('🌤️ 沙撈越 & 沙巴 天氣報告')
        .setDescription('芙蘭每小時幫你看一次天氣～熱死或冷死都要跟我說喔！')
        .setColor(0x87ceeb)
        .setTimestamp()
        .setFooter({ text: '資料來源：Open-Meteo • 每 1 小時正點更新' });

    for (const item of results) {
        const desc = weatherDescription(item.code);
        const windDirText = getWindDirection(item.wind_dir);
        
        const tmr = item.tomorrow;
        const tmrDesc = tmr.code != null ? weatherDescription(tmr.code) : '未知';
        const tmrText = tmr.max != null 
            ? `🔮 **明日：** ${tmrDesc} | ${tmr.min}~${tmr.max}°C | 降雨 ${tmr.rain ?? 0}%` 
            : '🔮 **明日：** 資料獲取失敗';

        embed.addFields({
            name: `📍 ${item.city}`,
            value: [
                `**現在：** ${desc} | ${item.temp}°C (體感 ${item.feels}°C)`,
                `**濕度：** ${item.humidity}% | **風況：** ${item.wind} km/h${windDirText}`,
                tmrText
            ].join('\n'),
            inline: false, 
        });
    }

    try {
        const channel = await client.channels.fetch(CHANNEL_ID);
        if (channel && channel.isTextBased()) {
            await channel.send({ embeds: [embed] });
            console.log('[on_weather] 推播成功');
        }
    } catch (e) {
        console.error('[on_weather] 推播失敗:', e.message);
    }
}

module.exports = {
    name: 'clientReady',
    once: true,
    async execute(client) {
        console.log('[on_weather] 天氣監控已啟動（使用 node-cron 確保正點更新）');
        
        // 啟動後 15 秒先執行一次
        setTimeout(() => runWeatherCheck(client), 15_000);

        // 🌸 終極排程：'0 * * * *' 代表「每小時的 00 分 00 秒」
        cron.schedule('0 * * * *', () => {
            runWeatherCheck(client);
        }, {
            timezone: "Asia/Kuala_Lumpur"
        });
    },
};
