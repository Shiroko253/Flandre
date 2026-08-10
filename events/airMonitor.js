const { EmbedBuilder } = require('discord.js');
const cron = require('node-cron');

const WAQI_TOKEN = process.env.WAQI_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const TZ = 'Asia/Kuching'; // 🌸 沙撈越當地時區 (UTC+8)

// 沙撈越 + 沙巴重點城市
const STATIONS = {
    'Kuching': 'kuching',
    'Sibu': 'sibu',
    'Miri': 'miri',
    'Kota Kinabalu': 'kota-kinabalu',
    'Sandakan': 'sandakan',
};

// 記憶上一次 AQI 用來對比趨勢
const lastAqi = {};

function getAqiInfo(aqi) {
    if (aqi <= 50) return { level: '🟢 良好', advice: '很適合出門跑步！', color: 0x2ecc71 };
    if (aqi <= 100) return { level: '🟡 普通', advice: '可以跑步，敏感的人注意一下～', color: 0xf1c40f };
    if (aqi <= 150) return { level: '🟠 對敏感族群不健康', advice: '不建議激烈戶外運動', color: 0xe67e22 };
    if (aqi <= 200) return { level: '🔴 不健康', advice: '別出門跑了，待在室內比較好', color: 0xe74c3c };
    if (aqi <= 300) return { level: '🟣 非常不健康', advice: '請避免所有戶外活動', color: 0x9b59b6 };
    return { level: '🟤 危險', advice: '待在室內，關緊門窗！', color: 0x7f1d1d };
}

function getTrend(city, currentAqi) {
    const prev = lastAqi[city];
    lastAqi[city] = currentAqi;

    if (prev === undefined) return '🆕 首次記錄';
    const diff = currentAqi - prev;
    if (diff > 0) return `🔺 上升 +${diff}`;
    if (diff < 0) return `🔽 下降 ${diff}`;
    return '➡️ 持平';
}

// 🌸 修復 1：WAQI 經常不給 dominentpol，改從 iaqi 自動計算主要污染物
function getDominantPol(data) {
    const dom = data?.data?.dominentpol;
    if (dom && dom !== '-') return dom.toUpperCase();

    const iaqi = data?.data?.iaqi || {};
    let bestKey = null;
    let bestVal = -Infinity;
    for (const [key, obj] of Object.entries(iaqi)) {
        const v = parseFloat(obj?.v);
        if (!Number.isNaN(v) && v > bestVal) {
            bestVal = v;
            bestKey = key;
        }
    }
    return bestKey ? bestKey.toUpperCase() : '資料未提供';
}

// 🌸 修復 2：把 Unix 秒數格式化成沙撈越當地可讀時間
function formatStationTime(timeS) {
    const num = Number(timeS);
    if (!timeS || Number.isNaN(num)) return '未知時間';
    const d = new Date(num * 1000);
    if (Number.isNaN(d.getTime())) return String(timeS);
    try {
        // sv-SE 會輸出 2026-08-11 01:00:00 這種乾淨格式
        return d.toLocaleString('sv-SE', { timeZone: TZ, hour12: false });
    } catch (e) {
        return d.toISOString();
    }
}

async function fetchStation(cityName, slug) {
    if (!WAQI_TOKEN) return null;
    const url = `https://api.waqi.info/feed/${slug}/?token=${WAQI_TOKEN}`;
    try {
        const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
        if (!res.ok) return null;
        const data = await res.json();
        if (data.status !== 'ok') return null;

        let aqi = data.data?.aqi;
        if (aqi == null || aqi === '-') return null;
        aqi = parseInt(aqi, 10);
        if (Number.isNaN(aqi)) return null;

        return {
            city: cityName,
            aqi,
            time: formatStationTime(data.data?.time?.s),
            dominent: getDominantPol(data),
        };
    } catch (e) {
        console.error(`[on_air] 取得 ${cityName} 失敗:`, e.message);
        return null;
    }
}

async function runAirCheck(client) {
    if (!CHANNEL_ID) {
        console.warn('[on_air] 未設定 CHANNEL_ID，跳過推播');
        return;
    }

    console.log('[on_air] 開始檢查沙撈越與沙巴空氣品質...');
    const results = [];

    for (const [name, slug] of Object.entries(STATIONS)) {
        const data = await fetchStation(name, slug);
        if (data) results.push(data);
    }

    if (results.length === 0) {
        console.warn('[on_air] 沒有成功取得任何測站資料');
        return;
    }

    const maxAqi = Math.max(...results.map(r => r.aqi));
    const { color } = getAqiInfo(maxAqi);

    const embed = new EmbedBuilder()
        .setTitle('🌸 沙撈越 & 沙巴 空氣品質報告')
        .setDescription('芙蘭幫你盯著空氣呢～不聽話的污染物要被炸掉喔！')
        .setColor(color)
        .setTimestamp()
        .setFooter({ text: '資料來源：WAQI • 每 1 小時正點更新' });

    for (const item of results) {
        const { level, advice } = getAqiInfo(item.aqi);
        const trend = getTrend(item.city, item.aqi);

        embed.addFields({
            name: `📍 ${item.city}`,
            value: [
                `**AQI：${item.aqi}** (${trend})`,
                `等級：${level}`,
                `主要污染物：\`${item.dominent}\``,
                `**🏃 跑步建議：** ${advice}`,
                `更新時間：${item.time}`,
            ].join('\n'),
            inline: false,
        });
    }

    try {
        const channel = await client.channels.fetch(CHANNEL_ID);
        if (channel && channel.isTextBased()) {
            await channel.send({ embeds: [embed] });
            console.log('[on_air] 推播成功');
        } else {
            console.error('[on_air] 找不到可用頻道:', CHANNEL_ID);
        }
    } catch (e) {
        console.error('[on_air] 推播失敗:', e.message);
    }
}

module.exports = {
    name: 'clientReady',
    once: true,
    async execute(client) {
        console.log('[on_air] 空氣品質監控已啟動（node-cron 正點模式）');

        // 啟動後 10 秒先推一次
        setTimeout(() => runAirCheck(client), 10_000);

        // 🌸 修復 3：node-cron 死死鎖住沙撈越時區整點，長期跑也不會漂移
        cron.schedule('0 * * * *', () => {
            runAirCheck(client);
        }, {
            timezone: TZ,
        });
    },
};
