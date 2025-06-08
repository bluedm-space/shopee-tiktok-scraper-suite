import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class JobsService {
  constructor(@InjectQueue('shopee') private readonly jobQueue: Queue) {}

  async addJob(data: { orderId: string }) {
    console.log('📨 Enqueue job:', data); // ✅ debug
    const job = await this.jobQueue.add('printOrderPDF', data);
    console.log('✅ [JobsService] Job enqueued:', job.id);
  }
}
