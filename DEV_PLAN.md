# Vytls — development plan

The spec. Sections are numbered so sessions can open one section instead of the whole file. Reasons for choices are in `DECISIONS.md`; progress is in `TRACKER.md`.

## 1. What it is

A web app added to an iPhone Home Screen. One user. Two logs, tracked in 30-day months: when day 30 ends, the next month starts by itself from day 31, with nothing to set up.

| Log | When | What is recorded |
|---|---|---|
| Blood sugar | On waking after an 8-hour fast, then 2 hours after breakfast, lunch and dinner (4 a day) | Reading in mg/dL, time, and for the three after-meal tests the list of ingredients eaten |
| Baby movements | After each of the 3 meals (after eating or drinking anything except water) | Start time, each movement as a tap, time taken to reach 5 |

Outputs: a 30-day history, flags on out-of-target readings, an alert when movements are low, and a report for the doctor.

Out of scope: accounts, cloud sync, meter connection, calorie or carb counting, medical advice, push notifications.

## 2. How the day works

**First run:** if the app is opened in Safari rather than from the Home Screen, it shows only an "Add to Home Screen first" screen with the steps, and does not accept entries. On iPhone the Safari copy and the Home Screen copy keep separate data, so anything logged in Safari would be left behind.

The Today screen has four cards in time order.

1. **Fasting** — one field for the reading, plus a yes/no "fasted 8 hours".
2. **Breakfast**, **Lunch**, **Dinner** — each card has three steps, done in order through the meal:
   1. **Meal** — add ingredients one at a time; tap "Meal finished" to stamp the time.
   2. **Movements** — "Start counting" opens the counter (§5).
   3. **Sugar** — the card shows "Test at HH:MM" (meal finished + 2 hours); enter the reading when taken.

**Typo guard:** a sugar reading below 40 or above 400 asks "Is this right?" before it is saved.

Each step shows one of three states: to do, due now, done. A progress line at the top reads "n of 7 logged today". Steps can be done out of order and any entry can be edited or deleted afterwards, with its time adjustable, in case she logs late.

## 3. Technical shape

- Plain HTML, CSS and JavaScript. No framework, no build, no packages.
- Installable PWA: a manifest and a service worker so it opens full-screen and works offline.
- Hosted on GitHub Pages from the `main` branch root.
- Data in the phone's `localStorage` under one key, as one JSON object. A month of data is a few hundred kilobytes at most.
- Every release changes the version number in `sw.js`, which makes the phone drop its old offline copy and load the new one. The same version number is shown in Settings, so it is easy to check which version she is running.

File layout:

```
index.html            app shell, one <section> per screen
css/app.css           all styles
js/store.js           load, save, migrate the data object; nothing else touches storage
js/today.js           Today screen and meal cards
js/kicks.js           movement counter and session timing
js/alerts.js          every alert rule and the alert screen (lead model only)
js/history.js         30-day grid and day detail
js/report.js          doctor report, CSV, backup and restore
js/settings.js        settings screen
js/app.js             navigation between screens, start-up
manifest.webmanifest  name, icons, colours
sw.js                 offline cache
icons/                app icons
```

## 4. Data model

```
{
  version: 1,
  settings: {
    startDate: "YYYY-MM-DD",
    lengthDays: 30,
    targets: { fasting: 95, afterMeal: 120 },      // mg/dL, flag when above
    kicks: { goal: 5, windowMinutes: 60 },
    doctorPhone: ""                                // for the alert's call button
  },
  days: {
    "YYYY-MM-DD": {
      fasting: { value, at, fasted8h },
      meals: {
        breakfast | lunch | dinner: {
          foods: ["rice, 1 cup", "chicken"],
          finishedAt,
          sugar: { value, at },
          kicks: { startedAt, taps: [timestamps], endedAt, outcome }
        }
      }
    }
  },
  foodHistory: ["rice, 1 cup", ...],                // for suggestions, most used first
  alerts: [{ at, rule, meal }]                      // record of alerts shown
}
```

- `outcome` is one of `reached`, `window-expired`, `ended-early`.
- All times are stored as timestamps. Everything shown on screen is calculated from them.
- `version` lets `store.js` upgrade old data if the shape changes. Never change the shape without a migration.

## 5. Movement counter

- Full-screen, one very large "Felt a movement" button, the count ("3 of 5"), time since start, and an undo for a mistaken tap.
- The session survives closing the app: on reopening, elapsed time is worked out from `startedAt`.
- Ends when the 5th tap lands (outcome `reached`, time taken is saved) or when the window passes (outcome `window-expired`).
- "End early" asks for confirmation and saves outcome `ended-early`. An early end with fewer than 5 is not counted as a completed session, is shown as incomplete in History, and triggers A4 (§6).
- Only one session can run at a time.

## 6. Alerts (safety-critical)

One alert screen, full-screen red, cannot be missed: **"Contact your doctor or go to the hospital now."** It has a "Call doctor" button (dials the number from Settings), a short line saying not to wait for the next session, and a "Close" that needs a deliberate tap. Every alert shown is recorded in `alerts`.

Triggers:

| # | Trigger | Rule |
|---|---|---|
| A1 | Goal not reached | A session's window passes with fewer than 5 taps. Fires when the window ends if the app is open, otherwise the moment the app is next opened. |
| A2 | Slower than her usual | A session reaches 5, but took more than twice her median time over her last 7 completed sessions, and more than 15 minutes longer than that median. Needs at least 5 completed sessions before it can fire. |
| A3 | She notices it herself | A permanent "Baby moving less than usual?" button on Today and on the counter opens the alert screen directly. |
| A4 | Ended early below the goal | Ending a session early with fewer than 5 taps asks "Is the baby moving less than usual?". Yes opens the alert screen; No closes the session as incomplete. |

Notes:

- A2's numbers are starting defaults chosen by us, not medical thresholds. They are to be confirmed with her doctor and are adjustable in Settings.
- A web app cannot sound an alarm while closed. A1 therefore depends on her reopening the app; the session card on Today shows a red "Window passed" state so it is seen immediately.
- Sugar readings above target are highlighted in amber, with no alert screen. Whether to add a "low reading" flag, and at what number, is an open question for her doctor.

## 7. History

- A 30-row grid for the current month, one row per day, seven cells: fasting, then sugar and movements for each meal. Arrows switch to earlier months.
- Sugar cells show the number; amber when above target. Movement cells show minutes to reach 5; red for `window-expired`; grey for missing or incomplete.
- Tapping a day opens that day's detail with foods listed, all editable.
- A "foods before high readings" list: ingredients ranked by how often they appear in meals followed by an above-target reading, with the count shown beside how often each was eaten overall.

## 8. Report and backup

- **Doctor report** — a print-styled page (iPhone Share → Print → save as PDF), one month at a time with the month selectable: date range, the grid, averages per test slot, number of above-target readings, movement sessions with outcomes, alerts shown.
- **CSV** — one row per day, for opening in a spreadsheet.
- **Backup** — exports the whole data object as a file through the iPhone share sheet. **Restore** loads it back after a confirmation that it replaces current data.
- Today shows a gentle "Back up your data" line when the last backup is over 7 days old.

## 9. Settings

App version, start date, sugar targets, movement goal and window, A2 numbers, doctor's phone number, backup and restore, and "Erase all data" behind a typed confirmation.

## 10. Reminders

The app cannot remind her while closed. Setup guide for the owner (written in Phase 7): iPhone Clock alarms for the fasting test, and a note that each after-meal test time is shown on its card once "Meal finished" is tapped.

## 11. Design

- One-handed use, thumb reach: main actions in the lower half of the screen.
- Tap targets at least 48 px; the movement button fills most of the screen.
- Calm, light, high-contrast. Red is reserved for alerts only; amber for above-target readings.
- Numeric keypad for readings. Respects iPhone text-size settings, the notch and the home indicator.
- Colour is never the only signal: flags also carry an icon or a word.

## 12. Build phases

| Phase | Delivers | Lead / delegate |
|---|---|---|
| 0 | Repo, the six project files, GitHub Pages switched on | Lead |
| 1 | App shell, navigation, `store.js`, Settings basics, install-first screen | Lead designs the data layer; Sonnet builds the shell |
| 2 | Today screen: fasting card, meal cards, sugar entry, target flags | Sonnet from §2 |
| 3 | Ingredient list with suggestions | Sonnet |
| 4 | Movement counter and session timing | Sonnet builds the UI from §5; lead reviews timing |
| 5 | Alerts A1–A4 and the alert screen | Lead only |
| 6 | History grid, day detail, foods-before-highs list | Sonnet |
| 7 | Report, CSV, backup and restore, reminder guide | Sonnet; Haiku for the guide's formatting |
| 8 | PWA: manifest, icons, offline cache | Haiku for boilerplate; lead checks the cache logic |
| 9 | Test on her iPhone, fix, polish | Lead triages; fixes delegated by size |

Each phase ends with the app working and deployed, so she can start using it from the end of Phase 2 while the rest is added.

## 13. Testing

- Every phase: open in a phone-sized browser window, run the phase's flows, reload to confirm data survives.
- Alerts: each trigger tested by hand with made-up data, including closing the app mid-session and reopening after the window.
- Data safety: backup, erase, restore, and compare.
- Before calling it finished: a full day of 7 entries on the real iPhone, installed from the Home Screen, with airplane mode on.

## 14. Risks

| Risk | Handling |
|---|---|
| Phone storage cleared, app deleted or phone replaced | Weekly backup prompt; restore from file |
| Entries made in Safari before installing are left behind | Install-first screen blocks logging in Safari (§2) |
| Phone keeps showing an old version after a fix | Version number changed on every release and shown in Settings (§3) |
| A1 not seen because the app stays closed | Red state on Today on next open; A3 button; the alert text itself says not to wait for the app |
| A2 numbers wrong for her | Adjustable; flagged for doctor confirmation; A1 and A3 do not depend on them |
| Late or forgotten entries | Every entry's time is editable; missing cells show clearly in History |
| A bad update breaks the app mid-month | Small commits; data shape versioned; test before pushing to `main` |

## 15. Open questions for her doctor

1. Are 95 (fasting) and 120 (2 hours after meals) the targets to use?
2. Is "5 movements within 1 hour after a meal" the right goal and window?
3. Should low sugar readings be flagged, and below what number?
4. Which phone number should the alert's call button dial?
