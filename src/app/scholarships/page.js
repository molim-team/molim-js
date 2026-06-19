import ScholarshipsClient from './ScholarshipsClient';

export const dynamic = 'force-dynamic';

export default async function ScholarshipsPage() {
  const res = await fetch(
    'https://molim.team/scholarships.json',
    { cache: 'no-store' }
  );
  const scholarships = await res.json();

  return <ScholarshipsClient scholarships={scholarships} />;
}