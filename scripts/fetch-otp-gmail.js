const { google } = require('googleapis');

function decodeBody(payload) {
  // Prefer text/plain; fallback to text/html (strip tags)
  if (payload.parts && Array.isArray(payload.parts)) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return Buffer.from(part.body.data, 'base64').toString('utf8');
      }
    }
    for (const part of payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        const html = Buffer.from(part.body.data, 'base64').toString('utf8');
        return html.replace(/<[^>]*>/g, ' ');
      }
    }
  }
  if (payload.body?.data) {
    const raw = Buffer.from(payload.body.data, 'base64').toString('utf8');
    return payload.mimeType === 'text/html' ? raw.replace(/<[^>]*>/g, ' ') : raw;
  }
  return '';
}

async function fetchOtpFromGmail(maxAttempts = 12, delayMs = 10000) {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET
  );
  oAuth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });

  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

  // Strict query to avoid picking up year/time from headers
  // - unread
  // - subject contains "OTP Verification" (handles FW/RE implicitly)
  // - from sender noreply@fmbmelbourne.com.au
  // - newer_than to avoid stale emails
//   const query =
//     'is:unread subject:"OTP Verification" from:noreply@fmbmelbourne.com.au newer_than:3h';
    const query = 'is:unread subject:OTP newer_than:3h';


  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`🔎 Checking Gmail for OTP (attempt ${attempt}/${maxAttempts})...`);

    const res = await gmail.users.messages.list({
      userId: process.env.GMAIL_USER,
      maxResults: 10,
      q: query,
    });

    const messages = res.data.messages || [];
    // Process newest first
    for (const m of messages.reverse()) {
      const msg = await gmail.users.messages.get({
        userId: process.env.GMAIL_USER,
        id: m.id,
      });

      const body = decodeBody(msg.data.payload || {});
      // Tight regex: only capture digits after the OTP phrase
      const phraseRegex = /your\s+otp[^0-9]*?(\d{4,8})/i;
      const match = phraseRegex.exec(body);

      if (match && match[1]) {
        const otp = match[1];
        console.log(`✅ OTP found: ${otp}`);
        return { otp, messageId: m.id };
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
