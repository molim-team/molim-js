import ScholarshipsClient from './ScholarshipsClient';
import JsonLd from '@/components/JsonLd';
import fs from 'fs/promises';
import path from 'path';


export const metadata = {
  title: 'مُلم | جميع المنح الدراسية',
  description: 'استكشف جميع المنح الدراسية المتاحة عبر منصة مُلم وقدم الآن على العالم حول المتاحة الدراسية المنح.',
};

export default async function ScholarshipsPage() {
  const filePath = path.join(process.cwd(), 'public', 'scholarships.json');
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const scholarships = JSON.parse(fileContent);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "المنح الدراسية",
    "url": "https://molim.team/scholarships",
    "description": "قائمة المنح الدراسية المتاحة للطلاب العرب",
    "inLanguage": "ar",
    "publisher": {
      "@type": "Organization",
      "name": "مُلم",
      "url": "https://molim.team"
    }
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <ScholarshipsClient scholarships={scholarships} />
    </>
  );
}