# Tracker

Current state only. When a phase is finished, collapse its tasks into the single phase line. Phases are defined in `DEV_PLAN.md` §12.

**Pick up here:** 0.7.0 (snacks) is live on `main`. Owner checks it on her iPhone from the Home Screen, and asks the doctor whether a snack should restart the 2-hour test clock.

## Phases

| Phase | What | Status |
|---|---|---|
| 0 | Repo and project files | Done |
| 1 | Design foundation, app shell, navigation, data layer, Settings basics | Done |
| 2 | Today screen and sugar logging | Done |
| 3 | Ingredient list | Done; snacks after a meal (0.7.0) |
| 4 | Movement counter | Done; back-swipe block untested on iPhone |
| 5 | Alerts | Done; alert rules unchanged; all four triggers re-tested on the clock-free counter (0.6.2) |
| 6 | History, with the day card | Done; card is a small table that edits in place; trends charts (0.6.2) |
| 7 | Report, CSV, backup and restore, reminder guide | Done; backups tied to the phone's username (0.5.0) |
| 8 | PWA: install, offline, safe auto-update, lost page | Done (0.5.0) |
| 9 | Test and polish | Polish done and a full offline day passed in a phone-sized browser (0.5.0); the real-iPhone day test is the owner's |

## Current tasks

- [ ] Owner: sign in on each phone (Admin on test phones, her email on hers)
- [ ] Owner: a full day of 7 entries on her iPhone from the Home Screen, airplane mode on; check that the flicker is gone, the History day card, and that sheets fade out
- [ ] Owner: on her iPhone, check 0.6.2: launch flicker, clock-free counter, day card, small red circle, notes, same as yesterday, trends
- [ ] Owner: auto-backup by email (DECISIONS 29): not possible without a server; the backup button already opens the share sheet (Mail)

## Waiting on the owner

- Doctor: should a snack before the test restart the 2-hour clock? (now it stays tied to the meal)
- Whether the repo stays public (free) or goes private (GitHub Pro, or a move to another free host before she starts logging)

## Known issues

- The quiet note (manual §16.13) is not built; it needs a sentence of intent from the owner, or can be left out.
