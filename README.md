# Discipline Tracker

Jocko-style workout tracker PWA for the 4-week program (4 days per week). Log sets on your phone at the gym, then sync to a Google Sheet when you’re done.

## Features

- **Jocko program**: Week 1–4, Day 1–4 from a Google Sheet
- **Local-first logging**: Log and edit sets on device; tap **SYNC** to push to the sheet
- **Rest timer**: Auto-suggested rest by exercise type; Skip, +30s, and bell on/off
- **Metcon**: For time, AMRAP, EMOM with countdown and round tracking
- **Session notes**: Saved to the sheet
- **Offline**: Workout data stored locally; queued writes retry when back online

## Run locally

1. Open `index.html` in a browser, or serve the folder (e.g. `npx serve .`).
2. Ensure the app can reach your Google Apps Script URL (see below).

## Point at your Google Sheet

The app talks to a **Google Apps Script** web app that reads/writes your sheet.

1. Create a Google Sheet with the structure your script expects (Program, Log, Metcons, Day Notes).
2. In the script editor, deploy as a web app (Execute as: Me, Who has access: Anyone).
3. Copy the web app URL and set it in `index.html`:

   ```js
   const API = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";
   ```

Replace the existing `API` constant with your deployment URL.

## Deploy

Host the repo as static files (e.g. GitHub Pages, Netlify, Vercel). The app is a single-page PWA; no build step required.

## PWA icons

The app references `favicon.png`, `icon-180.png`, and in the manifest `icon-192.png` and `icon-512.png`. Add these files for “Add to Home Screen” and app icons, or remove/update the `<link>` tags and `manifest.json` icons if you don’t need them.
