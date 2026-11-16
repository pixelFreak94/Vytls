# Tracker

Current state only. When a phase is finished, collapse its tasks into the single phase line. Phases are defined in `DEV_PLAN.md` §12.

**Pick up here:** 0.2.1 is live (Phase 2 done, plus sound, auto-update, missed-day entry). Owner checks it on the iPhone; then Phase 3 (ingredient list).

## Phases

| Phase | What | Status |
|---|---|---|
| 0 | Repo and project files | Done |
| 1 | Design foundation, app shell, navigation, data layer, Settings basics | Built and live; awaiting phone sign-off |
| 2 | Today screen and sugar logging | Done (0.2.1); awaiting phone check |
| 3 | Ingredient list | Not started |
| 4 | Movement counter | Not started |
| 5 | Alerts | Not started |
| 6 | History | Not started |
| 7 | Report, CSV, backup, reminder guide | Not started |
| 8 | PWA: install and offline | Offline copy and safe auto-update done (`sw.js`); 404 page left |
| 9 | Test on her iPhone, polish | Not started |

## Current phase tasks

Phase 2, live as 0.2.1. Tested in a phone-sized browser only.

- [ ] Owner: check 0.2.1 on the iPhone: type hierarchy, sound (silent switch on), missed-day entry, auto-update
- [ ] Owner: approve the wording of the Today gate
- [ ] Owner: choose an auto-backup approach (on hold; conflicts with the Privacy rules, see DECISIONS 29)

## Waiting on the owner

- Doctor's answers to the four questions in `DEV_PLAN.md` §15
- Whether the repo stays public (free) or goes private (GitHub Pro, or a move to another free host before she starts logging)

## Known issues

- Some component keyframes sit in `css/components.css`; move them to `css/motion.css` in a tidy-up pass.
- `404.html` and the quiet note are not built yet.
- Mono labels keep their wide letter-spacing (`--tr-label`), set for capitals; may need tightening now that labels are lowercase.
- Movements cannot be filled in for a past day until Phase 4.
