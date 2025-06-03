import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('shopee') // <- queue name
export class JobsProcessor {
  @Process()
  async handleJob(job: Job) {
    console.log('📦 Job received:', job.data);

    // 👉 ที่นี่จะใส่โค้ด Playwright scraping
    // เช่น await scrapeShopeeOrder(job.data.orderId);

    return { success: true };
  }
}
