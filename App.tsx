
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Trash2, FileText, CheckCircle2, Loader2, RefreshCcw, Settings, Plus, ArrowLeft, Edit2, Check, X, Download, Upload, MessageSquare, Globe, WifiOff } from 'lucide-react';
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
  photos: [],
  comments: ''
};

const DEFAULT_LISTS = {
  suppliers: ['ΣΥΝΕΤΑΙΡΙΣΜΟΣ Α', 'ΣΥΝΕΤΑΙΡΙΣΜΟΣ Β', 'ΙΔΙΩΤΗΣ'],
  drivers: ['ΓΙΑΝΝΗΣ ΠΑΠΑΔΟΠΟΥΛΟΣ', 'ΚΩΣΤΑΣ ΝΙΚΟΛΑΟΥ'],
  products: ['ΣΥΜΠΥΡΗΝΑ', 'ΡΟΔΑΚΙΝΑ', 'ΝΕΚΤΑΡΙΝΙΑ'],
  predefinedComments: ['ΣΠΑΣΜΕΝΟ ΠΑΤΟ', 'ΣΠΑΣΜΕΝΟ ΠΛΑΪΝΟ', 'ΚΑΜΕΝΟ BINS', 'ΦΘΟΡΑ ΑΠΟ ΧΡΗΣΗ']
};

const OnlineStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-50 border border-gray-100 shadow-sm transition-all">
      <div className={`w-2 h-2 rounded-full animate-pulse ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className={`text-[8px] font-black uppercase tracking-tighter ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
        {isOnline ? 'Online' : 'Offline'}
      </span>
    </div>
  );
};

interface ManagementViewProps {
  onBack: () => void;
  suppliers: string[];
  drivers: string[];
  products: string[];
  predefinedComments: string[];
  activeMgmtTab: 'suppliers' | 'drivers' | 'products' | 'comments';
  setActiveMgmtTab: (tab: 'suppliers' | 'drivers' | 'products' | 'comments') => void;
  newItemText: string;
  setNewItemText: (text: string) => void;
  handleAddItem: (type: 'suppliers' | 'drivers' | 'products' | 'comments') => void;
  handleDeleteItem: (type: 'suppliers' | 'drivers' | 'products' | 'comments', index: number) => void;
  editingIndex: number | null;
  editingText: string;
  setEditingText: (text: string) => void;
  startEditing: (index: number, text: string) => void;
  cancelEditing: () => void;
  handleUpdateItem: (type: 'suppliers' | 'drivers' | 'products' | 'comments', index: number) => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

const ManagementView: React.FC<ManagementViewProps> = ({
  onBack, suppliers, drivers, products, predefinedComments, activeMgmtTab, setActiveMgmtTab,
  newItemText, setNewItemText, handleAddItem, handleDeleteItem,
  editingIndex, editingText, setEditingText, startEditing, cancelEditing, handleUpdateItem,
  onExport, onImport
}) => {
  const currentItems = 
    activeMgmtTab === 'suppliers' ? suppliers : 
    activeMgmtTab === 'drivers' ? drivers : 
    activeMgmtTab === 'products' ? products : 
    predefinedComments;

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50 overflow-hidden">
      <header className="px-5 py-4 bg-white border-b flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 text-[#003d71] active:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-base font-black text-[#003d71] uppercase tracking-tight">Διαχείριση Λιστών</h1>
          </div>
        </div>
        <OnlineStatus />
      </header>
      
      <main className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden">
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 shrink-0 overflow-x-auto no-scrollbar">
          {(['suppliers', 'drivers', 'products', 'comments'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveMgmtTab(tab); setNewItemText(''); cancelEditing(); }}
              className={`flex-1 py-3 px-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeMgmtTab === tab ? 'bg-[#003d71] text-white shadow-md' : 'text-gray-400'
              }`}
            >
              {tab === 'suppliers' ? 'Προμηθευτες' : tab === 'drivers' ? 'Οδηγοι' : tab === 'products' ? 'Προϊοντα' : 'Σχολια'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100 flex flex-col overflow-hidden h-full">
          <div className="flex gap-2 mb-4 shrink-0">
            <input 
              type="text" 
              className="flex-1 p-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-[#003d71] uppercase text-sm font-bold"
              placeholder="Προσθήκη νέου..."
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

          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-1.5 touch-pan-y pb-4">
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

      {/* Backup/Restore Footer Section */}
      <footer className="bg-white border-t border-gray-100 p-4 pb-8 space-y-3 z-30 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={onExport}
            className="flex flex-col items-center justify-center gap-1.5 py-4 bg-gray-50 text-[#003d71] rounded-2xl border-2 border-gray-100 active:bg-gray-100 active:scale-95 transition-all shadow-sm"
          >
            <Download size={22} />
            <span className="text-[10px] font-black uppercase tracking-widest">Εξαγωγη Backup</span>
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-1.5 py-4 bg-gray-50 text-[#003d71] rounded-2xl border-2 border-gray-100 active:bg-gray-100 active:scale-95 transition-all shadow-sm"
          >
            <Upload size={22} />
            <span className="text-[10px] font-black uppercase tracking-widest">Επαναφορα Backup</span>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".json" 
              onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])} 
            />
          </button>
        </div>
      </footer>
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
  
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    const savedSuppliers = localStorage.getItem('aspis_suppliers');
    const savedDrivers = localStorage.getItem('aspis_drivers');
    const savedProducts = localStorage.getItem('aspis_products');
    const savedComments = localStorage.getItem('aspis_comments');
    setSuppliers(savedSuppliers ? JSON.parse(savedSuppliers) : DEFAULT_LISTS.suppliers);
    setDrivers(savedDrivers ? JSON.parse(savedDrivers) : DEFAULT_LISTS.drivers);
    setProducts(savedProducts ? JSON.parse(savedProducts) : DEFAULT_LISTS.products);
    setPredefinedComments(savedComments ? JSON.parse(savedComments) : DEFAULT_LISTS.predefinedComments);

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

  const saveLists = (type: 'suppliers' | 'drivers' | 'products' | 'comments', newList: string[]) => {
    const key = type === 'comments' ? 'aspis_comments' : `aspis_${type}`;
    localStorage.setItem(key, JSON.stringify(newList));
  };

  const handleAddItem = (type: 'suppliers' | 'drivers' | 'products' | 'comments') => {
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
    } else if (type === 'products') {
      if (products.includes(cleanItem)) return;
      updated = [...products, cleanItem];
      setProducts(updated);
    } else {
      if (predefinedComments.includes(cleanItem)) return;
      updated = [...predefinedComments, cleanItem];
      setPredefinedComments(updated);
    }
    saveLists(type, updated);
    setNewItemText('');
  };

  const handleDeleteItem = (type: 'suppliers' | 'drivers' | 'products' | 'comments', index: number) => {
    let updated: string[] = [];
    if (type === 'suppliers') {
      updated = suppliers.filter((_, i) => i !== index);
      setSuppliers(updated);
    } else if (type === 'drivers') {
      updated = drivers.filter((_, i) => i !== index);
      setDrivers(updated);
    } else if (type === 'products') {
      updated = products.filter((_, i) => i !== index);
      setProducts(updated);
    } else {
      updated = predefinedComments.filter((_, i) => i !== index);
      setPredefinedComments(updated);
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

  const handleUpdateItem = (type: 'suppliers' | 'drivers' | 'products' | 'comments', index: number) => {
    if (!editingText.trim()) return;
    const cleanItem = editingText.trim().toUpperCase();
    let updated: string[] = [];
    if (type === 'suppliers') {
      updated = [...suppliers]; updated[index] = cleanItem; setSuppliers(updated);
    } else if (type === 'drivers') {
      updated = [...drivers]; updated[index] = cleanItem; setDrivers(updated);
    } else if (type === 'products') {
      updated = [...products]; updated[index] = cleanItem; setProducts(updated);
    } else {
      updated = [...predefinedComments]; updated[index] = cleanItem; setPredefinedComments(updated);
    }
    saveLists(type, updated);
    setEditingIndex(null);
    setEditingText('');
  };

  const handleExport = () => {
    const data = {
      suppliers,
      drivers,
      products,
      predefinedComments,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aspis_lists_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.suppliers && json.drivers && json.products) {
          if (confirm('ΠΡΟΣΟΧΗ: Θέλετε να αντικαταστήσετε τις τρέχουσες λίστες με τις λίστες του αρχείου;')) {
            setSuppliers(json.suppliers);
            setDrivers(json.drivers);
            setProducts(json.products);
            setPredefinedComments(json.predefinedComments || DEFAULT_LISTS.predefinedComments);
            saveLists('suppliers', json.suppliers);
            saveLists('drivers', json.drivers);
            saveLists('products', json.products);
            saveLists('comments', json.predefinedComments || DEFAULT_LISTS.predefinedComments);
            alert('Επιτυχής εισαγωγή και επαναφορά των λιστών!');
          }
        } else {
          alert('Μη έγκυρο αρχείο αντιγράφου.');
        }
      } catch (err) {
        alert('Σφάλμα κατά την ανάγνωση του αρχείου.');
      }
    };
    reader.readAsText(file);
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
      alert("Οι βιβλιοθήκες PDF δεν είναι έτοιμες. Παρακαλώ περιμένετε.");
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
      
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      
      const imgWidth = 210; // A4 mm width
      const pageHeight = 297; // A4 mm height
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgData = canvas.toDataURL('image/jpeg', 0.85);
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      const dateStr = new Date().toLocaleDateString('el-GR').replace(/\//g, '-');
      const cleanSupplier = (formData.supplierName || 'REPORT').replace(/[^a-z0-9α-ω]/gi, '_').substring(0,10);
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
        <div className="flex flex-col items-center">
          <Logo className="scale-125 mb-4" />
          <Loader2 className="animate-spin text-[#003d71] mb-12" size={24} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-black py-3 px-4 text-center">
          <p className="text-[6px] font-black text-white uppercase tracking-widest leading-tight">
            © 2025 Michalis Paraforos - ΑΝΑΦΟΡΑ ΣΠΑΣΜΕΝΩΝ BINS
          </p>
        </div>
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
        predefinedComments={predefinedComments}
        activeMgmtTab={activeMgmtTab}
        setActiveMgmtTab={setActiveMgmtTab}
        newItemText={newItemText}
        setNewItemText={setNewItemText}
        handleAddItem={handleAddItem}
        handleDeleteItem={handleDeleteItem}
        editingIndex={editingIndex}
        editingText={editingText}
        setEditingText={setEditingText}
        startEditing={(index, currentText) => startEditing(index, currentText)}
        cancelEditing={cancelEditing}
        handleUpdateItem={handleUpdateItem}
        onExport={handleExport}
        onImport={handleImport}
      />
    );
  }

  const MainHeader = () => (
    <header className="px-5 py-3 bg-white border-b flex items-center justify-between sticky top-0 z-40 shadow-sm">
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-[#003d71] uppercase tracking-[0.2em] leading-none mb-1">ASPIS</span>
        <h1 className="text-xs font-black text-gray-900 uppercase tracking-tight">Bins Damage Reporter</h1>
      </div>
      <div className="flex items-center gap-3">
        <OnlineStatus />
        <button 
          onClick={() => setView(AppView.Management)}
          className="p-2 text-[#003d71] active:bg-blue-50 rounded-full transition-colors"
          title="Διαχείριση Λιστών"
        >
          <Settings size={20} />
        </button>
      </div>
    </header>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case Step.Supplier:
        return (
          <>
            <MainHeader />
            <StepLayout title="ΟΝΟΜΑ ΠΡΟΜΗΘΕΥΤΗ" stepIndex={0} totalSteps={8} onNext={handleNext} isNextDisabled={!formData.supplierName}>
              <div className="grid grid-cols-1 gap-2 max-h-[50dvh] overflow-y-auto pr-2 custom-scrollbar">
                {suppliers.map((s, i) => (
                  <button key={i} onClick={() => updateField('supplierName', s)} className={`w-full p-4 rounded-xl text-left font-bold uppercase transition-all flex items-center justify-between border-2 ${formData.supplierName === s ? 'bg-[#003d71] text-white border-[#003d71]' : 'bg-gray-50 text-gray-700 border-transparent active:border-gray-200'}`}>
                    <span className="truncate text-sm">{s}</span>
                    {formData.supplierName === s && <CheckCircle2 size={18} />}
                  </button>
                ))}
              </div>
            </StepLayout>
          </>
        );
      case Step.Driver:
        return (
          <>
            <MainHeader />
            <StepLayout title="ΟΔΗΓΟΣ" stepIndex={1} totalSteps={8} onNext={handleNext} onBack={handleBack} isNextDisabled={!formData.driverName}>
              <div className="grid grid-cols-1 gap-2 max-h-[50dvh] overflow-y-auto pr-2 custom-scrollbar">
                {drivers.map((d, i) => (
                  <button key={i} onClick={() => updateField('driverName', d)} className={`w-full p-4 rounded-xl text-left font-bold uppercase transition-all flex items-center justify-between border-2 ${formData.driverName === d ? 'bg-[#003d71] text-white border-[#003d71]' : 'bg-gray-50 text-gray-700 border-transparent active:border-gray-200'}`}>
                    <span className="truncate text-sm">{d}</span>
                    {formData.driverName === d && <CheckCircle2 size={18} />}
                  </button>
                ))}
              </div>
            </StepLayout>
          </>
        );
      case Step.Product:
        return (
          <>
            <MainHeader />
            <StepLayout title="ΠΡΟΪΟΝ" stepIndex={2} totalSteps={8} onNext={handleNext} onBack={handleBack} isNextDisabled={!formData.product}>
              <div className="grid grid-cols-1 gap-2 max-h-[50dvh] overflow-y-auto pr-2 custom-scrollbar">
                {products.map((p, i) => (
                  <button key={i} onClick={() => updateField('product', p)} className={`w-full p-4 rounded-xl text-left font-bold uppercase transition-all flex items-center justify-between border-2 ${formData.product === p ? 'bg-[#003d71] text-white border-[#003d71]' : 'bg-gray-50 text-gray-700 border-transparent active:border-gray-200'}`}>
                    <span className="truncate text-sm">{p}</span>
                    {formData.product === p && <CheckCircle2 size={18} />}
                  </button>
                ))}
              </div>
            </StepLayout>
          </>
        );
      case Step.TotalBins:
        return (
          <>
            <MainHeader />
            <StepLayout title="ΣΥΝΟΛΙΚΑ BINS ΠΑΡΤΙΔΑΣ" stepIndex={3} totalSteps={8} onNext={handleNext} onBack={handleBack} isNextDisabled={!formData.totalBins.trim()}>
              <input type="number" inputMode="numeric" autoFocus className="w-full text-5xl p-6 border-2 border-gray-100 rounded-2xl focus:border-[#003d71] focus:outline-none text-center font-black bg-gray-50/50" placeholder="0" value={formData.totalBins} onChange={(e) => updateField('totalBins', e.target.value)} />
            </StepLayout>
          </>
        );
      case Step.BrokenBins:
        return (
          <>
            <MainHeader />
            <StepLayout title="ΣΠΑΣΜΕΝΑ BINS" stepIndex={4} totalSteps={8} onNext={handleNext} onBack={handleBack} isNextDisabled={!formData.brokenBins.trim()}>
              <input type="number" inputMode="numeric" autoFocus className="w-full text-5xl p-6 border-2 border-gray-100 rounded-2xl focus:border-red-600 focus:outline-none text-center font-black text-red-600 bg-gray-50/50" placeholder="0" value={formData.brokenBins} onChange={(e) => updateField('brokenBins', e.target.value)} />
            </StepLayout>
          </>
        );
      case Step.Photos:
        return (
          <>
            <MainHeader />
            <StepLayout title="ΦΩΤΟΓΡΑΦΙΕΣ ΠΑΡΤΙΔΑΣ" description="Έως 9 λήψεις" stepIndex={5} totalSteps={8} onNext={handleNext} onBack={handleBack}>
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
          </>
        );
      case Step.Comments:
        return (
          <>
            <MainHeader />
            <StepLayout title="ΣΧΟΛΙΑ" description="Επιλέξτε ή πληκτρολογήστε ελεύθερα" stepIndex={6} totalSteps={8} onNext={handleNext} onBack={handleBack}>
              <div className="space-y-4">
                <div className="relative">
                  <textarea 
                    rows={3}
                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#003d71] focus:outline-none text-sm font-bold placeholder:opacity-30"
                    placeholder="ΠΛΗΚΤΡΟΛΟΓΗΣΤΕ ΣΧΟΛΙΑ ΕΔΩ..."
                    value={formData.comments}
                    onChange={(e) => updateField('comments', e.target.value.toUpperCase())}
                  />
                </div>
                
                <div className="flex items-center gap-2 px-1">
                  <div className="h-[1px] flex-1 bg-gray-100" />
                  <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Επιλογες</span>
                  <div className="h-[1px] flex-1 bg-gray-100" />
                </div>

                <div className="grid grid-cols-1 gap-2 max-h-[30dvh] overflow-y-auto pr-2 custom-scrollbar">
                  {predefinedComments.map((c, i) => (
                    <button 
                      key={i} 
                      onClick={() => {
                        const current = formData.comments.trim();
                        const next = current ? (current.includes(c) ? current : `${current}, ${c}`) : c;
                        updateField('comments', next);
                      }} 
                      className="w-full p-3.5 rounded-xl text-left font-bold uppercase transition-all bg-gray-50 text-gray-700 border-2 border-transparent active:border-[#003d71] flex items-center gap-3"
                    >
                      <Plus size={16} className="text-[#003d71]" />
                      <span className="text-xs">{c}</span>
                    </button>
                  ))}
                  {predefinedComments.length === 0 && (
                    <p className="text-center py-4 text-[10px] text-gray-300 font-bold uppercase italic">Δεν υπάρχουν έτοιμα σχόλια</p>
                  )}
                </div>
              </div>
            </StepLayout>
          </>
        );
      case Step.Summary:
        return (
          <div className="flex flex-col min-h-[100dvh] bg-white">
            <header className="px-5 py-4 border-b flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-30">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-[#003d71] uppercase tracking-[0.2em] leading-none mb-1">ASPIS</span>
                  <h1 className="text-[10px] font-black text-gray-900 uppercase">Summary Report</h1>
                </div>
                <div className="flex items-center gap-3">
                  <OnlineStatus />
                  <button onClick={handleBack} className="text-[11px] font-black text-[#003d71] border-2 border-[#003d71] px-5 py-2.5 rounded-full uppercase tracking-widest active:bg-gray-50 shadow-sm transition-all">Διόρθωση</button>
                </div>
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
                  {formData.comments && (
                    <div className="pt-4 border-t border-white/10">
                      <p className="text-[8px] font-bold opacity-40 uppercase mb-1">Σχόλια</p>
                      <p className="text-[11px] font-medium italic line-clamp-2">{formData.comments}</p>
                    </div>
                  )}
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
            <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 z-30">
              <div className="p-5 flex flex-col gap-2">
                <button onClick={generatePDF} disabled={isGenerating} className="w-full py-4 bg-[#003d71] text-white rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-50 transition-all">
                  {isGenerating ? <Loader2 className="animate-spin" /> : <FileText size={20} />} ΕΚΔΟΣΗ PDF
                </button>
                <button onClick={() => { if(confirm('Είστε σίγουροι ότι θέλετε να ξεκινήσετε νέα αναφορά; Τα τρέχοντα δεδομένα θα διαγραφούν.')){ localStorage.removeItem('aspis_draft_report'); window.location.reload(); } }} className="text-gray-400 font-black text-[9px] uppercase text-center tracking-widest py-1 flex items-center justify-center gap-1">
                  <RefreshCcw size={10} /> Νέα Αναφορά
                </button>
              </div>
              <div className="bg-black py-2 px-4 text-center">
                <p className="text-[6px] font-black text-white uppercase tracking-widest leading-none">
                  © 2025 Michalis Paraforos - ΑΝΑΦΟΡΑ ΣΠΑΣΜΕΝΩΝ BINS
                </p>
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
