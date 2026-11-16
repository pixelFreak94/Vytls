# Next session brief

Overwritten at every "save progress". Maximum 15 lines.

**Last saved:** 2026-11-16

**State:** 0.3.0 live on `main`. Phases 2 to 5 done: Today lifeline (`js/today.js`), ingredients, movement counter (`js/kicks.js`, `css/counter.css`), alerts A1 to A4 with tap guard (`js/alerts.js`, `css/alerts.css`; lead only). Also sound, safe auto-update (`sw.js`), browser use, Bebas headings.

**Do next:**
1. Ask the owner for the iPhone results on 0.3.0 (counter feel, back swipe, alert, Call doctor); fix one concern per pass.
2. Phase 6: History (`DEV_PLAN.md` §7), past entries locked (DECISIONS 32, 36).

**Open with the owner:** auto-backup approach (DECISIONS 29); doctor's answers (`DEV_PLAN.md` §15); public or private repo.

**Watch out for:** any change to `alerts.js` or the end-of-count flow in `kicks.js` needs every trigger re-tested before commit. Each release bumps VERSION in `sw.js` and `js/app.js`; new files go in `sw.js` FILES. Saves are merged to `main` by Claude (DECISIONS 28).
