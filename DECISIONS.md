# Decisions

One line per decision. When a decision changes, replace its line; do not keep the old one.

| # | Date | Decision | Why |
|---|---|---|---|
| 1 | 2026-11-15 | Build a custom tracker instead of using App Store apps | No app covers both logs in her exact routine; most kick counters assume 10 movements and lock history or reports behind subscriptions |
| 2 | 2026-11-15 | One app for both logs | One place to open 7 times a day; one report for the doctor |
| 3 | 2026-11-15 | Web app added to the Home Screen, not a native app | No App Store, no Mac needed, free, buildable entirely in Claude Code |
| 4 | 2026-11-15 | Host on GitHub Pages from `pixelFreak94/Vytls` (public repo) | Free; the repo holds only code, never readings |
| 5 | 2026-11-15 | Data stays on the phone, with file backup and restore | Keeps health data off any server and needs no account; backup covers a lost or reset phone |
| 6 | 2026-11-15 | Plain HTML, CSS and JavaScript, no framework or build step | Less to read and maintain, so fewer tokens per session; nothing to install |
| 7 | 2026-11-15 | Units are mg/dL | Her meter's units |
| 8 | 2026-11-15 | Default targets 95 fasting and 120 two hours after meals, editable | Common guideline targets for pregnancy; her doctor's numbers override |
| 9 | 2026-11-15 | Ingredient list on each after-meal test, none on fasting | Owner's request, to see which foods precede high readings; no meal precedes the fasting test |
| 10 | 2026-11-15 | Movement goal is 5 within 60 minutes after each meal, editable | Owner's instruction; window to be confirmed with her doctor |
| 11 | 2026-11-15 | Three alert triggers: goal not reached, slower than her usual, and a button she can press herself | Owner requires an alert whenever movements are fewer than usual; the button covers times outside a session |
| 12 | 2026-11-15 | No in-app reminders; use iPhone alarms | A web app cannot reliably notify while closed |
| 13 | 2026-11-15 | Work in Claude Code in the cloud; Opus leads, Sonnet and Haiku take delegated work | Owner cannot run Claude Code locally; cheaper models for routine work saves tokens |
| 14 | 2026-11-15 | Six project files only, with one overwritten next-session brief | Owner wants no backlog of redundant history; git keeps the history |
