
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
        className="bg-white p-10 w-[800px] h-auto flex flex-col font-sans text-black"
        style={{ color: 'black' }}
      >
        {/* Brand Header - More compact */}
        <div className="flex justify-between items-end mb-4">
          <Logo className="h-14 w-auto text-black" />
          <div className="text-right">
            <h1 className="text-lg font-black uppercase tracking-tight text-black">ΑΝΑΦΟΡΑ ΣΠΑΣΜΕΝΩΝ BINS</h1>
          </div>
        </div>

        <div className="h-0.5 w-full bg-black mb-6" />

        {/* Info Grid - All Black, Compact spacing */}
        <div className="grid grid-cols-2 gap-x-10 gap-y-4 mb-8">
          <div className="border-b border-gray-100 pb-1 flex flex-col">
            <p className="text-[9px] font-bold uppercase tracking-widest text-black leading-tight">ΠΡΟΜΗΘΕΥΤΗΣ</p>
            <p className="text-sm font-bold uppercase truncate-2-lines leading-snug">{data.supplierName || '-'}</p>
          </div>
          <div className="border-b border-gray-100 pb-1 flex flex-col">
            <p className="text-[9px] font-bold uppercase tracking-widest text-black leading-tight">ΗΜΕΡΟΜΗΝΙΑ</p>
            <p className="text-sm font-bold leading-snug">{today}</p>
          </div>
          <div className="border-b border-gray-100 pb-1 flex flex-col">
            <p className="text-[9px] font-bold uppercase tracking-widest text-black leading-tight">ΟΔΗΓΟΣ</p>
            <p className="text-sm font-bold uppercase leading-snug">{data.driverName || '-'}</p>
          </div>
          <div className="border-b border-gray-100 pb-1 flex flex-col">
            <p className="text-[9px] font-bold uppercase tracking-widest text-black leading-tight">ΠΡΟΪΟΝ</p>
            <p className="text-sm font-bold uppercase leading-snug">{data.product || '-'}</p>
          </div>
          <div className="border-b border-gray-100 pb-1 flex flex-col">
            <p className="text-[9px] font-bold uppercase tracking-widest text-black leading-tight">ΣΥΝΟΛΙΚΑ BINS ΠΑΡΤΙΔΑΣ</p>
            <p className="text-2xl font-black leading-none mt-1">{data.totalBins || '0'}</p>
          </div>
          <div className="border-b border-gray-100 pb-1 flex flex-col">
            <p className="text-[9px] font-bold uppercase tracking-widest text-black leading-tight">ΣΥΝΟΛΟ ΣΠΑΣΜΕΝΩΝ BINS</p>
            <p className="text-2xl font-black text-black leading-none mt-1">{data.brokenBins || '0'}</p>
          </div>
        </div>

        {/* Photos Section */}
        <div className="flex-1">
          <h2 className="text-[10px] font-black uppercase mb-4 tracking-widest text-black">
            ΦΩΤΟΓΡΑΦΙΕΣ ΠΑΡΤΙΔΑΣ
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {data.photos.map((photo, index) => (
              <div 
                key={index} 
                className="aspect-[4/3] w-full relative overflow-hidden bg-gray-50 border border-gray-200 rounded-md shadow-sm flex items-center justify-center"
                style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
              >
                <img 
                  src={photo} 
                  alt={`Evidence ${index + 1}`} 
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ))}
            {data.photos.length === 0 && (
              <div className="col-span-2 py-20 text-center border-2 border-dashed border-gray-100 rounded-lg">
                <p className="text-black font-bold uppercase text-[10px] tracking-widest opacity-50">Δεν υπάρχουν συνημμένες φωτογραφίες</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Only requested text, black color */}
        <div className="mt-10 pt-6 border-t border-gray-100 text-center">
          <p className="text-[10px] text-black font-medium">στάλθηκε από agronomist@aspis.gr</p>
        </div>
      </div>
      
      <style>{`
        .truncate-2-lines {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default PDFTemplate;
