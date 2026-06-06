"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ScholarshipDetails() {
  const params = useParams();
  const id = params?.id;
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    fetch('/scholarships.json')
      .then((res) => res.json())
      .then((scholarships) => {
        const s = scholarships.find((item) => String(item.id) === String(id));
        setScholarship(s || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching scholarship details:", err);
        setLoading(false);
      });
  }, [id]);

  const shareScholarship = () => {
    if (!scholarship) return;
    const s = scholarship;
    const cleanUrl = `${window.location.origin}/scholarship/${id}`;
    
    let text = `🎓 ${s.name}\n\n🌍 الدولة: ${s.country}\n⏰ آخر موعد: ${s.deadline}\n\n🔗 ${cleanUrl}\nعبر منصة مُلم 🎓`;

    if (navigator.share) {
      navigator.share({
        title: `مُلم | ${s.name}`,
        text: text,
        url: cleanUrl
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(cleanUrl).then(() => alert('تم نسخ رابط المنحة بنجاح'));
    }
  };

  if (loading) {
    return (
      <div className="details-container">
        <p style={{ textAlign: 'center', marginTop: '50px' }}>⏳ جاري تحميل تفاصيل المنحة...</p>
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="details-container">
        <p style={{ textAlign: 'center', marginTop: '50px' }}>المنحة غير موجودة 😔</p>
        <div style={{ textAlign: 'center' }}>
            <Link href="/scholarships">العودة لجميع المنح</Link>
        </div>
      </div>
    );
  }

  return (
    <div id="scholarship-details" className="details-container">
      <div className="details-hero-container">
        {scholarship.flag && (
          <img src={scholarship.flag} alt="flag" className="details-flag" />
        )}
        <h1>{scholarship.name}</h1>
        <p>{scholarship.name_en || ''}</p>
        <span className={`status ${scholarship.open ? 'open' : 'closed'}`}>
          {scholarship.open ? '✅ التقديم مفتوح' : '🔴 التقديم مغلق'}
        </span>
      </div>

      <div className="details-body">
        <div className="details-card">
          <h2>📋 معلومات عامة</h2>
          <p><strong>الدولة:</strong> {scholarship.country}</p>
          <p><strong>المراحل الدراسية:</strong> {scholarship.degree}</p>
          {scholarship.language && <p><strong>لغة الدراسة:</strong> {scholarship.language}</p>}
          <p><strong>آخر موعد للتقديم:</strong> {scholarship.deadline}</p>
        </div>

        {scholarship.majors?.length > 0 && (
          <div className="details-card">
            <h2>📚 التخصصات المتاحة</h2>
            <ul>{scholarship.majors.map((m, i) => <li key={i}>{m}</li>)}</ul>
          </div>
        )}

        {scholarship.benefits?.length > 0 && (
          <div className="details-card">
            <h2>🎁 المميزات</h2>
            <ul>{scholarship.benefits.map((b, i) => <li key={i}>{b}</li>)}</ul>
          </div>
        )}

        {scholarship.requirements?.length > 0 && (
          <div className="details-card">
            <h2>📌 الشروط والمتطلبات</h2>
            <ul>{scholarship.requirements.map((r, i) => <li key={i}>{r}</li>)}</ul>
          </div>
        )}

        {scholarship.documents && (
  <div className="details-card">
    <h2>الملفات المطلوبة 📄</h2>
    
    {/* عرض الملفات الإجبارية */}
    {scholarship.documents.required?.length > 0 && (
      <>
        <p><strong>🔴 إجباري:</strong></p>
        <ul>
          {scholarship.documents.required.map((d, i) => <li key={i}>{d}</li>)}
        </ul>
      </>
    )}

    {scholarship.documents.optional?.length > 0 && (
      <>
        <p><strong>🟡 اختياري:</strong></p>
        <ul>
          {scholarship.documents.optional.map((d, i) => <li key={i}>{d}</li>)}
        </ul>
      </>
    )}
  </div>
)}

        {scholarship.notes && (
  <div className="details-card">
    <h2>ملاحظات وتفاصيل إضافية 📝</h2>
    <p style={{ whiteSpace: 'pre-wrap' }}>{scholarship.notes}</p>
  </div>
)}

        {scholarship.groupLink && (
          <div className="btn-split">
            <a href={scholarship.groupLink} target="_blank" rel="noreferrer" className="btn-main btn-split-half">
              👥 قناة المنحة
            </a>
            {scholarship.discussionLink && (
              <a href={scholarship.discussionLink} target="_blank" rel="noreferrer" className="btn-main btn-split-half">
                💬 مناقشة المنحة
              </a>
            )}
          </div>
        )}

        {scholarship.link && (
          <a href={scholarship.link} target="_blank" rel="noreferrer" className="btn-main">🌐 زيارة الموقع الرسمي للتقديم</a>
        )}

        <button onClick={shareScholarship} className="btn-main">📤 شارك تفاصيل المنحة</button>
        <Link href="/scholarships" className="btn-main">← العودة لجميع المنح</Link>
      </div>
    </div>
  );
}