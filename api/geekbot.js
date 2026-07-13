const options = {
            hostname: '://deepseek.com',
            port: 443,
            path: '/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GEEKBOT_API_KEY || ''}`,
                'Content-Length': Buffer.byteLength(postData)
            }
        };
