import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { PlaywrightService } from '../scraper/playwright/playwright.service';

@Processor('shopee') // <- queue name
export class JobsProcessor {
  constructor(private readonly playwrightService: PlaywrightService) {
    console.log('📦 JobsProcessor initialized'); // ✅ debug
  }

  @Process('printOrderPDF')
  async handlePrintPDFJob(job: Job<{ orderId: string }>) {
    const orderId = job.data.orderId;
    console.log(
      '🛠️ [JobsProcessor] Received job:',
      job.id,
      '→ orderId:',
      orderId,
    ); // ✅ debug

    try {
      await this.playwrightService.printPDF(orderId);
      console.log('✅ [JobsProcessor] Completed:', orderId);
    } catch (err) {
      console.error('❌ [JobsProcessor] Failed:', orderId, err);
    }
  }
}
