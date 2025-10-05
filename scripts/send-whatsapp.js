require('dotenv').config();
const twilio = require('twilio');
const path = require('path');

(async () => {
  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

  // Twilio requires a public URL for media.
  // Simplest option: use GitHub artifact download URL or push to a storage bucket.
  // For demo, we’ll just send text + placeholder.
  await client.messages.create({
    from: `whatsapp:${process.env.WHATSAPP_FROM}`,
    to: `whatsapp:${process.env.WHATSAPP_TO}`,
    body: 'Here is today’s homepage screenshot 📸',
    // Replace with a real URL to the uploaded screenshot
    mediaUrl: ['https://example.com/path/to/homepage.png']
  });

  console.log('✅ Screenshot sent to WhatsApp');
})();
