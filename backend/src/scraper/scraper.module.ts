import { Module } from '@nestjs/common';
import { ScraperService } from './scraper/scraper.service';
import { PlaywrightService } from './playwright/playwright.service';

@Module({
  providers: [ScraperService, PlaywrightService],
  exports: [PlaywrightService],
})
export class ScraperModule {}
