const https = require('https');

export default function handler(req, res) {
    // Включаем CORS для беспрепятственного прохода данных на promis.space
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

        // Формируем тело запроса для отправки на GeekBot
        const postData = JSON.stringify({
            model: 'geekbot',
            messages: messages,
            temperature: temperature || 0.0
        });

        // Жесткие системные настройки сетевого потока к geekbot.ru
        const options = {
            hostname: 'geekbot.ru',
            port: 443,
            path: '/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GEEKBOT_API_KEY || ''}`,
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        // Открываем прямой системный кабель к серверу GeekBot
        const gRequest = https.request(options, (gResponse) => {
            let buffer = '';

            gResponse.on('data', (chunk) => { buffer += chunk; });

            gResponse.on('end', () => {
                try {
                    // Если GeekBot вернул ошибку, мы выводим её текст на сайт, а не падаем
                    if (gResponse.statusCode !== 200) {
                        return res.status(200).json({
                            choices: [{ message: { content: `❌ Отказ сервера GeekBot (Статус ${gResponse.statusCode}): ${buffer}. Проверьте токен на Vercel.` } }]
                        });
                    }

                    const data = JSON.parse(buffer);
                    return res.status(200).json(data);
                } catch (parseErr) {
                    return res.status(200).json({
                        choices: [{ message: { content: `❌ Ошибка обработки ответа ИИ: ${buffer}` } }]
                    });
                }
            });
        });

        gRequest.on('error', (e) => {
            return res.status(200).json({
                choices: [{ message: { content: `❌ Ошибка коннекта моста к GeekBot: ${e.message}` } }]
            });
        });

        // Заталкиваем наш Payload в кабель и закрываем поток
        gRequest.write(postData);
        gRequest.end();

    } catch (error) {
        return res.status(200).json({
            choices: [{ message: { content: `❌ Авария скрипта Node.js: ${error.message}` } }]
        });
    }
}
