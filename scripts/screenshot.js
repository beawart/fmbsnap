const { chromium } = require('playwright');
const { google } = require('googleapis');
const { fetchOtpFromGmail } = require('./fetch-otp-gmail');

async function markOtpAsRead(messageId) {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET
  );
  oAuth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });

  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

  await gmail.users.messages.modify({
    userId: process.env.GMAIL_USER,
    id: messageId,
    requestBody: {
      removeLabelIds: ['UNREAD'],
    },
  });

  console.log(`📩 Marked OTP email (${messageId}) as read`);
}

(async () => {
  console.log('🚀 Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Step 1: Go to login page
  console.log('🌐 Navigating to login page...');
  await page.goto('https://my.fmbmelbourne.com.au/', { waitUntil: 'networkidle' });

  // Debug: capture landing page
  await page.screenshot({ path: 'landing.png', fullPage: true });

  // Step 2: Fill login form
  console.log('✍️ Filling login form...');
  await page.waitForSelector('#email', { timeout: 60000 });
  await page.fill('#email', process.env.WEBSITE_USER);

  await page.waitForSelector('#its', { timeout: 60000 });
  await page.fill('#its', process.env.WEBSITE_PASS);

  await page.click('button:has-text("Login")');

  // Step 3: Wait for OTP field
  console.log('⌛ Waiting for OTP field...');
  await page.waitForSelector('#otp', { timeout: 60000 });

  // Step 4: Fetch OTP from Gmail
  console.log('📧 Fetching OTP from Gmail...');
  const { otp, messageId } = await fetchOtpFromGmail();
  console.log(`✅ OTP retrieved: ${otp}`);

  // Step 5: Enter OTP and submit
  await page.fill('#otp', otp);
  await page.click('button:has-text("Verify OTP")');
  await page.waitForLoadState('networkidle');

  // Step 6: Mark OTP email as read
  // if (messageId) {
  //   await markOtpAsRead(messageId);
  // }

  // Step 7: Capture screenshot
  console.log('📸 Capturing homepage screenshot...');
  await page.screenshot({ path: 'homepage.png', fullPage: true });

  await browser.close();
  console.log('✅ Screenshot captured successfully');
})();
