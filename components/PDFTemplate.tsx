
import React from 'react';
import { BinReportData } from '../types';
import { Logo } from './Logo';

interface PDFTemplateProps {
  data: BinReportData;
  reportRef: React.RefObject<HTMLDivElement>;
}

const PDFTemplate: React.FC<PDFTemplateProps> = ({ data, reportRef }) => {
  const today = new Date().toLocaleDateString('el-GR');
  const photoGroups = [];
  for (let i = 0; i < data.photos.length; i += 4) {
    photoGroups.push(data.photos.slice(i, i + 4));
  }

  return (
    <div className="fixed -left-[2000px] top-0 pointer-events-none">
      <div 
        ref={reportRef} 
        className="bg-white w-[794px] min-h-[1123px] flex flex-col font-sans"
        style={{ color: 'black', padding: '40px 50px' }}
      >
        <div className="flex justify-between items-end mb-2">
          <Logo className="h-12 w-auto" />
          <h1 className="text-[14px] font-black uppercase tracking-tight">ΑΝΑΦΟΡΑ ΣΠΑΣΜΕΝΩΝ BINS</h1>
        </div>
        <div className="h-[3px] w-full bg-black mb-8" />

        <div className="grid grid-cols-2 gap-x-12 gap-y-6 mb-10">
          {[
            { label: 'ΠΡΟΜΗΘΕΥΤΗΣ', val: data.supplierName },
            { label: 'ΗΜΕΡΟΜΗΝΙΑ', val: today },
            { label: 'ΟΔΗΓΟΣ', val: data.driverName },
            { label: 'ΠΡΟΪΟΝ', val: data.product }
          ].map((item, i) => (
            <div key={i} className="border-b border-gray-200 pb-2">
              <p className="text-[9px] font-black text-gray-400 mb-1">{item.label}</p>
              <p className="text-[14px] font-black uppercase">{item.val || '-'}</p>
            </div>
          ))}
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-[9px] font-black text-gray-400 mb-1 uppercase">ΣΥΝΟΛΙΚΑ BINS ΠΑΡΤΙΔΑΣ</p>
            <p className="text-[28px] font-black leading-none">{data.totalBins || '0'}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-xl">
            <p className="text-[9px] font-black text-red-400 mb-1 uppercase">ΣΥΝΟΛΟ ΣΠΑΣΜΕΝΩΝ</p>
            <p className="text-[28px] font-black text-red-600 leading-none">{data.brokenBins || '0'}</p>
          </div>
        </div>

        <div className="border-2 border-gray-100 p-5 rounded-2xl mb-10 bg-gray-50/30">
          <p className="text-[9px] font-black text-gray-400 mb-2 uppercase">ΣΧΟΛΙΑ / ΠΑΡΑΤΗΡΗΣΕΙΣ</p>
          <p className="text-[12px] font-bold leading-relaxed italic">
            {data.comments || 'Δεν υπάρχουν σχόλια.'}
          </p>
        </div>

        <div className="flex-1">
          <h2 className="text-[11px] font-black uppercase mb-6 tracking-widest border-l-4 border-black pl-4">ΦΩΤΟΓΡΑΦΙΕΣ ΤΕΚΜΗΡΙΩΣΗΣ</h2>
          <div className="space-y-10">
            {photoGroups.map((group, gIndex) => (
              <div key={gIndex} className="grid grid-cols-2 gap-6" style={{ breakInside: 'avoid' }}>
                {group.map((photo, pIndex) => (
                  <div key={pIndex} className="aspect-[4/3] rounded-xl overflow-hidden border border-gray-200">
                    <img src={photo} className="w-full h-full object-cover" alt="Damage" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-100 flex justify-between items-center">
          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">ASPIS BINS DAMAGE REPORTER</p>
          <p className="text-[6px] text-gray-300 font-bold lowercase italic">στάλθηκε από agronomist@aspis.gr</p>
        </div>
      </div>
    </div>
  );
};

export default PDFTemplate;
