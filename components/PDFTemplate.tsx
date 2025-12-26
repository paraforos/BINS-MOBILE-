
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
        className="bg-white w-[794px] min-h-[1123px] flex flex-col font-sans text-black"
        style={{ color: 'black', padding: '40px 50px' }}
      >
        {/* Header - Compact */}
        <div className="flex justify-between items-baseline mb-2">
          <Logo className="h-10 w-auto text-black" />
          <h1 className="text-base font-black uppercase tracking-tight text-black">ΑΝΑΦΟΡΑ ΣΠΑΣΜΕΝΩΝ BINS</h1>
        </div>

        <div className="h-0.5 w-full bg-black mb-4" />

        {/* Info Section - Compact & All Black */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-6">
          <div className="border-b border-gray-200 pb-0.5">
            <p className="text-[8px] font-bold uppercase tracking-widest text-black mb-0">ΠΡΟΜΗΘΕΥΤΗΣ</p>
            <p className="text-[13px] font-bold uppercase leading-tight line-clamp-1">{data.supplierName || '-'}</p>
          </div>
          <div className="border-b border-gray-200 pb-0.5">
            <p className="text-[8px] font-bold uppercase tracking-widest text-black mb-0">ΗΜΕΡΟΜΗΝΙΑ</p>
            <p className="text-[13px] font-bold leading-tight">{today}</p>
          </div>
          <div className="border-b border-gray-200 pb-0.5">
            <p className="text-[8px] font-bold uppercase tracking-widest text-black mb-0">ΟΔΗΓΟΣ</p>
            <p className="text-[13px] font-bold uppercase leading-tight line-clamp-1">{data.driverName || '-'}</p>
          </div>
          <div className="border-b border-gray-200 pb-0.5">
            <p className="text-[8px] font-bold uppercase tracking-widest text-black mb-0">ΠΡΟΪΟΝ</p>
            <p className="text-[13px] font-bold uppercase leading-tight line-clamp-1">{data.product || '-'}</p>
          </div>
          <div className="border-b border-gray-200 pb-0.5">
            <p className="text-[8px] font-bold uppercase tracking-widest text-black mb-0">ΣΥΝΟΛΙΚΑ BINS ΠΑΡΤΙΔΑΣ</p>
            <p className="text-xl font-black leading-tight">{data.totalBins || '0'}</p>
          </div>
          <div className="border-b border-gray-200 pb-0.5">
            <p className="text-[8px] font-bold uppercase tracking-widest text-black mb-0">ΣΥΝΟΛΟ ΣΠΑΣΜΕΝΩΝ BINS</p>
            <p className="text-xl font-black text-black leading-tight">{data.brokenBins || '0'}</p>
          </div>
        </div>

        {/* Photos Layout */}
        <div className="flex-1">
          <h2 className="text-[9px] font-black uppercase mb-3 tracking-widest text-black">ΦΩΤΟΓΡΑΦΙΕΣ ΠΑΡΤΙΔΑΣ</h2>
          
          <div className="space-y-10">
            {photoGroups.map((group, gIndex) => (
              <div key={gIndex} className="grid grid-cols-2 gap-4" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                {group.map((photo, pIndex) => (
                  <div 
                    key={pIndex} 
                    className="aspect-[4/3] w-full bg-white border border-gray-200 rounded-sm overflow-hidden flex items-center justify-center"
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
            <div className="py-10 text-center border border-dashed border-gray-200 rounded-md">
              <p className="text-[10px] uppercase font-bold text-black opacity-30">Δεν υπάρχουν συνημμένες φωτογραφίες</p>
            </div>
          )}
        </div>

        {/* Footer - Minimal & Black */}
        <div className="mt-8 pt-4 border-t border-gray-100 text-center">
          <p className="text-[10px] text-black font-bold">στάλθηκε από agronomist@aspis.gr</p>
        </div>
      </div>
    </div>
  );
};

export default PDFTemplate;
