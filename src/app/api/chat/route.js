export const maxDuration = 60;
export const runtime = 'nodejs';

const rateLimitMap = new Map();

export async function POST(req) {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  const origin = req.headers.get('origin') || '';
  const allowedOrigins = ['https://molim.team', 'https://www.molim.team', 'http://localhost:3000'];
  const isAllowedOrigin = allowedOrigins.includes(origin);
  const corsHeaders = {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : 'https://molim.team',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (!isAllowedOrigin && origin !== '') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403, headers: corsHeaders });
  }

  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (ip !== 'unknown') {
    const now = Date.now();
    const userRecord = rateLimitMap.get(ip) || { count: 0, startTime: now };
    if (now - userRecord.startTime > 60000) {
      userRecord.count = 1;
      userRecord.startTime = now;
    } else {
      userRecord.count++;
      if (userRecord.count > 15) {
        return new Response(JSON.stringify({ error: 'الرجاء الانتظار قليلاً' }), { status: 429, headers: corsHeaders });
      }
    }
    rateLimitMap.set(ip, userRecord);
  }

  try {
    const { history } = await req.json();

    if (!history || !Array.isArray(history) || history.length === 0) {
      return new Response(JSON.stringify({ error: 'بيانات غير صالحة' }), { status: 400, headers: corsHeaders });
    }

    const messages = [
      {
        role: 'system',
        content: 'أنت مساعد ذكي اسمك لمام في منصة مُلم. تساعد الطلاب في الإجابة عن كل مايتعلق بالمنح الدراسية وإعداد الملفات الخاصة بها كالسيرة الذاتية وخطاب الحافز. يجب أن تتحدث دائماً باللغة العربية الفصحى البسيطة فقط. استخدم أسلوباً ودوداً وواضحاً، وتجنب الإجابات المقطوعة.'
      },
      ...history.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: typeof m.content === 'string' ? m.content : m.content?.[0]?.text || ''
      }))
    ];

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        stream: true,
        max_tokens: 4096,
        temperature: 0.7
      })
    });

    if (!groqRes.ok) {
      const errorDetails = await groqRes.text();
      console.error('Groq Error:', groqRes.status, errorDetails);
      return new Response(JSON.stringify({ error: 'خطأ في الاتصال', details: errorDetails }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder('utf-8');
    const reader = groqRes.body.getReader();

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = '';
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || trimmed === 'data: [DONE]') continue;
              if (trimmed.startsWith('data: ')) {
                try {
                  const json = JSON.parse(trimmed.slice(6));
                  const text = json.choices?.[0]?.delta?.content;
                  if (text) controller.enqueue(encoder.encode(text));
                } catch (e) {}
              }
            }
          }
        } catch (err) {
          console.error('Stream error:', err);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error('Server error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}