export default async function handler(req, res) {
    // CORS-шлюзы для promis.space
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

        // Прямой запрос к GeekBot.ru
        const response = await fetch('https://geekbot.ru', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GEEKBOT_API_KEY || ''}`
            },
            body: JSON.stringify({
                model: 'geekbot',
                messages: messages,
                temperature: temperature || 0.0
            })
        });

        // Если сам GeekBot ответил ошибкой, мы выводим ее текст, а не падаем в 500!
        if (!response.ok) {
            const errText = await response.text();
            return res.status(200).json({
                choices: [{ message: { content: `❌ Ошибка внешнего сервера GeekBot (Статус ${response.status}): ${errText}. Проверьте токен GEEKBOT_API_KEY на Vercel.` } }]
            });
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        // Выводим текст системной ошибки Node.js прямо на экран сайта для диагностики
        return res.status(200).json({
            choices: [{ message: { content: `❌ Внутренний сбой скрипта Node.js: ${error.message}` } }]
        });
