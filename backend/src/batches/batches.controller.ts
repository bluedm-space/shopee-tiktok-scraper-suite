import { Controller, Get, Param, Res } from '@nestjs/common';
import { BatchesService } from './batches.service';
import { Response } from 'express';
import { join } from 'path';

@Controller('api/batches')
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

  @Get()
  async getAll() {
    return this.batchesService.getAllBatches();
  }

  @Get('/download/:batchId')
  async download(@Param('batchId') batchId: string, @Res() res: Response) {
    const batch = await this.batchesService.getBatch(batchId);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    const filePath = join(__dirname, '../../../output', batch.filename);
    return res.download(filePath);
  }

  @Get(':batchId')
  async getBatch(@Param('batchId') batchId: string) {
    return this.batchesService.getBatch(batchId);
  }
}
