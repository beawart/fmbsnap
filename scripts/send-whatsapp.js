require('dotenv').config();
const twilio = require('twilio');

(async () => {
  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

  // Build GitHub Pages URL
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
  const publicUrl = `https://${owner}.github.io/${repo}/homepage.png`;

  await client.messages.create({
    from: `whatsapp:${process.env.WHATSAPP_FROM}`,
    to: `whatsapp:${process.env.WHATSAPP_TO}`,
    body: '✅ Daily screenshot ready!',
    mediaUrl: [publicUrl]
  });

  console.log('📩 WhatsApp notification sent with image');
})();
