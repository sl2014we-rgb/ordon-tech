module.exports = async function handler(req, res) {
    // 1. Абсолютный CORS-прострел под корень для promis.space
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // 2. Мгновенно гасим предварительную проверку браузера (Preflight)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Разрешены только POST-запросы ORDON' });
    }

    try {
        const { messages, temperature } = req.body;

        // 3. Формируем Payload строго под стандарты DeepSeek API
        const postData = {
            model: 'deepseek-chat', // Флагманское рассуждающее ядро DeepSeek-V3
            messages: messages,
            temperature: temperature || 0.0 // Полное выжигание галлюцинаций
        };

        // 4. Запускаем нативный fetch напрямую на официальный сервер Китая
        // CloudFront пропустит этот запрос, так как мы передаем легитимный User-Agent
        const response = await fetch('https://deepseek.com', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Подхватывает твой новый ключ из сейфа настроек Vercel
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY || ''}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ORDON/0.3'
            },
            body: JSON.stringify(postData)
        });

        const responseText = await response.text();

        // 5. Обработка ответа
        if (!response.ok) {
            return res.status(200).json({
                choices: [{ message: { content: `❌ Ошибка серверов DeepSeek/CloudFront (Статус ${response.status}): ${responseText}. Проверьте баланс аккаунта и токен в Vercel.` } }]
            });
        }

        const data = JSON.parse(responseText);
        return res.status(200).json(data);

    } catch (error) {
        return res.status(200).json({
            choices: [{ message: { content: `❌ Авария транзитного скрипта Node.js: ${error.message}` } }]
        });
    }
};
