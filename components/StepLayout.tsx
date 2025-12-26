
import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface StepLayoutProps {
  title: string;
  description?: string;
  onNext: () => void;
  onBack?: () => void;
  isNextDisabled?: boolean;
  children: React.ReactNode;
  stepIndex: number;
  totalSteps: number;
}

const StepLayout: React.FC<StepLayoutProps> = ({
  title,
  description,
  onNext,
  onBack,
  isNextDisabled,
  children,
  stepIndex,
  totalSteps
}) => {
  const progress = ((stepIndex + 1) / totalSteps) * 100;

  return (
    <div className="flex flex-col min-h-fit bg-white">
      {/* progress bar */}
      <div className="w-full h-1 bg-gray-100 sticky top-[53px] z-20">
        <div 
          className="h-full bg-[#003d71] transition-all duration-300" 
          style={{ width: `${progress}%` }} 
        />
      </div>

      <main className="flex-1 px-6 pt-10 pb-20">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900 leading-tight uppercase tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-gray-400 text-xs font-bold uppercase mt-1 tracking-wider">{description}</p>
          )}
        </div>

        {/* Πεδίο Εισαγωγής (Children) */}
        <div className="mb-6">
          {children}
        </div>

        {/* Πλήκτρα Πλοήγησης - Ακριβώς κάτω από το πεδίο */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onNext}
            disabled={isNextDisabled}
            className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
              isNextDisabled 
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none' 
                : 'bg-[#003d71] text-white shadow-[#003d71]/20'
            }`}
          >
            ΕΠΟΜΕΝΟ <ChevronRight size={22} />
          </button>
          
          {onBack && (
            <button
              onClick={onBack}
              className="w-full py-3 text-gray-400 font-bold text-xs uppercase flex items-center justify-center gap-1 active:bg-gray-50 rounded-xl transition-colors tracking-widest"
            >
              <ChevronLeft size={16} /> ΠΙΣΩ
            </button>
          )}
        </div>
      </main>

      <div className="fixed bottom-2 left-6 right-6 pointer-events-none flex flex-col items-center gap-1 opacity-20">
        <div className="w-full flex justify-end items-center">
          <span className="text-[8px] font-black text-[#003d71] uppercase tracking-[0.3em]">{stepIndex + 1}/{totalSteps}</span>
        </div>
        <div className="text-[4px] font-black text-[#003d71] uppercase tracking-tight text-center leading-tight mt-0.5">
          © 2025 Michalis Paraforos<br />ΑΝΑΦΟΡΑ ΣΠΑΣΜΕΝΩΝ BINS
        </div>
      </div>
    </div>
  );
};

export default StepLayout;
