
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
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all shadow-md ${isOnline ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
      <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-600 animate-pulse' : 'bg-red-600'}`} />
      <span className={`text-[10px] font-black uppercase tracking-tighter ${isOnline ? 'text-green-700' : 'text-red-700'}`}>
        {isOnline ? 'ONLINE' : 'OFFLINE'}
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
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      <header className="px-5 py-4 bg-white border-b-4 border-[#002d54] flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-3 -ml-2 text-[#002d54] active:bg-blue-50 rounded-full transition-colors border-2 border-transparent active:border-[#002d54]">
            <ArrowLeft size={28} strokeWidth={3} />
          </button>
          <h1 className="text-xl font-black text-[#002d54] uppercase tracking-tighter leading-none">ΡΥΘΜΙΣΕΙΣ</h1>
        </div>
        <OnlineStatus />
      </header>
      
      <main className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden">
        <div className="flex bg-gray-100 p-1.5 rounded-2xl shadow-inner shrink-0 overflow-x-auto no-scrollbar border-2 border-gray-200">
          {(['suppliers', 'drivers', 'products', 'comments'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveMgmtTab(tab); setNewItemText(''); cancelEditing(); }}
              className={`flex-1 py-4 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
                activeMgmtTab === tab ? 'bg-[#002d54] text-white border-[#002d54] shadow-lg' : 'text-gray-500 border-transparent'
              }`}
            >
              {tab === 'suppliers' ? 'ΠΡΟΜΗΘΕΥΤΕΣ' : tab === 'drivers' ? 'ΟΔΗΓΟΙ' : tab === 'products' ? 'ΠΡΟΪΟΝΤΑ' : 'ΣΧΟΛΙΑ'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-[2rem] p-5 shadow-xl border-4 border-gray-100 flex flex-col overflow-hidden h-full">
          <div className="flex gap-2 mb-6 shrink-0">
            <input 
              type="text" 
              className="flex-1 p-5 bg-gray-50 border-4 border-gray-200 rounded-2xl focus:outline-none focus:border-[#002d54] uppercase text-lg font-black placeholder:text-gray-300"
              placeholder="ΝΕΑ ΕΓΓΡΑΦΗ..."
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem(activeMgmtTab)}
            />
            <button 
              onClick={() => handleAddItem(activeMgmtTab)}
              className="bg-[#002d54] text-white px-6 rounded-2xl active:scale-95 transition-transform shadow-lg"
            >
              <Plus size={32} strokeWidth={3} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3 touch-pan-y pb-4">
            {currentItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white p-5 rounded-2xl border-4 border-gray-100 shadow-sm">
                {editingIndex === idx ? (
                  <div className="flex-1 flex gap-2 items-center">
                    <input 
                      type="text" autoFocus
                      className="flex-1 p-3 bg-white border-4 border-blue-400 rounded-xl focus:outline-none uppercase text-base font-black"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                    />
                    <button onClick={() => handleUpdateItem(activeMgmtTab, idx)} className="text-green-600 p-2"><Check size={28} strokeWidth={4} /></button>
                    <button onClick={cancelEditing} className="text-red-400 p-2"><X size={28} strokeWidth={4} /></button>
                  </div>
                ) : (
                  <>
                    <span className="text-base font-black uppercase truncate pr-4 text-black">{item}</span>
                    <div className="flex gap-2">
                      <button onClick={() => startEditing(idx, item)} className="text-blue-600 p-3 bg-blue-50 rounded-xl"><Edit2 size={20} /></button>
                      <button onClick={() => handleDeleteItem(activeMgmtTab, idx)} className="text-red-500 p-3 bg-red-50 rounded-xl"><Trash2 size={20} /></button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-gray-50 border-t-4 border-gray-200 p-5 pb-10 space-y-4 shadow-2xl">
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={onExport}
            className="flex flex-col items-center justify-center gap-2 py-5 bg-white text-[#002d54] rounded-3xl border-4 border-gray-200 active:bg-blue-50 active:scale-95 transition-all shadow-md"
          >
            <Download size={28} />
            <span className="text-[10px] font-black uppercase tracking-widest">ΕΞΑΓΩΓΗ BACKUP</span>
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 py-5 bg-white text-[#002d54] rounded-3xl border-4 border-gray-200 active:bg-blue-50 active:scale-95 transition-all shadow-md"
          >
            <Upload size={28} />
            <span className="text-[10px] font-black uppercase tracking-widest">ΕΙΣΑΓΩΓΗ BACKUP</span>
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

    const timer = setTimeout(() => setShowSplash(false), 1500);
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
    if (!confirm('ΔΙΑΓΡΑΦΗ ΕΓΓΡΑΦΗΣ;')) return;
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
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ASPIS_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (file: File) => {
    try {
      // Memory efficient reading
      const content = await file.text();
      const json = JSON.parse(content);

      if (json.suppliers && json.drivers && json.products) {
        if (confirm('ΠΡΟΣΟΧΗ: Οι λίστες θα αντικατασταθούν. Συνέχεια;')) {
          // Staggered to prevent RAM spikes on large lists
          setTimeout(() => {
            setSuppliers(json.suppliers);
            saveLists('suppliers', json.suppliers);
          }, 0);
          setTimeout(() => {
            setDrivers(json.drivers);
            saveLists('drivers', json.drivers);
          }, 100);
          setTimeout(() => {
            setProducts(json.products);
            saveLists('products', json.products);
          }, 200);
          setTimeout(() => {
            const comments = json.predefinedComments || DEFAULT_LISTS.predefinedComments;
            setPredefinedComments(comments);
            saveLists('comments', comments);
            alert('Η ΕΠΑΝΑΦΟΡΑ ΟΛΟΚΛΗΡΩΘΗΚΕ!');
          }, 300);
        }
      } else {
        alert('Μη έγκυρο αρχείο.');
      }
    } catch (err) {
      alert('Σφάλμα μνήμης ή μορφής αρχείου.');
    }
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
      const processedPhotos: string[] = [];
      for (const file of filesToProcess) {
        const compressed = await compressImage(file);
        processedPhotos.push(compressed);
      }
      setFormData(prev => ({ ...prev, photos: [...prev.photos, ...processedPhotos] }));
    } catch (err) {
      alert("Πρόβλημα μνήμης με τις φωτογραφίες.");
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const generatePDF = async () => {
    if (!pdfRef.current || !window.html2canvas || !window.jspdf) {
      alert("Οι βιβλιοθήκες PDF δεν είναι έτοιμες.");
      return;
    }
    setIsGenerating(true);
    try {
      const canvas = await window.html2canvas(pdfRef.current, { 
        scale: 1.2, // Lowered scale for stability on mobile
        useCORS: true, 
        logging: false, 
        backgroundColor: '#ffffff',
        removeContainer: true
      });
      
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgData = canvas.toDataURL('image/jpeg', 0.6); // Lower quality for memory
      
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
      pdf.save(`ASPIS_REPORT_${dateStr}.pdf`);
      
      canvas.width = 0; canvas.height = 0; // Immediate cleanup
      localStorage.removeItem('aspis_draft_report');
    } catch (err) {
      alert("Σφάλμα μνήμης κατά την έκδοση PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-[#002d54] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center animate-pulse">
          <Logo className="scale-[2.5] mb-8 text-white" />
          <div className="mt-12 text-white font-black text-xs uppercase tracking-[0.5em]">ΦΟΡΤΩΣΗ...</div>
        </div>
      </div>
    );
  }

  if (view === AppView.Management) {
    return (
      <ManagementView 
        onBack={() => setView(AppView.Reporter)}
        suppliers={suppliers} drivers={drivers} products={products} predefinedComments={predefinedComments}
        activeMgmtTab={activeMgmtTab} setActiveMgmtTab={setActiveMgmtTab}
        newItemText={newItemText} setNewItemText={setNewItemText}
        handleAddItem={handleAddItem} handleDeleteItem={handleDeleteItem}
        editingIndex={editingIndex} editingText={editingText} setEditingText={setEditingText}
        startEditing={startEditing} cancelEditing={cancelEditing} handleUpdateItem={handleUpdateItem}
        onExport={handleExport} onImport={handleImport}
      />
    );
  }

  const MainHeader = () => (
    <header className="px-5 py-4 bg-white border-b-4 border-[#002d54] flex items-center justify-between sticky top-0 z-40 shadow-lg">
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-[#002d54] uppercase tracking-[0.3em] leading-none mb-1">ASPIS</span>
        <h1 className="text-sm font-black text-black uppercase tracking-tight">DAMAGE REPORTER</h1>
      </div>
      <div className="flex items-center gap-3">
        <OnlineStatus />
        <button 
          onClick={() => setView(AppView.Management)}
          className="p-3 text-[#002d54] active:bg-blue-50 rounded-full transition-colors border-2 border-transparent active:border-[#002d54]"
        >
          <Settings size={28} strokeWidth={2.5} />
        </button>
      </div>
    </header>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case Step.Supplier:
        return (
          <StepLayout title="ΠΡΟΜΗΘΕΥΤΗΣ" stepIndex={0} totalSteps={8} onNext={handleNext} isNextDisabled={!formData.supplierName}>
            <div className="grid grid-cols-1 gap-3 max-h-[60dvh] overflow-y-auto pr-2 custom-scrollbar">
              {suppliers.map((s, i) => (
                <button key={i} onClick={() => updateField('supplierName', s)} className={`w-full p-6 rounded-3xl text-left font-black uppercase transition-all flex items-center justify-between border-4 ${formData.supplierName === s ? 'bg-[#ffdf00] text-black border-[#ffdf00] shadow-lg scale-[1.02]' : 'bg-gray-50 text-gray-900 border-gray-100 active:border-gray-300'}`}>
                  <span className="text-xl leading-none">{s}</span>
                  {formData.supplierName === s && <CheckCircle2 size={28} strokeWidth={3} />}
                </button>
              ))}
            </div>
          </StepLayout>
        );
      case Step.Driver:
        return (
          <StepLayout title="ΟΔΗΓΟΣ" stepIndex={1} totalSteps={8} onNext={handleNext} onBack={handleBack} isNextDisabled={!formData.driverName}>
            <div className="grid grid-cols-1 gap-3 max-h-[60dvh] overflow-y-auto pr-2 custom-scrollbar">
              {drivers.map((d, i) => (
                <button key={i} onClick={() => updateField('driverName', d)} className={`w-full p-6 rounded-3xl text-left font-black uppercase transition-all flex items-center justify-between border-4 ${formData.driverName === d ? 'bg-[#ffdf00] text-black border-[#ffdf00] shadow-lg scale-[1.02]' : 'bg-gray-50 text-gray-900 border-gray-100 active:border-gray-300'}`}>
                  <span className="text-xl leading-none">{d}</span>
                  {formData.driverName === d && <CheckCircle2 size={28} strokeWidth={3} />}
                </button>
              ))}
            </div>
          </StepLayout>
        );
      case Step.Product:
        return (
          <StepLayout title="ΠΡΟΪΟΝ" stepIndex={2} totalSteps={8} onNext={handleNext} onBack={handleBack} isNextDisabled={!formData.product}>
            <div className="grid grid-cols-1 gap-3 max-h-[60dvh] overflow-y-auto pr-2 custom-scrollbar">
              {products.map((p, i) => (
                <button key={i} onClick={() => updateField('product', p)} className={`w-full p-6 rounded-3xl text-left font-black uppercase transition-all flex items-center justify-between border-4 ${formData.product === p ? 'bg-[#ffdf00] text-black border-[#ffdf00] shadow-lg scale-[1.02]' : 'bg-gray-50 text-gray-900 border-gray-100 active:border-gray-300'}`}>
                  <span className="text-xl leading-none">{p}</span>
                  {formData.product === p && <CheckCircle2 size={28} strokeWidth={3} />}
                </button>
              ))}
            </div>
          </StepLayout>
        );
      case Step.TotalBins:
        return (
          <StepLayout title="ΣΥΝΟΛΟ BINS" stepIndex={3} totalSteps={8} onNext={handleNext} onBack={handleBack} isNextDisabled={!formData.totalBins.trim()}>
            <input type="number" inputMode="numeric" autoFocus className="w-full text-7xl p-8 border-4 border-gray-200 rounded-[2.5rem] focus:border-[#002d54] focus:outline-none text-center font-black bg-gray-50 text-black shadow-inner" placeholder="0" value={formData.totalBins} onChange={(e) => updateField('totalBins', e.target.value)} />
          </StepLayout>
        );
      case Step.BrokenBins:
        return (
          <StepLayout title="ΣΠΑΣΜΕΝΑ BINS" stepIndex={4} totalSteps={8} onNext={handleNext} onBack={handleBack} isNextDisabled={!formData.brokenBins.trim()}>
            <input type="number" inputMode="numeric" autoFocus className="w-full text-7xl p-8 border-4 border-gray-200 rounded-[2.5rem] focus:border-red-600 focus:outline-none text-center font-black text-red-600 bg-red-50/30 shadow-inner" placeholder="0" value={formData.brokenBins} onChange={(e) => updateField('brokenBins', e.target.value)} />
          </StepLayout>
        );
      case Step.Photos:
        return (
          <StepLayout title="ΦΩΤΟΓΡΑΦΙΕΣ" description="ΕΩΣ 9 ΛΗΨΕΙΣ" stepIndex={5} totalSteps={8} onNext={handleNext} onBack={handleBack}>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {formData.photos.map((photo, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden shadow-md border-2 border-gray-200">
                  <img src={photo} className="w-full h-full object-cover" alt="Evidence" />
                  <button onClick={() => updateField('photos', formData.photos.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-red-600 text-white p-2 rounded-xl shadow-lg"><Trash2 size={16} /></button>
                </div>
              ))}
              {formData.photos.length < 9 && (
                <label className="flex flex-col items-center justify-center aspect-square border-4 border-dashed border-[#002d54] rounded-2xl bg-blue-50 text-[#002d54] cursor-pointer active:bg-blue-100 transition-all shadow-md">
                  <Camera size={40} strokeWidth={3} />
                  <span className="text-[10px] font-black mt-2 uppercase">ΚΑΜΕΡΑ</span>
                  <input type="file" className="hidden" accept="image/*" multiple onChange={handlePhotoUpload} capture="environment" />
                </label>
              )}
            </div>
            {isUploading && <div className="flex items-center justify-center gap-3 text-sm font-black text-blue-700 uppercase animate-pulse p-4 bg-blue-50 rounded-2xl border-2 border-blue-200"><Loader2 className="animate-spin" /> ΕΠΕΞΕΡΓΑΣΙΑ...</div>}
            <div className="text-xs font-black text-gray-400 uppercase tracking-widest text-center mt-4 bg-gray-50 py-2 rounded-full">{formData.photos.length} / 9 ΦΩΤΟΓΡΑΦΙΕΣ</div>
          </StepLayout>
        );
      case Step.Comments:
        return (
          <StepLayout title="ΣΧΟΛΙΑ" description="ΕΛΕΥΘΕΡΟ ΚΕΙΜΕΝΟ Ή ΕΠΙΛΟΓΕΣ" stepIndex={6} totalSteps={8} onNext={handleNext} onBack={handleBack}>
            <div className="space-y-6">
              <textarea 
                rows={3}
                className="w-full p-6 bg-gray-50 border-4 border-gray-200 rounded-[2rem] focus:border-[#002d54] focus:outline-none text-xl font-bold placeholder:text-gray-300 text-black shadow-inner"
                placeholder="ΓΡΑΨΤΕ ΕΔΩ..."
                value={formData.comments}
                onChange={(e) => updateField('comments', e.target.value.toUpperCase())}
              />
              <div className="grid grid-cols-1 gap-3 max-h-[40dvh] overflow-y-auto pr-2 custom-scrollbar">
                {predefinedComments.map((c, i) => (
                  <button key={i} onClick={() => {
                    const current = formData.comments.trim();
                    updateField('comments', current ? (current.includes(c) ? current : `${current}, ${c}`) : c);
                  }} className="w-full p-5 rounded-2xl text-left font-black uppercase transition-all bg-white border-4 border-gray-100 active:border-[#ffdf00] flex items-center gap-4 shadow-sm">
                    <div className="bg-[#002d54] text-white p-2 rounded-lg"><Plus size={20} strokeWidth={3} /></div>
                    <span className="text-base text-black">{c}</span>
                  </button>
                ))}
              </div>
            </div>
          </StepLayout>
        );
      case Step.Summary:
        return (
          <div className="flex flex-col min-h-screen bg-white">
            <header className="px-5 py-5 border-b-4 border-[#002d54] flex items-center justify-between sticky top-0 bg-white z-40">
                <Logo className="text-[#002d54] scale-110" />
                <div className="flex items-center gap-4">
                  <OnlineStatus />
                  <button onClick={handleBack} className="text-sm font-black text-black border-4 border-black px-6 py-3 rounded-2xl uppercase shadow-md active:bg-gray-100 transition-all">ΔΙΟΡΘΩΣΗ</button>
                </div>
            </header>
            <main className="flex-1 px-5 pt-8 space-y-8 pb-56">
              <div className="bg-black rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden border-4 border-[#002d54]">
                <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none text-[#ffdf00]"><CheckCircle2 size={200} /></div>
                <h2 className="text-xs font-black uppercase tracking-[0.4em] mb-8 text-yellow-400">ΣΥΝΟΨΗ ΑΝΑΦΟΡΑΣ</h2>
                <div className="space-y-8 relative z-10">
                  <div className="border-l-4 border-yellow-400 pl-4">
                    <p className="text-[10px] font-bold opacity-50 uppercase mb-2 tracking-widest">ΠΡΟΜΗΘΕΥΤΗΣ</p>
                    <p className="text-2xl font-black uppercase leading-none">{formData.supplierName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/10">
                    <div>
                      <p className="text-[10px] font-bold opacity-50 uppercase mb-2">ΣΥΝΟΛΟ BINS</p>
                      <p className="text-5xl font-black">{formData.totalBins}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-red-500 uppercase mb-2">ΣΠΑΣΜΕΝΑ</p>
                      <p className="text-5xl font-black text-red-500">{formData.brokenBins}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {formData.photos.map((p, i) => (
                  <img key={i} src={p} className="aspect-square w-full object-cover rounded-2xl border-4 border-gray-100 shadow-sm" alt="P" />
                ))}
              </div>
            </main>
            <footer className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-gray-200 z-50 p-6 shadow-[0_-20px_40px_rgba(0,0,0,0.1)]">
              <div className="flex flex-col gap-4">
                <button onClick={generatePDF} disabled={isGenerating} className={`w-full py-6 bg-[#002d54] text-white rounded-[2rem] font-black text-2xl flex items-center justify-center gap-4 shadow-xl active:scale-95 disabled:opacity-50 transition-all border-4 border-[#002d54] ${isGenerating ? 'generating-pdf' : ''}`}>
                  {isGenerating ? <Loader2 className="animate-spin" size={32} /> : <FileText size={32} strokeWidth={3} />} ΕΚΔΟΣΗ PDF
                </button>
                <button onClick={() => { if(confirm('ΝΕΑ ΑΝΑΦΟΡΑ; ΤΑ ΤΡΕΧΟΝΤΑ ΘΑ ΔΙΑΓΡΑΦΟΥΝ.')){ localStorage.removeItem('aspis_draft_report'); window.location.reload(); } }} className="text-gray-400 font-black text-xs uppercase text-center tracking-widest py-2 flex items-center justify-center gap-2">
                  <RefreshCcw size={16} /> ΝΕΑ ΑΝΑΦΟΡΑ
                </button>
              </div>
            </footer>
            <PDFTemplate data={formData} reportRef={pdfRef} />
          </div>
        );
      default: return null;
    }
  };

  return <div className={`max-w-md mx-auto min-h-screen bg-white relative ${isGenerating ? 'generating-pdf' : ''}`}>{MainHeader()}{renderStepContent()}</div>;
};

export default App;
