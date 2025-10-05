require('dotenv').config();
const { google } = require('googleapis');

async function fetchOtpFromGmail(maxAttempts = 12, delayMs = 10000) {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET
  );
  oAuth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });

  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`🔎 Checking Gmail for OTP (attempt ${attempt}/${maxAttempts})...`);

    const res = await gmail.users.messages.list({
      userId: process.env.GMAIL_USER,
      maxResults: 5,
      q: 'is:unread',
    });

    if (res.data.messages && res.data.messages.length > 0) {
      for (const m of res.data.messages) {
        const msg = await gmail.users.messages.get({
          userId: process.env.GMAIL_USER,
          id: m.id,
        });

        let body = '';
        if (msg.data.payload.parts) {
          for (const part of msg.data.payload.parts) {
            if (part.mimeType === 'text/plain' && part.body.data) {
              body += Buffer.from(part.body.data, 'base64').toString();
            }
          }
        } else if (msg.data.payload.body?.data) {
          body = Buffer.from(msg.data.payload.body.data, 'base64').toString();
        }

        const otpRegex = /\b\d{4,8}\b/;
        const match = otpRegex.exec(body);

        if (match) {
          console.log(`✅ OTP found: ${match[0]}`);
          return { otp: match[0], messageId: m.id };
        }
      }
    }

    if (attempt < maxAttempts) {
      console.log(`⏳ No OTP yet, waiting ${delayMs / 1000}s...`);
      await new Promise(r => setTimeout(r, delayMs));
    }
  }

  throw new Error(`❌ OTP not found after ${maxAttempts} attempts`);
}

module.exports = { fetchOtpFromGmail };
