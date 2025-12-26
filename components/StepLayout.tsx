
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
    <div className="flex flex-col min-h-screen bg-white">
      {/* progress bar - Thicker for visibility */}
      <div className="w-full h-2 bg-gray-200 sticky top-0 z-50">
        <div 
          className="h-full bg-[#002d54] transition-all duration-300" 
          style={{ width: `${progress}%` }} 
        />
      </div>

      <main className="flex-1 px-5 pt-8 pb-32">
        <div className="mb-6">
          <span className="text-[10px] font-black text-[#002d54] bg-blue-50 px-2 py-1 rounded uppercase tracking-[0.2em]">
            BHMA {stepIndex + 1} ΑΠΟ {totalSteps}
          </span>
          <h1 className="text-3xl font-black text-black leading-none uppercase tracking-tighter mt-3">
            {title}
          </h1>
          {description && (
            <p className="text-gray-500 text-sm font-bold uppercase mt-2 tracking-wide leading-tight">{description}</p>
          )}
        </div>

        {/* Content Area */}
        <div className="mb-8">
          {children}
        </div>

        {/* Action Buttons - Fixed at bottom for thumb reachability but spaced */}
        <div className="flex flex-col gap-4">
          <button
            onClick={onNext}
            disabled={isNextDisabled}
            className={`w-full py-6 rounded-3xl font-black text-2xl flex items-center justify-center gap-3 transition-all shadow-2xl active:scale-95 border-4 ${
              isNextDisabled 
                ? 'bg-gray-100 text-gray-300 border-gray-200 shadow-none' 
                : 'bg-[#002d54] text-white border-[#002d54] shadow-blue-900/40'
            }`}
          >
            ΕΠΟΜΕΝΟ <ChevronRight size={28} strokeWidth={3} />
          </button>
          
          {onBack && (
            <button
              onClick={onBack}
              className="w-full py-5 text-black font-black text-lg uppercase flex items-center justify-center gap-2 active:bg-gray-100 rounded-2xl transition-colors tracking-widest border-2 border-gray-200"
            >
              <ChevronLeft size={24} strokeWidth={3} /> ΠΙΣΩ
            </button>
          )}
        </div>
      </main>

      {/* Extreme Low Battery / Sunlight Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-black py-3 px-4 flex justify-between items-center shadow-[0_-10px_20px_rgba(0,0,0,0.1)]">
        <p className="text-[8px] font-black text-white uppercase tracking-widest">
          ASPIS DAMAGE REPORTER
        </p>
        <span className="text-[10px] font-black text-yellow-400 uppercase">{stepIndex + 1} / {totalSteps}</span>
      </div>
    </div>
  );
};

export default StepLayout;
