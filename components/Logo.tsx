
import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`font-black flex items-center ${className}`} style={{ fontFamily: 'sans-serif' }}>
    <span className="tracking-tighter text-xl sm:text-2xl">ASPIS</span>
  </div>
);
