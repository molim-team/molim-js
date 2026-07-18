"use client";

import Link from 'next/link';
import { GraduationCap, BookOpen, Compass, Globe, Bell, Bot, Headset, LayoutGrid } from 'lucide-react';

export default function WhatWeOfferSection({ openCount, totalCount }) {
  const features = [
    {
      id: 'scholarships-open',
      title: 'أحدث المنح المفتوحة',
      description: `تفاصيل لأكثر من ${openCount || 50} منحة متاحة للتقديم حالياَ`,
      icon: <GraduationCap size={24} className="about-icon" style={{ marginBottom: '8px' }} />,
      href: '/#available-scholarships'
    },
    {
      id: 'scholarships-all',
      title: 'جميع المنح',
      description: `تصفح ${totalCount || 100} منحة دراسية في قاعدتنا`,
      icon: <LayoutGrid size={24} className="about-icon" style={{ marginBottom: '8px' }} />,
      href: '/scholarships'
    },
    {
      id: 'library',
      title: 'مكتبة مُلم',
      description: 'دلائل أهم الملفات المطلوبة للتقديم على المنح',
      icon: <BookOpen size={24} className="about-icon" style={{ marginBottom: '8px' }} />,
      href: '/library'
    },
    {
      id: 'test',
      title: 'اختبار تحديد التخصص',
      description: 'اكتشف التخصص المناسب لك خلال دقائق',
      icon: <Compass size={24} className="about-icon" style={{ marginBottom: '8px' }} />,
      href: '/quiz'
    },
    {
      id: 'majors',
      title: 'التخصصات العالمية',
      description: 'معلومات شاملة عن أهم التخصصات الجامعية حول العالم',
      icon: <Globe size={24} className="about-icon" style={{ marginBottom: '8px' }} />,
      href: '/majors'
    },
    {
      id: 'notifications',
      title: 'تنبيهات المنح الجديدة',
      description: 'إشعارات عبر الإيميل فور فتح التقديم على أي منحة جديدة',
      icon: <Bell size={24} className="about-icon" style={{ marginBottom: '8px' }} />
      // No href as per user request
    },
    {
      id: 'bot',
      title: 'لمام، مساعدك الذكي',
      description: 'اسأل لمام أي سؤال عن المنح واحصل على إجابة',
      icon: <Bot size={24} className="about-icon" style={{ marginBottom: '8px' }} />,
      onClick: () => {
        const botBtn = document.querySelector('.llamam-button');
        if (botBtn) botBtn.click();
      }
    },
    {
      id: 'support',
      title: 'دعم فني متخصص',
      description: 'فريق دعم يرد على جميع استفساراتك بدقة ومجانًا',
      icon: <Headset size={24} className="about-icon" style={{ marginBottom: '8px' }} />,
      href: 'https://t.me/molim_ContactBot',
      target: '_blank'
    }
  ];

  // CSS مكتوب يدويًا (بدون الاعتماد على كلاسات Tailwind) لضمان ظهور الشبكة
  // بعمودين على الجوال و4 أعمدة على الديسكتوب، بغض النظر عن أي مشكلة
  // بناء/كاش قد تمنع كلاسات Tailwind من التوليد الصحيح وقت النشر.
  const gridStyles = `
    .molim-offer-grid {
      display: grid !important;
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 12px !important;
    }
    @media (min-width: 768px) {
      .molim-offer-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
      }
    }
  `;

  return (
    <section className="about-section" style={{ marginTop: '20px', marginBottom: '20px' }}>
      <h2 className="section-title">ماذا نقدم</h2>
      <style>{gridStyles}</style>
      <div className="molim-offer-grid" style={{ alignItems: 'stretch' }}>
        {features.map((feature) => {
          const CardContent = (
            <div 
              className="about-card visible" 
              style={{ 
                cursor: (feature.href || feature.onClick) ? 'pointer' : 'default',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                padding: '16px',
                minHeight: '120px'
              }}
              onClick={feature.onClick}
            >
              {feature.icon}
              <h3 style={{ fontSize: '15px', margin: '0 0 6px 0', fontWeight: 'bold' }}>{feature.title}</h3>
              <p style={{ fontSize: '12px', margin: 0, lineHeight: '1.4' }}>{feature.description}</p>
            </div>
          );

          if (feature.href) {
            return (
              <Link 
                key={feature.id} 
                href={feature.href} 
                target={feature.target || '_self'} 
                rel={feature.target === '_blank' ? "noopener noreferrer" : ""}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                {CardContent}
              </Link>
            );
          }

          return (
            <div key={feature.id}>
              {CardContent}
            </div>
          );
        })}
      </div>
    </section>
  );
}