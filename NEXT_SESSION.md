# Next session brief

Overwritten at every "save progress". Maximum 15 lines.

**Last saved:** 2026-11-21

**State:** 0.7.0 live on `main`. New: snacks logged under the meal they follow ("+ add snack" once a meal is finished; time required, foods, note). Data v3 (`meals[x].snacks`). Snacks before the test show on the sugar sheet, History card, report, CSV and the above-target foods list. The test time does not move. Alerts untouched.

**Do next:**
1. Ask the owner for her iPhone results on 0.7.0 (snack row prominence, "+ add snack" findability); fix one concern per pass.
2. If the doctor says a snack restarts the 2-hour clock, change `testAt` in `buildNodes` (`js/today.js`) and update DEV_PLAN §2 and DECISIONS 56.

**Open with the owner:** public or private repo; the quiet note; the doctor's answer on snacks and test timing.

**Watch out for:** any change to `alerts.js` or the counter's first tap, leave, end early or count-again flow in `kicks.js` needs every trigger re-tested before commit. Each release bumps VERSION in `sw.js` and `js/app.js`; new files go in `sw.js` FILES.
