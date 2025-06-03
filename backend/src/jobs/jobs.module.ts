import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { JobsService } from './jobs.service';
import { JobsProcessor } from './jobs.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'shopee',
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
  providers: [JobsService, JobsProcessor],
  exports: [JobsService],
})
export class JobsModule {}
