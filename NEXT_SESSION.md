# Next session brief

Overwritten at every "save progress". Maximum 15 lines.

**Last saved:** 2026-11-19

**State:** 0.6.2 live on `main`. Since 0.5.0: dish names (data v2), foods editable in Settings, counter with no clock (first tap starts a hidden 60-min window; leave, end early, undo at the bottom), unfinished counts redone or cleared, History day card as a small table that edits in place, trends charts (`js/trends.js`), notes, same as yesterday, small red circle for A3 on Today, cream launch screens (`icons/splash/`). All four alert triggers re-tested.

**Do next:**
1. Ask the owner for her iPhone results on 0.6.2; fix one concern per pass.
2. If the launch flicker remains, iOS may need the icon re-added: back up first, since removing the icon deletes her data.

**Open with the owner:** public or private repo; the quiet note.

**Watch out for:** any change to `alerts.js` or the counter's first tap, leave, end early or count-again flow in `kicks.js` needs every trigger re-tested before commit. Each release bumps VERSION in `sw.js` and `js/app.js`; new files go in `sw.js` FILES.
