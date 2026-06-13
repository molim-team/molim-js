import { readFileSync } from 'fs';
import path from 'path';
import HeroSection from '@/components/home/HeroSection';
import AboutSection from '@/components/home/AboutSection';
import ScholarshipsSlider from '@/components/home/ScholarshipsSlider';
import { getIsOpen } from '@/lib/scholarshipUtils';

async function getScholarships() {
  const filePath = path.join(process.cwd(), 'public', 'scholarships.json');
  const data = JSON.parse(readFileSync(filePath, 'utf-8'));
  const open = data.filter(s => getIsOpen(s));
  return open;
}

export const metadata = {
  title: 'مُلم — اكتشف المنح الدراسية حول العالم',
  description: 'منصة عربية لاكتشاف أبرز المنح الدراسية حول العالم.',
};

export default async function HomePage() {
  const scholarships = await getScholarships();

  return (
    <div className="main-home-container px-4 md:px-6">
      <HeroSection />
      <ScholarshipsSlider scholarships={scholarships} />
      <AboutSection />
    </div>
  );
}