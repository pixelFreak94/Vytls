# Next session brief

Overwritten at every "save progress". Maximum 15 lines.

**Last saved:** 2026-11-17

**State:** 0.5.0 live on `main`. All phases built: username sign-in (`signin.js`; Admin = test phone, no backups; backups restore only onto the same username), History day card, flicker fixes, motion 15% faster, double-tap zoom off, sheets fade out, lost page `404.html` served offline by `sw.js`.

**Do next:**
1. Ask the owner for her real-iPhone day test results on 0.5.0; fix one concern per pass.
2. Nothing else is planned. Do not start new features unasked.

**Open with the owner:** auto-backup approach (DECISIONS 29); public or private repo. Quiet note dropped (DECISIONS 49).

**Watch out for:** any change to `alerts.js` or the end-of-count flow in `kicks.js` needs every trigger re-tested before commit. Each release bumps VERSION in `sw.js` and `js/app.js`; new files go in `sw.js` FILES. Saves are merged to `main` by Claude (DECISIONS 28).
