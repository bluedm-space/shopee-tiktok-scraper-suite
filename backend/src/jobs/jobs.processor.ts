import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { PlaywrightService } from '../scraper/playwright/playwright.service';
import { mergePDFs } from '../utils/merge-pdf';
import { BatchesService } from '../batches/batches.service';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import Redis from 'ioredis';

@Processor('shopee') // <- queue name
export class JobsProcessor {
  private readonly redis: Redis;

  constructor(
    private readonly playwrightService: PlaywrightService,
    private readonly batchesService: BatchesService,
  ) {
    // console.log('📦 JobsProcessor initialized'); // ✅ debug
    this.redis = new Redis();
  }

  @Process('printOrderPDF')
  async handlePrintPDFJob(
    job: Job<{ orderId: string; batchId: string; total: number }>,
  ) {
    const { orderId, batchId, total } = job.data;
    const totalOrders = total;
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
      console.error(`❌ Failed to generate PDF for ${orderId}`, err);
      return;
    }

    // เริ่มสถานะ
    await this.batchesService.saveBatch({
      batchId,
      filename: `${batchId}.pdf`,
      createdAt: new Date().toISOString(),
      totalOrders,
      status: 'processing',
    });

    // บันทึกความคืบหน้าใน Redis
    const key = `batch:${batchId}:doneCount`;
    const current = await this.redis.incr(key);
    console.log(`✅ [${batchId}] ${current}/${total} jobs done`);

    // เมื่อครบทุก job → trigger merge
    if (current === total) {
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const now = new Date();

      const folder = path.join(
        os.homedir(),
        'Documents',
        'Shopee-Project',
        `shopee-pdf-OldOrder-FetchAt-${today}`,
      );

      const pdfPaths: string[] = [];

      for (let i = 0; i < total; i++) {
        const file = path.join(folder, `${job.data.batchId}-${i + 1}.pdf`);
        if (fs.existsSync(file)) {
          pdfPaths.push(file);
        }
      }

      const fileMergeName = `Shopee-merged-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}.pdf`;
      const output = path.join(folder, fileMergeName);

      try {
        await mergePDFs(pdfPaths, output);
        console.log(`✅ Merged PDF saved: ${output}`);

        // 🟢 อัปเดตสถานะเป็น done + ใช้ชื่อไฟล์จริง
        await this.batchesService.saveBatch({
          batchId,
          filename: fileMergeName,
          createdAt: new Date().toISOString(),
          totalOrders,
          status: 'done',
        });
      } catch (err) {
        console.error('❌ Failed to merge PDF:', err);

        // 🔴 ถ้า merge fail → อัปเดตว่า failed
        await this.batchesService.saveBatch({
          batchId,
          filename: fileMergeName,
          createdAt: new Date().toISOString(),
          totalOrders,
          status: 'failed',
        });
      }

      console.log(`✅ Merged PDF saved: ${output}`);

      await this.redis.del(key);
    }
  }
}
