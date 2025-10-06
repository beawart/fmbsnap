require('dotenv').config();
const twilio = require('twilio');

(async () => {
  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

  // GitHub provides a run URL via environment variables
  const runUrl = `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;

  await client.messages.create({
    from: `whatsapp:${process.env.WHATSAPP_FROM}`,
    to: `whatsapp:${process.env.WHATSAPP_TO}`,
    body: `✅ Daily run complete! Homepage screenshot captured.\n\nDownload it here: ${runUrl}`
  });

  console.log('📩 WhatsApp notification sent with artifact link');
})();
