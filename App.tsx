
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Trash2, FileText, CheckCircle2, Loader2, RefreshCcw, Settings, Plus, ArrowLeft, Database, ChevronRight, Edit2, Check, X } from 'lucide-react';
import { BinReportData, Step, AppView } from './types';
import { compressImage } from './services/imageService';
import StepLayout from './components/StepLayout';
import PDFTemplate from './components/PDFTemplate';
import { Logo } from './components/Logo';

declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

const INITIAL_DATA: BinReportData = {
  supplierName: '',
  driverName: '',
  product: '',
  totalBins: '',
  brokenBins: '',
  photos: []
};

const DEFAULT_LISTS = {
  suppliers: ['ΣΥΝΕΤΑΙΡΙΣΜΟΣ Α', 'ΣΥΝΕΤΑΙΡΙΣΜΟΣ Β', 'ΙΔΙΩΤΗΣ'],
  drivers: ['ΓΙΑΝΝΗΣ ΠΑΠΑΔΟΠΟΥΛΟΣ', 'ΚΩΣΤΑΣ ΝΙΚΟΛΑΟΥ'],
  products: ['ΣΥΜΠΥΡΗΝΑ', 'ΡΟΔΑΚΙΝΑ', 'ΝΕΚΤΑΡΙΝΙΑ']
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
  const [newItemText, setNewItemText] = useState('');
  const [activeMgmtTab, setActiveMgmtTab] = useState<'suppliers' | 'drivers' | 'products'>('suppliers');
  
  // States for editing
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    const savedSuppliers = localStorage.getItem('aspis_suppliers');
    const savedDrivers = localStorage.getItem('aspis_drivers');
    const savedProducts = localStorage.getItem('aspis_products');

    setSuppliers(savedSuppliers ? JSON.parse(savedSuppliers) : DEFAULT_LISTS.suppliers);
    setDrivers(savedDrivers ? JSON.parse(savedDrivers) : DEFAULT_LISTS.drivers);
    setProducts(savedProducts ? JSON.parse(savedProducts) : DEFAULT_LISTS.products);

    const timer = setTimeout(() => setShowSplash(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const saveLists = (type: 'suppliers' | 'drivers' | 'products', newList: string[]) => {
    localStorage.setItem(`aspis_${type}`, JSON.stringify(newList));
  };

  const handleAddItem = (type: 'suppliers' | 'drivers' | 'products') => {
    if (!newItemText.trim()) return;
    const cleanItem = newItemText.trim().toUpperCase();
    let updated: string[] = [];
    if (type === 'suppliers') {
      if (suppliers.includes(cleanItem)) return;
      updated = [...suppliers, cleanItem];
      setSuppliers(updated);
    } else if (type === 'drivers') {
      if (drivers.includes(cleanItem)) return;
      updated = [...drivers, cleanItem];
      setDrivers(updated);
    } else {
      if (products.includes(cleanItem)) return;
      updated = [...products, cleanItem];
      setProducts(updated);
    }
    saveLists(type, updated);
    setNewItemText('');
  };

  const handleDeleteItem = (type: 'suppliers' | 'drivers' | 'products', index: number) => {
    let updated: string[] = [];
    if (type === 'suppliers') {
      updated = suppliers.filter((_, i) => i !== index);
      setSuppliers(updated);
    } else if (type === 'drivers') {
      updated = drivers.filter((_, i) => i !== index);
      setDrivers(updated);
    } else {
      updated = products.filter((_, i) => i !== index);
      setProducts(updated);
    }
    saveLists(type, updated);
  };

  const startEditing = (index: number, currentText: string) => {
    setEditingIndex(index);
    setEditingText(currentText);
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditingText('');
  };

  const handleUpdateItem = (type: 'suppliers' | 'drivers' | 'products', index: number) => {
    if (!editingText.trim()) return;
    const cleanItem = editingText.trim().toUpperCase();
    let updated: string[] = [];
    
    if (type === 'suppliers') {
      updated = [...suppliers];
      updated[index] = cleanItem;
      setSuppliers(updated);
    } else if (type === 'drivers') {
      updated = [...drivers];
      updated[index] = cleanItem;
      setDrivers(updated);
    } else {
      updated = [...products];
      updated[index] = cleanItem;
      setProducts(updated);
    }
    
    saveLists(type, updated);
    setEditingIndex(null);
    setEditingText('');
  };

  const handleNext = () => {
    if (currentStep < Step.Summary) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > Step.Supplier) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const updateField = (field: keyof BinReportData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remainingSlots = 9 - formData.photos.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots) as File[];
    setIsUploading(true);
    try {
      const compressedPhotos = await Promise.all(filesToProcess.map(file => compressImage(file)));
      setFormData(prev => ({ ...prev, photos: [...prev.photos, ...compressedPhotos] }));
    } catch (err) {
      console.error("Compression error:", err);
      alert("Σφάλμα στην επεξεργασία εικόνων.");
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const generatePDF = async () => {
    if (!pdfRef.current || !window.html2canvas || !window.jspdf) return;
    setIsGenerating(true);
    try {
      const canvas = await window.html2canvas(pdfRef.current, { scale: 2, useCORS: false, logging: false, allowTaint: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', compress: true });
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      const dateStr = new Date().toLocaleDateString('el-GR').replace(/\//g, '-');
      const cleanSupplier = formData.supplierName.replace(/[^a-z0-9α-ω]/gi, '_').substring(0,10);
      pdf.save(`ASPIS_${cleanSupplier}_${dateStr}.pdf`);
    } catch (err) {
      console.error("PDF Error:", err);
      alert("Αποτυχία έκδοσης PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  const ManagementView = () => (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="px-6 py-6 bg-white border-b flex items-center gap-4 sticky top-0 z-30">
        <button onClick={() => { setView(AppView.Reporter); cancelEditing(); }} className="p-2 -ml-2 text-[#003d71] active:scale-90 transition-transform">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-black text-[#003d71] uppercase tracking-tight">Διαχείριση Λιστών</h1>
      </header>
      
      <main className="flex-1 p-6 space-y-6 pb-12">
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
          {(['suppliers', 'drivers', 'products'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveMgmtTab(tab); setNewItemText(''); cancelEditing(); }}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeMgmtTab === tab ? 'bg-[#003d71] text-white shadow-lg' : 'text-gray-400'
              }`}
            >
              {tab === 'suppliers' ? 'Προμηθευτες' : tab === 'drivers' ? 'Οδηγοι' : 'Προϊοντα'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
          <div className="flex gap-2">
            <input 
              type="text" 
              className="flex-1 p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#003d71] uppercase text-sm font-bold"
              placeholder={`Νέος ${activeMgmtTab === 'suppliers' ? 'Προμηθευτής' : activeMgmtTab === 'drivers' ? 'Οδηγός' : 'Προϊόν'}...`}
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem(activeMgmtTab)}
            />
            <button 
              onClick={() => handleAddItem(activeMgmtTab)}
              className="bg-[#003d71] text-white p-4 rounded-2xl active:scale-95 transition-transform shadow-lg shadow-[#003d71]/20"
            >
              <Plus size={24} />
            </button>
          </div>

          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
            {(activeMgmtTab === 'suppliers' ? suppliers : activeMgmtTab === 'drivers' ? drivers : products).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl group border border-transparent hover:border-gray-200 transition-colors">
                {editingIndex === idx ? (
                  <div className="flex-1 flex gap-2 items-center">
                    <input 
                      type="text"
                      autoFocus
                      className="flex-1 p-2 bg-white border border-blue-200 rounded-xl focus:outline-none focus:border-[#003d71] uppercase text-xs font-bold"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdateItem(activeMgmtTab, idx)}
                    />
                    <button onClick={() => handleUpdateItem(activeMgmtTab, idx)} className="text-green-600 p-2 hover:bg-green-50 rounded-lg">
                      <Check size={18} />
                    </button>
                    <button onClick={cancelEditing} className="text-gray-400 p-2 hover:bg-gray-100 rounded-lg">
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-xs font-bold uppercase truncate pr-4">{item}</span>
                    <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => startEditing(idx, item)}
                        className="text-blue-500 p-2 hover:bg-blue-50 rounded-xl transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(activeMgmtTab, idx)}
                        className="text-red-400 p-2 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {(activeMgmtTab === 'suppliers' ? suppliers : activeMgmtTab === 'drivers' ? drivers : products).length === 0 && (
              <div className="py-12 text-center text-gray-400 uppercase text-[10px] font-black tracking-widest">
                Η λίστα είναι κενή
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center">
        <Logo className="scale-150 mb-4" />
        <Loader2 className="animate-spin text-[#003d71]" size={24} />
      </div>
    );
  }

  if (view === AppView.Management) return <ManagementView />;

  const renderStepContent = () => {
    switch (currentStep) {
      case Step.Supplier:
        return (
          <StepLayout title="ΟΝΟΜΑ ΠΡΟΜΗΘΕΥΤΗ" stepIndex={0} totalSteps={7} onNext={handleNext} isNextDisabled={!formData.supplierName}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Επιλέξτε από τη λίστα</span>
              <button onClick={() => setView(AppView.Management)} className="flex items-center gap-1.5 text-[10px] font-black text-[#003d71] bg-blue-50 px-3 py-1.5 rounded-full uppercase tracking-widest active:scale-95 transition-all">
                <Settings size={12} /> Διαχειριση
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
              {suppliers.map((s, i) => (
                <button key={i} onClick={() => updateField('supplierName', s)} className={`w-full p-5 rounded-2xl text-left font-bold uppercase transition-all flex items-center justify-between ${formData.supplierName === s ? 'bg-[#003d71] text-white shadow-lg shadow-[#003d71]/20' : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:border-gray-200'}`}>
                  <span className="truncate">{s}</span>
                  {formData.supplierName === s && <CheckCircle2 size={20} />}
                </button>
              ))}
            </div>
          </StepLayout>
        );
      case Step.Driver:
        return (
          <StepLayout title="ΟΔΗΓΟΣ" stepIndex={1} totalSteps={7} onNext={handleNext} onBack={handleBack} isNextDisabled={!formData.driverName}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Λίστα Οδηγών</span>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
              {drivers.map((d, i) => (
                <button key={i} onClick={() => updateField('driverName', d)} className={`w-full p-5 rounded-2xl text-left font-bold uppercase transition-all flex items-center justify-between ${formData.driverName === d ? 'bg-[#003d71] text-white shadow-lg shadow-[#003d71]/20' : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:border-gray-200'}`}>
                  <span className="truncate">{d}</span>
                  {formData.driverName === d && <CheckCircle2 size={20} />}
                </button>
              ))}
            </div>
          </StepLayout>
        );
      case Step.Product:
        return (
          <StepLayout title="ΠΡΟΪΟΝ" stepIndex={2} totalSteps={7} onNext={handleNext} onBack={handleBack} isNextDisabled={!formData.product}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Λίστα Προϊόντων</span>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
              {products.map((p, i) => (
                <button key={i} onClick={() => updateField('product', p)} className={`w-full p-5 rounded-2xl text-left font-bold uppercase transition-all flex items-center justify-between ${formData.product === p ? 'bg-[#003d71] text-white shadow-lg shadow-[#003d71]/20' : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:border-gray-200'}`}>
                  <span className="truncate">{p}</span>
                  {formData.product === p && <CheckCircle2 size={20} />}
                </button>
              ))}
            </div>
          </StepLayout>
        );
      case Step.TotalBins:
        return (
          <StepLayout title="ΣΥΝΟΛΙΚΑ BINS ΠΑΡΤΙΔΑΣ" stepIndex={3} totalSteps={7} onNext={handleNext} onBack={handleBack} isNextDisabled={!formData.totalBins.trim()}>
            <input type="number" inputMode="numeric" autoFocus className="w-full text-6xl p-6 border-2 border-gray-100 rounded-2xl focus:border-[#003d71] focus:outline-none text-center font-black bg-gray-50/50" placeholder="0" value={formData.totalBins} onChange={(e) => updateField('totalBins', e.target.value)} />
          </StepLayout>
        );
      case Step.BrokenBins:
        return (
          <StepLayout title="ΣΠΑΣΜΕΝΑ BINS" stepIndex={4} totalSteps={7} onNext={handleNext} onBack={handleBack} isNextDisabled={!formData.brokenBins.trim()}>
            <input type="number" inputMode="numeric" autoFocus className="w-full text-6xl p-6 border-2 border-gray-100 rounded-2xl focus:border-red-600 focus:outline-none text-center font-black text-red-600 bg-gray-50/50" placeholder="0" value={formData.brokenBins} onChange={(e) => updateField('brokenBins', e.target.value)} />
          </StepLayout>
        );
      case Step.Photos:
        return (
          <StepLayout title="ΦΩΤΟΓΡΑΦΙΕΣ ΠΑΡΤΙΔΑΣ" description="Έως 9 λήψεις" stepIndex={5} totalSteps={7} onNext={handleNext} onBack={handleBack}>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {formData.photos.map((photo, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden shadow-sm border border-gray-100">
                  <img src={photo} className="w-full h-full object-cover" alt="Evidence" />
                  <button onClick={() => updateField('photos', formData.photos.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-red-600 text-white p-1.5 rounded-full shadow-lg"><Trash2 size={12} /></button>
                </div>
              ))}
              {formData.photos.length < 9 && (
                <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-[#003d71] rounded-xl bg-blue-50/30 text-[#003d71] cursor-pointer active:scale-95 transition-transform">
                  <Camera size={28} />
                  <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">ΚΑΜΕΡΑ</span>
                  <input type="file" className="hidden" accept="image/*" multiple onChange={handlePhotoUpload} capture="environment" />
                </label>
              )}
            </div>
            {isUploading && <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase animate-pulse mb-2"><Loader2 size={12} className="animate-spin" /> Συμπίεση...</div>}
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">{formData.photos.length}/9 ΦΩΤΟΓΡΑΦΙΕΣ</div>
          </StepLayout>
        );
      case Step.Summary:
        return (
          <div className="flex flex-col min-h-screen bg-white">
            <header className="px-6 py-6 border-b flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-30">
                <Logo />
                <button onClick={handleBack} className="text-[10px] font-black text-[#003d71] border-2 border-[#003d71] px-4 py-2 rounded-full uppercase tracking-widest active:bg-gray-50">Διόρθωση</button>
            </header>
            <main className="flex-1 px-6 pt-8 space-y-8 pb-40">
              <div className="bg-[#003d71] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><CheckCircle2 size={120} /></div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 text-blue-200/60">ΑΝΑΦΟΡΑ ΣΠΑΣΜΕΝΩΝ BINS</h2>
                <div className="space-y-8 relative z-10">
                  <div>
                    <p className="text-[9px] font-bold opacity-40 uppercase mb-1 tracking-[0.2em]">Προμηθευτής</p>
                    <p className="text-2xl font-black uppercase tracking-tight leading-none">{formData.supplierName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
                    <div>
                      <p className="text-[9px] font-bold opacity-40 uppercase mb-1 tracking-[0.2em]">Bins Παρτίδας</p>
                      <p className="text-4xl font-black">{formData.totalBins}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-red-300 uppercase mb-1 tracking-[0.2em]">Σπασμένα</p>
                      <p className="text-4xl font-black text-red-400">{formData.brokenBins}</p>
                    </div>
                  </div>
                </div>
              </div>
              {formData.photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {formData.photos.map((p, i) => (
                    <img key={i} src={p} className="aspect-square w-full object-cover rounded-xl border border-gray-100 shadow-sm" alt="Preview" />
                  ))}
                </div>
              )}
            </main>
            <footer className="fixed bottom-0 left-0 right-0 p-6 bg-white/95 backdrop-blur-md border-t border-gray-100 flex flex-col gap-3 z-30">
              <button onClick={generatePDF} disabled={isGenerating} className="w-full py-5 bg-[#003d71] text-white rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-3 shadow-2xl shadow-[#003d71]/30 active:scale-95 transition-all disabled:opacity-50">
                {isGenerating ? <Loader2 className="animate-spin" /> : <FileText size={22} />} ΕΚΔΟΣΗ PDF
              </button>
              <button onClick={() => window.location.reload()} className="text-gray-400 font-black text-[10px] uppercase text-center tracking-[0.3em] py-3 flex items-center justify-center gap-2">
                <RefreshCcw size={12} /> Νέα Αναφορά
              </button>
            </footer>
            <PDFTemplate data={formData} reportRef={pdfRef} />
          </div>
        );
      default: return null;
    }
  };

  return <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl">{renderStepContent()}</div>;
};

export default App;
