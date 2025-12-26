import React, { useState, useRef, useEffect } from 'react';
import { Camera, Trash2, FileText, Loader2, RefreshCcw, Settings, Plus, ArrowLeft, Edit2, Download, Upload } from 'lucide-react';
import { BinReportData, Step, AppView } from './types';
import { compressImage, greekToLatin } from './services/imageService';
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

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.Reporter);
  const [currentStep, setCurrentStep] = useState<Step>(Step.Supplier);
  const [formData, setFormData] = useState<BinReportData>(INITIAL_DATA);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  
  const page1Ref = useRef<HTMLDivElement>(null);
  const page2Ref = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [drivers, setDrivers] = useState<string[]>([]);
  const [products, setProducts] = useState<string[]>([]);
  const [predefinedComments, setPredefinedComments] = useState<string[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [activeMgmtTab, setActiveMgmtTab] = useState<'suppliers' | 'drivers' | 'products' | 'comments'>('suppliers');

  useEffect(() => {
    const get = (k: string) => localStorage.getItem(k);
    setSuppliers(get('aspis_suppliers') ? JSON.parse(get('aspis_suppliers')!) : DEFAULT_LISTS.suppliers);
    setDrivers(get('aspis_drivers') ? JSON.parse(get('aspis_drivers')!) : DEFAULT_LISTS.drivers);
    setProducts(get('aspis_products') ? JSON.parse(get('aspis_products')!) : DEFAULT_LISTS.products);
    setPredefinedComments(get('aspis_comments') ? JSON.parse(get('aspis_comments')!) : DEFAULT_LISTS.predefinedComments);
    
    const draft = get('aspis_draft_report');
    if (draft) try { setFormData(JSON.parse(draft)); } catch(e) {}
    
    setTimeout(() => setShowSplash(false), 1200);
  }, []);

  useEffect(() => {
    if (formData !== INITIAL_DATA) {
      localStorage.setItem('aspis_draft_report', JSON.stringify(formData));
    }
  }, [formData]);

  const handleExport = () => {
    const backupData = {
      suppliers,
      drivers,
      products,
      comments: predefinedComments
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `aspis_lists_backup_${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.suppliers) {
          setSuppliers(json.suppliers);
          localStorage.setItem('aspis_suppliers', JSON.stringify(json.suppliers));
        }
        if (json.drivers) {
          setDrivers(json.drivers);
          localStorage.setItem('aspis_drivers', JSON.stringify(json.drivers));
        }
        if (json.products) {
          setProducts(json.products);
          localStorage.setItem('aspis_products', JSON.stringify(json.products));
        }
        if (json.comments) {
          setPredefinedComments(json.comments);
          localStorage.setItem('aspis_comments', JSON.stringify(json.comments));
        }
        alert('Η εισαγωγή ολοκληρώθηκε επιτυχώς!');
        window.location.reload();
      } catch (err) {
        alert('Σφάλμα: Το αρχείο δεν είναι έγκυρο αρχείο backup.');
      }
    };
    reader.readAsText(file);
  };

  const generatePDF = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    
    try {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      if (page1Ref.current) {
        const canvas1 = await window.html2canvas(page1Ref.current, { scale: 1.5, logging: false, useCORS: true });
        const img1 = canvas1.toDataURL('image/jpeg', 0.8);
        pdf.addImage(img1, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
        canvas1.width = 0; canvas1.height = 0;
      }

      if (formData.photos.length > 4 && page2Ref.current) {
        pdf.addPage();
        const canvas2 = await window.html2canvas(page2Ref.current, { scale: 1.5, logging: false, useCORS: true });
        const img2 = canvas2.toDataURL('image/jpeg', 0.8);
        pdf.addImage(img2, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
        canvas2.width = 0; canvas2.height = 0;
      }

      const now = new Date();
      const dateStr = `${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}_${String(now.getDate()).padStart(2, '0')}`;
      const supplierLatin = greekToLatin(formData.supplierName || 'REPORT');
      pdf.save(`${supplierLatin}_${dateStr}.pdf`);
      
      localStorage.removeItem('aspis_draft_report');
      alert("Επιτυχής εξαγωγή PDF!");
    } catch (e) {
      console.error(e);
      alert("Σφάλμα μνήμης! Αφαιρέστε μερικές φωτογραφίες ή δοκιμάστε ξανά.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (showSplash) return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-12">
      <Logo className="h-40 mb-12 animate-pulse" />
      <div className="h-1 w-32 bg-gray-900 rounded-full overflow-hidden">
        <div className="h-full bg-yellow-400 animate-[loading_1.2s_ease-in-out_infinite]" />
      </div>
    </div>
  );

  const SummaryItem = ({ label, value, step }: { label: string, value: string, step: Step }) => (
    <div className="flex justify-between items-center bg-white p-4 rounded-2xl border-2 border-gray-100 mb-2">
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-lg font-black uppercase text-black leading-tight">{value || '-'}</p>
      </div>
      <button onClick={() => setCurrentStep(step)} className="p-3 text-blue-600 bg-blue-50 rounded-xl active:scale-95 transition-transform"><Edit2 size={18} /></button>
    </div>
  );

  if (view === AppView.Management) return (
    <div className="flex flex-col h-screen bg-white">
      <header className="p-5 border-b-4 border-black flex items-center gap-4">
        <button onClick={() => setView(AppView.Reporter)} className="p-2 border-2 border-black rounded-xl active:bg-gray-100"><ArrowLeft size={24} /></button>
        <h1 className="text-xl font-black uppercase tracking-tighter">ΡΥΘΜΙΣΕΙΣ ΛΙΣΤΩΝ</h1>
      </header>
      <main className="flex-1 p-5 overflow-hidden flex flex-col gap-4">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
          {['suppliers', 'drivers', 'products', 'comments'].map((t: any) => (
            <button key={t} onClick={() => setActiveMgmtTab(t)} className={`flex-1 py-3 px-4 rounded-lg text-[10px] font-black uppercase whitespace-nowrap transition-colors ${activeMgmtTab === t ? 'bg-black text-white' : 'text-gray-500'}`}>
              {t === 'suppliers' ? 'ΠΡΟΜΗΘΕΥΤΕΣ' : t === 'drivers' ? 'ΟΔΗΓΟΙ' : t === 'products' ? 'ΠΡΟΪΟΝΤΑ' : 'ΣΧΟΛΙΑ'}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newItemText} onChange={e => setNewItemText(e.target.value)} className="flex-1 p-4 border-4 border-gray-100 rounded-2xl focus:border-black outline-none uppercase font-black transition-colors" placeholder="ΠΡΟΣΘΗΚΗ..." />
          <button onClick={() => {
             const type = activeMgmtTab;
             if (!newItemText.trim()) return;
             const next = [...(type === 'suppliers' ? suppliers : type === 'drivers' ? drivers : type === 'products' ? products : predefinedComments), newItemText.trim().toUpperCase()];
             if (type === 'suppliers') setSuppliers(next); else if (type === 'drivers') setDrivers(next); else if (type === 'products') setProducts(next); else setPredefinedComments(next);
             localStorage.setItem(type === 'comments' ? 'aspis_comments' : `aspis_${type}`, JSON.stringify(next));
             setNewItemText('');
          }} className="bg-black text-white p-4 rounded-2xl active:scale-95 transition-transform"><Plus size={32} /></button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
          {(activeMgmtTab === 'suppliers' ? suppliers : activeMgmtTab === 'drivers' ? drivers : activeMgmtTab === 'products' ? products : predefinedComments).map((item, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-xl border-2 border-gray-100 flex justify-between items-center font-black uppercase text-sm">
              <span className="flex-1 mr-4">{item}</span>
              <button onClick={() => {
                if(!confirm('ΔΙΑΓΡΑΦΗ;')) return;
                const list = (activeMgmtTab === 'suppliers' ? suppliers : activeMgmtTab === 'drivers' ? drivers : activeMgmtTab === 'products' ? products : predefinedComments);
                const next = list.filter((_, idx) => idx !== i);
                if (activeMgmtTab === 'suppliers') setSuppliers(next); else if (activeMgmtTab === 'drivers') setDrivers(next); else if (activeMgmtTab === 'products') setProducts(next); else setPredefinedComments(next);
                localStorage.setItem(activeMgmtTab === 'comments' ? 'aspis_comments' : `aspis_${activeMgmtTab}`, JSON.stringify(next));
              }} className="text-red-600 p-2 active:bg-red-50 rounded-lg"><Trash2 size={20} /></button>
            </div>
          ))}
        </div>
        
        <div className="pt-4 mt-auto border-t-2 border-gray-100 grid grid-cols-2 gap-3">
          <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} />
          <button onClick={handleExport} className="flex items-center justify-center gap-2 py-4 bg-gray-50 text-black border-2 border-gray-200 rounded-2xl font-black uppercase text-[10px] tracking-widest active:bg-gray-200">
            <Download size={16} /> BACKUP (EXPORT)
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 py-4 bg-gray-50 text-black border-2 border-gray-200 rounded-2xl font-black uppercase text-[10px] tracking-widest active:bg-gray-200">
            <Upload size={16} /> RESTORE (IMPORT)
          </button>
        </div>
      </main>
    </div>
  );

  return (
    <div className={`max-w-md mx-auto min-h-screen bg-white ${isGenerating ? 'generating-pdf' : ''}`}>
      <header className="px-5 py-4 bg-white border-b-4 border-black flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
           <Logo className="h-8 w-auto" />
           <span className="text-[10px] font-black uppercase tracking-tighter">Damage Reporter</span>
        </div>
        <button onClick={() => setView(AppView.Management)} className="p-2 border-2 border-black rounded-xl active:bg-gray-100 transition-colors"><Settings size={24} /></button>
      </header>

      {currentStep === Step.Summary ? (
        <div className="p-5 pb-48 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-black mb-6 uppercase border-l-8 border-black pl-4 tracking-tighter">ΣΥΝΟΨΗ ΑΝΑΦΟΡΑΣ</h2>
          
          <SummaryItem label="ΠΡΟΜΗΘΕΥΤΗΣ" value={formData.supplierName} step={Step.Supplier} />
          <SummaryItem label="ΟΔΗΓΟΣ" value={formData.driverName} step={Step.Driver} />
          <SummaryItem label="ΠΡΟΪΟΝ" value={formData.product} step={Step.Product} />
          
          <div className="grid grid-cols-2 gap-2 mb-2">
             <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 flex justify-between items-center">
                <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ΣΥΝΟΛΟ</p><p className="text-2xl font-black">{formData.totalBins}</p></div>
                <button onClick={() => setCurrentStep(Step.TotalBins)} className="p-2 text-blue-600 active:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
             </div>
             <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 flex justify-between items-center">
                <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ΣΠΑΣΜΕΝΑ</p><p className="text-2xl font-black text-red-600">{formData.brokenBins}</p></div>
                <button onClick={() => setCurrentStep(Step.BrokenBins)} className="p-2 text-blue-600 active:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
             </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 mb-4 flex justify-between items-start">
             <div className="flex-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ΣΧΟΛΙΑ</p>
                <p className="text-sm font-bold uppercase italic mt-1 leading-snug">{formData.comments || 'ΧΩΡΙΣ ΕΠΙΠΛΕΟΝ ΣΧΟΛΙΑ'}</p>
             </div>
             <button onClick={() => setCurrentStep(Step.Comments)} className="p-2 text-blue-600 active:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            {formData.photos.map((p, i) => (
              <div key={i} className="aspect-square relative group">
                <img src={p} className="w-full h-full object-cover rounded-xl border-2 border-gray-100" alt="Summary thumb" />
              </div>
            ))}
            <button onClick={() => setCurrentStep(Step.Photos)} className="aspect-square border-4 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-300 active:bg-gray-50 active:scale-95 transition-all"><Edit2 /></button>
          </div>

          <footer className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t-4 border-gray-100 flex flex-col gap-3 z-50 shadow-2xl">
            <button onClick={generatePDF} disabled={isGenerating} className="w-full py-6 bg-black text-white rounded-[2rem] font-black text-2xl flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50 shadow-xl transition-all">
              {isGenerating ? <Loader2 className="animate-spin" size={32} /> : <FileText size={32} />} ΕΚΔΟΣΗ PDF
            </button>
            <button onClick={() => confirm('ΔΙΑΓΡΑΦΗ ΚΑΙ ΝΕΑ ΑΝΑΦΟΡΑ;') && window.location.reload()} className="text-gray-400 font-black text-[10px] uppercase text-center py-2 flex items-center justify-center gap-2 tracking-[0.2em] active:text-black transition-colors"><RefreshCcw size={14} /> ΝΕΑ ΑΝΑΦΟΡΑ</button>
          </footer>
        </div>
      ) : (
        <StepLayout 
          title={["ΠΡΟΜΗΘΕΥΤΗΣ","ΟΔΗΓΟΣ","ΠΡΟΪΟΝ","ΣΥΝΟΛΟ BINS","ΣΠΑΣΜΕΝΑ BINS","ΦΩΤΟΓΡΑΦΙΕΣ","ΣΧΟΛΙΑ"][currentStep]}
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
            <div className="space-y-2 animate-in fade-in duration-300">
              {(currentStep === 0 ? suppliers : currentStep === 1 ? drivers : products).map((item, i) => (
                <button key={i} onClick={() => setFormData(p => ({ ...p, [currentStep === 0 ? 'supplierName' : currentStep === 1 ? 'driverName' : 'product']: item }))} className={`w-full p-6 rounded-[1.5rem] text-left font-black uppercase text-lg border-4 transition-all ${ (currentStep === 0 ? formData.supplierName : currentStep === 1 ? formData.driverName : formData.product) === item ? 'bg-black text-white border-black shadow-lg scale-[1.02]' : 'bg-gray-50 border-gray-100 text-black active:bg-gray-100' }`}>
                  {item}
                </button>
              ))}
            </div>
          ) : currentStep === 3 || currentStep === 4 ? (
            <input type="number" inputMode="numeric" autoFocus className={`w-full text-8xl p-10 border-4 border-gray-200 rounded-[3rem] text-center font-black outline-none transition-all ${currentStep === 4 ? 'bg-white text-red-600 border-red-200 focus:border-red-600' : 'bg-white focus:border-black'}`} value={currentStep === 3 ? formData.totalBins : formData.brokenBins} onChange={e => setFormData(p => ({ ...p, [currentStep === 3 ? 'totalBins' : 'brokenBins']: e.target.value }))} />
          ) : currentStep === 5 ? (
            <div className="grid grid-cols-3 gap-3 animate-in fade-in duration-300">
              {formData.photos.map((p, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-100">
                  <img src={p} className="w-full h-full object-cover" alt="Captured" />
                  <button onClick={() => setFormData(prev => ({ ...prev, photos: prev.photos.filter((_, idx) => idx !== i) }))} className="absolute top-1 right-1 bg-red-600 text-white p-2 rounded-xl active:scale-95 transition-transform"><Trash2 size={16} /></button>
                </div>
              ))}
              {formData.photos.length < 9 && (
                <label className="aspect-square border-4 border-dashed border-black rounded-2xl flex flex-col items-center justify-center bg-gray-50 active:bg-gray-200 cursor-pointer transition-colors">
                  {isUploading ? <Loader2 className="animate-spin text-black" size={40} /> : <Camera size={40} />}
                  <input type="file" className="hidden" accept="image/*" capture="environment" multiple onChange={async e => {
                    const files = Array.from(e.target.files || []).slice(0, 9 - formData.photos.length) as File[];
                    if (files.length === 0) return;
                    setIsUploading(true);
                    try {
                      const compressed = await Promise.all(files.map(f => compressImage(f)));
                      setFormData(p => ({ ...p, photos: [...p.photos, ...compressed] }));
                    } catch(err) { console.error(err); alert("Πρόβλημα στην επεξεργασία εικόνας"); } finally { setIsUploading(false); }
                  }} />
                </label>
              )}
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-300">
              <textarea rows={3} className="w-full p-6 border-4 border-gray-100 rounded-[2rem] outline-none font-black text-xl uppercase bg-white focus:border-black transition-all" placeholder="ΠΡΟΣΘΕΣΤΕ ΣΧΟΛΙΑ..." value={formData.comments} onChange={e => setFormData(p => ({ ...p, comments: e.target.value.toUpperCase() }))} />
              <div className="grid grid-cols-1 gap-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2 mb-1">ΠΡΟΤΕΙΝΟΜΕΝΑ:</p>
                {predefinedComments.map((c, i) => (
                  <button key={i} onClick={() => setFormData(p => ({ ...p, comments: p.comments ? `${p.comments}, ${c}` : c }))} className="p-4 bg-white border-2 border-gray-100 rounded-xl text-left font-black uppercase text-sm active:border-black active:bg-gray-50 flex items-center justify-between transition-all">
                    <span>{c}</span>
                    <Plus size={16} className="text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </StepLayout>
      )}
      <PDFTemplate data={formData} page1Ref={page1Ref} page2Ref={page2Ref} />
    </div>
  );
};

export default App;