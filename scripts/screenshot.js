require('dotenv').config();
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
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Step 1: Login with email + ITS
  await page.goto('https://my.fmbmelbourne.com.au/');
  await page.fill('input[name="email"]', process.env.WEBSITE_USER);
  await page.fill('input[name="its"]', process.env.WEBSITE_PASS);
  await page.click('button[type="submit"]');

  // Step 2: Wait for OTP field
  await page.waitForSelector('input[name="otp"]');

  // Step 3: Fetch OTP (with retry loop)
  const { otp, messageId } = await fetchOtpFromGmail();
  console.log('Fetched OTP:', otp);

  // Step 4: Enter OTP
  await page.fill('input[name="otp"]', otp);
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');

  // Step 5: Mark OTP email as read
  if (messageId) {
    await markOtpAsRead(messageId);
  }

  // Step 6: Screenshot homepage
  await page.screenshot({ path: 'homepage.png', fullPage: true });

  await browser.close();
  console.log('✅ Screenshot captured with OTP login');
})();
