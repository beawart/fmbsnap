# Daily FMB Screenshot

App to create a snap of FMB menu for each day

This repository contains a GitHub Actions workflow that:

1. Logs into a website and captures a screenshot of the homepage.
2. Sends the screenshot to a WhatsApp group via Twilio.

## Setup

- Add the following secrets in your GitHub repo:
  - `WEBSITE_USER` / `WEBSITE_PASS`

## Run

- The workflow runs daily at 8 AM UTC.
- You can also trigger it manually from the Actions tab.
