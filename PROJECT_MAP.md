# Project Map

## Runtime shape

The deployed product is a mobile-first static dashboard hosted through a Next.js/vinext application on Cloudflare:

- `app/page.tsx` redirects `/` to `/index.html`.
- `public/index.html`, `public/app.js`, `public/styles.css`, and `public/data/*.js` are the browser-delivered dashboard.
- Root `index.html`, `app.js`, `styles.css`, and `data/*.js` are the editable static sources. `scripts/sync-static.mjs` copies them into `public/`.
- `app/api/state/route.ts` supplies optional cloud persistence through Cloudflare D1. The dashboard falls back to seed data and browser `localStorage` when D1 is unavailable.

## Root files

| Path | Responsibility |
| --- | --- |
| `package.json` | pnpm scripts and vinext/Next.js/React/Cloudflare dependencies. |
| `vite.config.ts` | vinext, OpenAI Sites, Tailwind PostCSS, and Cloudflare Vite integration. |
| `next.config.ts` | Next.js configuration; currently empty. |
| `tsconfig.json` | Strict TypeScript settings for the app and API. |
| `index.html` | Editable dashboard markup: Overview, Offers, Finder, Trips, dialogs, mobile navigation, manifest/icons, and data script loading order. |
| `app.js` | All browser behavior: member switching, sailing expansion, offer ledger, Finder filters/scoring/comparison, saved searches, trip workspace, calendar, local storage, and API hydration. |
| `styles.css` | Editable responsive visual system. |
| `README.md` | Short product summary; its snapshot counts may lag newer data and must be updated during relevant refreshes. |
| `NEXT_SESSION.md` | Historical deployment/session note from the September 12 refresh; not a replacement for `AI_STATE.md`. |

## Next.js and API

| Path | Responsibility |
| --- | --- |
| `app/layout.tsx` | Site metadata and root layout. |
| `app/page.tsx` | Redirects the app root to the static dashboard. |
| `app/globals.css` | Minimal global stylesheet imported by the layout. |
| `app/api/state/route.ts` | `GET`/`POST` state API, D1 initialization/seeding, member allowlist, saved-search/status/booking persistence, and local fallback. |
| `db/schema.ts` | Runtime D1 `CREATE TABLE`/index statements. Keep aligned with migrations. |
| `drizzle/0000_club_royale_workspace.sql` | Legacy single-member schema. |
| `drizzle/0001_multi_member.sql` | Multi-member profiles, state tables, metadata, and indexes. |

## Canonical data sources

| Path | Responsibility |
| --- | --- |
| `data/club-royale-data.js` | Mike's current active offer dictionary. |
| `data/live-sailing-groups.js` | Mike's current active eligible itinerary groups; expanded to dated sailings in `app.js`. |
| `data/tully-data.js` | Tully's offer dictionary and eligible itinerary groups. |
| `data/member-profiles.js` | Member registry, profile/tier fields, active dataset wiring, refresh summary, duplicate/returned codes, and default member. |
| `data/booked-cruises.js` | Mike's seeded booked-trip records and trip-prep details. |
| `data/mike-26pas603.js` | Preserved August 29 sailing snapshot for the booked `26PAS603` offer. It is loaded by the page but is not wired into the active Finder dataset. |

The corresponding `public/data/*.js` files are generated deployment copies, not independent sources.

## Static/PWA surface

| Path | Responsibility |
| --- | --- |
| `public/manifest.webmanifest` | Standalone display metadata, theme colors, start URL, and icons. |
| `public/icons/` | Favicons, Apple touch icon, and install icons. |
| `public/og.png` | Social sharing image. |
| `public/index.html`, `public/app.js`, `public/styles.css`, `public/data/` | Build-ready copies produced from root sources by `sync-static`. |

There is no service-worker file or registration in the current repository. The app has installable/mobile metadata, but it does not provide a repository-defined offline asset cache.

## Deployment and hosting

The live site is the existing GitHub-backed ChatGPT Sites project at `https://club-royale-offer-compass.the-unlimite-3666.chatgpt.site`. Site version 22 was verified as successfully published on September 21, 2026. This repository contains no hosting or project-ID configuration: no `.openai/hosting.json`, `wrangler.toml`, or equivalent exists in the current tree. The identifying configuration lives in the ChatGPT/Codex environment rather than this shared repository.

Deployment is deliberately manual through ChatGPT Sites as decided on 2026-09-16. This repository is the shared code/data layer, not the deployment mechanism. Do not add or invent hosting configuration or deployment automation without Mike's explicit request, and do not infer the live Site version from Git history.

The Sites source repository is a separate deployment mirror. It contains environment-managed `.openai/hosting.json` and `.openai/drizzle/` files that are intentionally absent from GitHub. When publishing, start from the current Sites `main`, copy only the verified GitHub changes into it, commit, and push that Sites commit. Never force-push the GitHub tree over the Sites repository or delete its `.openai/` files. Save a Sites version from the exact pushed Sites commit, deploy that saved version, preserve the current audience, wait for success, and verify the live UI.

## Maintenance tooling and historical references

| Path | Responsibility |
| --- | --- |
| `scripts/sync-static.mjs` | Copies editable static sources and all six data files into `public/`. |
| `maintenance/build_live_offer_snapshot.mjs` | Converts a verified browser snapshot into Mike's grouped sailing JS and reports offer/group/dated-row counts. |
| `maintenance/build_member_data.mjs` | Builds Tully's offer and sailing data from JSON input. Offer metadata is currently embedded in the script. |
| `maintenance/build_mike_offer_groups.mjs` | Builds the preserved `26PAS603` sailing snapshot. |
| `maintenance/refresh-2026-08-26.mjs` | One-off historical migration script; it expects an older constant name and a temporary input path, so it is not the current general refresh command. |
| `maintenance/build_data.py` | Legacy Claude-artifact Finder generator containing an older snapshot. It is not used by the current vinext build. |
| `maintenance/docs/` | Historical offer, sailing, and Claude-artifact workflow records. Useful as provenance only; current code/data and the root handoff docs take precedence. |

## Feature-to-file index

- Overview, urgency, change center, offer cards, duplicate redemption ledger: `index.html`, `app.js`, active offer/member data.
- Finder, saved Christmas search, filters, scoring, comparisons, conflict/back-to-back checks: `index.html`, `app.js`, active sailing groups and bookings.
- Trips, costs, notes, checklist, and calendar: `app.js`, `data/booked-cruises.js`, `/api/state` persistence.
- Mike/Tully switcher and strict presentation separation: `data/member-profiles.js`, `app.js`, `/api/state` member-keyed tables.
- Cloud state: `app/api/state/route.ts`, `db/schema.ts`, `drizzle/`.
- Mobile install metadata: `index.html`, `public/manifest.webmanifest`, `public/icons/`.
