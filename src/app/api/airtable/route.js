// هذا خاص بتقديم الدعم الفني فقط

import { NextResponse } from 'next/server';

// Simple in-memory rate limiting
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

function checkRateLimit(ip) {
  const now = Date.now();
  const userRecord = rateLimitStore.get(ip) || { count: 0, startTime: now };

  if (now - userRecord.startTime > RATE_LIMIT_WINDOW_MS) {
    userRecord.count = 1;
    userRecord.startTime = now;
  } else {
    userRecord.count++;
  }

  rateLimitStore.set(ip, userRecord);
  return userRecord.count <= MAX_REQUESTS_PER_WINDOW;
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'https://molim.team',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(req) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'لقد تجاوزت الحد المسموح من الطلبات. يرجى المحاولة لاحقاً.' },
        {
          status: 429,
          headers: { 'Access-Control-Allow-Origin': 'https://molim.team' }
        }
      );
    }

    const body = await req.json();
    const {
      fullName,
      birthDate,
      nationality,
      residence,
      email,
      telegram,
      whatsapp,
      joinReason,
      freeTime,
      arabicSkill,
      writtenCommSkill,
      explainingSkill,
      scenario1,
      scenario2,
      scenario3,
      scenario4,
      scenario5,
      agreeEthics,
      agreePrivacy,
      agreeTraining,
      honeypot
    } = body;

    // 1. Honeypot check
    if (honeypot) {
      // Silently reject if honeypot is filled (likely a bot)
      return NextResponse.json({ success: true }, {
        status: 200,
        headers: { 'Access-Control-Allow-Origin': 'https://molim.team' }
      });
    }

    // 2. Basic Server-side Validation
    if (
      !fullName || !birthDate || !nationality || !residence || !email || !telegram ||
      !joinReason || !freeTime || !arabicSkill || !writtenCommSkill || !explainingSkill ||
      !scenario1 || !scenario2 || !scenario3 || !scenario4 || !scenario5
    ) {
      return NextResponse.json({ error: 'يرجى تعبئة جميع الحقول المطلوبة' }, {
        status: 400,
        headers: { 'Access-Control-Allow-Origin': 'https://molim.team' }
      });
    }

    if (!agreeEthics || !agreePrivacy || !agreeTraining) {
      return NextResponse.json({ error: 'يرجى الموافقة على جميع التعهدات والشروط' }, {
        status: 400,
        headers: { 'Access-Control-Allow-Origin': 'https://molim.team' }
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'صيغة البريد الإلكتروني غير صحيحة' }, {
        status: 400,
        headers: { 'Access-Control-Allow-Origin': 'https://molim.team' }
      });
    }

    const validSkillLabels = ['سيئ', 'مقبول', 'جيد', 'جيد جداً', 'ممتاز'];
    if (
      !validSkillLabels.includes(arabicSkill) ||
      !validSkillLabels.includes(writtenCommSkill) ||
      !validSkillLabels.includes(explainingSkill)
    ) {
      return NextResponse.json({ error: 'قيمة تقييم غير صحيحة' }, {
        status: 400,
        headers: { 'Access-Control-Allow-Origin': 'https://molim.team' }
      });
    }

    // 3. Prepare Airtable request
    const airtableToken = process.env.AIRTABLE_SUPPORT_TOKEN;
    const baseId = process.env.AIRTABLE_SUPPORT_BASE_ID;
    const tableName = process.env.AIRTABLE_SUPPORT_TABLE_NAME;

    if (!airtableToken || !baseId || !tableName) {
      console.error('Airtable support credentials are not properly configured.');
      return NextResponse.json({ error: 'حدث خطأ في الخادم' }, {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': 'https://molim.team' }
      });
    }

    // Map exactly to Airtable columns
    const airtableFields = {
      "الاسم الثلاثي": fullName.substring(0, 200),
      "تاريخ الميلاد": birthDate,
      "الجنسية": nationality.substring(0, 200),
      "مكان السكن الحالي": residence.substring(0, 200),
      "البريد الإلكتروني": email.substring(0, 200),
      "حساب تيليجرام (Username)": telegram.substring(0, 200),
      "رقم الواتساب": whatsapp ? whatsapp.substring(0, 50) : '',
      "ما هو سبب رغبتك في الانضمام لفريق مُلِم؟": joinReason.substring(0, 2000),
      "أوقات التفرغ المناسبة لك للعمل التطوعي": freeTime.substring(0, 500),
      "تقييم التواصل باللغة العربية الفصحى": arabicSkill,
      "تقييم التواصل الكتابي مع المستفيدين": writtenCommSkill,
      "تقييم القدرة على شرح المعلومات ببساطة ووضوح": explainingSkill,
      "سيناريو 1 - واجهت مشكلة لأول مرة ولا تعرف حلها": scenario1.substring(0, 2000),
      "سيناريو 2 - قدمت معلومة خاطئة للمستفيد": scenario2.substring(0, 2000),
      "سيناريو 3 - عضو فريق يرد بطريقة غير مناسبة": scenario3.substring(0, 2000),
      "سيناريو 4 - طلب منك معلومات خاصة بمستفيد": scenario4.substring(0, 2000),
      "سيناريو 5 - قُبلت ثم شعرت أنك لا تستطيع الالتزام": scenario5.substring(0, 2000),
      "التعهد بأخلاقيات العمل التطوعي": Boolean(agreeEthics),
      "التعهد بسرية البيانات": Boolean(agreePrivacy),
      "الموافقة على حضور التدريب": Boolean(agreeTraining)
    };

    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${airtableToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        records: [
          {
            fields: airtableFields
          }
        ],
        typecast: true
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Airtable API Error:', errorData);
      return NextResponse.json({ error: 'فشل في إرسال الطلب، يرجى المحاولة لاحقاً' }, {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': 'https://molim.team' }
      });
    }

    return NextResponse.json({ success: true }, {
      headers: { 'Access-Control-Allow-Origin': 'https://molim.team' }
    });

  } catch (error) {
    console.error('Support Apply API Error:', error);
    return NextResponse.json({ error: 'حدث خطأ غير متوقع' }, {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': 'https://molim.team' }
    });
  }
}