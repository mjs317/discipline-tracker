# Discipline Tracker

Jocko-style workout tracker PWA for the 4-week program (4 days per week). Log sets on your phone at the gym, then sync to a Google Sheet when you're done.

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

The app references `favicon.png`, `icon-180.png`, and in the manifest `icon-192.png` and `icon-512.png`. Add these files for "Add to Home Screen" and app icons, or remove/update the `<link>` tags and `manifest.json` icons if you don't need them.

## Starting a new cycle

When you finish the 4 weeks (Week 4, Day 4), a **Start new cycle** card appears at the bottom. Tap it to clear local workout data, return to Week 1 Day 1, and refetch the log. Your previous cycle stays on the sheet (each row has a date). To archive: in Google Sheets, copy the Log sheet to e.g. Log_Archive_2025-01 and optionally clear the Log sheet for a clean slate. The program (exercises) is unchanged.

### How the sheet keeps old and new cycle data

The app sends **Date** (workout date, e.g. `YYYY-MM-DD`) with every set when you sync. For old and new cycles to coexist, the **Google Apps Script** must treat **Date** as part of the row identity:

- When **writing** a set (`logSet`): find a row by **(Week, Day, Date, Exercise, Set #)**. If found, update that row; if not found, **append** a new row. Do not find by (Week, Day, Exercise, Set #) only, or the next cycle would overwrite the previous one.
- When **reading** the log (`getLog`): return all rows. The app filters to the current cycle (rows with Date on or after the cycle start date).

So the Log sheet will have multiple rows for the same Week/Day/Exercise/Set with different Date values—one row per cycle per set. No data is overwritten.
