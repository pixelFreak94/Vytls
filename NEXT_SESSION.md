# Next session brief

Overwritten at every "save progress". Maximum 15 lines.

**Last saved:** 2026-11-19

**State:** 0.6.0 live on `main`. New: dish names per meal (a saved dish brings back its ingredients; data shape v2), dishes and ingredients renamed or removed in Settings, "leave" on the movement counter (count keeps running, A1 unchanged), unfinished counts can be counted again or cleared, History day card edits in place. All four alert triggers re-tested in a phone-sized browser.

**Do next:**
1. Ask the owner for her iPhone results on 0.6.0; fix one concern per pass.
2. Her answer on auto-backup by email (see Open). Do not build it unasked.

**Open with the owner:** auto-backup by email: the app cannot send mail by itself without a server (Privacy rules); the closest is the backup button opening the share sheet with Mail. Public or private repo; the quiet note.

**Watch out for:** any change to `alerts.js` or the counter's end, leave or count-again flow in `kicks.js` needs every trigger re-tested before commit. Each release bumps VERSION in `sw.js` and `js/app.js`; new files go in `sw.js` FILES.
