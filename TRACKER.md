# Tracker

Current state only. When a phase is finished, collapse its tasks into the single phase line. Phases are defined in `DEV_PLAN.md` §12.

**Pick up here:** Phase 1 is built and awaits the owner: merge the pull request, switch on GitHub Pages, check it on the iPhone from the Home Screen. Then Phase 2 (Today lifeline and sugar logging).

## Phases

| Phase | What | Status |
|---|---|---|
| 0 | Repo and project files (GitHub Pages moves to the end of Phase 1) | Done |
| 1 | Design foundation, app shell, navigation, data layer, Settings basics | Built; awaiting phone sign-off |
| 2 | Today screen and sugar logging | Not started |
| 3 | Ingredient list | Not started |
| 4 | Movement counter | Not started |
| 5 | Alerts | Not started |
| 6 | History | Not started |
| 7 | Report, CSV, backup, reminder guide | Not started |
| 8 | PWA: install and offline | Not started |
| 9 | Test on her iPhone, polish | Not started |

## Current phase tasks

Phase 1, built and tested in a phone-sized browser only:

- [x] `js/store.js`, tokens, base, motion, fonts with licence, icons, manifest
- [x] Loading ball, room colour and hour tint, corner web, nav capsule
- [x] App shell, navigation, install-first screen
- [x] Settings basics, doctor's number gate, optional sound
- [ ] Owner: merge the pull request into `main`
- [ ] Owner: switch on GitHub Pages (repo Settings → Pages → deploy from `main`, root)
- [ ] Owner: sign off on the iPhone, launched from the Home Screen

## Waiting on the owner

- Doctor's answers to the four questions in `DEV_PLAN.md` §15

## Known issues

- Some component keyframes sit in `css/components.css`; move them to `css/motion.css` in a tidy-up pass.
- `404.html` and the quiet note are not built yet.
