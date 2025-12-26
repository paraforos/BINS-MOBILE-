
import React from 'react';
import { BinReportData } from '../types';
import { Logo } from './Logo';

interface PDFTemplateProps {
  data: BinReportData;
  reportRef: React.RefObject<HTMLDivElement>;
}

const PDFTemplate: React.FC<PDFTemplateProps> = ({ data, reportRef }) => {
  const today = new Date().toLocaleDateString('el-GR');

  // Ομαδοποίηση φωτογραφιών ανά 4 για να διατηρήσουμε το όριο ανά σελίδα
  const photoGroups = [];
  for (let i = 0; i < data.photos.length; i += 4) {
    photoGroups.push(data.photos.slice(i, i + 4));
  }

  return (
    <div className="fixed -left-[2000px] top-0 pointer-events-none">
      <div 
        ref={reportRef} 
        className="bg-white w-[794px] min-h-[1123px] flex flex-col font-sans"
        style={{ color: 'black', padding: '30px 45px' }}
      >
        {/* Header - Very Compact */}
        <div className="flex justify-between items-baseline mb-1">
          <Logo className="h-8 w-auto text-black" />
          <h1 className="text-[14px] font-black uppercase tracking-tight text-black">ΑΝΑΦΟΡΑ ΣΠΑΣΜΕΝΩΝ BINS</h1>
        </div>

        <div className="h-[1.5px] w-full bg-black mb-4" />

        {/* Info Section - Smaller fonts to prevent character cutoff */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-2.5 mb-2">
          <div className="border-b border-gray-100 pb-0.5 flex flex-col">
            <p className="text-[7px] font-bold uppercase tracking-widest text-black mb-0 leading-none">ΠΡΟΜΗΘΕΥΤΗΣ</p>
            <p className="text-[11px] font-bold uppercase leading-snug break-words mt-0.5 text-black">{data.supplierName || '-'}</p>
          </div>
          <div className="border-b border-gray-100 pb-0.5 flex flex-col">
            <p className="text-[7px] font-bold uppercase tracking-widest text-black mb-0 leading-none">ΗΜΕΡΟΜΗΝΙΑ</p>
            <p className="text-[11px] font-bold leading-snug mt-0.5 text-black">{today}</p>
          </div>
          <div className="border-b border-gray-100 pb-0.5 flex flex-col">
            <p className="text-[7px] font-bold uppercase tracking-widest text-black mb-0 leading-none">ΟΔΗΓΟΣ</p>
            <p className="text-[11px] font-bold uppercase leading-snug break-words mt-0.5 text-black">{data.driverName || '-'}</p>
          </div>
          <div className="border-b border-gray-100 pb-0.5 flex flex-col">
            <p className="text-[7px] font-bold uppercase tracking-widest text-black mb-0 leading-none">ΠΡΟΪΟΝ</p>
            <p className="text-[11px] font-bold uppercase leading-snug break-words mt-0.5 text-black">{data.product || '-'}</p>
          </div>
          <div className="border-b border-gray-100 pb-0.5 flex flex-col">
            <p className="text-[7px] font-bold uppercase tracking-widest text-black mb-0 leading-none">ΣΥΝΟΛΙΚΑ BINS ΠΑΡΤΙΔΑΣ</p>
            <p className="text-[18px] font-black leading-none mt-1 text-black">{data.totalBins || '0'}</p>
          </div>
          <div className="border-b border-gray-100 pb-0.5 flex flex-col">
            <p className="text-[7px] font-bold uppercase tracking-widest text-black mb-0 leading-none">ΣΥΝΟΛΟ ΣΠΑΣΜΕΝΩΝ BINS</p>
            <p className="text-[18px] font-black text-black leading-none mt-1">{data.brokenBins || '0'}</p>
          </div>
        </div>

        {/* Comments Section - Full Width row */}
        <div className="border-b border-gray-100 pb-1 mb-5 flex flex-col">
          <p className="text-[7px] font-bold uppercase tracking-widest text-black mb-0 leading-none">ΣΧΟΛΙΑ / ΠΑΡΑΤΗΡΗΣΕΙΣ</p>
          <p className="text-[10px] font-medium leading-snug mt-1 text-black italic">
            {data.comments || 'Δεν υπάρχουν σχόλια.'}
          </p>
        </div>

        {/* Photos Layout */}
        <div className="flex-1">
          <h2 className="text-[8px] font-black uppercase mb-3 tracking-widest text-black">ΦΩΤΟΓΡΑΦΙΕΣ ΠΑΡΤΙΔΑΣ</h2>
          
          <div className="space-y-6">
            {photoGroups.map((group, gIndex) => (
              <div 
                key={gIndex} 
                className="grid grid-cols-2 gap-4" 
                style={{ breakInside: 'avoid', pageBreakInside: 'avoid', marginBottom: '15px' }}
              >
                {group.map((photo, pIndex) => (
                  <div 
                    key={pIndex} 
                    className="aspect-[4/3] w-full bg-white border border-gray-100 rounded-sm overflow-hidden flex items-center justify-center"
                    style={{ breakInside: 'avoid' }}
                  >
                    <img 
                      src={photo} 
                      className="max-w-full max-h-full object-contain" 
                      alt="Bin Damage" 
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>

          {data.photos.length === 0 && (
            <div className="py-8 text-center border border-dashed border-gray-100 rounded-md">
              <p className="text-[9px] uppercase font-bold text-black opacity-30 tracking-widest">Δεν υπάρχουν συνημμένες φωτογραφίες</p>
            </div>
          )}
        </div>

        {/* Footer - Minimalist & Black */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <p className="text-[10px] text-black font-bold lowercase">στάλθηκε από agronomist@aspis.gr</p>
        </div>
      </div>
    </div>
  );
};

export default PDFTemplate;
