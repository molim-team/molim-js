"use client";

import React, { useState } from 'react';

export default function FaqClient({ faqItems }) {
  const [openIndexes, setOpenIndexes] = useState(new Set());

  const toggleFaq = (index) => {
    setOpenIndexes(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <section className="faq-section">
      {faqItems.map((item, index) => (
        <div className="faq-item" key={index}>
          <div
            className={`faq-question ${openIndexes.has(index) ? 'active' : ''}`}
            onClick={() => toggleFaq(index)}
          >
            <span>{item.q}</span>
            <span className="faq-icon">{openIndexes.has(index) ? '−' : '+'}</span>
          </div>
          <div className={`faq-collapse-wrapper ${openIndexes.has(index) ? 'is-open' : ''}`}>
            <div className="answer-content">
              <p style={{ padding: '15px' }}>{item.a}</p>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
