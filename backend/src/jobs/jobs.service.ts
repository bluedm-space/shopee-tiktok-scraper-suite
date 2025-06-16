import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

interface PrintJobData {
  orderId: string;
  batchId: string;
  total: number;
}

@Injectable()
export class JobsService {
  constructor(@InjectQueue('shopee') private readonly jobQueue: Queue) {}

  async addJob(data: PrintJobData) {
    console.log('📨 Enqueue job:', data); // ✅ debug
    const job = await this.jobQueue.add('printOrderPDF', data, {
      removeOnComplete: true, // Auto Complete Job Clear
      removeOnFail: true, // Auto Fail Job Clear
    });
    console.log('✅ [JobsService] Job enqueued:', job.id);
  }
}
