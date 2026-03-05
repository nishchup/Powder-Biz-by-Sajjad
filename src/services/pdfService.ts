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
        clonedElement.style.color = '#000000';
        clonedElement.style.backgroundColor = '#ffffff';

        // Force visibility and standard colors for all elements
        const allElements = clonedElement.getElementsByTagName('*');
        for (const el of Array.from(allElements)) {
          const htmlEl = el as HTMLElement;
          htmlEl.style.opacity = '1';
          htmlEl.style.visibility = 'visible';
          
          // Get computed style to check for oklch or other modern colors
          const style = window.getComputedStyle(htmlEl);
          
          // If color is very light or uses modern syntax, force it to a safe color
          if (style.color.includes('oklch') || style.color.includes('var')) {
            htmlEl.style.color = '#1e293b'; // slate-800 equivalent
          }

          // Ensure backgrounds are solid if they use modern syntax
          if (style.backgroundColor.includes('oklch') || style.backgroundColor.includes('var')) {
            // Only force if it's not transparent
            if (style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent') {
              htmlEl.style.backgroundColor = '#f8fafc'; // slate-50 equivalent
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
