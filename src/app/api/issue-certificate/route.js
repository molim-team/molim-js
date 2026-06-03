import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import QRCode from 'qrcode';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';


// ─────────────────────────────────────────────
// التوكن السري لحماية الـ API
// ─────────────────────────────────────────────
const ADMIN_TOKEN = process.env.CERT_ADMIN_TOKEN;

function formatArabicText(text) {
  const segments = text.split(/(\d+[\d.,]*|\s+)/);

  const processed = segments.map((seg) => {
    if (!seg) return seg;
    if (/^[\d.,]+$/.test(seg)) return seg;  
    if (/^\s+$/.test(seg)) return seg;     
    return seg.split(' ').filter(w => w).reverse().join(' ');
  });

  return processed.reverse().join('');
}
// ─────────────────────────────────────────────
// تقسيم النص إلى أسطر (Text Wrapping)
// ─────────────────────────────────────────────
function wrapArabicText(rawText, font, fontSize, maxWidth) {
  const words = rawText.trim().split(/\s+/);
  const lines = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testFormatted = formatArabicText(testLine);
    const testWidth = font.widthOfTextAtSize(testFormatted, fontSize);

    if (testWidth > maxWidth && currentLine !== '') {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines;
}

// ─────────────────────────────────────────────
// API Route Handler
// ─────────────────────────────────────────────
export async function POST(request) {
  try {

    // ── التحقق من التوكن ──
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '').trim();

    if (!ADMIN_TOKEN || token !== ADMIN_TOKEN) {
      return NextResponse.json(
        { error: 'غير مصرح. التوكن غير صحيح.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, cert_type, certificateText } = body;

    // ── التحقق من البيانات ──
    if (!name || !email || !cert_type || !certificateText) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة.' },
        { status: 400 }
      );
    }

    // ── الرقم التسلسلي ──
    const certId = `MOLIM-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const verifyUrl = `https://molim.team/verify/${certId}`;

    // ── QR Code ──
    const qrCodeBuffer = await QRCode.toBuffer(verifyUrl, { width: 120, margin: 1 });

    // ── قراءة القالب ──
    const imagePath = path.resolve(process.cwd(), 'public/templates/template_volunteer.png');
    const imageBytes = fs.readFileSync(imagePath);

    // ── إنشاء PDF ──
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const fontPath = path.resolve(process.cwd(), 'public/fonts/Cairo-Regular.ttf');
    const fontBytes = fs.readFileSync(fontPath);
    const customFont = await pdfDoc.embedFont(fontBytes);

    const PAGE_WIDTH = 1000;
    const PAGE_HEIGHT = 700;
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

    const embeddedImage = await pdfDoc.embedPng(imageBytes);
    page.drawImage(embeddedImage, { x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT });

    // ── QR Code (موضعه محفوظ) ──
    const embeddedQr = await pdfDoc.embedPng(qrCodeBuffer);
    page.drawImage(embeddedQr, { x: 440, y: 55, width: 120, height: 120 });

    // ── لون النصوص ──
    const TEXT_COLOR = rgb(0.15, 0.15, 0.15);

    // ────────────────────────────────────────
    // 1️⃣ عنوان الشهادة 
    // ────────────────────────────────────────
    const titleFontSize = 32;
    const formattedTitle = formatArabicText(cert_type);
    const titleWidth = customFont.widthOfTextAtSize(formattedTitle, titleFontSize);
    const titleX = (PAGE_WIDTH - titleWidth) / 2;

    page.drawText(formattedTitle, {
      x: titleX,
      y: 530,
      size: titleFontSize,
      font: customFont,
      color: TEXT_COLOR,
    });

    // ────────────────────────────────────────
    // 2️⃣ الاسم 
    // ────────────────────────────────────────
    const nameFontSize = 28;
    const formattedName = formatArabicText(name);
    const nameWidth = customFont.widthOfTextAtSize(formattedName, nameFontSize);
    const nameX = (PAGE_WIDTH - nameWidth) / 2;

    page.drawText(formattedName, {
      x: nameX,
      y: 400, // ← كان 445، نزّلناه
      size: nameFontSize,
      font: customFont,
      color: TEXT_COLOR,
    });

    // ────────────────────────────────────────
    // 3️⃣ نص الشهادة الكامل — أسفل قليلاً من السابق
    // ────────────────────────────────────────
    const bodyFontSize = 17;
    const LINE_HEIGHT = 30;
    const TEXT_MAX_WIDTH = 820;
    const BODY_START_Y = 315; // ← كان 360، نزّلناه

    const lines = wrapArabicText(certificateText, customFont, bodyFontSize, TEXT_MAX_WIDTH);

    lines.forEach((line, index) => {
      const formattedLine = formatArabicText(line);
      const lineWidth = customFont.widthOfTextAtSize(formattedLine, bodyFontSize);
      const lineX = (PAGE_WIDTH - lineWidth) / 2;
      const lineY = BODY_START_Y - index * LINE_HEIGHT;

      page.drawText(formattedLine, {
        x: lineX,
        y: lineY,
        size: bodyFontSize,
        font: customFont,
        color: TEXT_COLOR,
      });
    });

    // ── حفظ PDF ──
    const pdfBytes = await pdfDoc.save();

    // ── قاعدة البيانات ──
    const insert = db.prepare(`
      INSERT INTO certificates (id, name, email, cert_type, certificate_text)
      VALUES (?, ?, ?, ?, ?)
    `);
    insert.run(certId, name, email, cert_type, certificateText);

    // ── إرسال البريد ──
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'molim.team@gmail.com',
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: '"فريق مُلم التطوعي" <molim.team@gmail.com>',
      to: email,
      subject: `${cert_type} معتمدة - ${name}`,
      text: `مرحباً ${name}،\n\nيسعدنا تقديم شهادتك المعتمدة من فريق مُلِم. تجد الشهادة مرفقة بصيغة PDF.\n\nيمكن التحقق من صحة الشهادة عبر الرابط:\n${verifyUrl}`,
      attachments: [
        {
          filename: `Certificate-${name}.pdf`,
          content: Buffer.from(pdfBytes),
        },
      ],
    });

    return NextResponse.json({
      success: true,
      certId,
      message: 'تم إصدار الشهادة وإرسالها بنجاح!',
    });

  } catch (error) {
    console.error('[issue-certificate] Error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء معالجة الشهادة.' },
      { status: 500 }
    );
  }
}