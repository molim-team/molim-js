import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer>
      <div className="footer-content">
        <div className="footer-brand">
          <Image src="/images/logo.png" alt="مُلم" className="footer-logo" width={100} height={35} />
          <p>منصتك الأولى لاكتشاف المنح الدراسية حول العالم</p>
        </div>

        <div className="footer-links">
          <h4>روابط سريعة</h4>
          <Link href="/">الرئيسية</Link>
          <Link href="/scholarships">جميع المنح</Link>
          <Link href="/quiz">اختبار التخصص المناسب</Link>
          <Link href="/faq">الأسئلة الشائعة</Link>
        </div>

        <div className="footer-social">
          <h4>تواصل معنا</h4>
          <a href="https://t.me/molim_ContactBot" target="_blank" rel="noopener noreferrer">الدعم الفني - تليجرام</a>
          <a href="mailto:molim.team@gmail.com">molim.team@gmail.com</a>
          <a href="https://airtable.com/appKSN4NvFXywJuUW/shrH9x9YwyEcHuvIi" target="_blank" rel="noopener noreferrer">تطوع معنا</a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>مُلم © 2026 | جميع الحقوق محفوظة</p>
        <Link href="/privacy">سياسة الخصوصية</Link>
      </div>
    </footer>
  );
}