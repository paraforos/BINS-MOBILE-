import React from 'react';
import { BinReportData } from '../types';
import { Logo } from './Logo';

interface PDFTemplateProps {
  data: BinReportData;
  reportRef: React.RefObject<HTMLDivElement>;
}

const PDFTemplate: React.FC<PDFTemplateProps> = ({ data, reportRef }) => {
  const today = new Date().toLocaleDateString('el-GR');
  
  // Χωρίζουμε τις φωτογραφίες: 1-4 στην πρώτη σελίδα, 5-9 στη δεύτερη
  const firstPagePhotos = data.photos.slice(0, 4);
  const secondPagePhotos = data.photos.slice(4);

  const PageHeader = () => (
    <>
      <div className="flex justify-between items-end mb-2">
        <Logo className="h-12 w-auto" />
        <h1 className="text-[14px] font-black uppercase tracking-tight">ΑΝΑΦΟΡΑ ΣΠΑΣΜΕΝΩΝ BINS</h1>
      </div>
      <div className="h-[3px] w-full bg-black mb-6" />
    </>
  );

  const Footer = () => (
    <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center opacity-70">
      <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">ASPIS BINS DAMAGE REPORTER</p>
      <p className="text-[5px] text-gray-300 font-bold lowercase italic">στάλθηκε από agronomist@aspis.gr</p>
    </div>
  );

  return (
    <div className="fixed -left-[3000px] top-0 pointer-events-none">
      <div ref={reportRef} className="flex flex-col bg-gray-200 gap-4">
        
        {/* ΣΕΛΙΔΑ 1 */}
        <div className="bg-white w-[794px] h-[1123px] flex flex-col font-sans p-[50px] shadow-sm">
          <PageHeader />
          
          <div className="grid grid-cols-2 gap-x-12 gap-y-6 mb-8">
            {[
              { label: 'ΠΡΟΜΗΘΕΥΤΗΣ', val: data.supplierName },
              { label: 'ΗΜΕΡΟΜΗΝΙΑ', val: today },
              { label: 'ΟΔΗΓΟΣ', val: data.driverName },
              { label: 'ΠΡΟΪΟΝ', val: data.product }
            ].map((item, i) => (
              <div key={i} className="border-b border-gray-200 pb-2">
                <p className="text-[9px] font-black text-gray-400 mb-1">{item.label}</p>
                <p className="text-[13px] font-black uppercase">{item.val || '-'}</p>
              </div>
            ))}
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-[9px] font-black text-gray-400 mb-1 uppercase">ΣΥΝΟΛΙΚΑ BINS ΠΑΡΤΙΔΑΣ</p>
              <p className="text-[24px] font-black leading-none">{data.totalBins || '0'}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-xl">
              <p className="text-[9px] font-black text-red-400 mb-1 uppercase">ΣΥΝΟΛΟ ΣΠΑΣΜΕΝΩΝ</p>
              <p className="text-[24px] font-black text-red-600 leading-none">{data.brokenBins || '0'}</p>
            </div>
          </div>

          <div className="border-2 border-gray-100 p-5 rounded-2xl mb-8 bg-gray-50/30">
            <p className="text-[9px] font-black text-gray-400 mb-2 uppercase">ΣΧΟΛΙΑ / ΠΑΡΑΤΗΡΗΣΕΙΣ</p>
            <p className="text-[11px] font-bold leading-relaxed italic">
              {data.comments || 'Δεν υπάρχουν σχόλια.'}
            </p>
          </div>

          <div className="flex-1">
            <h2 className="text-[10px] font-black uppercase mb-4 tracking-widest border-l-4 border-black pl-4">ΦΩΤΟΓΡΑΦΙΕΣ (1-4)</h2>
            <div className="grid grid-cols-2 gap-6">
              {firstPagePhotos.map((photo, pIndex) => (
                <div key={pIndex} className="aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 bg-white">
                  <img src={photo} className="w-full h-full object-cover" alt="Damage 1-4" />
                </div>
              ))}
            </div>
          </div>
          
          <Footer />
        </div>

        {/* ΣΕΛΙΔΑ 2 (Εμφανίζεται μόνο αν υπάρχουν > 4 φωτογραφίες) */}
        {secondPagePhotos.length > 0 && (
          <div className="bg-white w-[794px] h-[1123px] flex flex-col font-sans p-[50px] shadow-sm">
            <PageHeader />
            <div className="flex-1">
              <h2 className="text-[10px] font-black uppercase mb-6 tracking-widest border-l-4 border-black pl-4">ΣΥΜΠΛΗΡΩΜΑΤΙΚΕΣ ΦΩΤΟΓΡΑΦΙΕΣ (5-{4 + secondPagePhotos.length})</h2>
              <div className="grid grid-cols-2 gap-6">
                {secondPagePhotos.map((photo, pIndex) => (
                  <div key={pIndex} className="aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 bg-white">
                    <img src={photo} className="w-full h-full object-cover" alt="Damage 5+" />
                  </div>
                ))}
              </div>
            </div>
            <Footer />
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFTemplate;