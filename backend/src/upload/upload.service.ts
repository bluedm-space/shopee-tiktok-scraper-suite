import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {
  parseFile(file: Express.Multer.File): string[] {
    if (!file || !file.buffer || !Buffer.isBuffer(file.buffer)) {
      throw new Error('Invalid file or buffer');
    }

    const content = file.buffer.toString('utf-8');

    const lines = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line !== '');

    console.log('📋 Parsed Order IDs:', lines); // ✅ debug
    return lines;
  }
}
