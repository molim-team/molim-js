"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from '../lib/firebase';

export default function Header() {
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
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const getButtonText = () => {
    if (user) {
      const firstName = user.displayName ? user.displayName.split(' ')[0] : 'حسابي';
      return `👤 ${firstName}`;
    }
    return '🔑 تسجيل الدخول';
  };

  return (
    <header>
      <div className="logo">
        <Link href="/" onClick={closeMenu}>
          <Image src="/images/logo.png" alt="مُلم" className="logo-img" width={120} height={40} priority />
        </Link>
      </div>

      <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button className="dark-mode-toggle" onClick={toggleDarkMode} aria-label="تبديل الوضع">
          {isDarkMode ? '🌙' : '☀️'}
        </button>
        <button className={`menu-toggle ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu} aria-label="قائمة التنقل">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
      </div>

      <nav id="main-nav" className={isMenuOpen ? 'open' : ''}>
        <Link href="/" onClick={closeMenu}>الرئيسية</Link>
        <Link href="/scholarships" onClick={closeMenu}>المنح</Link>
        <Link href="/quiz" onClick={closeMenu}>اكتشف تخصصك المناسب</Link>
        <Link href="/majors" onClick={closeMenu}>التخصصات العالمية</Link>
        <Link href="/faq" onClick={closeMenu}>الأسئلة الشائعة</Link>
        <Link href="/contact" onClick={closeMenu}>تواصل معنا</Link>
        <Link href={user ? "/profile" : "/login"} className="nav-auth-btn" onClick={closeMenu}>
          {getButtonText()}
        </Link>
      </nav>
    </header>
  );
}