import { readFileSync } from 'fs';
import path from 'path';
import HeroSection from '@/components/home/HeroSection';
import WhatWeOfferSection from '@/components/home/WhatWeOfferSection';
import AboutSection from '@/components/home/AboutSection';
import ScholarshipsSlider from '@/components/home/ScholarshipsSlider';
import { getIsOpen } from '@/lib/scholarshipUtils';
import JsonLd from '@/components/JsonLd';

export const dynamic = 'force-dynamic';

async function getScholarshipsData() {
  const filePath = path.join(process.cwd(), 'public', 'scholarships.json');
  const data = JSON.parse(readFileSync(filePath, 'utf-8'));
  const open = data.filter(s => getIsOpen(s));
  const countriesCount = new Set(data.map(s => s.country)).size;
  return { open, totalCount: data.length, countriesCount };
}

export const metadata = {
  title: 'مُلم — اكتشف المنح الدراسية حول العالم',
  description: 'منصة عربية لاكتشاف أبرز المنح الدراسية حول العالم.',
};

export default async function HomePage() {
  const { open: scholarships, totalCount, countriesCount } = await getScholarshipsData();
  const openCount = scholarships.length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "مُلم",
    "url": "https://molim.team",
    "description": "منصة مُلم تساعد الطلاب العرب على اكتشاف والتقدم للمنح الدراسية",
    "inLanguage": "ar",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://molim.team/scholarships?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="main-home-container px-4 md:px-6">
        <HeroSection />
        <WhatWeOfferSection openCount={openCount} totalCount={totalCount} countriesCount={countriesCount} />
        <ScholarshipsSlider scholarships={scholarships} />
        <AboutSection />
      </div>
    </>
  );
}