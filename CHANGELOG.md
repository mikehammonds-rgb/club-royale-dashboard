# Changelog

All notable project, data, workflow, and deployment changes should be recorded here. Dates use `YYYY-MM-DD`.

## 2026-09-19 — Reconciled canonical workflow and deployment records

- Verified GitHub `main` as the canonical source and directly confirmed that ChatGPT Site version 21 was successfully published on September 16, 2026 from the GitHub-backed source workflow.
- Updated `AI_STATE.md` and `PROJECT_MAP.md` with the verified production URL and publication state.
- Marked `NEXT_SESSION.md` and the former Claude artifact procedure as historical, and removed instructions that could send an agent back to the retired artifact publishing flow.
- Replaced the Claude fallback's fixed `~/Documents/club-royale-dashboard` path with any clean, current GitHub clone so the Mac folder remains optional.
- Documentation only: no offer, sailing, booking, application, schema, audience, or live deployment change.

## 2026-09-16 — Documented Claude's git push fallback

- Confirmed Claude's cloud sandbox cannot push directly to this repository (session-level git-proxy restriction, independent of credentials) and that routing git through Mike's Mac via the device-bridge local shell also does not currently work (`device_bash` reports the local sandbox fails to start, even after app restarts on current version 2.110.0).
- Decided the interim fallback: Claude commits locally and hands Mike a patch/file plus exact commands to run from his own working local clone (`~/Documents/club-royale-dashboard`), which has normal push access.
- Documented this in `WORKFLOW.md` (new section 8, "Git push access by agent") and `AI_STATE.md` so Codex/ChatGPT and any future Claude session both understand the current push-access split without re-diagnosing it.
- No offer, sailing, booking, or application data changed.

## 2026-09-16 — Mike offer refresh

- Live-checked Mike's signed-in Royal Caribbean Club Royale account (Claude, via browser automation on the user's authenticated session).
- `26TOR604` "Play Your Way" expired on schedule (Sep 15, 2026) and is no longer on the account. Removed from `data/club-royale-data.js`, `data/live-sailing-groups.js` (161 sailing groups removed), and `member-profiles.js` `returnedOffers`.
- `26TOR704` "Super Spins" changed: now carries $100 bonus FreePlay (previously `fp: 0`, no perk text). Redeem-by (2026-10-07), uses (2), and cabin options unchanged. Updated in `data/club-royale-data.js`.
- `26RCL904` "September Monthly Mix" and `26QFP204` "Autumn Showdown" unchanged. Note: `26QFP204` redeems by 2026-09-16 — same day as this check.
- No previously-removed offer returned this cycle.
- Result: 3 unique active codes (was 4), 4 usable slots (was 6), 459 expanded dated sailing rows (was 897) — this count was computed by actually running `app.js`'s own `expandRoyalSailingGroups` logic against the refreshed `data/live-sailing-groups.js`, not estimated.
- Updated `data/club-royale-data.js`, `data/live-sailing-groups.js`, `data/member-profiles.js` (Mike's `snapshot`, `portalCheck`, `returnedOffers`), `app/api/state/route.ts` (seed profile snapshot date, new idempotent `mike_snapshot_2026_09_16` migration/snapshot following the existing pattern), `README.md` (current-data counts), `AI_STATE.md`.
- Validation: ran `pnpm sync-static` and confirmed root/public byte-identical for all six data files plus `index.html`/`app.js`/`styles.css`. Independently recomputed (outside `app.js`, in a standalone script using the same expansion function) `uniqueOffers`, `usableSlots`, `sailingRows`, and confirmed every sailing group references an active offer, no invalid `uses`, no bad dates/nights, no `undefined`/`NaN` in offer data. Ran `pnpm build`: module transformation succeeds; build fails only at the already-documented `.openai/hosting.json` step, unchanged by this refresh.
- Tully: not checked this cycle (user scoped this refresh to Mike only).
- Deployment: not performed. Per the 2026-09-16 decision, this refresh stops at a verified push; publishing to ChatGPT Sites remains a separate manual step.

## 2026-09-16 — hosting and deployment correction

- Corrected the shared handoff documentation after verifying the supplied patch's intent against the actual `mikehammonds-rgb/club-royale-dashboard` repository.
- Clarified that no `.openai/hosting.json`, `wrangler.toml`, or equivalent hosting/project-ID configuration exists in this repository; that configuration lives in the ChatGPT/Codex environment.
- Recorded the decision that deployment stays manual through ChatGPT Sites. This repository is the shared code/data layer, and neither Claude nor Codex should infer, trigger, or claim a deployment from Git state alone.
- Removed the follow-up instruction to restore a hosting file in this repository. A successful push is not evidence that the live Site was published.
- Source data, database schema, and application behavior are unchanged. No portal access or deployment occurred.

## 2026-09-16

### GitHub migration and shared AI handoff

- Established `mikehammonds-rgb/club-royale-dashboard` on `main` as the canonical source of truth for ChatGPT/Codex, Claude, and human contributors.
- Added model-neutral root handoff files: `AGENTS.md`, `PROJECT_MAP.md`, `WORKFLOW.md`, `DATA_SCHEMA.md`, `AI_STATE.md`, and `CHANGELOG.md`.
- Documented the actual hybrid architecture: static dashboard sources synchronized into `public/`, Next.js redirect/API routes, Cloudflare D1 persistence, and browser-storage fallback.
- Mapped the current Mike/Tully offer, sailing, profile, booking, maintenance, PWA, and database files.
- Recorded the exact refresh lifecycle: preflight/pull, authenticated portal comparison, history preservation, canonical data updates, public sync, count and UI validation, production build, mobile/install refresh checks, state/changelog update, and commit/push to `main`.
- Documented current data shapes and the legacy-to-multi-member D1 migration state.
- Clarified that the current web app has install metadata but no service worker or guaranteed offline cache.
- Verified root/public static copies and current Finder counts (Mike: 897; Tully: 1,207). The production build completed module transformation but exposed a pre-existing missing `.openai/hosting.json` requirement in the Sites plugin; this is recorded in `AI_STATE.md` for follow-up.
- No offer, sailing, booking, or application behavior was changed by this documentation-only migration.
