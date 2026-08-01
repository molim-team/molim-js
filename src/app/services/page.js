import ServicesClient from './ServicesClient';
import JsonLd from '@/components/JsonLd';
import fs from 'fs/promises';
import path from 'path';

export const metadata = {
  title: 'خدمات ملم | تجهيز الملفات والتقديم على المنح',
  description: 'خدمات تجهيز السيرة الذاتية وخطابات الحافز والتوصية والتقديم الشامل على المنح الدراسية حول العالم باحترافية من خلال منصة مُلم.',
};

export default async function ServicesPage() {
  const filePath = path.join(process.cwd(), 'public', 'scholarships.json');
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const allScholarships = JSON.parse(fileContent);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "خدمات منصة ملم",
    "url": "https://molim.team/services",
    "description": "نقدم خدمات تجهيز ملفات التقديم والتقديم على المنح الدراسية باحترافية عالية",
    "inLanguage": "ar"
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <ServicesClient scholarships={allScholarships} />
    </>
  );
}
