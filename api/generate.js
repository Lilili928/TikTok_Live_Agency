// Vercel Serverless Function — DeepSeek API Proxy
// Deploy to Vercel, set DEEPSEEK_API_KEY in Environment Variables

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { systemPrompt, userMessage, mode } = req.body || {};

  if (!systemPrompt) {
    return res.status(400).json({ error: 'Missing systemPrompt' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server API key not configured' });
  }

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage || (mode === 'polish' ? '请润色优化以上内容' : '请生成催播话术') },
        ],
        temperature: 0.8,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: `DeepSeek API error: ${response.status}`, detail: err });
    }

    const data = await response.json();
    return res.status(200).json({ content: data.choices[0].message.content });
  } catch (e) {
    return res.status(500).json({ error: 'Internal server error', detail: e.message });
  }
}
