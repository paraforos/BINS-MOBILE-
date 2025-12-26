
import React from 'react';
import { BinReportData } from '../types';
import { Logo } from './Logo';

interface PDFTemplateProps {
  data: BinReportData;
  reportRef: React.RefObject<HTMLDivElement>;
}

const PDFTemplate: React.FC<PDFTemplateProps> = ({ data, reportRef }) => {
  const today = new Date().toLocaleDateString('el-GR');

  return (
    <div className="fixed -left-[2000px] top-0 pointer-events-none">
      <div 
        ref={reportRef} 
        className="bg-white p-12 w-[800px] h-auto flex flex-col font-sans text-gray-900"
      >
        {/* Brand Header */}
        <div className="flex justify-between items-center mb-8">
          <Logo className="h-20 w-auto" />
          <div className="text-right">
            <h1 className="text-xl font-black text-[#003d71] uppercase tracking-tight">ΑΝΑΦΟΡΑ ΣΠΑΣΜΕΝΩΝ BINS</h1>
          </div>
        </div>

        <div className="h-1 w-full bg-[#003d71] mb-10" />

        {/* Info Grid - No backgrounds as requested */}
        <div className="grid grid-cols-2 gap-x-12 gap-y-8 mb-12">
          <div className="border-b border-gray-100 pb-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-widest">ΠΡΟΜΗΘΕΥΤΗΣ</p>
            <p className="text-base font-bold uppercase">{data.supplierName || '-'}</p>
          </div>
          <div className="border-b border-gray-100 pb-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-widest">ΗΜΕΡΟΜΗΝΙΑ</p>
            <p className="text-base font-bold">{today}</p>
          </div>
          <div className="border-b border-gray-100 pb-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-widest">ΟΔΗΓΟΣ</p>
            <p className="text-base font-bold uppercase">{data.driverName || '-'}</p>
          </div>
          <div className="border-b border-gray-100 pb-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-widest">ΠΡΟΪΟΝ</p>
            <p className="text-base font-bold uppercase">{data.product || '-'}</p>
          </div>
          <div className="border-b border-gray-100 pb-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-widest">ΣΥΝΟΛΙΚΑ BINS ΠΑΡΤΙΔΑΣ</p>
            <p className="text-3xl font-black">{data.totalBins || '0'}</p>
          </div>
          <div className="border-b border-gray-100 pb-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-widest">ΣΥΝΟΛΟ ΣΠΑΣΜΕΝΩΝ BINS</p>
            <p className="text-3xl font-black text-red-600">{data.brokenBins || '0'}</p>
          </div>
        </div>

        {/* Photos Section */}
        <div className="flex-1">
          <h2 className="text-[12px] font-black uppercase text-[#003d71] mb-6 tracking-widest">
            ΦΩΤΟΓΡΑΦΙΕΣ ΠΑΡΤΙΔΑΣ
          </h2>
          <div className="grid grid-cols-2 gap-6">
            {data.photos.map((photo, index) => (
              <div key={index} className="aspect-[4/3] w-full relative overflow-hidden bg-gray-50 border border-gray-200 rounded-lg shadow-sm flex items-center justify-center">
                {/* object-contain ensures the aspect ratio is locked and the full bin is visible */}
                <img 
                  src={photo} 
                  alt={`Evidence ${index + 1}`} 
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ))}
            {data.photos.length === 0 && (
              <div className="col-span-2 py-32 text-center border-2 border-dashed border-gray-100 rounded-xl">
                <p className="text-gray-300 font-bold uppercase text-xs tracking-widest">Δεν υπάρχουν συνημμένες φωτογραφίες</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Minimalist as requested */}
        <div className="mt-16 pt-10 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-400 font-medium lowercase">στάλθηκε από agronomist@aspis.gr</p>
        </div>
      </div>
    </div>
  );
};

export default PDFTemplate;
