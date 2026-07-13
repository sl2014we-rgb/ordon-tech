const https = require('https');

module.exports = function handler(req, res) {
    // Жесткий CORS-прострел для беспрепятственного вывода на promis.space
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Перехват предварительной проверки браузера (Preflight)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Разрешены только POST-запросы ORDON' });
    }

    try {
        const { messages, temperature } = req.body;

        // Формируем Payload строго под официальные стандарты DeepSeek API
        const postData = JSON.stringify({
            model: 'deepseek-chat', // Флагманское ядро DeepSeek-V3
            messages: messages,
            temperature: temperature || 0.0 // Выжигаем галлюцинации и лень
        });

        // Прямой системный кабель на официальный эндпоинт Китая
       const options = {
    hostname: 'api.deepseek.com',       
    port: 443,
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer \${process.env.DEEPSEEK_API_KEY || ''}`,
        'Content-Length': Buffer.byteLength(postData)
    }
};
        const gRequest = https.request(options, (gResponse) => {
            let buffer = '';
            gResponse.on('data', (chunk) => { buffer += chunk; });
            gResponse.on('end', () => {
                try {
                    if (gResponse.statusCode !== 200) {
                        return res.status(200).json({
                            choices: [{ message: { content: `❌ Отказ официального ядра DeepSeek (Статус ${gResponse.statusCode}): ${buffer}. Проверьте токен DEEPSEEK_API_KEY в панели Vercel.` } }]
                        });
                    }
                    const data = JSON.parse(buffer);
                    return res.status(200).json(data);
                } catch (parseErr) {
                    return res.status(200).json({
                        choices: [{ message: { content: `❌ Ошибка обработки потока DeepSeek: ${buffer}` } }]
                    });
                }
            });
        });

        gRequest.on('error', (e) => {
            return res.status(200).json({
                choices: [{ message: { content: `❌ Ошибка коннекта моста к Китаю: ${e.message}` } }]
            });
        });

        gRequest.write(postData);
        gRequest.end();

    } catch (error) {
        return res.status(200).json({
            choices: [{ message: { content: `❌ Авария скрипта Node.js: ${error.message}` } }]
        });
    }
};
