import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export const exportToPDF = async (elementId: string, fileName: string = 'report.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found');
    return;
  }

  try {
    // Create a temporary container to ensure consistent styling for PDF
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      ignoreElements: (el) => el.classList.contains('print:hidden'),
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(elementId);
        if (!clonedElement) return;
        
        // Ensure all text is visible and colors are correct
        clonedElement.style.padding = '20px';
        clonedElement.style.width = '100%';
        clonedElement.style.height = 'auto';
        
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

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add subsequent pages if content is longer than one page
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(fileName);
  } catch (error) {
    console.error('PDF Export Error:', error);
    window.print();
  }
};
