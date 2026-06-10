import { NextResponse } from "next/server";
import { Resend } from "resend";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://molim.team";

export async function POST(request) {
  try {
    const { scholarship } = await request.json();

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("notifyOnNewScholarship", "==", true));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json({ message: "لا يوجد مشتركون" });
    }

    const emails = snapshot.docs.map((d) => d.data().email).filter(Boolean);

    const results = await Promise.allSettled(
      emails.map((email) =>
        resend.emails.send({
          from: "مُلم <onboarding@resend.dev>",
          to: email,
          subject: `منحة جديدة متاحة: ${scholarship.name}`,
          html: buildEmailHTML(scholarship),
        })
      )
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    return NextResponse.json({ sent });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function buildEmailHTML(s) {
  const deadline = s.deadline
    ? new Date(s.deadline).toLocaleDateString("ar-SA", {
        year: "numeric", month: "long", day: "numeric",
      })
    : "غير محدد";

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
        style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);max-width:96vw;">

        <tr><td style="background:#FF6B00;padding:28px 32px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:24px;">مُلم</h1>
          <p style="margin:6px 0 0;color:#ffe0c2;font-size:14px;">منصة اكتشاف المنح الدراسية</p>
        </td></tr>

        <tr><td style="padding:32px;">
          <p style="color:#333;font-size:15px;line-height:1.7;">
            يسعدنا إخبارك بأن منحة دراسية أصبحت متاحة على منصة <strong>مُلم</strong>:
          </p>
          <table width="100%" cellpadding="0" cellspacing="0"
            style="background:#fff8f3;border:1px solid #ffd5b0;border-radius:10px;margin-bottom:24px;">
            <tr><td style="padding:24px;">
              <h2 style="margin:0 0 16px;color:#FF6B00;font-size:20px;">${s.name}</h2>
              <table width="100%">
                ${s.country ? `<tr>
                  <td style="padding:5px 0;color:#888;font-size:13px;width:110px;">🌍 الدولة</td>
                  <td style="padding:5px 0;color:#333;font-size:14px;font-weight:600;">${s.country}</td>
                </tr>` : ""}
                ${s.degree ? `<tr>
                  <td style="padding:5px 0;color:#888;font-size:13px;">🎓 الدرجة</td>
                  <td style="padding:5px 0;color:#333;font-size:14px;font-weight:600;">${s.degree}</td>
                </tr>` : ""}
                ${s.language ? `<tr>
                  <td style="padding:5px 0;color:#888;font-size:13px;">🗣️ اللغة</td>
                  <td style="padding:5px 0;color:#333;font-size:14px;font-weight:600;">${s.language}</td>
                </tr>` : ""}
                <tr>
                  <td style="padding:5px 0;color:#888;font-size:13px;">📅 آخر موعد</td>
                  <td style="padding:5px 0;color:#e53e3e;font-size:14px;font-weight:700;">${deadline}</td>
                </tr>
              </table>
            </td></tr>
          </table>
          <table width="100%"><tr><td align="center">
            <a href="${SITE_URL}/scholarship/${s.id}"
              style="display:inline-block;background:#FF6B00;color:#fff;text-decoration:none;
                     padding:14px 40px;border-radius:8px;font-size:16px;font-weight:700;">
              اطّلع على تفاصيل المنحة ←
            </a>
          </td></tr></table>
        </td></tr>

        <tr><td style="background:#f9f9f9;padding:20px 32px;border-top:1px solid #eee;text-align:center;">
          <p style="margin:0;color:#aaa;font-size:12px;">
            وصلك هذا الإيميل لاشتراكك في إشعارات منصة
            <a href="${SITE_URL}" style="color:#FF6B00;text-decoration:none;">molim.team</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}