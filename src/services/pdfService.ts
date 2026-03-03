import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export const exportToPDF = async (elementId: string, fileName: string = 'report.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found');
    return;
  }

  try {
    // Hide elements with 'print:hidden' class temporarily if needed, 
    // but html2canvas doesn't respect @media print.
    // We can manually hide them or use a specific container.
    
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      ignoreElements: (el) => el.classList.contains('print:hidden'),
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(elementId);
        if (!clonedElement) return;

        // Helper to convert any color to rgba using a canvas
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
        const allElements = [clonedElement, ...Array.from(elements)];
        
        for (const el of allElements) {
          const htmlEl = el as HTMLElement;
          const style = clonedDoc.defaultView?.getComputedStyle(htmlEl);
          if (!style) continue;
          
          const colorProps = [
            'color', 'backgroundColor', 'borderColor', 
            'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 
            'textDecorationColor', 'outlineColor', 'fill', 'stroke'
          ];
          
          for (const prop of colorProps) {
            const val = style.getPropertyValue(prop.replace(/([A-Z])/g, '-$1').toLowerCase());
            if (val && val.includes('oklch')) {
              htmlEl.style.setProperty(prop.replace(/([A-Z])/g, '-$1').toLowerCase(), convertColor(val), 'important');
            }
          }
        }
      }
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(fileName);
  } catch (error) {
    console.error('PDF Export Error:', error);
    // Fallback to window.print if library fails
    window.print();
  }
};
