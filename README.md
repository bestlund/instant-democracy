# Instant Democracy · prototype

A mobile prototype for Instant Democracy: small groups (a shared flat, a club, friends) turn a shared concern into a decision. Someone raises an issue, the group discusses it, votes, and the decision says who takes care of it.

Experience Design group project, University of Coimbra, 2026.

**Every design choice is explained in [`docs/DECISIONS.md`](docs/DECISIONS.md)**, linked to the user-test findings. Commit messages explain the why of each step.

## Run it

```bash
npm install
npm run dev
```

Open the link Vite prints. On a laptop the app shows inside an iPhone frame. On a phone (same Wi-Fi, use the "Network" link) it fills the screen.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel: **Add New → Project**, import the repository. Vercel detects Vite; no settings to change.
3. Every push to `main` deploys again.

## Testing tips

- **Reset demo** (next to the phone frame) or open `/#/reset` on a phone to clear votes and comments between testers.
- The test path: Home → Roommates → Broken fridge → vote.
- Votes and comments are saved in the browser, so a refresh keeps them.

## What's built

| Screen | Status |
| --- | --- |
| Home (groups, bell, + New) | Done |
| Notifications | Done |
| Group (Open / Decided, members) | Done |
| Discussion / poll with voting and comments | Done |
| Create discussion, poll, group; join | Next step |
| Group settings | Next step |

## Structure

```
src/
  screens/      Home, Group, Thread (discussion or poll), Notifications
  components/   PollCard, DeviceFrame (iPhone frame), sheets, buttons
  data/         types, seed data, state (store), selectors
  lib/          time and group helpers
docs/
  DECISIONS.md  why everything looks the way it does
```

Stack: Vite, React, TypeScript, Tailwind CSS, React Router, lucide icons, Outfit font.
