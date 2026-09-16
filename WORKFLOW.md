# Working and Refresh Workflow

## 1. Preflight for every change

1. Read all six root handoff documents listed in `AGENTS.md`.
2. Run `git status`, switch to `main`, and run `git pull --ff-only origin main`.
3. Stop and resolve unexpected local changes before touching overlapping files.
4. Confirm the requested member and refresh scope. Never mix Mike and Tully data.
5. Record the live portal check time, member, source, active code count, usable slot count, and whether each offer's sailing table and details were opened.
6. Never commit credentials, session data, browser cookies, or raw private exports. Do not trigger a portal download without the user's approval.

## 2. Capture and compare the live Club Royale state

1. Open the authenticated Royal Caribbean Club Royale offers page for the requested member.
2. Compare every live tile with both the current active offers and historical records. Count repeated instances of the same code; a code shown twice is two usable slots.
3. Classify each code as unchanged, changed, new, returned, or removed. A removed code can later return.
4. Open offer details and the issued offer's actual “View sailings” link. Preserve its instance-specific URL rather than fabricating a bare code URL.
5. Capture offer name, redeem-by date, usable copies, FreePlay/perk text, benefit, cabin choices, and whether it is a cruise comp (`comp`).
6. Capture each eligible sailing row as an itinerary group: offer code, date lines, itinerary, link, port, room category, and ship.
7. Re-check standing or saved searches affected by the refresh, including the built-in Christmas Day search. “Aboard on” means the date falls within the cruise interval, including a return-date match that docks that morning.

## 3. Update canonical data without erasing history

1. Save the verified active offers in the correct canonical file:
   - Mike: `data/club-royale-data.js`
   - Tully: offer section of `data/tully-data.js`
2. Generate or update the member's sailing groups:
   - Mike: use `maintenance/build_live_offer_snapshot.mjs <verified-input.json> data/live-sailing-groups.js YYYY-MM-DD` when the captured input matches that builder's contract.
   - Tully: use `maintenance/build_member_data.mjs <verified-input.json> data/tully-data.js`, after updating its embedded offer metadata from verified data.
3. Update the member in `data/member-profiles.js`: profile/tier values, `snapshot`, `portalCheck` counts and arrays, returned codes, and explanatory note.
4. Preserve removed/expired history in `CHANGELOG.md`, `AI_STATE.md` when still operationally relevant, and an append-only D1 snapshot/migration when cloud history must be exposed. Do not leave removed codes in active offer/Finder data.
5. Preserve booked-offer snapshots such as `data/mike-26pas603.js`; a booked offer can remain historically important after it leaves the active account.
6. If booking facts changed, update both `data/booked-cruises.js` and the matching fallback/seed booking in `app/api/state/route.ts`. Add an idempotent `app_metadata`-guarded migration when existing D1 rows also need the correction.
7. For a new refresh history record, add an idempotent `member_offer_snapshots` insert in `app/api/state/route.ts` or a migration. Never overwrite earlier snapshots.
8. Update `README.md` counts/date if its “Current data” section changed.

## 4. Synchronize deployable static files

Run:

```sh
pnpm sync-static
```

This copies root `index.html`, `app.js`, `styles.css`, and `data/*.js` to `public/`. Do not manually maintain divergent public copies.

Verify all pairs are byte-identical:

```sh
cmp index.html public/index.html
cmp app.js public/app.js
cmp styles.css public/styles.css
for file in data/*.js; do cmp "$file" "public/data/$(basename "$file")"; done
```

## 5. Validate the refresh

1. Validate the data mechanically: parse every data file, confirm expected offer codes and object keys, expand grouped dates with the same logic as `app.js`, and reconcile unique offers, usable slots, itinerary groups, and dated-sailing counts with `portalCheck`.
2. Confirm every sailing references an active offer, except explicitly preserved historical files that are not wired into `sailingGroups`.
3. Confirm dates are valid ISO results, itinerary text contains a parseable night count, cabin labels match UI expectations, and no generated text contains `undefined` or `NaN`.
4. Confirm Mike and Tully remain separate after switching accounts: offers, Finder results, bookings, saved searches, statuses, and snapshots must not leak between members.
5. Exercise the visible flows on desktop and a mobile viewport: Overview, all Offers, duplicate slots, default Florida/Oasis Finder, date search, Christmas preset, saved search, comparison, Trips, notes/checklist, and member switching.
6. Run the production build:

```sh
pnpm install --frozen-lockfile
pnpm build
```

`pnpm build` runs `sync-static` first. Fix build, runtime, or browser-console errors before publishing.

## 6. Mobile/PWA refresh behavior

The current project provides a web-app manifest, standalone display mode, Apple metadata, and icons, but no service worker. Therefore:

1. Always sync `public/` and complete a new deployment after data/code changes.
2. Test the normal hosted URL while online at a mobile viewport.
3. Test an installed Home Screen/standalone copy by fully closing it, reopening it online, and navigating between views. If an older response remains in the browser cache, reload the hosted page or clear that site's cached web data, then reopen the installed app.
4. Do not claim offline support or background refresh. A true offline cache requires a deliberately added and tested service worker.
5. Confirm `start_url` (`/#overview`), scope (`/`), icons, theme color, and Apple touch behavior after any path/domain change.

## 7. Record, commit, and push

1. Update `AI_STATE.md` with the new verified snapshot, architecture/deployment changes, open constraints, and migration status.
2. Add a dated `CHANGELOG.md` entry containing the member, source date, before/after counts, important code changes, history preserved, and checks run.
3. Review `git diff` and `git status`; confirm no raw capture, secret, or unrelated file is staged.
4. Commit to `main` with a concise message such as `Refresh Mike Club Royale snapshot for YYYY-MM-DD`.
5. Push to `origin main`, fetch/inspect the remote, and confirm local `HEAD` equals `origin/main`.
6. Stop after the verified push unless Mike separately requests a ChatGPT Sites publish. This repository has no hosting/project-ID configuration, so an agent working only from this repo cannot identify or publish the live Site.
7. Report the commit hash, live snapshot counts, validation/build outcome, and that deployment remains pending unless the live Site was actually checked and manually published. Never infer deployment from a successful build or push.
