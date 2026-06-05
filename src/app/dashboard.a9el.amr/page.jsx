'use client';
import { useState } from 'react';

export default function Dashboard() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cert_type: 'شهادة تطوع',
    certificateText: '',
    nameEn: '',
    certificateTextEn: '',
    cert_typeEn: 'Volunteer Certificate',
  });
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/issue-certificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`✅ نجاح! رقم الشهادة: ${data.certId}`);
        setFormData({ name: '', email: '', cert_type: 'شهادة تطوع', certificateText: '' });
        setToken('');
      } else {
        setMessage(`❌ خطأ: ${data.error}`);
      }
    } catch (err) {
      setMessage('❌ حدث خطأ في الاتصال بالسيرفر.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '15px',
    fontFamily: 'inherit',
    direction: 'rtl',
    width: '100%',
    boxSizing: 'border-box',
  };

  return (
    <div style={{
      maxWidth: '640px', margin: '50px auto', padding: '32px',
      fontFamily: "'Cairo', 'Segoe UI', sans-serif", direction: 'rtl',
      backgroundColor: '#fff', borderRadius: '12px',
      boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
    }}>
      <h2 style={{ marginBottom: '24px', fontSize: '20px', color: '#1a1a1a' }}>
        🎓 لوحة تحكم إصدار شهادات فريق مُلم
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* التوكن */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>
            🔑 توكن الدخول
          </label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
            style={{ ...inputStyle, direction: 'ltr' }}
          />
        </div>

        {/* نوع الشهادة */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>نوع الشهادة</label>
          <select
            value={formData.cert_type}
            onChange={(e) => setFormData({ ...formData, cert_type: e.target.value })}
            style={inputStyle}
          >
            <option value="شهادة تطوع">شهادة تطوع</option>
            <option value="شهادة خبرة">شهادة خبرة</option>
            <option value="شهادة مشاركة">شهادة مشاركة</option>
          </select>
        </div>

        {/* الاسم */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>اسم المتطوع الثلاثي</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            style={inputStyle}
          />
        </div>

        {/* البريد */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>البريد الإلكتروني</label>
          <input
            type="email"
            placeholder="example@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            style={{ ...inputStyle, direction: 'ltr', textAlign: 'right' }}
          />
        </div>

        {/* نص الشهادة */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>نص الشهادة الكامل</label>
          <p style={{ fontSize: '12px', color: '#888', margin: '0 0 4px 0' }}>
            اكتب النص كاملاً بما في ذلك القسم وعدد الساعات.
          </p>
          <textarea
            value={formData.certificateText}
            onChange={(e) => setFormData({ ...formData, certificateText: e.target.value })}
            required
            rows={5}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.7', minHeight: '120px' }}
          />
        </div>

        {/* الاسم بالإنجليزي */}
<div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
  <label style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>
    Full Name (English)
  </label>
  <input
    type="text"
    value={formData.nameEn}
    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
    required
    style={{ ...inputStyle, direction: 'ltr' }}
  />
</div>

{/* cert_type بالإنجليزي */}
<div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
  <label style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>
    Certificate Type (English)
  </label>
  <select
    value={formData.cert_typeEn}
    onChange={(e) => setFormData({ ...formData, cert_typeEn: e.target.value })}
    style={{ ...inputStyle, direction: 'ltr' }}
  >
    <option value="Volunteer Certificate">Volunteer Certificate</option>
    <option value="Experience Certificate">Experience Certificate</option>
    <option value="Participation Certificate">Participation Certificate</option>
  </select>
</div>

{/* نص الشهادة بالإنجليزي */}
<div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
  <label style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>
    Certificate Text (English)
  </label>
  <textarea
    value={formData.certificateTextEn}
    onChange={(e) => setFormData({ ...formData, certificateTextEn: e.target.value })}
    required
    rows={5}
    style={{ ...inputStyle, direction: 'ltr', resize: 'vertical', minHeight: '120px' }}
  />
</div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px', backgroundColor: loading ? '#aaa' : '#ff4500',
            color: 'white', border: 'none', borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '15px', fontWeight: '600', marginTop: '4px',
          }}
        >
          {loading ? '⏳ جاري إصدار وإرسال الشهادة...' : 'إصدار الشهادة وإرسالها فوراً'}
        </button>
      </form>

      {message && (
        <p style={{
          marginTop: '20px', fontWeight: 'bold', fontSize: '15px',
          color: message.startsWith('✅') ? '#1a7a3c' : '#ff4500',
          padding: '12px',
          backgroundColor: message.startsWith('✅') ? '#eafaf1' : '#fdf0ef',
          borderRadius: '8px',
        }}>
          {message}
        </p>
      )}
    </div>
  );
}