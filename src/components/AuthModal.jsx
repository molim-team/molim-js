export default function AuthModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white', padding: '32px 24px', borderRadius: '16px',
        textAlign: 'center', width: '320px', boxShadow: '0 8px 32px', color:'#1a3e6a'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', marginLeft: '260px', marginTop: '-20px',
          background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#555'
        }}>✕</button>

        <h3 style={{ color: '#ff4500', fontSize: '20px', marginBottom: '12px' }}>المنح المفضلة</h3>
        <p style={{ color: '#444', marginBottom: '24px', fontSize: '15px' }}>
          الرجاء تسجيل الدخول للاستفادة من ميزة المنح المفضلة.
        </p>

        <a href="/login" style={{
          display: 'block', backgroundColor: '#ff4500', color: 'white',
          padding: '12px', borderRadius: '8px', textDecoration: 'none',
          fontWeight: 'bold', marginBottom: '12px', fontSize: '16px'
        }}>
          تسجيل الدخول
        </a>

        <button onClick={onClose} style={{
          display: 'block', width: '100%', backgroundColor: 'white',
          color: '#ff4500', padding: '12px', borderRadius: '8px',
          border: '2px solid #ff4500', fontWeight: 'bold',
          cursor: 'pointer', fontSize: '16px'
        }}>
          إلغاء
        </button>
      </div>
    </div>
  );
}