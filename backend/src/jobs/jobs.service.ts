import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class JobsService {
  constructor(@InjectQueue('shopee') private readonly queue: Queue) {}

  async addJob(data: { orderId: string }) {
    await this.queue.add('scrape-order', data);
  }
}
