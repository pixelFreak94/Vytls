# How to work on Vytls with Claude

For the owner. Claude's own rules are in `CLAUDE.md`, which Claude Code loads by itself.

## Starting a session

Open Claude Code in the cloud, pick the `pixelFreak94/Vytls` repo, and send:

> Continue Vytls.

Claude reads `NEXT_SESSION.md` and carries on from there. You do not need to explain the project again.

## Things you can say

| Say | What happens |
|---|---|
| **Continue Vytls** | Picks up from the last brief |
| **save progress** | Updates the tracker, decisions and plan, replaces the next-session brief, and pushes everything to GitHub |
| **Where are we?** | A few lines from the tracker: done, in progress, next |
| **Why did we…?** | Answered from the decision log |

Say **save progress** before you close a session, and whenever a session is getting long. A long session costs more tokens per message than a fresh one that starts from the brief.

## Keeping token use low

- One task per message, as specific as you can make it ("the food list should suggest past ingredients as I type", not "improve the food part").
- Batch small fixes into one message.
- Start a new session after each **save progress** instead of continuing a long one.

## If you also use a Claude Project

Paste this as the Project's instructions:

> This Project is for Vytls, an iPhone web app that logs daily blood-sugar readings and baby-movement sessions. The code and all project files are in the GitHub repo pixelFreak94/Vytls and are worked on in Claude Code, not here. Use this Project for discussion, wording and design questions only. Be brief: tokens are limited. Never state that a reading or a movement count is medically fine; refer those questions to the doctor.

## The project files

| File | What it is |
|---|---|
| `CLAUDE.md` | Claude's operating rules |
| `DEV_PLAN.md` | What is being built and how |
| `TRACKER.md` | What is done and what is next |
| `DECISIONS.md` | What was decided and why |
| `NEXT_SESSION.md` | The brief for the next session, replaced at every save |
