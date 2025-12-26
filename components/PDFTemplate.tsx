import React from 'react';
import { BinReportData } from '../types';
import { Logo } from './Logo';

interface PDFTemplateProps {
  data: BinReportData;
  page1Ref: React.RefObject<HTMLDivElement>;
  page2Ref: React.RefObject<HTMLDivElement>;
}

const PDFTemplate: React.FC<PDFTemplateProps> = ({ data, page1Ref, page2Ref }) => {
  const today = new Date().toLocaleDateString('el-GR');
  const firstPagePhotos = data.photos.slice(0, 4);
  const secondPagePhotos = data.photos.slice(4);

  const Header = () => (
    <div className="mb-8">
      <div className="flex justify-between items-end mb-3">
        <Logo className="h-14 w-auto" />
        <div className="text-right">
          <h1 className="text-[18px] font-black uppercase tracking-tighter leading-none mb-1">ΑΝΑΦΟΡΑ ΖΗΜΙΑΣ BINS</h1>
          <p className="text-[9px] font-bold text-gray-500 tracking-widest">ASPIS QUALITY CONTROL SYSTEM</p>
        </div>
      </div>
      <div className="h-[4px] w-full bg-black" />
    </div>
  );

  const Footer = () => (
    <div className="mt-auto pt-4 border-t-2 border-gray-100 flex justify-between items-center">
      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">ASPIS S.A. OFFICE COPY</p>
      <p className="text-[6px] text-gray-300 font-bold italic">στάλθηκε από agronomist@aspis.gr</p>
    </div>
  );

  return (
    <div className="fixed -left-[4000px] top-0 pointer-events-none bg-gray-200 p-10 flex flex-col gap-20">
      
      {/* ΣΕΛΙΔΑ 1 */}
      <div ref={page1Ref} className="bg-white w-[210mm] h-[297mm] flex flex-col p-[20mm] box-border shadow-2xl overflow-hidden">
        <Header />
        
        <div className="grid grid-cols-2 gap-x-10 gap-y-6 mb-10">
          {[
            { label: 'ΠΡΟΜΗΘΕΥΤΗΣ', val: data.supplierName },
            { label: 'ΗΜΕΡΟΜΗΝΙΑ', val: today },
            { label: 'ΟΔΗΓΟΣ', val: data.driverName },
            { label: 'ΠΡΟΪΟΝ', val: data.product }
          ].map((item, i) => (
            <div key={i} className="border-b-2 border-gray-100 pb-2">
              <p className="text-[10px] font-black text-gray-400 mb-1 uppercase tracking-wider">{item.label}</p>
              <p className="text-[14px] font-black uppercase">{item.val || '-'}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6 mb-10">
          <div className="bg-gray-50 p-6 rounded-3xl border-2 border-gray-100">
            <p className="text-[10px] font-black text-gray-400 mb-1 uppercase tracking-wider">ΣΥΝΟΛΙΚΑ BINS</p>
            <p className="text-[32px] font-black leading-none">{data.totalBins || '0'}</p>
          </div>
          <div className="bg-red-50 p-6 rounded-3xl border-2 border-red-100">
            <p className="text-[10px] font-black text-red-400 mb-1 uppercase tracking-wider">ΣΠΑΣΜΕΝΑ</p>
            <p className="text-[32px] font-black text-red-600 leading-none">{data.brokenBins || '0'}</p>
          </div>
        </div>

        <div className="mb-10 p-6 rounded-3xl bg-gray-50 border-2 border-gray-100 min-h-[100px]">
          <p className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-wider">ΠΑΡΑΤΗΡΗΣΕΙΣ / ΣΧΟΛΙΑ</p>
          <p className="text-[12px] font-bold leading-relaxed italic">
            {data.comments || 'Δεν υπάρχουν επιπλέον σχόλια.'}
          </p>
        </div>

        <div className="flex-1">
          <h2 className="text-[11px] font-black uppercase mb-4 tracking-widest border-l-4 border-black pl-4">ΦΩΤΟΓΡΑΦΙΚΟ ΥΛΙΚΟ (1-4)</h2>
          <div className="grid grid-cols-2 gap-6">
            {firstPagePhotos.map((photo, i) => (
              <div key={i} className="aspect-[4/3] rounded-2xl overflow-hidden border-2 border-gray-100 bg-gray-50 flex items-center justify-center">
                <img src={photo} className="w-full h-full object-contain" alt="Photo" />
              </div>
            ))}
          </div>
        </div>
        
        <Footer />
      </div>

      {/* ΣΕΛΙΔΑ 2 */}
      {secondPagePhotos.length > 0 && (
        <div ref={page2Ref} className="bg-white w-[210mm] h-[297mm] flex flex-col p-[20mm] box-border shadow-2xl overflow-hidden">
          <Header />
          <div className="flex-1">
            <h2 className="text-[11px] font-black uppercase mb-6 tracking-widest border-l-4 border-black pl-4">ΣΥΜΠΛΗΡΩΜΑΤΙΚΕΣ ΦΩΤΟΓΡΑΦΙΕΣ (5-{4 + secondPagePhotos.length})</h2>
            <div className="grid grid-cols-2 gap-6">
              {secondPagePhotos.map((photo, i) => (
                <div key={i} className="aspect-[4/3] rounded-2xl overflow-hidden border-2 border-gray-100 bg-gray-50 flex items-center justify-center">
                  <img src={photo} className="w-full h-full object-contain" alt="Photo" />
                </div>
              ))}
            </div>
          </div>
          <Footer />
        </div>
      )}
    </div>
  );
};

export default PDFTemplate;