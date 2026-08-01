import React from 'react';
import PriceTag from './PriceTag';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function ServiceCard({ 
  title, 
  description, 
  oldPrice, 
  newPrice, 
  isHighlighted = false,
  status = null, 
  link = null,
  onOrder 
}) {
  return (
    <div className={`service-card ${isHighlighted ? 'highlighted' : ''}`}>
      <div className="service-card-content">
        <h3>{title}</h3>
        {link ? (
          <Link href={link} className="service-link" target="_blank" rel="noopener noreferrer">
            تفاصيل المنحة <ExternalLink size={14} />
          </Link>
        ) : (
          <p className="desc">{description}</p>
        )}
      </div>

      <div className="service-card-footer">
        <PriceTag oldPrice={oldPrice} newPrice={newPrice} />
        <button 
          className="btn-order"
          onClick={() => onOrder(title)}
        >
          انقر للطلب
        </button>
      </div>
    </div>
  );
}
