# Daily FMB Screenshot to WhatsApp

App to create a snap of FMB menu for each day

This repository contains a GitHub Actions workflow that:

1. Logs into a website and captures a screenshot of the homepage.
2. Sends the screenshot to a WhatsApp group via Twilio.

## Setup

- Add the following secrets in your GitHub repo:
  - `WEBSITE_USER` / `WEBSITE_PASS`
  - `TWILIO_SID` / `TWILIO_AUTH`
  - `WHATSAPP_FROM` (Twilio sandbox number, e.g. `whatsapp:+14155238886`)
  - `WHATSAPP_TO` (your group or personal number)

## Run

- The workflow runs daily at 8 AM UTC.
- You can also trigger it manually from the Actions tab.
