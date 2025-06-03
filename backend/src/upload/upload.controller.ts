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

    const orderIds = this.uploadService.parseFile(file);

    for (const orderId of orderIds) {
      await this.jobsService.addJob({ orderId });
    }

    return { message: `Queued ${orderIds.length} orders.` };
  }
}
