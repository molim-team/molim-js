import ScholarshipsClient from './ScholarshipsClient';

export default async function ScholarshipsPage() {
  const res = await fetch(
    'https://molim.team/scholarships.json',
    { cache: 'force-cache' }
  );
  const scholarships = await res.json();

  return <ScholarshipsClient scholarships={scholarships} />;
}