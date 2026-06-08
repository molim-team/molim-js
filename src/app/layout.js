import { Cairo, Tajawal } from 'next/font/google';
import { FavoritesProvider } from '../lib/context/FavoritesContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LlamamBot from '../components/LlamamBot';
import ScrollToTop from '../components/ScrollToTop';
import './globals.css';

const cairo = Cairo({
  subsets: ['arabic'],
  weight: ['400', '600', '700', '900'],
  variable: '--font-cairo',
  display: 'swap',
});

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '700', '900'],
  variable: '--font-tajawal',
  display: 'swap',
});

export const metadata = {
  title: 'مُلم — منصة المنح الدراسية',
  description: 'منصتك الأولى لاكتشاف المنح الدراسية حول العالم',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} ${tajawal.variable}`}>
        <FavoritesProvider>
          <Header />
          <main className="main-content-wrapper">
            {children}
          </main>
          <LlamamBot />
          <Footer />
        </FavoritesProvider>
        <ScrollToTop />
      </body>
    </html>
  );
}