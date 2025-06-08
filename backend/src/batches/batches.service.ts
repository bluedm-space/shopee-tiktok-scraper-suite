import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { BatchMeta } from './interfaces/batch-meta.interface';

const BATCHES_FILE = join(__dirname, '../../../data/batches.json');

@Injectable()
export class BatchesService {
  async getAllBatches(): Promise<BatchMeta[]> {
    try {
      const file = await fs.readFile(BATCHES_FILE, 'utf-8');
      const data = JSON.parse(file) as BatchMeta[];
      return data;
    } catch {
      return [];
    }
  }

  async getBatch(batchId: string): Promise<BatchMeta | null> {
    const all = await this.getAllBatches();
    return all.find((b) => b.batchId === batchId) || null;
  }

  async saveBatch(meta: BatchMeta) {
    const all = await this.getAllBatches();
    const updated = all.filter((b) => b.batchId !== meta.batchId);
    updated.push(meta);
    await fs.writeFile(BATCHES_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  }
}
