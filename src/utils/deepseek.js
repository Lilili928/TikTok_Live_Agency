// DeepSeek API utility — supports both Vercel proxy and direct call
const VERCEL_PROXY = '/api/generate';
const DIRECT_API = 'https://api.deepseek.com/v1/chat/completions';
const DIRECT_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;

export async function callDeepSeek(systemPrompt, userMessage) {
  // Prefer Vercel proxy (safer, hides API key)
  try {
    const response = await fetch(VERCEL_PROXY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemPrompt, userMessage }),
    });
    if (response.ok) {
      const data = await response.json();
      return data.content;
    }
    // If Vercel proxy returns a server error (not 404), it's deployed but broken
    if (response.status >= 500) {
      throw new Error(`Vercel proxy error: ${response.status}`);
    }
  } catch (e) {
    // Vercel not available (404 or network error) — fall through to direct
    if (e.message?.includes('Vercel proxy error')) throw e;
  }

  // Fallback: direct DeepSeek call
  if (!DIRECT_KEY) {
    console.warn('No API key available — using mock fallback');
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    return `亲爱的主播你好！活动倒计时中，距离目标只差最后一步了，专属激励已就位，今晚开播冲刺一下吧！💪`;
  }

  const response = await fetch(DIRECT_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DIRECT_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage || '请生成催播话术' },
      ],
      temperature: 0.8,
      max_tokens: 600,
    }),
  });

  if (!response.ok) throw new Error(`DeepSeek API error: ${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content;
}
