import React, { useState, useRef, useEffect } from 'react';
import { Camera, Trash2, FileText, CheckCircle2, Loader2, RefreshCcw, Settings, Plus, ArrowLeft, Edit2, Check, X, Download, Upload } from 'lucide-react';
import { BinReportData, Step, AppView } from './types';
import { compressImage } from './services/imageService';
import StepLayout from './components/StepLayout';
import PDFTemplate from './components/PDFTemplate';
import { Logo } from './components/Logo';

declare global {
  interface Window { jspdf: any; html2canvas: any; }
}

const INITIAL_DATA: BinReportData = {
  supplierName: '', driverName: '', product: '', totalBins: '', brokenBins: '', photos: [], comments: ''
};

const DEFAULT_LISTS = {
  suppliers: ['ΣΥΝΕΤΑΙΡΙΣΜΟΣ Α', 'ΣΥΝΕΤΑΙΡΙΣΜΟΣ Β', 'ΙΔΙΩΤΗΣ'],
  drivers: ['ΓΙΑΝΝΗΣ ΠΑΠΑΔΟΠΟΥΛΟΣ', 'ΚΩΣΤΑΣ ΝΙΚΟΛΑΟΥ'],
  products: ['ΣΥΜΠΥΡΗΝΑ', 'ΡΟΔΑΚΙΝΑ', 'ΝΕΚΤΑΡΙΝΙΑ'],
  predefinedComments: ['ΣΠΑΣΜΕΝΟ ΠΑΤΟ', 'ΣΠΑΣΜΕΝΟ ΠΛΑΪΝΟ', 'ΚΑΜΕΝΟ BINS', 'ΦΘΟΡΑ ΑΠΟ ΧΡΗΣΗ']
};

const OnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const o = () => setIsOnline(true);
    const f = () => setIsOnline(false);
    window.addEventListener('online', o); window.addEventListener('offline', f);
    return () => { window.removeEventListener('online', o); window.removeEventListener('offline', f); };
  }, []);
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 ${isOnline ? 'bg-green-50 border-green-600 text-green-700' : 'bg-red-50 border-red-600 text-red-700'} font-black text-[10px]`}>
      <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-600 animate-pulse' : 'bg-red-600'}`} />
      {isOnline ? 'ONLINE' : 'OFFLINE'}
    </div>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.Reporter);
  const [currentStep, setCurrentStep] = useState<Step>(Step.Supplier);
  const [formData, setFormData] = useState<BinReportData>(INITIAL_DATA);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const pdfRef = useRef<HTMLDivElement>(null);

  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [drivers, setDrivers] = useState<string[]>([]);
  const [products, setProducts] = useState<string[]>([]);
  const [predefinedComments, setPredefinedComments] = useState<string[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [activeMgmtTab, setActiveMgmtTab] = useState<'suppliers' | 'drivers' | 'products' | 'comments'>('suppliers');

  useEffect(() => {
    const get = (k: string) => localStorage.getItem(k);
    const savedSuppliers = get('aspis_suppliers');
    const savedDrivers = get('aspis_drivers');
    const savedProducts = get('aspis_products');
    const savedComments = get('aspis_comments');

    setSuppliers(savedSuppliers ? JSON.parse(savedSuppliers) : DEFAULT_LISTS.suppliers);
    setDrivers(savedDrivers ? JSON.parse(savedDrivers) : DEFAULT_LISTS.drivers);
    setProducts(savedProducts ? JSON.parse(savedProducts) : DEFAULT_LISTS.products);
    setPredefinedComments(savedComments ? JSON.parse(savedComments) : DEFAULT_LISTS.predefinedComments);
    
    const draft = get('aspis_draft_report');
    if (draft) try { setFormData(JSON.parse(draft)); } catch(e) {}
    
    setTimeout(() => setShowSplash(false), 1200);
  }, []);

  useEffect(() => {
    if (formData !== INITIAL_DATA) localStorage.setItem('aspis_draft_report', JSON.stringify(formData));
  }, [formData]);

  const saveList = (type: any, list: any) => {
    localStorage.setItem(type === 'comments' ? 'aspis_comments' : `aspis_${type}`, JSON.stringify(list));
  };

  const handleAddItem = (type: any) => {
    if (!newItemText.trim()) return;
    const item = newItemText.trim().toUpperCase();
    let currentList = type === 'suppliers' ? suppliers : type === 'drivers' ? drivers : type === 'products' ? products : predefinedComments;
    
    if (currentList.includes(item)) return;
    const nextList = [...currentList, item];
    
    if (type === 'suppliers') setSuppliers(nextList);
    else if (type === 'drivers') setDrivers(nextList);
    else if (type === 'products') setProducts(nextList);
    else setPredefinedComments(nextList);
    
    saveList(type, nextList);
    setNewItemText('');
  };

  const generatePDF = async () => {
    if (!pdfRef.current || isGenerating) return;
    setIsGenerating(true);
    try {
      // Μείωση scale στο 1.0 για αποφυγή crash μνήμης
      const canvas = await window.html2canvas(pdfRef.current, { 
        scale: 1, 
        useCORS: true, 
        backgroundColor: '#e5e7eb',
        logging: false,
        removeContainer: true
      });
      
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Use JPEG compression
      const imgData = canvas.toDataURL('image/jpeg', 0.7);
      const pageWidth = 210;
      const pageHeight = 297;

      // Σελίδα 1
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
      
      // Σελίδα 2 αν υπάρχουν πολλές φωτό
      if (formData.photos.length > 4) {
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, -pageHeight, pageWidth, pageHeight, undefined, 'FAST');
      }

      pdf.save(`ASPIS_${new Date().getTime()}.pdf`);
      
      // Clear draft to free memory
      localStorage.removeItem('aspis_draft_report');
      alert("Η αναφορά εκδόθηκε επιτυχώς!");
    } catch (e) { 
      console.error(e);
      alert("Σφάλμα μνήμης! Δοκιμάστε να αφαιρέσετε κάποιες φωτογραφίες ή να κάνετε επανεκκίνηση."); 
    }
    finally { 
      setIsGenerating(false); 
    }
  };

  if (showSplash) return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-12">
      <Logo className="h-40 mb-12 animate-pulse" />
      <div className="h-1 w-32 bg-gray-900 rounded-full overflow-hidden">
        <div className="h-full bg-yellow-400 animate-[loading_1.2s_ease-in-out_infinite]" />
      </div>
      <style>{`@keyframes loading { 0% { width: 0%; } 100% { width: 100%; } }`}</style>
    </div>
  );

  const MainHeader = () => (
    <header className="px-5 py-4 bg-white border-b-4 border-black flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <Logo className="h-8 w-auto" />
        <h1 className="text-xs font-black tracking-tight uppercase">Damage Reporter</h1>
      </div>
      <div className="flex items-center gap-3">
        <OnlineStatus />
        <button onClick={() => setView(AppView.Management)} className="p-2 border-2 border-black rounded-xl active:bg-gray-100">
          <Settings size={24} />
        </button>
      </div>
    </header>
  );

  if (view === AppView.Management) return (
    <div className="flex flex-col h-screen bg-white">
      <header className="p-5 border-b-4 border-black flex items-center gap-4">
        <button onClick={() => setView(AppView.Reporter)} className="p-2 border-2 border-black rounded-xl"><ArrowLeft size={24} /></button>
        <h1 className="text-xl font-black uppercase">ΡΥΘΜΙΣΕΙΣ</h1>
      </header>
      <main className="flex-1 p-5 overflow-hidden flex flex-col gap-4">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
          {['suppliers', 'drivers', 'products', 'comments'].map((t: any) => (
            <button key={t} onClick={() => setActiveMgmtTab(t)} className={`flex-1 py-3 px-4 rounded-lg text-[10px] font-black uppercase whitespace-nowrap ${activeMgmtTab === t ? 'bg-black text-white' : 'text-gray-500'}`}>
              {t === 'suppliers' ? 'ΠΡΟΜΗΘΕΥΤΕΣ' : t === 'drivers' ? 'ΟΔΗΓΟΙ' : t === 'products' ? 'ΠΡΟΪΟΝΤΑ' : 'ΣΧΟΛΙΑ'}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newItemText} onChange={e => setNewItemText(e.target.value)} className="flex-1 p-4 border-4 border-gray-100 rounded-2xl focus:border-black outline-none uppercase font-black" placeholder="ΠΡΟΣΘΗΚΗ..." />
          <button onClick={() => handleAddItem(activeMgmtTab)} className="bg-black text-white p-4 rounded-2xl"><Plus size={32} /></button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pb-10">
          {(activeMgmtTab === 'suppliers' ? suppliers : activeMgmtTab === 'drivers' ? drivers : activeMgmtTab === 'products' ? products : predefinedComments).map((item, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-xl border-2 border-gray-100 flex justify-between items-center font-black uppercase text-sm">
              <span>{item}</span>
              <button onClick={() => {
                if(!confirm('ΔΙΑΓΡΑΦΗ;')) return;
                let next = [];
                if(activeMgmtTab==='suppliers') { next = suppliers.filter((_,idx)=>idx!==i); setSuppliers(next); }
                else if(activeMgmtTab==='drivers') { next = drivers.filter((_,idx)=>idx!==i); setDrivers(next); }
                else if(activeMgmtTab==='products') { next = products.filter((_,idx)=>idx!==i); setProducts(next); }
                else { next = predefinedComments.filter((_,idx)=>idx!==i); setPredefinedComments(next); }
                saveList(activeMgmtTab, next);
              }} className="text-red-600 p-2"><Trash2 size={20} /></button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );

  return (
    <div className={`max-w-md mx-auto min-h-screen bg-white ${isGenerating ? 'generating-pdf' : ''}`}>
      {MainHeader()}
      {currentStep === Step.Summary ? (
        <div className="p-5 pb-48">
          <div className="bg-black text-white p-8 rounded-[2.5rem] shadow-2xl border-4 border-black">
            <h2 className="text-yellow-400 font-black text-xs tracking-widest uppercase mb-6">ΣΥΝΟΨΗ ΑΝΑΦΟΡΑΣ</h2>
            <div className="space-y-6">
              <div><p className="text-[10px] opacity-50 uppercase mb-1">ΠΡΟΜΗΘΕΥΤΗΣ</p><p className="text-2xl font-black">{formData.supplierName}</p></div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-[10px] opacity-50 uppercase mb-1">ΣΥΝΟΛΟ</p><p className="text-4xl font-black">{formData.totalBins}</p></div>
                <div><p className="text-[10px] text-red-400 uppercase mb-1">ΣΠΑΣΜΕΝΑ</p><p className="text-4xl font-black text-red-500">{formData.brokenBins}</p></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-6">
            {formData.photos.map((p, i) => <img key={i} src={p} className="aspect-square object-cover rounded-xl border-2 border-gray-100" />)}
          </div>
          <footer className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t-4 border-gray-100 flex flex-col gap-3 z-50 shadow-2xl">
            <button onClick={generatePDF} disabled={isGenerating} className="w-full py-6 bg-black text-white rounded-[2rem] font-black text-2xl flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50 shadow-xl">
              {isGenerating ? <Loader2 className="animate-spin" size={32} /> : <FileText size={32} />} ΕΚΔΟΣΗ PDF
            </button>
            <button onClick={() => confirm('ΝΕΑ ΑΝΑΦΟΡΑ;') && window.location.reload()} className="text-gray-400 font-black text-xs uppercase text-center py-2 flex items-center justify-center gap-2"><RefreshCcw size={14} /> ΝΕΑ ΑΝΑΦΟΡΑ</button>
          </footer>
        </div>
      ) : (
        <StepLayout 
          title={currentStep === Step.Supplier ? "ΠΡΟΜΗΘΕΥΤΗΣ" : currentStep === Step.Driver ? "ΟΔΗΓΟΣ" : currentStep === Step.Product ? "ΠΡΟΪΟΝ" : currentStep === Step.TotalBins ? "ΣΥΝΟΛΟ BINS" : currentStep === Step.BrokenBins ? "ΣΠΑΣΜΕΝΑ" : currentStep === Step.Photos ? "ΦΩΤΟΓΡΑΦΙΕΣ" : "ΣΧΟΛΙΑ"}
          stepIndex={currentStep} totalSteps={8}
          onNext={() => setCurrentStep(prev => prev + 1)}
          onBack={currentStep > 0 ? () => setCurrentStep(prev => prev - 1) : undefined}
          isNextDisabled={
            (currentStep === Step.Supplier && !formData.supplierName) ||
            (currentStep === Step.Driver && !formData.driverName) ||
            (currentStep === Step.Product && !formData.product) ||
            (currentStep === Step.TotalBins && !formData.totalBins) ||
            (currentStep === Step.BrokenBins && !formData.brokenBins)
          }
        >
          {currentStep <= 2 ? (
            <div className="space-y-3">
              {(currentStep === 0 ? suppliers : currentStep === 1 ? drivers : products).map((item, i) => (
                <button key={i} onClick={() => setFormData(p => ({ ...p, [currentStep === 0 ? 'supplierName' : currentStep === 1 ? 'driverName' : 'product']: item }))} className={`w-full p-6 rounded-[2rem] text-left font-black uppercase text-xl border-4 transition-all ${ (currentStep === 0 ? formData.supplierName : currentStep === 1 ? formData.driverName : formData.product) === item ? 'bg-yellow-400 border-yellow-400 shadow-lg scale-[1.02]' : 'bg-gray-50 border-gray-100' }`}>
                  {item}
                </button>
              ))}
            </div>
          ) : currentStep === 3 || currentStep === 4 ? (
            <input type="number" inputMode="numeric" autoFocus className={`w-full text-8xl p-10 border-4 border-gray-200 rounded-[3rem] text-center font-black outline-none ${currentStep === 4 ? 'bg-red-50 text-red-600 focus:border-red-600' : 'bg-gray-50 text-black focus:border-black'}`} value={currentStep === 3 ? formData.totalBins : formData.brokenBins} onChange={e => setFormData(p => ({ ...p, [currentStep === 3 ? 'totalBins' : 'brokenBins']: e.target.value }))} />
          ) : currentStep === 5 ? (
            <div className="grid grid-cols-3 gap-3">
              {formData.photos.map((p, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-100">
                  <img src={p} className="w-full h-full object-cover" />
                  <button onClick={() => setFormData(prev => ({ ...prev, photos: prev.photos.filter((_, idx) => idx !== i) }))} className="absolute top-1 right-1 bg-red-600 text-white p-2 rounded-xl"><Trash2 size={16} /></button>
                </div>
              ))}
              {formData.photos.length < 9 && (
                <label className="aspect-square border-4 border-dashed border-black rounded-2xl flex flex-col items-center justify-center bg-gray-50 active:bg-gray-200 cursor-pointer">
                  {isUploading ? <Loader2 className="animate-spin text-black" size={40} /> : <Camera size={40} />}
                  <input type="file" className="hidden" accept="image/*" capture="environment" multiple onChange={async e => {
                    const files = Array.from(e.target.files || []).slice(0, 9 - formData.photos.length) as File[];
                    if (files.length === 0) return;
                    setIsUploading(true);
                    try {
                      const compressed = await Promise.all(files.map(f => compressImage(f)));
                      setFormData(p => ({ ...p, photos: [...p.photos, ...compressed] }));
                    } catch(err) {
                      alert("Πρόβλημα με την επεξεργασία της εικόνας.");
                    } finally { setIsUploading(false); }
                  }} />
                </label>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <textarea rows={3} className="w-full p-6 border-4 border-gray-100 rounded-[2rem] outline-none font-black text-xl uppercase bg-gray-50 focus:border-black" placeholder="ΓΡΑΨΤΕ ΕΔΩ..." value={formData.comments} onChange={e => setFormData(p => ({ ...p, comments: e.target.value.toUpperCase() }))} />
              <div className="grid grid-cols-1 gap-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">ΠΡΟΤΕΙΝΟΜΕΝΑ:</p>
                {predefinedComments.map((c, i) => (
                  <button key={i} onClick={() => {
                    const current = formData.comments.trim();
                    setFormData(p => ({ ...p, comments: current ? `${current}, ${c}`.toUpperCase() : c.toUpperCase() }));
                  }} className="w-full p-5 rounded-2xl text-left font-black uppercase transition-all bg-white border-2 border-gray-100 active:border-yellow-400 flex items-center gap-3">
                    <Plus size={20} className="text-yellow-600" />
                    <span className="text-sm">{c}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {isUploading && <div className="mt-4 p-4 bg-yellow-400 text-black font-black text-center rounded-2xl animate-pulse">ΕΠΕΞΕΡΓΑΣΙΑ...</div>}
        </StepLayout>
      )}
      <PDFTemplate data={formData} reportRef={pdfRef} />
    </div>
  );
};

export default App;