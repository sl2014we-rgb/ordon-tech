const https = require('https');

module.exports = function handler(req, res) {
    // CORS (можно вынести в middleware, но оставляем для совместимости)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(204).end(); // 204 No Content для preflight
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    // Проверка наличия ключа ДО отправки запроса
    if (!apiKey || apiKey.trim() === '') {
        console.error('DEEPSEEK_API_KEY is missing');
        return res.status(500).json({ 
            choices: [{ message: { content: '❌ Ошибка конфигурации: API ключ не найден. Проверьте переменные окружения в Vercel.' } }] 
        });
    }

    const { messages, temperature } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Invalid payload: messages array is required' });
    }

    const postData = JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        temperature: typeof temperature === 'number' ? temperature : 0.0
    });

    const options = {
        hostname: 'api.deepseek.com',
        port: 443,
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer \${apiKey}`, // ✅ Исправлено: правильная подстановка
            'Content-Length': Buffer.byteLength(postData),
            'User-Agent': 'ORDON-Integration/1.0' // Полезно для аналитики
        },
        timeout: 60000 // 60 секунд таймаут
    };

    const gRequest = https.request(options, (gResponse) => {
        let buffer = '';
        
        gResponse.on('data', (chunk) => {
            buffer += chunk;
        });

        gResponse.on('end', () => {
            // Пробрасываем реальный статус от DeepSeek (401, 500 и т.д.)
            // Если DeepSeek вернул ошибку, мы не должны возвращать 200 клиенту
            const statusCodeToReturn = (gResponse.statusCode >= 500) ? 502 : gResponse.statusCode;

            if (gResponse.statusCode !== 200) {
                // Логируем ошибку (без ключа!), но возвращаем понятный ответ
                console.warn(`DeepSeek error ${gResponse.statusCode}: ${buffer.substring(0, 200)}...`);
                
                return res.status(statusCodeToReturn).json({
                    choices: [{ 
                        message: { 
                            content: `❌ Отказ ядра DeepSeek (Статус \${gResponse.statusCode}). Проверьте логи сервера.` 
                        } 
                    }]
                });
            }

            try {
                const data = JSON.parse(buffer);
                return res.status(200).json(data);
            } catch (parseErr) {
                console.error('Parse error:', parseErr);
                return res.status(500).json({
                    choices: [{ 
                        message: { 
                            content: `❌ Ошибка парсинга ответа от DeepSeek. Ответ не является валидным JSON.` 
                        } 
                    }]
                });
            }
        });
    });

    gRequest.on('error', (e) => {
        console.error('Connection error:', e.message);
        return res.status(502).json({
            choices: [{ 
                message: { 
                    content: `❌ Ошибка соединения с API DeepSeek: \${e.message}` 
                } 
            }]
        });
    });

    gRequest.on('timeout', () => {
        gRequest.destroy();
        return res.status(504).json({
            choices: [{ 
                message: { 
                    content: '❌ Превышено время ожидания ответа от DeepSeek.' 
                } 
            }]
        });
    });

    gRequest.write(postData);
    gRequest.end();
};
