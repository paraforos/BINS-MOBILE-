import React, { useState } from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "" }) => {
  const [error, setError] = useState(false);

  return (
    <div className={`flex items-center justify-center overflow-hidden ${className}`}>
      {!error ? (
        <img 
          src="aspislogo.png" 
          alt="ASPIS" 
          className="h-full w-auto object-contain"
          onError={() => setError(true)}
        />
      ) : (
        <span className="font-black text-black tracking-tighter text-xl">ASPIS</span>
      )}
    </div>
  );
};