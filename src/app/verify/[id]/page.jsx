import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function VerifyPage({ params }) {
  const { id } = await params;

  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return notFound();

  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: 'green' }}>✅ شهادة موثقة</h1>
      <p><strong>الاسم:</strong> {data.name}</p>
      <p><strong>نوع الشهادة:</strong> {data.cert_type}</p>
      <p><strong>رقم الشهادة:</strong> {data.id}</p>
      <p><strong>تاريخ الإصدار:</strong> {new Date(data.issue_date).toLocaleDateString('ar-EG', {
       year: 'numeric',
       month: 'long', 
       day: 'numeric'
        })}</p>
    </div>
  );
}