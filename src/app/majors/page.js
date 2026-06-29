import React from 'react';
import MajorsClient from './MajorsClient';
import majorsDataRaw from './majors_info.json';

export default function Majors() {
  // تحويل الـ JSON إلى مصفوفة
  const majorsData = Object.entries(majorsDataRaw).map(([key, value]) => ({
    id: key,
    ...value
  }));

  return (
    <div className="majors-page">
      <section className="page-hero">
        <h1>🌍 دليل التخصصات العالمية</h1>
        <p>تعرف على تفاصيل ومستقبل أهم التخصصات الأكاديمية والمقومات الأساسية لكل تخصص</p>
      </section>
      <MajorsClient majorsData={majorsData} />
    </div>
  );
}