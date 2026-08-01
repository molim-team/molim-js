import React from 'react';

export default function PriceTag({ oldPrice, newPrice, currency = '$' }) {
  return (
    <div className="price-tag-container">
      <span className="price-old">
        {oldPrice}{currency}
      </span>
      <span className="price-new">
        {newPrice}{currency}
      </span>
    </div>
  );
}
