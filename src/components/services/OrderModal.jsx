"use client";

import React, { useState, useEffect } from 'react';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { X } from 'lucide-react';

export default function OrderModal({ isOpen, onClose, selectedService }) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gpa: '',
    residence: '',
    level: '',
    service: selectedService || ''
  });

  useEffect(() => {
    if (selectedService) {
      setFormData(prev => ({ ...prev, service: selectedService }));
    }
  }, [selectedService]);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const link = generateWhatsAppLink(formData);
    window.open(link, '_blank');
    onClose();
  };

  // Close when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose} aria-label="إغلاق">
          <X size={24} />
        </button>
        
        <h2>طلب خدمة</h2>
        
        <form onSubmit={handleSubmit} className="order-form">
          <div className="form-group">
            <label htmlFor="service">الخدمة المطلوبة</label>
            <input 
              type="text" 
              id="service" 
              name="service" 
              value={formData.service} 
              readOnly 
              style={{ backgroundColor: 'var(--faq-hover-bg)', fontWeight: 'bold' }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="name">الاسم</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label htmlFor="age">العمر</label>
              <input 
                type="number" 
                id="age" 
                name="age" 
                value={formData.age} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="gpa">المعدل</label>
              <input 
                type="text" 
                id="gpa" 
                name="gpa" 
                value={formData.gpa} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="residence">مكان الإقامة (الدولة)</label>
            <input 
              type="text" 
              id="residence" 
              name="residence" 
              value={formData.residence} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="level">المرحلة الدراسية</label>
            <select 
              id="level" 
              name="level" 
              value={formData.level} 
              onChange={handleChange} 
              required
            >
              <option value="" disabled>اختر المرحلة...</option>
              <option value="بكالوريوس">بكالوريوس</option>
              <option value="ماجستير">ماجستير</option>
              <option value="دكتوراه">دكتوراه</option>
              <option value="غير ذلك">غير ذلك</option>
            </select>
          </div>

          <button type="submit" className="btn-submit">
            إرسال الطلب عبر واتساب
          </button>
        </form>
      </div>
    </div>
  );
}
