import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { BoxResult, Point } from './boxGeometry';

const MM_TO_POINTS = 72 / 25.4;

export async function generatePDF(result: BoxResult, appName: string, appVersion: string, homepage: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  const pageWidth = result.docSize.w * MM_TO_POINTS;
  const pageHeight = result.docSize.h * MM_TO_POINTS;
  
  const page = pdfDoc.addPage([pageWidth, pageHeight]);
  
  for (const path of result.paths) {
    if (path.length < 2) continue;
    
    for (let i = 0; i < path.length - 1; i++) {
      const from = path[i];
      const to = path[i + 1];
      
      page.drawLine({
        start: { x: from.x * MM_TO_POINTS, y: from.y * MM_TO_POINTS },
        end: { x: to.x * MM_TO_POINTS, y: to.y * MM_TO_POINTS },
        thickness: 0.1,
        color: rgb(0, 0, 0),
      });
    }
  }
  
  const fontSize = 10;
  const textY = 35 * MM_TO_POINTS;
  const textX = 15 * MM_TO_POINTS;
  
  page.drawText(`Cut Width: ${result.metadata.cutWidth.toFixed(4)}mm`, {
    x: textX,
    y: textY,
    size: fontSize,
    font,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(`Material Thickness: ${result.metadata.thickness.toFixed(4)}mm`, {
    x: textX,
    y: textY - 15,
    size: fontSize,
    font,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(`W x D x H: ${result.size.w.toFixed(2)}mm x ${result.size.d.toFixed(2)}mm x ${result.size.h.toFixed(2)}mm`, {
    x: textX,
    y: textY - 30,
    size: fontSize,
    font,
    color: rgb(0, 0, 0),
  });
  
  const now = new Date();
  const dateStr = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  
  page.drawText(`Produced by ${appName} v${appVersion} on ${dateStr} at ${timeStr}`, {
    x: textX,
    y: textY - 45,
    size: fontSize,
    font,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(homepage, {
    x: textX,
    y: textY - 60,
    size: fontSize,
    font,
    color: rgb(0, 0, 0),
  });
  
  if (result.boundingBoxSize.w > 0) {
    const bbText = `Bounding Box: ${result.boundingBoxSize.w.toFixed(2)}mm x ${result.boundingBoxSize.h.toFixed(2)}mm`;
    page.drawText(bbText, {
      x: textX,
      y: pageHeight - 20 * MM_TO_POINTS,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });
  }
  
  return await pdfDoc.save();
}

export function downloadPDF(data: Uint8Array, filename: string = 'box.pdf'): void {
  // Ensure BlobPart is a real ArrayBuffer to satisfy TS/lib.dom types
  const buffer = new ArrayBuffer(data.byteLength);
  new Uint8Array(buffer).set(data);
  const blob = new Blob([buffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
