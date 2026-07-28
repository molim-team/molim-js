export const runtime = 'edge';
import ScholarshipsClient from './ScholarshipsClient';
import JsonLd from '@/components/JsonLd';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'جميع المنح الدراسية | مُلم',
  description: 'استكشف جميع المنح الدراسية المتاحة حول العالم وقدم عليها الآن عبر منصة مُلم.',
};

export default async function ScholarshipsPage() {
  const res = await fetch(
    'https://molim.team/scholarships.json',
    { cache: 'no-store' }
  );
  const scholarships = await res.json();

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