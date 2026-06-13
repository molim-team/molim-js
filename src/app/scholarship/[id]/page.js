import Link from 'next/link';
import ShareButton from './ShareButton';
import { notFound } from 'next/navigation';
import { readFile } from 'fs/promises';
import path from 'path';
import { getIsOpen } from '@/lib/scholarshipUtils';

// تولد كل صفحات المنح وقت البناء
export async function generateStaticParams() {
  const filePath = path.join(process.cwd(), 'public', 'scholarships.json');
  const data = await readFile(filePath, 'utf-8');
  const scholarships = JSON.parse(data);
  return scholarships.map((s) => ({ id: String(s.id) }));
}

// تقرأ البيانات مرة وحدة وقت البناء
async function getScholarship(id) {
  const filePath = path.join(process.cwd(), 'public', 'scholarships.json');
  const data = await readFile(filePath, 'utf-8');
  const scholarships = JSON.parse(data);
  return scholarships.find((item) => String(item.id) === String(id)) || null;
}

export default async function ScholarshipDetails({ params }) {
  const { id } = await params;
  const scholarship = await getScholarship(id);

  if (!scholarship) notFound();

  const s = scholarship;

  const isOpen = getIsOpen(s);

  return (
    <div id="scholarship-details" className="details-container">
      <div className="details-hero-container">
        {s.flag && (
          <img src={s.flag} alt="flag" className="details-flag" />
        )}
        <h1>{s.name}</h1>
        <p>{s.name_en || ''}</p>
        <span className={`status ${isOpen ? 'open' : 'closed'}`}>
          {isOpen ? '✅ التقديم مفتوح' : '🔴 التقديم مغلق'}
        </span>
      </div>

      <div className="details-body">
        <div className="details-card">
          <h2>📋 معلومات عامة</h2>
          <p><strong>الدولة:</strong> {s.country}</p>
          <p><strong>المراحل الدراسية:</strong> {s.degree}</p>
          {s.language && <p><strong>لغة الدراسة:</strong> {s.language}</p>}
          {s.open_date && <p><strong>موعد فتح التقديم:</strong> {s.open_date}</p>}
          <p><strong>آخر موعد للتقديم:</strong> {s.deadline}</p>
        </div>

        {s.majors?.length > 0 && (
          <div className="details-card">
            <h2>📚 التخصصات المتاحة</h2>
            <ul>{s.majors.map((m, i) => <li key={i}>{m}</li>)}</ul>
          </div>
        )}

        {s.benefits?.length > 0 && (
          <div className="details-card">
            <h2>🎁 المميزات</h2>
            <ul>{s.benefits.map((b, i) => <li key={i}>{b}</li>)}</ul>
          </div>
        )}

        {s.requirements?.length > 0 && (
          <div className="details-card">
            <h2>📌 الشروط والمتطلبات</h2>
            <ul>{s.requirements.map((r, i) => <li key={i}>{r}</li>)}</ul>
          </div>
        )}

        {s.documents && (
          <div className="details-card">
            <h2>الملفات المطلوبة 📄</h2>
            {s.documents.required?.length > 0 && (
              <>
                <p><strong>🔴 إجباري:</strong></p>
                <ul>{s.documents.required.map((d, i) => <li key={i}>{d}</li>)}</ul>
              </>
            )}
            {s.documents.optional?.length > 0 && (
              <>
                <p><strong>🟡 اختياري:</strong></p>
                <ul>{s.documents.optional.map((d, i) => <li key={i}>{d}</li>)}</ul>
              </>
            )}
          </div>
        )}

        {s.notes && (
          <div className="details-card">
            <h2>ملاحظات وتفاصيل إضافية 📝</h2>
            <p style={{ whiteSpace: 'pre-wrap' }}>{s.notes}</p>
          </div>
        )}

        {s.groupLink && (
          <div className="btn-split">
            <a href={s.groupLink} target="_blank" rel="noreferrer" className="btn-main btn-split-half">
              👥 قناة المنحة
            </a>
            {s.discussionLink && (
              <a href={s.discussionLink} target="_blank" rel="noreferrer" className="btn-main btn-split-half">
                💬 مناقشة المنحة
              </a>
            )}
          </div>
        )}

        {s.link && (
          <a href={s.link} target="_blank" rel="noreferrer" className="btn-main">
            🌐 زيارة الموقع الرسمي للتقديم
          </a>
        )}

        <ShareButton scholarship={s} id={id} />

        <Link href="/scholarships" className="btn-main">← العودة لجميع المنح</Link>
      </div>
    </div>
  );
}