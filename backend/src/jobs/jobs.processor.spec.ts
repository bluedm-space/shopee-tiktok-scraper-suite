import { Test, TestingModule } from '@nestjs/testing';
import { JobsProcessor } from './jobs.processor';
import { PlaywrightService } from '../scraper/playwright/playwright.service';

describe('JobsProcessor', () => {
  let processor: JobsProcessor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsProcessor,
        {
          provide: PlaywrightService,
          useValue: {
            printPDF: jest.fn(), // mock function
          },
        },
      ],
    }).compile();

    processor = module.get<JobsProcessor>(JobsProcessor);
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });
});
