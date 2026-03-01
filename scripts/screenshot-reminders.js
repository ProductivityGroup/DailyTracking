const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // Navigate to the local Vite dev server
  await page.goto('http://localhost:5175');

  // Wait for the app to load
  await page.waitForSelector('.header-action-btn');

  // Click the Reminder Settings bell icon
  await page.click('.header-action-btn');

  // Wait for the modal to pop up
  await page.waitForSelector('.reminder-modal', { visible: true });

  // Give it a split second for animations to settle
  await new Promise(r => setTimeout(r, 500));

  // Select the modal element specifically to screenshot just the modal
  const element = await page.$('.reminder-modal');

  // Take screenshot
  await element.screenshot({ path: '/Users/fazanza/.gemini/antigravity/brain/a721de96-067a-491d-b712-f0020cfd2bc6/reminder_settings.png' });

  await browser.close();
})();
