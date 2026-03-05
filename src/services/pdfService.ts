import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export const exportToPDF = async (elementId: string, fileName: string = 'report.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found');
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 3, // Even higher resolution for crisp text
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1200, // Fixed width for consistent layout
      ignoreElements: (el) => el.classList.contains('print:hidden'),
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(elementId);
        if (!clonedElement) return;
        
        // Professional Document Styling
        clonedElement.style.padding = '40px';
        clonedElement.style.width = '1200px';
        clonedElement.style.height = 'auto';
        clonedElement.style.fontFamily = '"Plus Jakarta Sans", sans-serif';
        
        // Convert OKLCH colors to RGB for html2canvas compatibility
        const colorCanvas = clonedDoc.createElement('canvas');
        colorCanvas.width = 1;
        colorCanvas.height = 1;
        const ctx = colorCanvas.getContext('2d', { willReadFrequently: true });

        const convertColor = (colorStr: string) => {
          if (!ctx || !colorStr || !colorStr.includes('oklch')) return colorStr;
          ctx.clearRect(0, 0, 1, 1);
          ctx.fillStyle = colorStr;
          ctx.fillRect(0, 0, 1, 1);
          const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
          return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
        };

        const elements = clonedElement.getElementsByTagName('*');
        for (const el of Array.from(elements)) {
          const htmlEl = el as HTMLElement;
          
          // Force visibility of borders and backgrounds
          htmlEl.style.boxShadow = 'none';
          
          const style = clonedDoc.defaultView?.getComputedStyle(htmlEl);
          if (!style) continue;
          
          const colorProps = ['color', 'backgroundColor', 'borderColor'];
          for (const prop of colorProps) {
            const val = style.getPropertyValue(prop.replace(/([A-Z])/g, '-$1').toLowerCase());
            if (val && val.includes('oklch')) {
              htmlEl.style.setProperty(prop.replace(/([A-Z])/g, '-$1').toLowerCase(), convertColor(val), 'important');
            }
          }
        }
      }
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - (margin * 2);
    
    // Calculate image dimensions to fit the page width
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // If the content is slightly longer than one page, we scale it down to fit one page
    // Otherwise, we use multiple pages
    const maxSinglePageHeight = pageHeight - (margin * 2);
    
    if (imgHeight <= maxSinglePageHeight * 1.2) {
      // Scale down to fit one page if it's within 20% of the limit
      const scaleFactor = maxSinglePageHeight / imgHeight;
      const finalWidth = imgWidth * scaleFactor;
      const finalHeight = maxSinglePageHeight;
      const xOffset = (pageWidth - finalWidth) / 2;
      
      pdf.addImage(imgData, 'JPEG', xOffset, margin, finalWidth, finalHeight);
    } else {
      // Multi-page logic
      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
      heightLeft -= maxSinglePageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
        heightLeft -= maxSinglePageHeight;
      }
    }

    pdf.save(fileName);
  } catch (error) {
    console.error('PDF Export Error:', error);
    window.print();
  }
};
