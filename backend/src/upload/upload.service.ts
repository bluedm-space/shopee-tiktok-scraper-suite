/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

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

    return lines;
  }
}
