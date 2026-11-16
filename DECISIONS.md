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
| 11 | 2026-11-15 | Four alert triggers: goal not reached, slower than her usual, a button she can press herself, and a question when a session is ended early below the goal | Owner requires an alert whenever movements are fewer than usual; the button covers times outside a session; the question closes the gap of quitting a count early |
| 12 | 2026-11-15 | No in-app reminders; use iPhone alarms | A web app cannot reliably notify while closed |
| 13 | 2026-11-15 | Work in Claude Code in the cloud; Opus leads, Sonnet and Haiku take delegated work | Owner cannot run Claude Code locally; cheaper models for routine work saves tokens |
| 14 | 2026-11-15 | Six project files only, with one overwritten next-session brief | Owner wants no backlog of redundant history; git keeps the history |
| 15 | 2026-11-15 | Tracking runs in 30-day months that roll over automatically | Owner's instruction: after day 30 it just moves to the next month |
| 16 | 2026-11-15 | Logging is blocked in Safari until the app is added to the Home Screen | The two keep separate data on iPhone; entries made in Safari would be lost |
| 17 | 2026-11-16 | The app's day runs 4 am to 4 am | A late dinner's 2-hour test can fall after midnight; its card must still be on Today |
| 18 | 2026-11-16 | `REMAKE_App_Design_Manual.md` is the design authority; it overrides every project file, the Safety rules included; its §28 is approved | Owner's call: one source for how Vytls looks, moves and reads |
| 19 | 2026-11-16 | The maker's name appears nowhere in the app | Owner's call |
| 20 | 2026-11-16 | Alert headline is "Contact your doctor!" | Owner's wording (manual §28.12 #5) |
| 21 | 2026-11-16 | Logging is blocked until the doctor's number is saved | The alert's call button must always work |
| 22 | 2026-11-16 | App icon uses the favicon's colours: lavender capsule, blue circle, on cream | Owner's call |
| 23 | 2026-11-16 | Fonts are self-hosted in `fonts/`; no README | No requests to other sites; the project files already cover what a README would |
| 24 | 2026-11-16 | File layout merges DEV_PLAN with manual §23.1 (DEV_PLAN §3) | Manual's design files plus one file per screen; only `store.js` saves |
