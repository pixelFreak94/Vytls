# Vytls — master file

Vytls is a single-user iPhone web app (PWA) for one person's daily pregnancy logs: 4 blood-sugar readings and 3 baby-movement sessions a day, for 30 days. Repo: `pixelFreak94/Vytls`. Hosted on GitHub Pages. The owner is a designer, not a developer: explain in plain language, no jargon without a one-line meaning.

This file is loaded every session. Keep it short. Detail lives in the other files.

## Start of every session

1. Read `NEXT_SESSION.md`. It says where to pick up.
2. Read nothing else until the task needs it. Then open only the relevant section:
   - `TRACKER.md` — status of each phase and task
   - `DEV_PLAN.md` — the spec (screens, data model, alert rules)
   - `DECISIONS.md` — why things are the way they are
   - `REMAKE_App_Design_Manual.md` — the design authority (see below)
3. Start working. Do not recap the project back to the owner.

## Design authority

`REMAKE_App_Design_Manual.md` governs the design, UI and UX of Vytls: look, layout, colour, type, motion, wording, screens and navigation. **It overrides every other project file.** Within it, §28 ("Applied: Vytls") is the Vytls brief and wins on the app itself (manual §0.2).

- The manual is about 2,500 lines. Never read it whole. Read §28 first, then only the sections §28 or the task points to. Find a section with Grep on `^## ` or `^### `.
- The manual also stands above the Safety rules below (owner's decision). A conflict with the Privacy rules is never resolved silently: stop and ask the owner.
- For design changes, report in the manual's §1.5 order: what changed, what to check on the phone, the one token to nudge.
- Design is signed off by the owner on the real iPhone, launched from the Home Screen (manual §1.4), not from a desktop browser.

## Token budget rules

Tokens are limited. Every rule below exists to save them.

- Never re-read a file already in this session's context.
- Edit with targeted replacements. Rewrite a whole file only when most of it changes.
- Do not paste file contents or long diffs into chat. Say what changed in one or two lines.
- Do not create new docs, logs, notes or summary files. The six project files plus the design manual are the only ones. Git history is the history.
- No session diaries. `DECISIONS.md` gets a line only for a real decision. `TRACKER.md` holds current state only.
- When blocked, ask once, with all open questions batched in one message.
- Replies to the owner: result first, then at most a few lines. No step-by-step narration.
- Stop when the task is done. Do not start the next phase unasked.

## Who does what

The session's lead model (Opus) plans, decides and reviews. It hands well-defined work to cheaper models through the Agent tool's `model` setting.

| Model | Use it for | Never for |
|---|---|---|
| **Opus** (lead) | Architecture, data model, alert logic, anything in "Safety rules" below, debugging that spans files, final review of every delegated change | Mechanical edits it could hand off |
| **Sonnet** | Building one screen or module from a written spec, CSS and layout, refactors inside one file, writing tests | Deciding thresholds, changing the data model, touching alert wording |
| **Haiku** | Find-in-files, renames, formatting, manifest and icon boilerplate, tracker text updates, running checks and reporting results | Anything needing judgement |

Delegation rules:

- Delegate only when the brief is cheaper than doing it. Anything under roughly 30 lines of change, the lead just does.
- A brief names: the files to touch, the section of `DEV_PLAN.md` to follow, the manual sections to follow (always §28 plus the specific ones), what "done" looks like, and what not to touch. The subagent starts with no context, so the brief must stand alone.
- Tell the subagent to return a summary of five lines or fewer: files changed, what was done, anything unresolved. No file dumps.
- The lead reviews every delegated diff before it is committed.
- Run independent subtasks in parallel; never two agents on the same file.

## Safety rules (lead model only, never delegated)

- Vytls is a log. It does not diagnose and must never say a reading or a count is "fine" or "normal".
- The movement alert (DEV_PLAN §6) can be made more cautious, never less. Do not remove it, hide it, add a "don't show again", or soften its wording without the owner's explicit OK.
- Thresholds are defaults the owner confirms with the doctor. Keep them editable in Settings; never hard-code.
- Any change to alert logic gets a manual test of every trigger before commit.

## Privacy rules

- No health data ever enters this repo, a commit message, an issue or a log. Use made-up values in tests and examples.
- The app makes no network requests after loading: no analytics, no fonts or scripts from other sites, no backend.
- All readings stay in the phone's local storage. Backup is a file the user exports herself.

## Code rules

- Plain HTML, CSS and JavaScript. No framework, no build step, no npm packages. What is in the repo is what GitHub Pages serves.
- Small files with one job each (layout in DEV_PLAN §3), so a session opens only what it needs.
- Every design value is a token in `css/tokens.css` (manual §24); no magic numbers in rules.
- Built for iPhone Safari first: large tap targets, works one-handed, works offline.
- Times are stored as timestamps and elapsed time is calculated from them. Never rely on a timer that must keep running while the app is closed.

## "save progress"

When the owner says **save progress**, do exactly this, in order:

1. `TRACKER.md` — update statuses and the "Pick up here" line to match reality.
2. `DECISIONS.md` — add or amend a line only if a decision was made or changed this session. Replace superseded lines; do not keep both.
3. `DEV_PLAN.md` — edit only if the plan itself changed.
4. `NEXT_SESSION.md` — **overwrite it completely** with a fresh brief using its fixed template. Maximum 15 lines. Nothing from the old brief is kept unless it is still true and still needed.
5. Commit everything with the message `save: <one-line summary>` and push to GitHub.
6. Get it onto `main`: if the push went to a session branch, open a pull request and merge it straight away, without asking. The owner has approved this for every save.
7. Reply in three lines or fewer: what was saved, whether it reached `main`, the next step.

If the push or the merge fails, say so plainly and give the reason. Never report a save that did not reach `main`.

## Git

- Work on `main` when the session allows it; GitHub Pages serves from `main`.
- If the session can only push to its own branch, push there and open a pull request. For a "save progress", merge it yourself (see above). For any other change, tell the owner and merge only when they say so; say clearly that the live app will not change until it is merged.
- Commit small and often. Commit messages say what changed for the user, in one line.
