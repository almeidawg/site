import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const generatePdf = async (title, headerContent, tableContent, options = {}) => {
  const {
    orientation = 'landscape',
    format = 'a4'
  } = options;

  const doc = new jsPDF(orientation, 'pt', format);
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;

  // Header
  const logoUrl = 'https://horizons-cdn.hostinger.com/378de1a7-16dc-45cb-902e-80ce1d49a1f3/grupo-wg-TEmSq.png';
  const logoResponse = await fetch(logoUrl);
  const logoBlob = await logoResponse.blob();
  const logoBase64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(logoBlob);
  });
  
  doc.addImage(logoBase64, 'PNG', margin, margin, 80, 0);

  doc.setFontSize(18);
  doc.setTextColor(40);
  doc.text(title, pageWidth / 2, margin + 30, { align: 'center' });

  if (headerContent) {
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(headerContent, margin, margin + 70);
  }
  
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.line(margin, margin + 90, pageWidth - margin, margin + 90);

  // Content
  if (typeof tableContent === 'string') { // If it's a selector for html2canvas
    const element = document.querySelector(tableContent);
    if(element) {
        // Temporarily adjust for printing
        element.style.padding = '0';
        element.style.boxShadow = 'none';
        element.style.border = 'none';

        const canvas = await html2canvas(element, { 
            scale: 2, 
            useCORS: true,
            logging: false
        });

        // Revert styles
        element.style.padding = '';
        element.style.boxShadow = '';
        element.style.border = '';

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - margin * 2;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = margin + 100;
        
        doc.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - position - margin);

        while (heightLeft > 0) {
            position = -pageHeight + margin*2; // Negative position to push from top
            doc.addPage();
            doc.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

    }
  } else { // If it's an array for autoTable
     doc.autoTable({
        ...tableContent,
        startY: margin + 100,
        theme: 'grid',
        styles: {
            font: 'helvetica',
            fontSize: 8,
            cellPadding: 5
        },
        headStyles: {
            fillColor: [23, 37, 84], // bg-slate-800
            textColor: 255,
            fontStyle: 'bold'
        },
        margin: { top: margin + 100, right: margin, bottom: margin, left: margin },
        didDrawPage: (data) => {
            // Footer
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(8);
            doc.text(`Página ${data.pageNumber} de ${pageCount}`, pageWidth / 2, pageHeight - 20, { align: 'center' });
        }
    });
  }


  doc.save(`${title.replace(/ /g, '_').toLowerCase()}.pdf`);
};

export default generatePdf;