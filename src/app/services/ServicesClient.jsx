"use client";

import React, { useState } from 'react';
import { FileText, GraduationCap, AlertTriangle } from 'lucide-react';
import ServiceCard from '@/components/services/ServiceCard';
import OrderModal from '@/components/services/OrderModal';
import { getIsOpen } from '@/lib/scholarshipUtils';

export default function ServicesClient({ scholarships }) {
  const [activeTab, setActiveTab] = useState('files');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');

  const handleOrder = (serviceName) => {
    setSelectedService(serviceName);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedService('');
  };

  // Scholarships to display
  const targetScholarshipIds = [
    'turkey-gov', 'study-in-saudi', 'study-in-egypt', 'brunei-gov',
    'russia-gov', 'open-doors', 'kazakhstan-gov', 'romania-gov',
    'india-iccr', 'icesco-scholarships', 'study-in-hungary', 'study-in-iraq',
    'slovakia-government-scholarship', 'islamic-development-bank-isdb-scholarship-20262027'
  ];

  // Map and sort scholarships
  const mappedScholarships = targetScholarshipIds.map(id => {
    const s = scholarships.find(item => item.id === id);
    if (!s) return null;
    return {
      ...s,
      isOpen: getIsOpen(s)
    };
  }).filter(Boolean);

  // Sort by open status (open first)
  mappedScholarships.sort((a, b) => {
    if (a.isOpen === b.isOpen) return 0;
    return a.isOpen ? -1 : 1;
  });

  return (
    <div className="services-page-container">
      {/* Alert Bar */}
      <div className="alert-bar">
        <AlertTriangle size={24} />
        <p><strong>ملاحظة هامة:</strong> خدماتنا مقتصرة حالياً على الطلاب المتواجدين داخل الدول التالية فقط: (المملكة العربية السعودية - جمهورية مصر العربية - الجمهورية اليمنية).</p>
      </div>

      <div className="services-header">
        <h1>خدمات مُلم الاحترافية</h1>
        <p>نساعدك في تجهيز ملفك والتقديم على المنح الدراسية بأعلى معايير الجودة لزيادة فرص قبولك</p>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          <FileText size={24} />
          تجهيز وكتابة الملفات
        </button>
        <button 
          className={`tab-btn ${activeTab === 'scholarships' ? 'active' : ''}`}
          onClick={() => setActiveTab('scholarships')}
        >
          <GraduationCap size={24} />
          التقديم على المنح
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'files' && (
          <div className="files-tab fade-in">
            <h2 className="section-title">تجهيز وكتابة الملفات</h2>
            <div className="services-grid files-grid">
              
              <div className="top-highlight-card-wrapper">
                <ServiceCard 
                  title="الباقة الشاملة لجميع ملفات التقديم"
                  description="تشمل (السيرة الذاتية + خطاب الحافز + خطابات التوصية) دفعة واحدة وبشكل متناسق واحترافي."
                  oldPrice={30}
                  newPrice={20}
                  isHighlighted={true}
                  onOrder={handleOrder}
                />
              </div>

              <ServiceCard 
                title="تجهيز السيرة الذاتية (CV)"
                description="تصميم وتجهيز سيرة ذاتية احترافية متوافقة مع معايير المنح العالمية (ATS)."
                oldPrice={15}
                newPrice={10}
                onOrder={handleOrder}
              />
              
              <ServiceCard 
                title="تجهيز خطاب الحافز (Motivation Letter)"
                description="صياغة خطاب حافز قوي ومخصص لإبراز شغفك ومهاراتك الأكاديمية."
                oldPrice={15}
                newPrice={10}
                onOrder={handleOrder}
              />

              <ServiceCard 
                title="تجهيز خطاب التوصية (Recommendation Letter)"
                description="كتابة وتجهيز مسودة خطاب توصية أكاديمي أو مهني مؤثر."
                oldPrice={15}
                newPrice={10}
                onOrder={handleOrder}
              />



            </div>
          </div>
        )}

        {activeTab === 'scholarships' && (
          <div className="scholarships-tab fade-in">
            <div className="process-explanation">
              <h2>ماذا نقدم لك عند التقديم على المنحة عبر "ملم"؟</h2>
              <ul className="process-list">
                <li><span>1</span> تجهيز ملف التقديم كاملاً.</li>
                <li><span>2</span> مراجعة الوثائق والمستندات المطلوبة للمنحة للتأكد من صحتها.</li>
                <li><span>3</span> رفع الطلب الإلكتروني إلى الجهة المانحة بشكل كامل واحترافي.</li>
                <li><span>4</span> المتابعة الدورية حتى إكتمال جميع إجراءات التقديم.</li>
              </ul>
            </div>

            <h2 className="section-title">المنح المتاحة للتقديم</h2>
            <div className="services-grid scholarships-grid">
              {mappedScholarships.map(s => (
                <ServiceCard 
                  key={s.id}
                  title={s.name}
                  link={`/scholarship/${s.id}`}
                  oldPrice={100}
                  newPrice={60}
                  status={s.isOpen ? 'open' : 'closed'}
                  onOrder={handleOrder}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer Section */}
      <div className="disclaimer-section">
        <h3>شروط الخدمة وإخلاء المسؤولية</h3>
        <p><strong>منصة ملم</strong> تقدم خدمات تجهيز ملفات التقديم والتقديم على المنح باحترافية وبأعلى معايير الجودة لزيادة فرص قبولك، ولكننا لا نضمن القبول النهائي بأي حال من الأحوال؛ حيث أن القبول يعتمد بشكل كامل على معايير الجهة المانحة ومنافسة المتقدمين وهي أمور خارجة عن إرادتنا.</p>
        <p>الموافقة على طلب الخدمة تعني فهم أن الخدمة مخصصة لتجهيز الملفات والتقديم الفني والإداري فقط، وليست ضماناً للقبول الأكاديمي أو الحصول على المنحة.</p>
      </div>

      <OrderModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        selectedService={selectedService} 
      />
    </div>
  );
}
