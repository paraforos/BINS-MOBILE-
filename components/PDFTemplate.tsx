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
      <div className="flex justify-between items-end mb-4">
        <Logo className="h-16 w-auto" />
        <div className="text-right">
          <h1 className="text-[20px] font-black uppercase tracking-tighter leading-none mb-1 text-black">ΑΝΑΦΟΡΑ ΣΠΑΣΜΕΝΩΝ BINS</h1>
        </div>
      </div>
      <div className="h-[2px] w-full bg-black" />
    </div>
  );

  const Footer = () => (
    <div className="mt-auto pt-4 border-t border-gray-200 flex justify-between items-center">
      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest"></p>
      <p className="text-[6px] text-gray-400 font-medium italic">Sent from Android</p>
    </div>
  );

  const InfoBox = ({ label, value }: { label: string, value: string }) => (
    <div className="border-b border-gray-200 pb-2">
      <p className="text-[9px] font-black text-gray-400 mb-1 uppercase tracking-wider">{label}</p>
      <p className="text-[13px] font-bold uppercase text-black">{value || '-'}</p>
    </div>
  );

  const StatBox = ({ label, value }: { label: string, value: string }) => (
    <div className="border border-gray-200 p-6 rounded-2xl flex flex-col justify-center bg-white shadow-none">
      <p className="text-[9px] font-black text-gray-400 mb-1 uppercase tracking-wider">{label}</p>
      <p className="text-[32px] font-black leading-none text-black">{value || '0'}</p>
    </div>
  );

  return (
    <div className="fixed -left-[5000px] top-0 pointer-events-none flex flex-col gap-10">
      
      {/* PAGE 1 */}
      <div ref={page1Ref} className="bg-white w-[210mm] h-[297mm] flex flex-col p-[20mm] box-border overflow-hidden text-black font-sans shadow-none border-none">
        <Header />
        
        <div className="grid grid-cols-2 gap-x-12 gap-y-6 mb-10">
          <InfoBox label="ΠΡΟΜΗΘΕΥΤΗΣ" value={data.supplierName} />
          <InfoBox label="ΗΜΕΡΟΜΗΝΙΑ" value={today} />
          <InfoBox label="ΟΔΗΓΟΣ" value={data.driverName} />
          <InfoBox label="ΠΡΟΪΟΝ" value={data.product} />
        </div>

        <div className="grid grid-cols-2 gap-6 mb-10">
          <StatBox label="ΣΥΝΟΛΙΚΑ BINS" value={data.totalBins} />
          <StatBox label="ΣΠΑΣΜΕΝΑ" value={data.brokenBins} />
        </div>

        <div className="mb-10 p-6 border border-gray-200 rounded-2xl min-h-[80px] bg-white">
          <p className="text-[9px] font-black text-gray-400 mb-2 uppercase tracking-wider">ΣΧΟΛΙΑ / ΠΑΡΑΤΗΡΗΣΕΙΣ</p>
          <p className="text-[11px] font-medium leading-relaxed italic text-black">
            {data.comments || 'Δεν υπάρχουν επιπλέον σχόλια.'}
          </p>
        </div>

        <div className="flex-1">
          <h2 className="text-[10px] font-black uppercase mb-4 tracking-widest border-l-4 border-black pl-3">ΦΩΤΟΓΡΑΦΙΕΣ</h2>
          <div className="grid grid-cols-2 gap-4">
            {firstPagePhotos.map((photo, i) => (
              <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden border border-gray-100 bg-white flex items-center justify-center">
                <img src={photo} className="w-full h-full object-contain" alt="Damage" />
              </div>
            ))}
          </div>
        </div>
        
        <Footer />
      </div>

      {/* PAGE 2 */}
      {secondPagePhotos.length > 0 && (
        <div ref={page2Ref} className="bg-white w-[210mm] h-[297mm] flex flex-col p-[20mm] box-border overflow-hidden text-black font-sans shadow-none border-none">
          <Header />
          <div className="flex-1">
            <h2 className="text-[10px] font-black uppercase mb-6 tracking-widest border-l-4 border-black pl-3">ΣΥΝΕΧΕΙΑ ΦΩΤΟΓΡΑΦΙΩΝ</h2>
            <div className="grid grid-cols-2 gap-4">
              {secondPagePhotos.map((photo, i) => (
                <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden border border-gray-100 bg-white flex items-center justify-center">
                  <img src={photo} className="w-full h-full object-contain" alt="Damage Continued" />
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