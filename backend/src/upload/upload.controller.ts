import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JobsService } from '../jobs/jobs.service';

@Controller('api/upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly jobsService: JobsService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async handleUpload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    console.log('📁 Received file:', file?.originalname);

    const orderIds = this.uploadService.parseFile(file);
    console.log('📋 Order IDs to queue:', orderIds); // ✅ debug

    for (const orderId of orderIds) {
      console.log('📦 Queueing:', orderId); // ✅ debug
      await this.jobsService.addJob({ orderId });
    }

    return { message: `Queued ${orderIds.length} orders.` };
  }
}
