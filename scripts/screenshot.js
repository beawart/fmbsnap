const { chromium } = require('playwright');
const { fetchOtpFromGmail } = require('./fetch-otp-gmail');

(async () => {
  console.log('🚀 Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('🌐 Navigating to login page...');
  await page.goto('https://my.fmbmelbourne.com.au/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'landing.png', fullPage: true });

  console.log('✍️ Filling login form...');
  await page.waitForSelector('#email', { timeout: 60000 });
  await page.fill('#email', process.env.WEBSITE_USER);

  await page.waitForSelector('#its', { timeout: 60000 });
  await page.fill('#its', process.env.WEBSITE_PASS);

  await page.click('button:has-text("Login")');

  console.log('⌛ Waiting for OTP field...');
  await page.waitForSelector('#otp', { timeout: 60000 });

  console.log('📧 Fetching OTP from Gmail...');
  const { otp /*, messageId*/ } = await fetchOtpFromGmail();
  console.log(`✅ OTP retrieved: ${otp}`);

  await page.fill('#otp', otp);

  // Explicitly click Verify OTP and wait for page to settle
  await page.click('button:has-text("Verify OTP")');

  // Give the app time to navigate/render. If there’s a known selector on the homepage, wait for it.
  // Example: wait for a specific element that appears only after verification (replace as needed).
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('📸 Capturing homepage screenshot...');
  await page.screenshot({ path: 'homepage.png', fullPage: true });

  await browser.close();
  console.log('✅ Screenshot captured successfully');
})();
