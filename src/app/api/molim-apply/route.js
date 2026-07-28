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
      email,
      phone,
      nationality,
      volunteerFields, // Array
      skills, // Array
      otherSkills,
      experience,
      previousVolunteering,
      reasonToVolunteer,
      weeklyHours,
      telegramLink,
      socialLinks,
      notes,
      honeypot
    } = body;

    // 1. Honeypot check
    if (honeypot) {
      // Silently reject if honeypot is filled
      return NextResponse.json({ success: true }, {
        status: 200,
        headers: { 'Access-Control-Allow-Origin': 'https://molim.team' }
      });
    }

    // 2. Basic Server-side Validation
    if (!fullName || !email || !phone || !nationality || !volunteerFields || volunteerFields.length === 0 || !skills || skills.length === 0 || !experience || !previousVolunteering || !reasonToVolunteer || !weeklyHours || !telegramLink) {
      return NextResponse.json({ error: 'يرجى تعبئة جميع الحقول المطلوبة' }, {
        status: 400,
        headers: { 'Access-Control-Allow-Origin': 'https://molim.team' }
      });
    }

    if (volunteerFields.length > 2) {
      return NextResponse.json({ error: 'يمكنك اختيار مجالين كحد أقصى للتطوع' }, {
        status: 400,
        headers: { 'Access-Control-Allow-Origin': 'https://molim.team' }
      });
    }

    if (skills.length > 5) {
      return NextResponse.json({ error: 'يمكنك اختيار 5 مهارات كحد أقصى' }, {
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

    // 3. Prepare Airtable request
    const airtableToken = process.env.AIRTABLE_APPLY_TOKEN;
    const baseId = process.env.AIRTABLE_APPLY_BASE_ID;
    const tableName = process.env.AIRTABLE_APPLY_TABLE_NAME;

    if (!airtableToken || !baseId || !tableName) {
      console.error('Airtable credentials are not properly configured.');
      return NextResponse.json({ error: 'حدث خطأ في الخادم' }, {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': 'https://molim.team' }
      });
    }

    // Map exactly to Airtable columns
    const airtableFields = {
      "الاسم الثلاثي": fullName.substring(0, 200),
      "البريد الإلكتروني": email.substring(0, 200),
      "رقم الهاتف": phone.substring(0, 50),
      "الجنسية - الدولة المقيم فيها": nationality.substring(0, 200),
      "المجال الذي ترغب بالتطوع فيه": volunteerFields, 
      "المهارات والخبرات": skills,
      "اذا كانت لديك مهارات اخرئ اذكرها": otherSkills ? otherSkills.substring(0, 500) : '',
      "هل لديك أي خبرات أو مشاريع عملت عليها من قبل ويمكنك اخبارنا بها؟": experience.substring(0, 2000),
      "هل سبق لك العمل مع فريق تطوعي من قبل أو لا؟": previousVolunteering,
      "لماذا تريد التطوع في فريق مُلِم؟": reasonToVolunteer.substring(0, 2000),
      "كم وقت تستطيع تخصيصه اسبوعيا للعمل مع فريق مُلِم؟": weeklyHours,
      "رابط حساب التلجرام": telegramLink.substring(0, 500),
      "رابط حساباتك بالسوشال ميديا": socialLinks ? socialLinks.substring(0, 2000) : '',
      "ملاحظات مقدم الطلب": notes ? notes.substring(0, 2000) : ''
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
    console.error('Apply API Error:', error);
    return NextResponse.json({ error: 'حدث خطأ غير متوقع' }, {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': 'https://molim.team' }
    });
  }
}