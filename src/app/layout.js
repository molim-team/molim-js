import { Cairo, Tajawal } from 'next/font/google';
import { FavoritesProvider } from '../lib/context/FavoritesContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LlamamBot from '../components/LlamamBot';
import ScrollToTop from '../components/ScrollToTop';
import { GoogleAnalytics } from '@next/third-parties/google';
import Script from 'next/script';
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
  metadataBase: new URL('https://molim.team'),
  title: 'مُلم — منصة المنح الدراسية',
  description: 'منصتك الأولى لاكتشاف المنح الدراسية حول العالم',
  openGraph: {
    siteName: 'مُلم — منصة المنح الدراسية',
    locale: 'ar_SA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
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

        {/* ويدجت الدعم الفني Tawk.to - يعمل في الخلفية بعد تحميل الصفحة كاملة */}
        <Script id="tawk-to-chat" strategy="lazyOnload">
          {`
            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
            (function(){
            var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='https://embed.tawk.to/6a2f44029e8aac1f4526f6a1/1jr4a3aq0';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
            })();
          `}
        </Script>
        <GoogleAnalytics gaId="G-0VET8JF7N5" />
      </body>
    </html>
  );
}Header