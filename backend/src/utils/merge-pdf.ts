import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';

export async function mergePDFs(pdfPaths: string[], output: string) {
  const out = await PDFDocument.create();

  for (const p of pdfPaths) {
    const src = await PDFDocument.load(fs.readFileSync(p));
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((pg) => out.addPage(pg));
  }

  fs.writeFileSync(output, await out.save());
}
