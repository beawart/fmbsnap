require('dotenv').config();
const twilio = require('twilio');

(async () => {
  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

  // GitHub provides a run URL via environment variables
const publicUrl = `https://${process.env.GITHUB_REPOSITORY.split('/')[0]}.github.io/${process.env.GITHUB_REPOSITORY.split('/')[1]}/homepage.png`;

await client.messages.create({
  from: `whatsapp:${process.env.WHATSAPP_FROM}`,
  to: `whatsapp:${process.env.WHATSAPP_TO}`,
  body: '✅ Daily screenshot ready!',
  mediaUrl: [publicUrl]
});

  console.log('📩 WhatsApp notification sent with artifact link');
})();
