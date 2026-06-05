import { NextResponse } from 'next/server';
import db from '@/lib/db';
import QRCode from 'qrcode';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { generateArabicCertPDF } from '@/lib/generateCertPDF';
import fontkit from '@pdf-lib/fontkit';

const ADMIN_TOKEN = process.env.CERT_ADMIN_TOKEN;

// ─── استنتاج مفتاح النوع من نص الشهادة (عربي أو إنجليزي) ────────────────────
function resolveCertType(cert_type) {
  const val = (cert_type || '').toLowerCase();
  if (val.includes('مشاركة') || val.includes('participation')) return 'participation';
  if (val.includes('خبرة')   || val.includes('experience'))    return 'experience';
  return 'volunteer'; // تطوع أو أي قيمة أخرى
}

// ─── اختيار مسار التمبلت بناءً على نوع الشهادة فقط ───────────────────────────
function getTemplatePath(type) {
  switch (type) {
    case 'participation':
      return path.resolve(process.cwd(), 'public/templates/participation-bg.png');
    case 'experience':
      return path.resolve(process.cwd(), 'public/templates/experience-bg.png');
    case 'volunteer':
    default:
      return path.resolve(process.cwd(), 'public/templates/volunteer-bg.png');
  }
}

// ─── مساعد: تقسيم النص إلى segments مع دعم Bold بالنجمتين ─────────────────────
function parseSegments(rawText) {
  const segments = [];
  const parts = rawText.trim().split(/\*\*(.+?)\*\*/);
  parts.forEach((part, i) => {
    if (!part) return;
    const isBold = i % 2 === 1;
    const words = part.split(/\s+/).filter(Boolean);
    words.forEach(word => {
      segments.push({ text: word, bold: isBold });
    });
  });
  return segments;
}

// ─── مساعد: تلفيف النص الإنجليزي ─────────────────────────────────────────────
function wrapEnglishText(rawText, font, boldFont, fontSize, maxWidth) {
  const segments = parseSegments(rawText);

  const lines = [];
  let currentLineSegments = [];
  let currentLineWidth = 0;

  for (const seg of segments) {
    const segFont = seg.bold ? boldFont : font;
    const segWidth = segFont.widthOfTextAtSize(seg.text, fontSize);

    const spaceWidth = seg.bold
      ? boldFont.widthOfTextAtSize(' ', fontSize)
      : font.widthOfTextAtSize(' ', fontSize);

    const addedWidth = currentLineSegments.length > 0
      ? spaceWidth + segWidth
      : segWidth;

    if (currentLineSegments.length > 0 && currentLineWidth + addedWidth > maxWidth) {
      lines.push(currentLineSegments);
      currentLineSegments = [seg];
      currentLineWidth = segWidth;
    } else {
      if (currentLineSegments.length > 0) {
        currentLineSegments.push({ text: ' ', bold: seg.bold });
      }
      currentLineSegments.push(seg);
      currentLineWidth += addedWidth;
    }
  }
  if (currentLineSegments.length > 0) lines.push(currentLineSegments);
  return lines;
}

// ─── مساعد: حساب العرض الكلي لسطر ────────────────────────────────────────────
function calcLineWidth(lineSegs, font, boldFont, fontSize) {
  return lineSegs.reduce((total, seg) => {
    const segFont = seg.bold ? boldFont : font;
    return total + segFont.widthOfTextAtSize(seg.text, fontSize);
  }, 0);
}

// ─── مساعد: رسم نص في المنتصف ─────────────────────────────────────────────────
function drawCenteredEn(page, text, font, size, y, color, pageW) {
  const w = font.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: (pageW - w) / 2,
    y,
    size,
    font,
    color,
  });
}

// ─── بناء PDF الإنجليزي ────────────────────────────────────────────────────────
async function buildEnglishPDF(pdfDoc, customFont, qrCodeBuffer, data, type) {
  const { nameEn, cert_typeEn, certificateTextEn } = data;

  const PAGE_WIDTH = 1000;
  const PAGE_HEIGHT = 700;
  const TEXT_COLOR = rgb(0.15, 0.15, 0.15);

  // embed الخط العريض
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // اختيار التمبلت بناءً على النوع (نفس منطق العربي)
  const imagePath = getTemplatePath(type);
  const imageBytes = fs.readFileSync(imagePath);

  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const embeddedImage = await pdfDoc.embedPng(imageBytes);
  page.drawImage(embeddedImage, { x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT });

  const embeddedQr = await pdfDoc.embedPng(qrCodeBuffer);
  page.drawImage(embeddedQr, { x: 440, y: 55, width: 120, height: 120 });
  // إضافة نص التحقق تحت الباركود الإنجليزي
        const verifyText = "Scan to Verify";
        const verifyTextSize = 10;
        const verifyTextWidth = customFont.widthOfTextAtSize(verifyText, verifyTextSize);

        page.drawText(verifyText, {
            x: 500 - (verifyTextWidth / 2), 
            y: 40, 
            size: verifyTextSize,
            font: customFont,
            color: TEXT_COLOR,
        });

  // عنوان الشهادة
  drawCenteredEn(page, cert_typeEn, customFont, 32, 530, TEXT_COLOR, PAGE_WIDTH);

  // الجملة الثابتة
  drawCenteredEn(
    page,
    'This certificate is presented to a member of the MOLIM Team',
    customFont, 16, 463, TEXT_COLOR, PAGE_WIDTH
  );

  // الاسم
  drawCenteredEn(page, nameEn, customFont, 27, 418, TEXT_COLOR, PAGE_WIDTH);

  // ── نص الشهادة مع دعم Bold بالنجمتين ──
  const BODY_FONT_SIZE = 17;
  const LINE_HEIGHT = 30;
  const MAX_WIDTH = 820;
  const BODY_Y = 320;

  const lines = wrapEnglishText(
    certificateTextEn,
    customFont,
    boldFont,
    BODY_FONT_SIZE,
    MAX_WIDTH
  );

  lines.forEach((lineSegs, lineIndex) => {
    const y = BODY_Y - lineIndex * LINE_HEIGHT;

    const totalWidth = calcLineWidth(lineSegs, customFont, boldFont, BODY_FONT_SIZE);
    let currentX = (PAGE_WIDTH - totalWidth) / 2;

    lineSegs.forEach(seg => {
      const segFont = seg.bold ? boldFont : customFont;
      const segW = segFont.widthOfTextAtSize(seg.text, BODY_FONT_SIZE);
      page.drawText(seg.text, {
        x: currentX,
        y,
        size: BODY_FONT_SIZE,
        font: segFont,
        color: TEXT_COLOR,
      });
      currentX += segW;
    });
  });

  // اسم المدير
  page.drawText('Head of Molim Team', {
    x: 730, y: 155, size: 14, font: customFont, color: TEXT_COLOR,
  });
  page.drawText('ASEEL AL-SELWE', {
    x: 730, y: 135, size: 14, font: customFont, color: TEXT_COLOR,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// API Route Handler
// ─────────────────────────────────────────────────────────────────────────────
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

    const {
      name, email, cert_type, certificateText,
      nameEn, cert_typeEn, certificateTextEn,
    } = body;

    // يُستنتج تلقائياً من نص الشهادة — لا حاجة لإرساله من الفورم
    const type = resolveCertType(cert_type);

    if (!name || !email || !cert_type || !certificateText) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة.' }, { status: 400 });
    }

    const certId = `MOLIM-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const verifyUrl = `https://molim.team/verify/${certId}`;

    const qrCodeBuffer = await QRCode.toBuffer(verifyUrl, { width: 120, margin: 1 });
    const qrCodeBase64 = qrCodeBuffer.toString('base64');

    // ── بناء PDF العربي (Puppeteer) ──
    const pdfBytes = await generateArabicCertPDF({
      name,
      cert_type,
      certificateText,
      qrCodeBase64,
      type,   // ← يُمرَّر لاختيار التمبلت
    });

    // ── بناء PDF الإنجليزي (pdf-lib) ──
    const pdfDocEn = await PDFDocument.create();
    pdfDocEn.registerFontkit(fontkit);
    const fontPath = path.resolve(process.cwd(), 'public/fonts/Cairo-Regular.ttf');
    const fontBytesEn = fs.readFileSync(fontPath);
    const customFontEn = await pdfDocEn.embedFont(fontBytesEn);
    const qrBufferEn = await QRCode.toBuffer(verifyUrl, { width: 120, margin: 1 });

    await buildEnglishPDF(
      pdfDocEn,
      customFontEn,
      qrBufferEn,
      { nameEn, cert_typeEn, certificateTextEn },
      type,   // ← يُمرَّر لاختيار التمبلت
    );

    const pdfBytesEn = await pdfDocEn.save();

    // ── حفظ في قاعدة البيانات ──
    const insert = db.prepare(`
      INSERT INTO certificates (id, name, email, cert_type, certificate_text)
      VALUES (?, ?, ?, ?, ?)
    `);
    insert.run(certId, name, email, cert_type, certificateText);

    // ── إرسال الإيميل ──
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
      text: `مرحباً ${name}،\n\nيسعدنا تقديم شهادتك التطوعية من فريق مُلِم.\n\nرابط التحقق:\n${verifyUrl}`,
      attachments: [
        {
          filename: `Certificate-AR-${name}.pdf`,
          content: Buffer.from(pdfBytes),
        },
        {
          filename: `Certificate-EN-${nameEn}.pdf`,
          content: Buffer.from(pdfBytesEn),
        },
      ],
    });

    return NextResponse.json({ success: true, certId, message: 'تم إصدار الشهادة وإرسالها بنجاح!' });

  } catch (error) {
    console.error('[issue-certificate] Error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء معالجة الشهادة.' }, { status: 500 });
  }
}