import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import PDFDocument from 'https://esm.sh/pdfkit@0.13.0';

export type TimbradoCfg = {
  header_url?: string;
  footer_url?: string;
  bg_url?: string;
  margins?: { top: number; bottom: number; left: number; right: number };
};

export async function loadTimbradoConfig(supabase: any): Promise<TimbradoCfg> {
  const { data } = await supabase.from('config_sistema').select('valor').eq('chave', 'timbrado_a4').single();
  return (data?.valor || {}) as TimbradoCfg;
}

async function fetchAsUint8(url?: string): Promise<Uint8Array | null> {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) {
        console.warn(`Failed to fetch image: ${url}, status: ${res.status}`);
        return null;
    }
    const ab = await res.arrayBuffer();
    return new Uint8Array(ab);
  } catch (e) {
    console.error(`Error fetching image ${url}:`, e);
    return null;
  }
}

export async function applyTimbrado(doc: PDFKit.PDFDocument, cfg: TimbradoCfg) {
  const [header, footer, bg] = await Promise.all([
    fetchAsUint8(cfg.header_url),
    fetchAsUint8(cfg.footer_url),
    fetchAsUint8(cfg.bg_url),
  ]);

  const m = cfg.margins || { top: 80, bottom: 80, left: 40, right: 40 };

  doc.page.margins = { ...doc.page.margins, ...m };
  doc.y = m.top;

  const paint = () => {
    const { width, height, margins } = doc.page;
    if (bg) {
      doc.image(bg, 0, 0, { width, height });
    }
    if (header) {
      const imgWidth = width - margins.left - margins.right;
      doc.image(header, margins.left, 10, { width: imgWidth });
    }
    if (footer) {
      const imgWidth = width - margins.left - margins.right;
      const footerHeight = 60; 
      doc.image(footer, margins.left, height - footerHeight - 10, { width: imgWidth });
    }
  };

  paint();
  doc.on('pageAdded', paint);
}