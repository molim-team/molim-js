import { readFileSync } from 'fs';
import { join } from 'path';

export const maxDuration = 60;
export const runtime = 'nodejs';

// ─── Rate Limiting & Message Limits ────────────────────────────────────────────
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 15;
const RATE_LIMIT_CLEANUP_INTERVAL_MS = 5 * 60_000; // تنظيف كل 5 دقايق

const messageLimitMap = new Map();
const MSG_LIMIT_WINDOW_MS = 60 * 60 * 1000; // ساعة واحدة
const MSG_LIMIT_MAX_REQUESTS = 30; // 30 رسالة في الساعة لكل IP

let lastCleanup = Date.now();

function cleanupMaps() {
  const now = Date.now();
  if (now - lastCleanup < RATE_LIMIT_CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now - record.startTime > RATE_LIMIT_WINDOW_MS) {
      rateLimitMap.delete(ip);
    }
  }
  for (const [ip, record] of messageLimitMap.entries()) {
    if (now - record.startTime > MSG_LIMIT_WINDOW_MS) {
      messageLimitMap.delete(ip);
    }
  }
}

// ─── Scholarships RAG ────────────────────────────────────────────────────────
let scholarshipsData = null;

function loadScholarships() {
  if (scholarshipsData) return scholarshipsData;
  try {
    const filePath = join(process.cwd(), 'public', 'scholarships.json');
    const raw = readFileSync(filePath, 'utf-8');
    scholarshipsData = JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load scholarships.json:', e);
    scholarshipsData = [];
  }
  return scholarshipsData;
}

function searchScholarships(query) {
  const data = loadScholarships();
  if (!data || data.length === 0) return [];

  const normalizedQuery = query
    .toLowerCase()
    .replace(/[أإآا]/g, 'ا')
    .replace(/[ةه]/g, 'ه')
    .replace(/ى/g, 'ي');

  const keywords = normalizedQuery.split(/\s+/).filter(w => w.length > 2);
  if (keywords.length === 0) return [];

  const scored = data.map(s => {
    const haystack = [
      s.name || '',
      s.name_en || '',
      s.country || '',
      s.degree || '',
      s.language || '',
      s.description || '',
      ...(s.majors || []),
    ]
      .join(' ')
      .toLowerCase()
      .replace(/[أإآا]/g, 'ا')
      .replace(/[ةه]/g, 'ه')
      .replace(/ى/g, 'ي');

    let score = 0;
    for (const kw of keywords) {
      if (haystack.includes(kw)) score++;
    }
    return { s, score };
  });

  return scored
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 7)
    .map(x => x.s);
}

function buildScholarshipContext(scholarships) {
  if (!scholarships || scholarships.length === 0) return '';

  const items = scholarships.map(s => {
    const parts = [
      `• اسم المنحة: ${s.name}`,
      s.country ? `  الدولة: ${s.country}` : null,
      s.degree ? `  الدرجة: ${s.degree}` : null,
      s.language ? `  اللغة: ${s.language}` : null,
      s.open !== undefined ? `  الحالة: ${s.open ? 'مفتوحة' : 'مغلقة'}` : null,
      s.deadline ? `  آخر موعد: ${s.deadline}` : null,
      s.description ? `  الوصف: ${s.description}` : null,
      s.benefits && s.benefits.length > 0
        ? `  المميزات: ${s.benefits.slice(0, 3).join('، ')}`
        : null,
      s.majors && s.majors.length > 0
        ? `  التخصصات: ${s.majors.slice(0, 2).join('، ')}`
        : null,
    ].filter(Boolean);
    return parts.join('\n');
  });

  return `\n\n[بيانات منح ذات صلة من قاعدة بيانات مُلم]\n${items.join('\n\n')}`;
}

// ─── CORS ────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'https://molim.team',
  'https://www.molim.team',
  'http://localhost:3000',
];

function getCorsHeaders(origin) {
  const isAllowed = ALLOWED_ORIGINS.includes(origin);
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : 'https://molim.team',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

// ─── Constants ───────────────────────────────────────────────────────────────
const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_MESSAGES = 30;
const TEXT_MODEL = 'llama-3.3-70b-versatile';
const VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

// ─── Handlers ────────────────────────────────────────────────────────────────
export async function POST(req) {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  const origin = req.headers.get('origin') || '';
  const corsHeaders = getCorsHeaders(origin);

  // رفض أي طلب مفيهوش Origin ضمن القائمة المسموحة (بما فيها الفاضي/الغائب)
  if (!ALLOWED_ORIGINS.includes(origin)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 403,
      headers: corsHeaders,
    });
  }

  // Rate limiting & Message limiting مع تنظيف دوري
  cleanupMaps();
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  if (ip !== 'unknown') {
    const now = Date.now();
    
    // 1. فحص طلبات الشبكة السريعة (DDoS/Spam)
    const rateRecord = rateLimitMap.get(ip) || { count: 0, startTime: now };
    if (now - rateRecord.startTime > RATE_LIMIT_WINDOW_MS) {
      rateRecord.count = 1;
      rateRecord.startTime = now;
    } else {
      rateRecord.count++;
      if (rateRecord.count > RATE_LIMIT_MAX_REQUESTS) {
        return new Response(
          JSON.stringify({ error: 'الرجاء الانتظار قليلاً' }),
          { status: 429, headers: corsHeaders }
        );
      }
    }
    rateLimitMap.set(ip, rateRecord);

    // 2. فحص عدد الرسائل الكلي خلال ساعة
    const msgRecord = messageLimitMap.get(ip) || { count: 0, startTime: now };
    if (now - msgRecord.startTime > MSG_LIMIT_WINDOW_MS) {
      msgRecord.count = 1;
      msgRecord.startTime = now;
    } else {
      msgRecord.count++;
      if (msgRecord.count > MSG_LIMIT_MAX_REQUESTS) {
        return new Response(
          JSON.stringify({ error: 'عذراً، لقد تجاوزت الحد الأقصى للرسائل المسموح بها حالياً. يرجى المحاولة بعد ساعة.' }),
          { status: 429, headers: corsHeaders }
        );
      }
    }
    messageLimitMap.set(ip, msgRecord);
  }

  try {
    const { history } = await req.json();

    if (!history || !Array.isArray(history) || history.length === 0) {
      return new Response(JSON.stringify({ error: 'بيانات غير صالحة' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // حد عدد الرسائل في الـ history: آخر MAX_HISTORY_MESSAGES فقط
    const trimmedHistory =
      history.length > MAX_HISTORY_MESSAGES
        ? history.slice(history.length - MAX_HISTORY_MESSAGES)
        : history;

    // فحص حد طول الرسالة الأخيرة (رسالة المستخدم الحالية)
    const lastUserMsg = [...trimmedHistory].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      const textContent =
        typeof lastUserMsg.content === 'string'
          ? lastUserMsg.content
          : Array.isArray(lastUserMsg.content)
          ? lastUserMsg.content.find(p => p.type === 'text')?.text || ''
          : '';
      if (textContent.length > MAX_MESSAGE_LENGTH) {
        return new Response(
          JSON.stringify({ error: 'الرسالة طويلة جداً، يرجى تقصيرها (الحد الأقصى 2000 حرف).' }),
          { status: 400, headers: corsHeaders }
        );
      }
    }

    // كشف هل فيه صورة في آخر رسالة مستخدم
    let hasImage = false;
    if (lastUserMsg && Array.isArray(lastUserMsg.content)) {
      hasImage = lastUserMsg.content.some(p => p.type === 'image_url');
    }

    // بحث RAG في بيانات المنح بناءً على نص السؤال
    const userQueryText =
      typeof lastUserMsg?.content === 'string'
        ? lastUserMsg.content
        : Array.isArray(lastUserMsg?.content)
        ? lastUserMsg.content.find(p => p.type === 'text')?.text || ''
        : '';

    const relatedScholarships = searchScholarships(userQueryText);
    const scholarshipContext = buildScholarshipContext(relatedScholarships);

    const systemPrompt =
      'أنت مساعد ذكي اسمك لمام في منصة مُلم. ' +
      'نطاق عملك محدد ومقتصر حصراً على: المنح الدراسية، السيرة الذاتية، خطاب الحافز، والقبول الجامعي والدراسة بشكل عام. ' +
      'إذا كان سؤال المستخدم خارج هذا النطاق تماماً (مثل أسئلة البرمجة، الأخبار، أو مواضيع عامة وشخصية)، يجب عليك رفض الإجابة بلطف واختصار باللغة العربية، وتوجيه المستخدم لسؤالك عن المنح والدراسة فقط، دون محاولة الإجابة على سؤاله الأساسي إطلاقاً. ' +
      'يجب أن تتحدث دائماً باللغة العربية الفصحى البسيطة فقط. استخدم أسلوباً ودوداً وواضحاً، وتجنب الإجابات المقطوعة.' +
      (scholarshipContext
        ? `\n\nعند الإجابة، استخدم المعلومات التالية إن كانت ذات صلة بسؤال المستخدم:${scholarshipContext}`
        : '');

    // بناء الرسائل بصيغة OpenAI-compatible
    const messages = [
      { role: 'system', content: systemPrompt },
      ...trimmedHistory.map(m => {
        if (m.role === 'assistant') {
          return { role: 'assistant', content: typeof m.content === 'string' ? m.content : '' };
        }
        // رسالة المستخدم: إما نص بسيط أو array فيها صورة (OpenAI-compatible)
        if (Array.isArray(m.content)) {
          return { role: 'user', content: m.content };
        }
        return { role: 'user', content: m.content || '' };
      }),
    ];

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: hasImage ? VISION_MODEL : TEXT_MODEL,
        messages,
        stream: true,
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!groqRes.ok) {
      const errorDetails = await groqRes.text();
      console.error('Groq Error:', groqRes.status, errorDetails);
      return new Response(
        JSON.stringify({ error: 'خطأ في الاتصال', details: errorDetails }),
        { status: 502, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
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
      },
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
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}

export async function OPTIONS(req) {
  const origin = req.headers.get('origin') || '';
  const corsHeaders = getCorsHeaders(origin);
  return new Response(null, { status: 200, headers: corsHeaders });
}