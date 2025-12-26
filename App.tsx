
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Trash2, FileText, CheckCircle2, Loader2, RefreshCcw, Settings, Plus, ArrowLeft, Edit2, Check, X } from 'lucide-react';
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

interface ManagementViewProps {
  onBack: () => void;
  suppliers: string[];
  drivers: string[];
  products: string[];
  activeMgmtTab: 'suppliers' | 'drivers' | 'products';
  setActiveMgmtTab: (tab: 'suppliers' | 'drivers' | 'products') => void;
  newItemText: string;
  setNewItemText: (text: string) => void;
  handleAddItem: (type: 'suppliers' | 'drivers' | 'products') => void;
  handleDeleteItem: (type: 'suppliers' | 'drivers' | 'products', index: number) => void;
  editingIndex: number | null;
  editingText: string;
  setEditingText: (text: string) => void;
  startEditing: (index: number, text: string) => void;
  cancelEditing: () => void;
  handleUpdateItem: (type: 'suppliers' | 'drivers' | 'products', index: number) => void;
}

const ManagementView: React.FC<ManagementViewProps> = ({
  onBack, suppliers, drivers, products, activeMgmtTab, setActiveMgmtTab,
  newItemText, setNewItemText, handleAddItem, handleDeleteItem,
  editingIndex, editingText, setEditingText, startEditing, cancelEditing, handleUpdateItem
}) => {
  const currentItems = activeMgmtTab === 'suppliers' ? suppliers : activeMgmtTab === 'drivers' ? drivers : products;

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gray-50">
      <header className="px-5 py-4 bg-white border-b flex items-center gap-3 sticky top-0 z-30 shadow-sm">
        <button onClick={onBack} className="p-2 -ml-2 text-[#003d71] active:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-base font-black text-[#003d71] uppercase tracking-tight">Διαχείριση Λιστών</h1>
      </header>
      
      <main className="flex-1 p-4 space-y-4 pb-10">
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
          {(['suppliers', 'drivers', 'products'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveMgmtTab(tab); setNewItemText(''); cancelEditing(); }}
              className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                activeMgmtTab === tab ? 'bg-[#003d71] text-white shadow-md' : 'text-gray-400'
              }`}
            >
              {tab === 'suppliers' ? 'Προμηθευτες' : tab === 'drivers' ? 'Οδηγοι' : 'Προϊοντα'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100 space-y-4">
          <div className="flex gap-2">
            <input 
              type="text" 
              className="flex-1 p-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-[#003d71] uppercase text-sm font-bold"
              placeholder="Νέα εγγραφή..."
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem(activeMgmtTab)}
            />
            <button 
              onClick={() => handleAddItem(activeMgmtTab)}
              className="bg-[#003d71] text-white px-5 rounded-xl active:scale-95 transition-transform"
            >
              <Plus size={24} />
            </button>
          </div>

          <div className="space-y-1.5 max-h-[60dvh] overflow-y-auto pr-1 custom-scrollbar">
            {currentItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between bg-gray-50 p-3.5 rounded-xl border border-transparent">
                {editingIndex === idx ? (
                  <div className="flex-1 flex gap-2 items-center">
                    <input 
                      type="text" autoFocus
                      className="flex-1 p-2 bg-white border border-blue-200 rounded-lg focus:outline-none focus:border-[#003d71] uppercase text-xs font-bold"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdateItem(activeMgmtTab, idx)}
                    />
                    <button onClick={() => handleUpdateItem(activeMgmtTab, idx)} className="text-green-600 p-1.5"><Check size={18} /></button>
                    <button onClick={cancelEditing} className="text-gray-400 p-1.5"><X size={18} /></button>
                  </div>
                ) : (
                  <>
                    <span className="text-xs font-bold uppercase truncate pr-2">{item}</span>
                    <div className="flex gap-0.5">
                      <button onClick={() => startEditing(idx, item)} className="text-blue-500 p-2 active:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                      <button onClick={() => handleDeleteItem(activeMgmtTab, idx)} className="text-red-400 p-2 active:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
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
  const [newItemText, setNewItemText] = useState('');
  const [activeMgmtTab, setActiveMgmtTab] = useState<'suppliers' | 'drivers' | 'products'>('suppliers');
  
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  // Persistence logic
  useEffect(() => {
    const savedSuppliers = localStorage.getItem('aspis_suppliers');
    const savedDrivers = localStorage.getItem('aspis_drivers');
    const savedProducts = localStorage.getItem('aspis_products');
    setSuppliers(savedSuppliers ? JSON.parse(savedSuppliers) : DEFAULT_LISTS.suppliers);
    setDrivers(savedDrivers ? JSON.parse(savedDrivers) : DEFAULT_LISTS.drivers);
    setProducts(savedProducts ? JSON.parse(savedProducts) : DEFAULT_LISTS.products);

    const draft = localStorage.getItem('aspis_draft_report');
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        if (parsedDraft.supplierName || (parsedDraft.photos && parsedDraft.photos.length > 0)) {
          setFormData(parsedDraft);
        }
      } catch(e) {}
    }

    const timer = setTimeout(() => setShowSplash(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (formData !== INITIAL_DATA) {
      localStorage.setItem('aspis_draft_report', JSON.stringify(formData));
    }
  }, [formData]);

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
      updated = [...suppliers]; updated[index] = cleanItem; setSuppliers(updated);
    } else if (type === 'drivers') {
      updated = [...drivers]; updated[index] = cleanItem; setDrivers(updated);
    } else {
      updated = [...products]; updated[index] = cleanItem; setProducts(updated);
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
    if (!pdfRef.current || !window.html2canvas || !window.jspdf) {
      alert("Οι βιβλιοθήκες PDF δεν είναι έτοιμες. Παρακαλώ περιμένετε ή ελέγξτε τη σύνδεση.");
      return;
    }
    setIsGenerating(true);
    try {
      const canvas = await window.html2canvas(pdfRef.current, { 
        scale: 2, 
        useCORS: true, 
        logging: false, 
        backgroundColor: '#ffffff' 
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.85);
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', compress: true });
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      const dateStr = new Date().toLocaleDateString('el-GR').replace(/\//g, '-');
      const cleanSupplier = formData.supplierName.replace(/[^a-z0-9α-ω]/gi, '_').substring(0,10);
      pdf.save(`ASPIS_${cleanSupplier}_${dateStr}.pdf`);
      localStorage.removeItem('aspis_draft_report');
    } catch (err) {
      console.error("PDF Error:", err);
      alert("Αποτυχία έκδοσης PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center">
        <Logo className="scale-125 mb-4" />
        <Loader2 className="animate-spin text-[#003d71]" size={24} />
      </div>
    );
  }

  if (view === AppView.Management) {
    return (
      <ManagementView 
        onBack={() => setView(AppView.Reporter)}
        suppliers={suppliers}
        drivers={drivers}
        products={products}
        activeMgmtTab={activeMgmtTab}
        setActiveMgmtTab={setActiveMgmtTab}
        newItemText={newItemText}
        setNewItemText={setNewItemText}
        handleAddItem={handleAddItem}
        handleDeleteItem={handleDeleteItem}
        editingIndex={editingIndex}
        editingText={editingText}
        setEditingText={setEditingText}
        startEditing={startEditing}
        cancelEditing={cancelEditing}
        handleUpdateItem={handleUpdateItem}
      />
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case Step.Supplier:
        return (
          <StepLayout title="ΟΝΟΜΑ ΠΡΟΜΗΘΕΥΤΗ" stepIndex={0} totalSteps={7} onNext={handleNext} isNextDisabled={!formData.supplierName}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Λίστα Προμηθευτών</span>
              <button onClick={() => setView(AppView.Management)} className="flex items-center gap-1 text-[9px] font-black text-[#003d71] bg-blue-50 px-3 py-1.5 rounded-full uppercase tracking-widest active:bg-blue-100">
                <Settings size={10} /> Διαχειριση
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-[45dvh] overflow-y-auto pr-1 custom-scrollbar">
              {suppliers.map((s, i) => (
                <button key={i} onClick={() => updateField('supplierName', s)} className={`w-full p-4 rounded-xl text-left font-bold uppercase transition-all flex items-center justify-between border-2 ${formData.supplierName === s ? 'bg-[#003d71] text-white border-[#003d71]' : 'bg-gray-50 text-gray-700 border-transparent hover:border-gray-200'}`}>
                  <span className="truncate text-sm">{s}</span>
                  {formData.supplierName === s && <CheckCircle2 size={18} />}
                </button>
              ))}
            </div>
          </StepLayout>
        );
      case Step.Driver:
        return (
          <StepLayout title="ΟΔΗΓΟΣ" stepIndex={1} totalSteps={7} onNext={handleNext} onBack={handleBack} isNextDisabled={!formData.driverName}>
            <div className="grid grid-cols-1 gap-2 max-h-[45dvh] overflow-y-auto pr-1 custom-scrollbar">
              {drivers.map((d, i) => (
                <button key={i} onClick={() => updateField('driverName', d)} className={`w-full p-4 rounded-xl text-left font-bold uppercase transition-all flex items-center justify-between border-2 ${formData.driverName === d ? 'bg-[#003d71] text-white border-[#003d71]' : 'bg-gray-50 text-gray-700 border-transparent hover:border-gray-200'}`}>
                  <span className="truncate text-sm">{d}</span>
                  {formData.driverName === d && <CheckCircle2 size={18} />}
                </button>
              ))}
            </div>
          </StepLayout>
        );
      case Step.Product:
        return (
          <StepLayout title="ΠΡΟΪΟΝ" stepIndex={2} totalSteps={7} onNext={handleNext} onBack={handleBack} isNextDisabled={!formData.product}>
            <div className="grid grid-cols-1 gap-2 max-h-[45dvh] overflow-y-auto pr-1 custom-scrollbar">
              {products.map((p, i) => (
                <button key={i} onClick={() => updateField('product', p)} className={`w-full p-4 rounded-xl text-left font-bold uppercase transition-all flex items-center justify-between border-2 ${formData.product === p ? 'bg-[#003d71] text-white border-[#003d71]' : 'bg-gray-50 text-gray-700 border-transparent hover:border-gray-200'}`}>
                  <span className="truncate text-sm">{p}</span>
                  {formData.product === p && <CheckCircle2 size={18} />}
                </button>
              ))}
            </div>
          </StepLayout>
        );
      case Step.TotalBins:
        return (
          <StepLayout title="ΣΥΝΟΛΙΚΑ BINS ΠΑΡΤΙΔΑΣ" stepIndex={3} totalSteps={7} onNext={handleNext} onBack={handleBack} isNextDisabled={!formData.totalBins.trim()}>
            <input type="number" inputMode="numeric" autoFocus className="w-full text-5xl p-6 border-2 border-gray-100 rounded-2xl focus:border-[#003d71] focus:outline-none text-center font-black bg-gray-50/50" placeholder="0" value={formData.totalBins} onChange={(e) => updateField('totalBins', e.target.value)} />
          </StepLayout>
        );
      case Step.BrokenBins:
        return (
          <StepLayout title="ΣΠΑΣΜΕΝΑ BINS" stepIndex={4} totalSteps={7} onNext={handleNext} onBack={handleBack} isNextDisabled={!formData.brokenBins.trim()}>
            <input type="number" inputMode="numeric" autoFocus className="w-full text-5xl p-6 border-2 border-gray-100 rounded-2xl focus:border-red-600 focus:outline-none text-center font-black text-red-600 bg-gray-50/50" placeholder="0" value={formData.brokenBins} onChange={(e) => updateField('brokenBins', e.target.value)} />
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
                  <Camera size={26} />
                  <span className="text-[8px] font-black mt-1 uppercase tracking-tighter">ΚΑΜΕΡΑ</span>
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
          <div className="flex flex-col min-h-[100dvh] bg-white">
            <header className="px-5 py-4 border-b flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-30">
                <Logo />
                <button onClick={handleBack} className="text-[9px] font-black text-[#003d71] border-2 border-[#003d71] px-4 py-2 rounded-full uppercase tracking-widest active:bg-gray-50">Διόρθωση</button>
            </header>
            <main className="flex-1 px-5 pt-6 space-y-6 pb-48">
              <div className="bg-[#003d71] rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><CheckCircle2 size={100} /></div>
                <h2 className="text-[9px] font-black uppercase tracking-[0.3em] mb-6 text-blue-200/60">ΣΥΝΟΨΗ ΑΝΑΦΟΡΑΣ</h2>
                <div className="space-y-6 relative z-10">
                  <div>
                    <p className="text-[8px] font-bold opacity-40 uppercase mb-1 tracking-widest">Προμηθευτής</p>
                    <p className="text-xl font-black uppercase leading-tight">{formData.supplierName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div>
                      <p className="text-[8px] font-bold opacity-40 uppercase mb-1">Bins Παρτίδας</p>
                      <p className="text-3xl font-black">{formData.totalBins}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-red-300 uppercase mb-1">Σπασμένα</p>
                      <p className="text-3xl font-black text-red-400">{formData.brokenBins}</p>
                    </div>
                  </div>
                </div>
              </div>
              {formData.photos.length > 0 && (
                <div className="grid grid-cols-3 gap-1.5">
                  {formData.photos.map((p, i) => (
                    <img key={i} src={p} className="aspect-square w-full object-cover rounded-xl border border-gray-100" alt="Preview" />
                  ))}
                </div>
              )}
            </main>
            <footer className="fixed bottom-0 left-0 right-0 p-5 bg-white/95 backdrop-blur-md border-t border-gray-100 flex flex-col gap-2 z-30">
              <button onClick={generatePDF} disabled={isGenerating} className="w-full py-4 bg-[#003d71] text-white rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-50 transition-all">
                {isGenerating ? <Loader2 className="animate-spin" /> : <FileText size={20} />} ΕΚΔΟΣΗ PDF
              </button>
              <button onClick={() => { localStorage.removeItem('aspis_draft_report'); window.location.reload(); }} className="text-gray-400 font-black text-[9px] uppercase text-center tracking-widest py-1 flex items-center justify-center gap-1">
                <RefreshCcw size={10} /> Νέα Αναφορά
              </button>
              <div className="text-center leading-tight mt-2">
                <p className="text-[5px] font-black text-gray-300 uppercase tracking-tight">© 2025 Michalis Paraforos</p>
                <p className="text-[5px] font-black text-gray-300 uppercase tracking-tight">ΑΝΑΦΟΡΑ ΣΠΑΣΜΕΝΩΝ BINS</p>
              </div>
            </footer>
            <PDFTemplate data={formData} reportRef={pdfRef} />
          </div>
        );
      default: return null;
    }
  };

  return <div className="max-w-md mx-auto min-h-[100dvh] bg-white shadow-2xl relative">{renderStepContent()}</div>;
};

export default App;
