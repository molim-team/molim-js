import fs from 'fs';
import path from 'path';

export async function generateArabicCertPDF({ name, cert_type, certificateText, qrCodeBase64, type }) {

  // اختيار الخلفية بناءً على نوع الشهادة فقط
  let imgFileName;
  switch (type) {
    case 'participation':
      imgFileName = 'participation-bg.png';
      break;
    case 'experience':
      imgFileName = 'experience-bg.png';
      break;
    case 'volunteer':
    default:
      imgFileName = 'volunteer-bg.png';
      break;
  }

  const imgPath = path.resolve(process.cwd(), `public/templates/${imgFileName}`);
  const imgBase64 = fs.readFileSync(imgPath).toString('base64');
  const fontPath = path.resolve(process.cwd(), 'public/fonts/Cairo-Regular.ttf');
  const fontBase64 = fs.readFileSync(fontPath).toString('base64');

  // لتغميق أي جملة بين نجمتين
  const formattedCertText = certificateText.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        @font-face {
          font-family: 'Cairo';
          src: url('data:font/truetype;base64,${fontBase64}') format('truetype');
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          width: 1000px; height: 700px;
          font-family: 'Cairo', sans-serif;
          direction: rtl; position: relative; overflow: hidden;
        }
        .bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
        .content {
          position: relative; z-index: 1; width: 100%; height: 100%;
          display: flex; flex-direction: column; align-items: center;
          padding-top: 100px; color: #262626;
        }
        .cert-type { font-size: 32px; font-weight: 700; margin-bottom: 40px; }
        .subtitle { font-size: 18px; color: #444; margin-bottom: 12px; }
        .name {
          font-size: 28px; font-weight: 700;
          margin-bottom: 30px; min-width: 300px; text-align: center;
        }
        .body-text { font-size: 17px; line-height: 1.9; text-align: center; max-width: 820px; padding: 0 40px; }
        .signature-area {
          position: absolute; bottom: 125px; right: 165px;
          text-align: center; font-size: 13px; color: #333; line-height: 1.6;
        }
        .qr-code {
          position: absolute;
          bottom: 45px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
        }
        .qr-text {
        font-size: 11px;
        color: #000;
        font-weight: bold;
        }
        .qr-code img {
          width: 110px;
          height: 110px;
        }
        .body-text b {
          font-weight: 900;
          color: #000;
        }
      </style>
    </head>
    <body>
      <img class="bg" src="data:image/png;base64,${imgBase64}" />
      <div class="content">
        <div class="cert-type">${cert_type}</div>
        <div class="subtitle">تقدم هذه الشهادة إلى عضو فريق مُلم</div>
        <div class="name">${name}</div>
        <div class="body-text">${formattedCertText}</div>
      </div>
      <div class="signature-area">
        <div>مدير فريق ملم</div>
        <div>أصيل الصلوي</div>
      </div>
      <div class="qr-code">
        <img src="data:image/png;base64,${qrCodeBase64}" />
        <span class="qr-text">امسح للتحقق</span>
      </div>
    </body>
    </html>
  `;

  let browser;

  // محلياً: puppeteer العادي — على Vercel: @sparticuz/chromium
  if (process.env.NODE_ENV === 'production') {
    const chromium = (await import('@sparticuz/chromium')).default;
    const puppeteer = (await import('puppeteer-core')).default;
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1000, height: 700 },
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  } else {
    const puppeteer = (await import('puppeteer')).default;
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox'],
      defaultViewport: { width: 1000, height: 700 },
    });
  }

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({
    width: '1000px', height: '700px', printBackground: true,
  });
  await browser.close();
  return Buffer.from(pdfBuffer);
}