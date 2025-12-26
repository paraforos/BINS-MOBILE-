
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
        className="bg-white p-12 w-[800px] min-h-[1130px] flex flex-col font-sans text-gray-900"
      >
        {/* Brand Header */}
        <div className="flex justify-between items-center mb-6">
          <Logo className="h-20 w-auto" />
          <div className="text-right">
            <h1 className="text-xl font-black text-[#003d71] uppercase">ΑΝΑΦΟΡΑ ΣΠΑΣΜΕΝΩΝ BINS</h1>
          </div>
        </div>

        <div className="h-0.5 w-full bg-[#003d71] mb-8" />

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-x-12 gap-y-6 mb-10">
          <div>
            <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">ΠΡΟΜΗΘΕΥΤΗΣ</p>
            <p className="text-sm font-bold border-b border-gray-100 pb-1">{data.supplierName || '-'}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">ΗΜΕΡΟΜΗΝΙΑ</p>
            <p className="text-sm font-bold border-b border-gray-100 pb-1">{today}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">ΟΔΗΓΟΣ</p>
            <p className="text-sm font-bold border-b border-gray-100 pb-1 uppercase">{data.driverName || '-'}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">ΠΡΟΪΟΝ</p>
            <p className="text-sm font-bold border-b border-gray-100 pb-1 uppercase">{data.product || '-'}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">ΣΥΝΟΛΙΚΑ BINS ΠΑΡΤΙΔΑΣ</p>
            <p className="text-2xl font-black">{data.totalBins || '0'}</p>
          </div>
          <div className="bg-red-50 p-3 rounded">
            <p className="text-[9px] font-bold text-red-400 uppercase mb-1">ΣΥΝΟΛΟ ΣΠΑΣΜΕΝΩΝ BINS</p>
            <p className="text-2xl font-black text-red-600">{data.brokenBins || '0'}</p>
          </div>
        </div>

        {/* Photos Section */}
        <div className="flex-1">
          <h2 className="text-[11px] font-black uppercase text-[#003d71] mb-4 border-l-4 border-[#003d71] pl-2">
            ΦΩΤΟΓΡΑΦΙΕΣ ΠΑΡΤΙΔΑΣ
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {data.photos.map((photo, index) => (
              <div key={index} className="aspect-video w-full relative overflow-hidden bg-gray-50 border border-gray-200 rounded-lg">
                <img 
                  src={photo} 
                  alt={`Evidence ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1 right-1 bg-black/50 text-white text-[8px] px-2 py-0.5 rounded font-mono">
                  IMG_{index + 1}
                </div>
              </div>
            ))}
            {data.photos.length === 0 && (
              <div className="col-span-2 py-24 text-center border-2 border-dashed border-gray-100 rounded-xl">
                <p className="text-gray-300 font-bold uppercase text-xs tracking-widest">Δεν υπάρχουν συνημμένες φωτογραφίες</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-100 flex justify-center items-end">
          <div className="text-[10px] text-gray-400 text-center font-medium">
            <p>Η ΑΝΑΦΟΡΑ ΣΤΑΛΘΗΚΕ ΑΠΟ agronomist@aspis.gr</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFTemplate;
