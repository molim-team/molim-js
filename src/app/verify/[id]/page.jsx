import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';

export default async function VerifyPage({ params }) {
  const { id } = params;

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
    </div>
  );
}