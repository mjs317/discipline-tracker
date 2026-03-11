# Google Apps Script for Discipline Tracker

Copy the contents of `Code.gs` into your Google Apps Script project (script.google.com, bound to your Sheet or standalone).

## Sheet structure

- **Program** — columns: Week, Day, Day Title, Exercise, Target Sets, Target Reps, Gear, Notes (and any per-set columns like Set #, Target Weight if you use them).
- **Log** — columns: **Week**, **Day**, **Date**, **Exercise**, **Set #**, **Actual Weight**, **Actual Reps**.  
  The script finds/updates by (Week, Day, Date, Exercise, Set #) so multiple cycles stay as separate rows.
- **Metcons** — program rows (Week, Day, Metcon Name, Time Cap, Movements, etc.).
- **MetconResults** — created automatically when you log a metcon (Week, Day, Date, Time, Score, Notes).
- **Day Notes** — Week, Day, Date, Notes. Created automatically if missing.

Rename the constants at the top of `Code.gs` if your sheet names differ:

```js
var SHEET_PROGRAM = 'Program';
var SHEET_LOG = 'Log';
var SHEET_METCONS = 'Metcons';
var SHEET_METCON_RESULTS = 'MetconResults';
var SHEET_DAY_NOTES = 'Day Notes';
```

## Deploy

1. In the script editor: **Deploy** → **New deployment** → type **Web app**.
2. **Execute as**: Me.
3. **Who has access**: Anyone (so the PWA can call it).
4. Copy the web app URL into `index.html` as the `API` constant.

After updating the script, create a **New deployment** (or version and deploy) so the new code is used.
