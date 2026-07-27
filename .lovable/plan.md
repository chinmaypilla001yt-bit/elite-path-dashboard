
# Ascend Upgrade Plan

Big scope — I'll implement in ordered phases so each ships working before the next. UI, routing, animations, and glass/cyber aesthetic are preserved throughout.

## Heads-up on your Firebase config

- `apiKey: "@secret:GOOGLE_API_KEY"` — Firebase Web API keys are **not** secrets and must ship in the client bundle. I'll store the value in a `.env` (VITE_FIREBASE_API_KEY) that you paste once. Storing it in the Lovable secret vault won't work — Vite can't read runtime secrets in the browser.
- Before Google sign-in works you must add your Lovable preview domain (`*.lovable.app`) and any custom domain in **Firebase Console → Authentication → Settings → Authorized domains**, and enable Google + Email/Password providers.
- Firestore must be created (Native mode) and security rules set to allow each user to read/write only their own docs. I'll provide the rules; you paste them in Firebase Console.

## Phase 1 — Firebase foundation

1. Install `firebase`.
2. `src/lib/firebase.ts` — initialize app, `auth`, `db` from env config.
3. `src/hooks/use-auth.ts` — `onAuthStateChanged` subscription, loading state, `user` context.
4. `src/routes/__root.tsx` — wrap tree in AuthProvider.
5. `src/routes/auth.tsx` — glass-styled sign-in page (Google + Email/Password) matching current design.
6. Route guard — redirect unauthenticated users to `/auth`; render app shell only after auth resolves. Loading spinner in current aesthetic.

## Phase 2 — Firestore data layer (replaces localStorage)

Reusable services in `src/services/`:
- `firestore.ts` — generic collection helpers scoped to `users/{uid}/<collection>`.
- `tasks.ts`, `studySessions.ts`, `calendarEvents.ts`, `goals.ts`, `habits.ts`, `journal.ts`, `profile.ts`, `stats.ts` (XP/level).

New hook `src/hooks/use-firestore-collection.ts` — same shape as current `useLocalCollection` (items/add/update/remove) but backed by `onSnapshot`. Drop-in swap so every page keeps working.

One-time migration on first login: read all `ascend:*` keys from localStorage, batch-write to Firestore under the user's UID, then clear localStorage and set a `migrated: true` flag on the profile.

## Phase 3 — Task upgrade

- Remove P0/P1/P2 priority field.
- Add `estimatedMinutes` field with presets (15/30/45/60/120) + custom.
- On complete → award XP, add to today's "productive minutes", feed weekly analytics.

## Phase 4 — Study Timer

Rewrite `src/routes/study.tsx`:
- Create multiple concurrent timers (subject + planned duration).
- Each timer: independent countdown (interval driven by end-timestamp so pause/refresh survives), Start / Pause / Resume / Stop controls.
- On completion → toast notification + browser Notification API (with permission prompt) + auto-save a completed `studySessions` doc with actual minutes.
- Dashboard study hours pulls live from `studySessions`.

Active timers persisted in Firestore so they survive refresh across devices.

## Phase 5 — Calendar

Rewrite `src/routes/calendar.tsx`:
- Monthly grid view (custom, matches design — no new heavy dep).
- Fields: title, date, time, category, priority, description.
- Dots on dates with events; today highlighted; clicking a date opens a panel listing that day's events with edit/delete.
- Live clock in header.
- Each event card shows "XX Days Left" / "Today" / "Completed" derived from date.
- Dashboard widget: next N events, sorted by soonest, showing title/date/days-left only.

## Phase 6 — XP & Level system

- Formula: level N requires `100 * (2^(N-1) - 1)` total XP (matches 0/100/300/700/1500…).
- `useXP()` hook derives level, xpIntoLevel, xpForNextLevel, progress% from lifetime XP stored on profile.
- Task completion adds `xp` to lifetime total; level recomputes reactively.
- Dashboard hero + sidebar reflect immediately via Firestore snapshot.

## Phase 7 — Dashboard rework

- Hero: replace "Mission Control Day X" with live date + live clock (updates every second).
- Charts (Recharts, already installed): tasks completed / productive hours / weekly XP / daily study hours — last 7 days, animated area/bar charts with gradients + tooltips, matching cyber/emerald/gold accents already in the design system.
- Upcoming events widget from calendar.
- All widgets subscribe to Firestore snapshots.

## Technical notes

- Route guard uses TanStack `beforeLoad` reading auth context; loading state renders the existing glass shell with a spinner so there's no flash.
- Firestore reads use `onSnapshot` so multi-device sync is automatic.
- Timestamps stored as Firestore `Timestamp`; converted at the service boundary so components stay unchanged.
- Firestore security rules I'll give you:
  ```
  match /users/{uid}/{document=**} {
    allow read, write: if request.auth != null && request.auth.uid == uid;
  }
  ```

## What I need from you before I start

1. Confirm you'll (a) paste the Firebase Web API key into a `.env` var (I'll create the file), (b) enable Google + Email/Password in Firebase Console, (c) add your Lovable domain to Authorized domains, (d) create Firestore and paste the rules I provide.
2. Approve this plan (or tell me which phases to drop / reorder). Given the size, I'd suggest shipping Phases 1–2 first, verifying login + data works, then continuing.

Reply "go" to proceed with all phases, or tell me which to prioritize.
