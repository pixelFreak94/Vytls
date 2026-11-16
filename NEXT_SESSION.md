# Next session brief

Overwritten at every "save progress". Maximum 15 lines.

**Last saved:** 2026-11-16

**State:** 0.4.0 live on `main`. Phases 2 to 7 done: Today (`today.js`), counter (`kicks.js`), alerts A1 to A4 (`alerts.js`, lead only), History (`history.js`), Report with PDF via print, CSV, backup and restore (`report.js`). Safe auto-update in `sw.js`.

**Do next:**
1. Ask the owner for the iPhone results on 0.4.0; fix one concern per pass.
2. Phase 8: the in-world lost page `404.html` (manual §17.7). Then Phase 9: full-day test on her iPhone in airplane mode.

**Open with the owner:** auto-backup approach (DECISIONS 29); doctor's answers (`DEV_PLAN.md` §15); public or private repo.

**Watch out for:** any change to `alerts.js` or the end-of-count flow in `kicks.js` needs every trigger re-tested before commit. Each release bumps VERSION in `sw.js` and `js/app.js`; new files go in `sw.js` FILES. Saves are merged to `main` by Claude (DECISIONS 28).
