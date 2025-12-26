export const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // 800px είναι υπεραρκετά για PDF αναφορά
      const MAX_DIM = 800;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_DIM) {
          height *= MAX_DIM / width;
          width = MAX_DIM;
        }
      } else {
        if (height > MAX_DIM) {
          width *= MAX_DIM / height;
          height = MAX_DIM;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { alpha: false });
      
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        return reject('Canvas Error');
      }
      
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      
      // Χαμηλότερη ποιότητα για εξοικονόμηση μνήμης (0.35)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.35);
      
      // Cleanup
      URL.revokeObjectURL(objectUrl);
      img.src = "";
      canvas.width = 0;
      canvas.height = 0;
      
      resolve(dataUrl);
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };

    img.src = objectUrl;
  });
};

export const greekToLatin = (text: string): string => {
  const map: Record<string, string> = {
    'Α': 'A', 'Β': 'B', 'Γ': 'G', 'Δ': 'D', 'Ε': 'E', 'Ζ': 'Z', 'Η': 'I', 'Θ': 'TH',
    'Ι': 'I', 'Κ': 'K', 'Λ': 'L', 'Μ': 'M', 'Ν': 'N', 'Ξ': 'X', 'Ο': 'O', 'Π': 'P',
    'Ρ': 'R', 'Σ': 'S', 'Τ': 'T', 'Υ': 'Y', 'Φ': 'F', 'Χ': 'CH', 'Ψ': 'PS', 'Ω': 'O',
    ' ': '_', '-': '_', '.': '_'
  };
  return text.toUpperCase().split('').map(char => map[char] || char).join('').replace(/[^A-Z0-9_]/g, '');
};