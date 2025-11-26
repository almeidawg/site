import jsPDF from 'jspdf';

/**
 * Gera um PDF simples com título/subtítulo e conteúdo básico.
 * Suporta:
 *  - content como seletor (string): registra aviso de exportação visual ausente.
 *  - content com { head, body }: escreve linhas em texto (sem tabelas complexas).
 */
export default async function generatePdf(title, subtitle, content, options = {}) {
  const doc = new jsPDF(options.orientation || 'portrait', 'pt', options.format || 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFontSize(16);
  doc.text(title || 'Documento', 40, 40);
  doc.setFontSize(11);
  if (subtitle) {
    doc.text(subtitle, 40, 60, { maxWidth: pageWidth - 80 });
  }

  let y = subtitle ? 90 : 70;

  const addLine = (line) => {
    const lines = doc.splitTextToSize(line, pageWidth - 80);
    lines.forEach((ln) => {
      if (y > pageHeight - 40) {
        doc.addPage();
        y = 40;
      }
      doc.text(ln, 40, y);
      y += 16;
    });
  };

  if (typeof content === 'string') {
    addLine('Exportação visual indisponível nesta build. Seletor: ' + content);
  } else if (content && Array.isArray(content.head) && Array.isArray(content.body)) {
    const rows = [...content.head, ...content.body];
    rows.forEach((row) => addLine(row.map((cell) => cell ?? '').join(' | ')));
  } else {
    addLine('Conteúdo não fornecido.');
  }

  const safeTitle = (title || 'documento').replace(/\s+/g, '_');
  doc.save(`${safeTitle}.pdf`);
}
