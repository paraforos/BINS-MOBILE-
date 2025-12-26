
export const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Μείωση σε 1000px για εξοικονόμηση μνήμης σε κινητά
      const MAX_DIM = 1000;
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
      const ctx = canvas.getContext('2d', { alpha: false }); // Απενεργοποίηση alpha για λιγότερη μνήμη
      
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        return reject('Could not get canvas context');
      }
      
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      
      // Ποιότητα 0.5 για βέλτιστη ισορροπία μεγέθους/μνήμης
      const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
      
      // Cleanup
      URL.revokeObjectURL(objectUrl);
      img.src = ""; // Clear image memory
      canvas.width = 0; // Clear canvas memory
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
