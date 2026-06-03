"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from '../lib/firebase';
import { FavoritesProvider } from '../lib/context/FavoritesContext';
import './globals.css';
import LlamamBot from '../components/LlamamBot';
import ScrollToTop from '../components/ScrollToTop';

import { Cairo, Tajawal } from 'next/font/google';

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

function Header() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem('theme') === 'dark' || 
                 (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(theme);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const getButtonText = () => {
    if (user) {
      const firstName = user.displayName ? user.displayName.split(' ')[0] : 'حسابي';
      return `👤 ${firstName}`;
    }
    return '🔑 تسجيل الدخول';
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header>
      <div className="logo">
        <Link href="/" onClick={closeMenu}>
          <Image src="/images/logo.png" alt="مُلم" className="logo-img" width={120} height={40} priority />
        </Link>
      </div>

      <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button 
          className="dark-mode-toggle" 
          onClick={toggleDarkMode}
          aria-label="تبديل الوضع"
        >
          {isDarkMode ? '🌙' : '☀️'}
        </button>

        <button 
          className={`menu-toggle ${isMenuOpen ? 'active' : ''}`} 
          onClick={toggleMenu}
          aria-label="قائمة التنقل"
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
      </div>

      <nav id="main-nav" className={isMenuOpen ? 'open' : ''}>
        <Link href="/" onClick={closeMenu}>الرئيسية</Link>
        <Link href="/scholarships" onClick={closeMenu}>المنح</Link>
        <Link href="/quiz" onClick={closeMenu}>اكتشف تخصصك المناسب</Link>
        <Link href="/majors" onClick={closeMenu}> التخصصات العالمية</Link>
        <Link href="/faq" onClick={closeMenu}>الأسئلة الشائعة</Link>
        <Link href="/contact" onClick={closeMenu}>تواصل معنا</Link>
        
        <Link href={user ? "/profile" : "/login"} className="nav-auth-btn" onClick={closeMenu}>
          {getButtonText()}
        </Link>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer>
      <div className="footer-content">
        <div className="footer-brand">
          <Image src="/images/logo.png" alt="مُلم" className="footer-logo" width={100} height={35} />
          <p>منصتك الأولى لاكتشاف المنح الدراسية حول العالم</p>
        </div>

        <div className="footer-links">
          <h4>روابط سريعة</h4>
          <Link href="/" onClick={() => window.scrollTo(0, 0)}>الرئيسية</Link>
          <Link href="/scholarships" onClick={() => window.scrollTo(0, 0)}>جميع المنح</Link>
          <Link href="/quiz" onClick={() => window.scrollTo(0, 0)}>اختبار التخصص المناسب</Link>
          <Link href="/faq" onClick={() => window.scrollTo(0, 0)}>الأسئلة الشائعة</Link>
        </div>

        <div className="footer-social">
          <h4>تواصل معنا</h4>
          <a href="https://t.me/molim_ContactBot" target="_blank" rel="noopener noreferrer">الدعم الفني - تليجرام</a>
          <a href="mailto:molim.team@gmail.com">molim.team@gmail.com</a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>مُلم © 2026 | جميع الحقوق محفوظة</p>
        <Link href="/privacy" onClick={() => window.scrollTo(0, 0)}>سياسة الخصوصية</Link>
      </div>
    </footer>
  );
}

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