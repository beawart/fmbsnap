require('dotenv').config();
const fs = require('fs');
const { google } = require('googleapis');

// Load credentials.json (ignored in .gitignore, never commit this!)
const creds = require('./credentials.json').installed || require('./credentials.json').web;

const oAuth2Client = new google.auth.OAuth2(
  creds.client_id,
  creds.client_secret,
  creds.redirect_uris[0]
);

// Read the one-time auth code from environment variable
const code = process.env.GMAIL_AUTH_CODE;

if (!code) {
  console.error('❌ Missing GMAIL_AUTH_CODE environment variable.');
  console.error('Run like: GMAIL_AUTH_CODE="4/0AX..." node scripts/get-token.js');
  process.exit(1);
}

oAuth2Client.getToken(code, (err, token) => {
  if (err) {
    console.error('❌ Error retrieving access token', err);
    process.exit(1);
  }

  console.log('✅ Refresh token:', token.refresh_token);

  // Save locally for testing (ignored by .gitignore)
  fs.writeFileSync('token.json', JSON.stringify(token, null, 2));
  console.log('💾 Saved token.json (ignored by git)');
});
