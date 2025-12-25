
import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`font-black text-[#003d71] flex items-center ${className}`} style={{ fontFamily: 'sans-serif' }}>
    <span className="tracking-tighter text-2xl sm:text-3xl">ASPIS</span>
  </div>
);
