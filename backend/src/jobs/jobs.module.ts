import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { JobsService } from './jobs.service';
import { JobsProcessor } from './jobs.processor';
import { ScraperModule } from '../scraper/scraper.module';
import { BatchesModule } from '../batches/batches.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'shopee',
    }),
    ScraperModule,
    BatchesModule,
  ],
  providers: [JobsService, JobsProcessor],
  exports: [JobsService],
})
export class JobsModule {}
