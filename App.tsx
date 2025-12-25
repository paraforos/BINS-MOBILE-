
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Trash2, FileText, CheckCircle2, Loader2, Image as ImageIcon, Plus, AlertTriangle, RefreshCcw } from 'lucide-react';
import { BinReportData, Step } from './types';
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

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.Supplier);
  const [formData, setFormData] = useState<BinReportData>(INITIAL_DATA);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Μικρή καθυστέρηση για να φορτώσουν οι βιβλιοθήκες από το CDN στη μνήμη
    const timer = setTimeout(() => setShowSplash(false), 1500);
    return () => clearTimeout(timer);
  }, []);

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
      const compressedPhotos = await Promise.all(
        filesToProcess.map(file => compressImage(file))
      );
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...compressedPhotos]
      }));
    } catch (err) {
      console.error("Compression error:", err);
      alert("Σφάλμα στην επεξεργασία εικόνων.");
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const generatePDF = async () => {
    if (!pdfRef.current) {
        alert("Το πρότυπο PDF δεν είναι έτοιμο.");
        return;
    }
    
    // Έλεγχος αν οι βιβλιοθήκες έχουν φορτωθεί στη μνήμη
    if (!window.html2canvas || !window.jspdf) {
        alert("Οι βιβλιοθήκες PDF δεν έχουν φορτώσει ακόμα. Παρακαλώ περιμένετε ή ελέγξτε τη σύνδεση για την πρώτη φόρτωση.");
        return;
    }

    setIsGenerating(true);

    try {
      // Χρήση html2canvas με ρυθμίσεις για offline/local data
      const canvas = await window.html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: false, // Απενεργοποίηση CORS γιατί χρησιμοποιούμε base64
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const { jsPDF } = window.jspdf;
      
      // Δημιουργία PDF στην τοπική μνήμη
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      
      const dateStr = new Date().toLocaleDateString('el-GR').replace(/\//g, '-');
      const cleanSupplier = formData.supplierName.replace(/[^a-z0-9α-ω]/gi, '_').substring(0,10);
      const fileName = `ASPIS_${cleanSupplier}_${dateStr}.pdf`;
      
      pdf.save(fileName);
    } catch (err) {
      console.error("PDF Error:", err);
      alert("Αποτυχία έκδοσης PDF. Βεβαιωθείτε ότι η εφαρμογή έχει φορτώσει πλήρως.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center">
        <Logo className="scale-150 mb-4" />
        <div className="flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-[#003d71]" size={24} />
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Initializing Offline Engine</div>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case Step.Supplier:
        return (
          <StepLayout title="ΟΝΟΜΑ ΠΡΟΜΗΘΕΥΤΗ" stepIndex={0} totalSteps={7} onNext={handleNext} isNextDisabled={!formData.supplierName.trim()}>
            <input type="text" autoFocus className="w-full text-xl p-5 border-2 border-gray-100 rounded-2xl focus:border-[#003d71] focus:outline-none bg-gray-50/50 font-bold transition-colors" placeholder="Επωνυμία Συνεταιρισμού..." value={formData.supplierName} onChange={(e) => updateField('supplierName', e.target.value)} />
          </StepLayout>
        );

      case Step.Driver:
        return (
          <StepLayout title="ΟΔΗΓΟΣ" stepIndex={1} totalSteps={7} onNext={handleNext} onBack={handleBack} isNextDisabled={!formData.driverName.trim()}>
            <input type="text" autoFocus className="w-full text-xl p-5 border-2 border-gray-100 rounded-2xl focus:border-[#003d71] focus:outline-none bg-gray-50/50 font-bold" placeholder="Ονοματεπώνυμο οδηγού..." value={formData.driverName} onChange={(e) => updateField('driverName', e.target.value)} />
          </StepLayout>
        );

      case Step.Product:
        return (
          <StepLayout title="ΠΡΟΪΟΝ" stepIndex={2} totalSteps={7} onNext={handleNext} onBack={handleBack} isNextDisabled={!formData.product.trim()}>
            <input type="text" autoFocus className="w-full text-xl p-5 border-2 border-gray-100 rounded-2xl focus:border-[#003d71] focus:outline-none bg-gray-50/50 font-bold" placeholder="Είδος (π.χ. Συμπύρηνα)..." value={formData.product} onChange={(e) => updateField('product', e.target.value)} />
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
          <StepLayout title="ΦΩΤΟΓΡΑΦΙΕΣ ΖΗΜΙΑΣ" description="Έως 9 λήψεις" stepIndex={5} totalSteps={7} onNext={handleNext} onBack={handleBack}>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {formData.photos.map((photo, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden shadow-sm border border-gray-100">
                  <img src={photo} className="w-full h-full object-cover" alt="Evidence" />
                  <button onClick={() => removePhoto(idx)} className="absolute top-1 right-1 bg-red-600 text-white p-1.5 rounded-full shadow-lg"><Trash2 size={12} /></button>
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
            {isUploading && (
              <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase animate-pulse mb-2">
                <Loader2 size={12} className="animate-spin" /> Συμπίεση...
              </div>
            )}
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
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 text-blue-200/60">Σύνοψη Αναφοράς</h2>
                
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
              <button 
                onClick={generatePDF} 
                disabled={isGenerating} 
                className="w-full py-5 bg-[#003d71] text-white rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-3 shadow-2xl shadow-[#003d71]/30 active:scale-95 transition-all disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="animate-spin" /> : <FileText size={22} />} ΕΚΔΟΣΗ PDF
              </button>
              <button 
                onClick={() => window.location.reload()} 
                className="text-gray-400 font-black text-[10px] uppercase text-center tracking-[0.3em] py-3 flex items-center justify-center gap-2"
              >
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
