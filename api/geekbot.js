const https = require('https');

module.exports = function handler(req, res) {
    // Жёсткий CORS-прострел для беспрепятственного вывода на promis.space
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Разрешены только POST-запросы ORDON' });
    }

    try {
        const { messages, temperature } = req.body;

        // Формируем Payload строго под официальные стандарты DeepSeek API
        const postData = JSON.stringify({
            model: 'deepseek-chat', // Официальный запуск флагманской модели DeepSeek-V3
            messages: messages,
            temperature: temperature || 0.0 // Полное выжигание галлюцинации и лени
        });

        // Прямой системный кабель на официальный эндпоинт Китая
        const options = {
            hostname: '://deepseek.com',
            port: 443,
            path: '/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Подхватывает твой новый ключ DeepSeek из переменной GEEKBOT_API_KEY
                'Authorization': `Bearer ${process.env.GEEKBOT_API_KEY || ''}`,
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const gRequest = https.request(options, (gResponse) => {
            let buffer = '';
            gRequest.on('data', (chunk) => { buffer += chunk; });
            gResponse.on('end', () => {
                try {
                    if (gResponse.statusCode !== 200) {
                        return res.status(200).json({
                            choices: [{ message: { content: `❌ Отказ официального ядра DeepSeek (Статус ${gResponse.statusCode}): ${buffer}. Проверьте токен в панели Vercel.` } }]
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
