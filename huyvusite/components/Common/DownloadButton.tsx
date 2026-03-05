
import React, { useState } from 'react';

// html2canvas is loaded from a script tag in index.html, so we declare it globally.
declare const html2canvas: any;

interface DownloadButtonProps {
  elementId: string;
  currentDate: Date;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ elementId, currentDate }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    const captureElement = document.getElementById(elementId);
    if (!captureElement) {
      console.error('Element to capture not found!');
      return;
    }

    setIsDownloading(true);

    try {
      // We use a fixed desktop width to ensure the generated image looks like the desktop view.
      // Synced width prevents empty whitespace on the right.
      const DESKTOP_WIDTH = 1400; 

      const canvas = await html2canvas(captureElement, {
        useCORS: true,
        scale: 2, // High resolution
        backgroundColor: '#ffffff',
        
        // FORCE DESKTOP VIEWPORT:
        // This tricks the renderer into thinking it's on a wide screen, 
        // triggering Tailwind's 'md', 'lg', 'xl' breakpoints correctly.
        windowWidth: DESKTOP_WIDTH,
        width: DESKTOP_WIDTH,
        
        // Reset scroll to ensure top of calendar is captured
        scrollX: 0,
        scrollY: 0,
        
        // Modify the cloned document before capturing
        onclone: (clonedDoc: Document) => {
            const clonedContainer = clonedDoc.getElementById(elementId);
            const btn = clonedDoc.getElementById('download-calendar-button');
            
            // Hide the download button in the image
            if (btn) btn.style.display = 'none';

            if (clonedContainer) {
                // --- LAYOUT FIXES ---
                // Force the container to expand to exactly the canvas width.
                // This prevents the "cramped" mobile look and removes unused whitespace.
                clonedContainer.style.width = `${DESKTOP_WIDTH}px`; 
                clonedContainer.style.maxWidth = 'none';
                clonedContainer.style.minWidth = `${DESKTOP_WIDTH}px`;
                clonedContainer.style.height = 'auto';
                
                // Remove centering margins that might cause shifts or whitespace
                clonedContainer.style.margin = '0'; 
                clonedContainer.style.padding = '40px'; // Add breathing room around the calendar
                clonedContainer.style.boxSizing = 'border-box'; // Ensure padding is included in width
                
                clonedContainer.style.borderRadius = '0'; // Optional: square corners look better on paper/image
                
                // Ensure the container isn't constrained by parent flex properties in the clone
                clonedContainer.style.flex = 'none';
                clonedContainer.style.position = 'static';

                // --- GRADIENT TEXT FIXES ---
                // html2canvas struggles with 'text-transparent' and 'bg-clip-text'.
                // We switch to solid colors for the snapshot to ensure text is visible and aligned.
                const monthText = clonedContainer.querySelector('h2');
                const yearText = clonedContainer.querySelector('p');

                if (monthText) {
                    monthText.style.background = 'none';
                    monthText.style.webkitTextFillColor = 'initial';
                    monthText.style.color = '#6366f1'; // Indigo-500
                    monthText.classList.remove('text-transparent', 'bg-clip-text', 'bg-gradient-to-r');
                    // Ensure header text is centered nicely in the wide view
                    monthText.style.textAlign = 'center';
                }
                if (yearText) {
                    yearText.style.background = 'none';
                    yearText.style.webkitTextFillColor = 'initial';
                    yearText.style.color = '#ec4899'; // Pink-500
                    yearText.classList.remove('text-transparent', 'bg-clip-text', 'bg-gradient-to-r');
                }

                // Ensure shadow doesn't look weird on white background export
                clonedContainer.style.boxShadow = 'none';
            }
        }
      });
      
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const filename = `Lich-Nghi-Thang-${month}-${year}.png`;

      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.href = image;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Error generating image:', error);
      alert('Có lỗi khi tạo ảnh. Vui lòng thử lại.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      id="download-calendar-button"
      onClick={handleDownload}
      disabled={isDownloading}
      className="p-2 rounded-full text-gray-500 hover:bg-gray-200/60 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Tải ảnh lịch tháng này"
      title="Tải ảnh lịch tháng này"
    >
      {isDownloading ? (
        <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
        </svg>
      )}
    </button>
  );
};

export default DownloadButton;
