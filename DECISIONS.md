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
| 16 | 2026-11-16 | The app runs in a browser tab as well as from the Home Screen; no install gate | Owner's call; on iPhone the two still keep separate data |
| 17 | 2026-11-16 | The app's day runs 4 am to 4 am | A late dinner's 2-hour test can fall after midnight; its card must still be on Today |
| 18 | 2026-11-16 | `REMAKE_App_Design_Manual.md` is the design authority; it overrides every project file, the Safety rules included; its §28 is approved | Owner's call: one source for how Vytls looks, moves and reads |
| 19 | 2026-11-16 | The maker's name appears nowhere in the app | Owner's call |
| 20 | 2026-11-16 | Alert headline is "Contact your doctor!" | Owner's wording (manual §28.12 #5) |
| 21 | 2026-11-16 | Logging is blocked until the doctor's number is saved | The alert's call button must always work |
| 22 | 2026-11-16 | App icon uses the favicon's colours: lavender capsule, blue circle, on cream | Owner's call |
| 23 | 2026-11-16 | Fonts are self-hosted in `fonts/`; no README | No requests to other sites; the project files already cover what a README would |
| 24 | 2026-11-16 | File layout merges DEV_PLAN with manual §23.1 (DEV_PLAN §3) | Manual's design files plus one file per screen; only `store.js` saves |
| 25 | 2026-11-16 | Alert supporting line: "If you can't reach them, go to the hospital." | Tells her what to do if the doctor doesn't answer |
| 26 | 2026-11-16 | Back swipe is disabled on the movement counter | A stray swipe must never interrupt a count; exits are "end early" or finishing |
| 27 | 2026-11-16 | Progress reads "n of 7"; meal steps are not counted; the ball rests on the earliest open step | Owner's call |
| 28 | 2026-11-16 | "save progress" includes merging into `main`; Claude merges the save's pull request without asking | Owner's call: the owner only tests, and does not handle merges |
| 29 | 2026-11-16 | Auto-backup to GitHub is on hold | Conflicts with the Privacy rules (no health data in the repo, no network after loading); options put to the owner |
| 30 | 2026-11-16 | Sound plays with the silent switch on; soundscape (pad, water, rare tones) pitched for the phone speaker | Owner's call; the manual's 55Hz bed was inaudible on iPhone |
| 31 | 2026-11-16 | Updates install themselves via `sw.js`, swapping only when safe (app hidden or just opened, no count running, nothing typed) | Owner wants auto-update without corrupting data |
| 32 | 2026-11-16 | Past days can be filled in where empty; entries already logged on a past day are locked. Today stays editable | Owner's call |
| 33 | 2026-11-16 | Type: headings (day parts, room titles) in Bebas Neue, all caps, self-hosted; step names Sora regular, 7% lighter; status label tight under its step; all other text lowercase with tight letter-spacing | Owner's call |
| 34 | 2026-11-16 | Foods are saved and shown with one capital letter; new entries use the iPhone keyboard's capitals and spelling correction | Owner's call; no offline dictionary, so spelling of older entries is not changed |
| 35 | 2026-11-16 | Counter hierarchy: the count leads ("of 5" smaller and greyed), the tap surface second, the title and times small and quiet | Owner's call: one focal point |
| 36 | 2026-11-16 | Past days in History stay locked once logged, overriding DEV_PLAN §7's "all editable" | Follows DECISIONS 32 |
| 37 | 2026-11-16 | The raise control (A3) also sits on the counter's finished screen | More cautious than the manual's minimum |
| 38 | 2026-11-16 | Doctor report exports as PDF through the iPhone print sheet (no PDF library), with period and six include filters, all on by default | Owner's request; keeps the no-packages rule |
| 39 | 2026-11-16 | Restore keeps the replaced data under `vytls.before-restore` and fills in any missing fields | A wrong file must never lose her readings |
| 40 | 2026-11-16 | Motion amplified about 2.5x (press, room change, reveal, hop, toggle, bloom); the nav pour has 8 rising bubbles; the tap surface pulses | Owner's call |
| 41 | 2026-11-16 | Today's header is the date ("16th of Nov/26", the day number large, light weight, heading ink); small text sits grouped, in heading ink | Owner's call |
| 42 | 2026-11-16 | History names the calendar month ("November 2026") with calendar dates per row and full meal names; the report shows dates as 14-Nov-26 (the CSV keeps YYYY-MM-DD for spreadsheets) | Owner's call: simpler to read |
| 43 | 2026-11-17 | Each phone asks once for a username: "Admin" for a test phone, her email for hers (changeable in Settings). A test phone makes no backups; a backup file only restores onto a phone with the same username; the phone keeps its own username on restore | Owner's call: test phones must never overwrite her record. Nothing leaves the phone, so the Privacy rules hold |
| 44 | 2026-11-17 | Every UI duration runs 15% faster than the manual's (overrides manual §28.2 "no faster variant"). Ambient loops and the alert's 500ms tap guard are unchanged | Owner's call |
| 45 | 2026-11-17 | Tapping a day in History opens a read-only card over History; its one button hands the day to Today for filling gaps | Owner's call; matches manual §28.10 |
| 46 | 2026-11-17 | Double-tap zoom is off; pinch zoom stays. Item reveal is flat (scale), sheets fade without sliding, the History panel has no live blur | Owner's call on zoom; the rest removes flicker on iPhone and follows manual §13.4 and §22 |
