module.exports = async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ 
            error: 'Method Not Allowed',
            message: 'Только POST-запросы' 
        });
    }

    try {
        const { messages, temperature = 0.0 } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ 
                error: 'Bad Request',
                message: 'messages должен быть массивом' 
            });
        }

        const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
        if (!DEEPSEEK_API_KEY) {
            return res.status(500).json({ 
                error: 'Server Config Error',
                message: 'DEEPSEEK_API_KEY не настроен' 
            });
        }

        // Правильный эндпоинт и User-Agent
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'User-Agent': 'ORDON-Proxy/0.3'
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: messages,
                temperature: temperature,
                max_tokens: 4096
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('DeepSeek API Error:', data);
            return res.status(response.status).json({
                error: 'DeepSeek API Error',
                details: data.error?.message || data
            });
        }

        return res.status(200).json(data);

    } catch (error) {
        console.error('Proxy Error:', error);
        return res.status(502).json({
            error: 'Bad Gateway',
            message: 'Ошибка прокси-сервера',
            details: error.message
        });
    }
};
