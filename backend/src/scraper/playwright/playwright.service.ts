// src/scraper/playwright.service.ts

import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

@Injectable()
export class PlaywrightService implements OnModuleDestroy {
  private browser: Browser;
  private page: Page;
  // private isLoggedIn = false;

  private readonly cookiePath = path.join(__dirname, 'shopee-session.json');

  private readonly appUser: string;
  private readonly appPass: string;

  constructor(private configService: ConfigService) {}

  private async saveCookies(context: BrowserContext) {
    const cookies = await context.cookies();
    fs.writeFileSync(this.cookiePath, JSON.stringify(cookies, null, 2));
    console.log('💾 Cookies saved');
  }

  private async loadCookies(context: BrowserContext) {
    if (fs.existsSync(this.cookiePath)) {
      const cookies = JSON.parse(
        fs.readFileSync(this.cookiePath, 'utf-8'),
      ) as Parameters<BrowserContext['addCookies']>[0];
      await context.addCookies(cookies);
      console.log('📥 Cookies loaded');
    }
  }

  private async manualLogin(context: BrowserContext) {
    console.log('Manual Login Starting');

    // 💡 รอ login manual โดยผู้ใช้ (OTP, Captcha, 2FA)
    console.log('🧍‍♂️ โปรด login ด้วยตนเอง (กด "เข้าสู่ระบบ")');
    await this.page.waitForURL('**/portal/home', { timeout: 300000 }); // รอสูงสุด 5 นาที

    // ✅ บันทึก cookie หลัง login
    await this.saveCookies(context);
    console.log('🔐 Login เสร็จ → Session พร้อมใช้งาน');
  }

  async init(): Promise<void> {
    console.log('Browser Initialized');
    const appUser = this.configService.get<string>('APP_USER') ?? '';
    const appPass = this.configService.get<string>('APP_PASS') ?? '';
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: false,
        slowMo: 100,
      });
      const context = await this.browser.newContext();
      await this.loadCookies(context);

      this.page = await context.newPage();
      console.log('New Page');

      await this.page.goto('https://seller.shopee.co.th/portal/home', {
        waitUntil: 'load',
      });
      await this.page.waitForTimeout(2000);
      console.log('Page Loaded');

      await this.page.goto('https://accounts.shopee.co.th/seller/login', {
        waitUntil: 'networkidle',
      });
      await this.page.waitForTimeout(2000);

      // 📍 ถ้ามี popup เลือกภาษา
      const langPopup = await this.page.$('.language-selection__list');
      if (langPopup) {
        await this.page.click('button:has-text("ไทย")');
        await this.page.waitForTimeout(500);
      }

      await this.page.waitForSelector('input.nFUZwF[name="loginKey"]');
      // console.log('loginKey is appeard');

      await this.page.waitForSelector('input.nFUZwF[name="password"]');
      // console.log('password is appeard');

      await this.page.fill('input[name="loginKey"]', appUser);
      await this.page.fill('input[name="password"]', appPass);
      await this.page.keyboard.press('Enter');
      await this.page.waitForTimeout(2000);

      if (this.page.url().includes('verify')) {
        console.log('🔐 ต้อง login ด้วยตนเอง (ครั้งแรก)');
        await this.manualLogin(context);
      }
    }
  }

  async searchOrderId(orderId: string): Promise<string | null> {
    await this.init(); // Ensure browser + login

    await this.page.goto('https://seller.shopee.co.th/portal/sale/order', {
      // waitUntil: 'load',
    });

    await this.page.waitForSelector('input.eds-input__input');
    await this.page.click('input.eds-input__input', { clickCount: 3 });
    await this.page.keyboard.press('Backspace');
    await this.page.fill('input.eds-input__input', orderId);
    await this.page.keyboard.press('Enter');

    await this.page.waitForTimeout(3000); // รอผลลัพธ์โหลด

    // หาลิงก์สั่งพิมพ์ PDF
    const linkHandle = await this.page.$('a[href*="/portal/sale/order/"]');
    const href = linkHandle ? await linkHandle.getAttribute('href') : null;

    return href ? `https://seller.shopee.co.th${href}` : null;
  }

  async printPDF(orderId: string): Promise<void> {
    console.log('[PlayWright] printPDF Starting'); // ✅ debug
    const pdfUrl = await this.searchOrderId(orderId);
    if (!pdfUrl) {
      console.warn(`❌ OrderId not found: ${orderId}`);
      return;
    }

    console.log('[PlayWright] Goto Order URL'); // ✅ debug
    await this.page.goto(pdfUrl, {
      waitUntil: 'load',
      timeout: 30000,
    });
    await this.page.waitForSelector('.payment-info-details');
    await this.page.waitForTimeout(2000);

    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const outputFolder = path.join(
      os.homedir(),
      'Documents',
      'Shopee-Project',
      `shopee-pdf-OldOrder-FetchAt-${today}`,
    );
    const outputPath = path.join(outputFolder, `Shopee-${orderId}.pdf`);

    // Ensure output directory
    fs.mkdirSync(outputFolder, { recursive: true });

    await this.page.addStyleTag({
      content: `
        .body *,
        .body {
        color: #000;
        font-weight: bold !important;
        }
        .payment-info-details *,
        .income-group *,
        .income-item *,
        .name ,
        .product-list-item *,
        .product-list-item.product-list-head *,
        .product-detail *,
        .order-invoice-body *,
        .ship-address {
          color: #000 !important;
          -webkit-text-fill-color: #000 !important;
          font-weight: bold !important;
        }
        .eds-button.eds-button--primary.eds-button--normal {
          color: #000 !important;
          -webkit-text-fill-color: #000 !important;
          background-color: #fff !important;
          font-weight: bold !important;
        }
          .eds-button.eds-button--normal {
          color: #000 !important;
          -webkit-text-fill-color: #000 !important;
          background-color: #fff !important;
          font-weight: bold !important;
        }
        .instruction {
        width: 500px !important;
        }
        .username.text-overflow {
        font-weight: bold !important;
        font-size: 20px;
        color: #000 !important;
        -webkit-text-fill-color: #000 !important;
        }
          .actual-carrier-name  {
          color: #000 !important;
          -webkit-text-fill-color: #000 !important;
          font-weight: bold !important;
        }
          .carrier  {
          color: #000 !important;
          -webkit-text-fill-color: #000 !important;
          font-weight: bold !important;
        }
        .tracking-number-wrapper * {
          background-color: #FFF !important;
          color: #000 !important;
          -webkit-text-fill-color: #000 !important;
          font-weight: bold !important;
        }
      `,
    });

    console.log('[PlayWright] page.pdf running'); // ✅ debug

    const client = await this.page.context().newCDPSession(this.page);
    const result = await client.send('Page.printToPDF', {
      printBackground: true,
      scale: 0.65,
      pageRanges: '1',
    });

    const buffer = Buffer.from(result.data, 'base64');
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ PDF saved: ${outputPath}`);
  }

  async onModuleDestroy(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
