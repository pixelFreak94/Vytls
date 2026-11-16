# Tracker

Current state only. When a phase is finished, collapse its tasks into the single phase line. Phases are defined in `DEV_PLAN.md` §12.

**Pick up here:** Phase 1 is live at https://pixelfreak94.github.io/Vytls/ and awaits the owner's sign-off on the iPhone, launched from the Home Screen. Then Phase 2 (Today lifeline and sugar logging).

## Phases

| Phase | What | Status |
|---|---|---|
| 0 | Repo and project files | Done |
| 1 | Design foundation, app shell, navigation, data layer, Settings basics | Built and live; awaiting phone sign-off |
| 2 | Today screen and sugar logging | Not started |
| 3 | Ingredient list | Not started |
| 4 | Movement counter | Not started |
| 5 | Alerts | Not started |
| 6 | History | Not started |
| 7 | Report, CSV, backup, reminder guide | Not started |
| 8 | PWA: install and offline | Not started |
| 9 | Test on her iPhone, polish | Not started |

## Current phase tasks

Phase 1, built, merged to `main`, GitHub Pages on. Tested in a phone-sized browser only.

- [ ] Owner: sign off on the iPhone, launched from the Home Screen (checks in the pull request 2 hand-off)
- [ ] Owner: approve the proposed wording on the install page and the Today gate

## Waiting on the owner

- Doctor's answers to the four questions in `DEV_PLAN.md` §15
- Whether the repo stays public (free) or goes private (GitHub Pro, or a move to another free host before she starts logging)

## Known issues

- Some component keyframes sit in `css/components.css`; move them to `css/motion.css` in a tidy-up pass.
- `404.html` and the quiet note are not built yet.
