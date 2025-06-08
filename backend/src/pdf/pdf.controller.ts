import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { Response } from 'express';

@Controller('pdf')
export class PdfController {
  @Get(':filename')
  downloadPdf(@Param('filename') filename: string, @Res() res: Response) {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const filePath = path.join(
      process.env.HOME || process.env.USERPROFILE || '',
      'Documents',
      `shopee-pdf-OldOrder-FetchAt-${today}`,
      filename,
    );

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    res.download(filePath); // ส่งไฟล์กลับแบบ download
  }
}
