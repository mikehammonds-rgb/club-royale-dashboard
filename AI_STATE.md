# Current AI State

Last reconciled with repository `main`: 2026-10-26 (Mike refresh validated; publication blocked by Sites source-host DNS).

## October 26 offer refresh — publication pending

- Delivery result: local implementation commit `238e7e9` is preserved on `main`. GitHub `create_tree` was rejected with “MCP tool call requires approval, but approval policy is never”; no remote tree/commit/ref write succeeded. Shell Git cannot resolve `github.com`. **Canonical GitHub remains `153cc27662884e13aa34896afb82374747559a9c`, and Sites remains version 39.** No further approval question can resolve this inside the current never-approval session. Resume GitHub delivery first, then publish through Sites when network/approval capability is restored.

- Mike explicitly requested adding Queen of Diamonds and Multi-Line Mix and publishing the existing dashboard. Verified his signed-in Club Royale account (Prime, 1,082 credits), all 16 tiles, both new offer details and both full sailing tables on October 26.
- Added Queen of Diamonds `26MIX604` (one copy; redeem November 24; sail December 3, 2026–March 22, 2027; 20 groups / 64 dated sailings; checksum `ad04981d`) and Multi-Line Mix `26EMV504` (one copy; redeem November 25; sail January 2–March 29, 2027; 53 groups / 142 dated sailings; checksum `4029c511`). Both provide cruise fare for two in Balcony or Ocean View GTY rooms; no FreePlay shown. No existing codes removed or changed by tile.
- Current Mike dataset: **12 unique codes, 16 usable slots, 700 groups, 1,873 dated sailings**. Ten retained sailing tables carry forward October 13/19/22 captures. Tully, bookings, historical booked-offer data, member isolation and UI unchanged. October 26 append-only D1 snapshot and profile-date guard added (`mike_snapshot_2026_10_26`), after older migrations so a fresh database ends on the correct date.
- Six Finder tests, TypeScript, both-member mechanical validation and root/public synchronization pass. Zero orphan groups, skipped groups, bad dates or duplicate dated sailings. Standard canonical build still fails at its intentionally absent `.openai/hosting.json`; the full production build passes in an isolated scratch copy using the existing Site hosting configuration. Browser QA could not run because sandboxed local-server binding is denied.
- GitHub connector verified canonical remote `main` equals local base `153cc27662884e13aa34896afb82374747559a9c`; shell pull fails resolving `github.com`. The Sites connector works and confirms version 39, current custom audience (Mike owner, Michael Hott viewer), but the source helper fails resolving `git.chatgpt-team.site`. **No new Sites version saved or deployed; version 39 remains live.** Resume by delivering this verified source change to the current Sites main with the source helper, building/packaging and saving/deploying the exact pushed Sites commit. Preserve managed `.openai/` files and current custom audience.

## October 22 publication completed

- Mike explicitly approved GitHub and existing shared-dashboard publication. GitHub main 4f084df63b74ffc50d65765f89d26a5b1bdf2618 includes the October 22 offer refresh and today-default/Clear date controls; local main matched origin/main after push.
- Sites version 39 published successfully from deployment-mirror commit e18654a018bbdd38a78e5b40271801a6188a8cd3. Deployment appgdep_6ada8ed6ae7481918257ec232262b950 returned succeeded and the existing production URL. Existing custom audience preserved.
- Production build, six Finder tests, Clear-handler checks and static synchronization passed. Browser/mobile visual verification was unavailable. Earlier blocked-delivery notes below are historical and superseded by this successful publication.

## October 22 Finder delivery follow-up

- Local commit adds today as the initial/Reset departure date and individual date Clear controls. All six tests, direct Clear-handler checks and root/public synchronization pass. Production build now succeeds in the Sites deployment mirror after dependency restoration. Browser/mobile QA was unavailable.
- Sites source access and package downloads now work. Canonical GitHub push was blocked by automatic approval review: publishing private offer/booking data requires explicit destination approval. GitHub and live Sites remain unchanged pending that approval.

## Finder date controls

- Earliest departure and latest return each have a Clear button that removes only that limit and immediately recomputes results. Initial load, member switching and full Reset set the earliest departure to today in the browser’s local timezone. Clear removes that limit without resetting other filters.

## Finder regression safeguards

- Advanced checkboxes (weekend-only, duplicate-only, hide booked ships, back-to-back-only) require an explicit checkbox change in the current search. Reset, member switches, and saved-search loading clear them; date edits and stale browser-restored state cannot opt in. Saved-search counts ignore historical flags that are no longer automatically applied. Ports and ship-class selections retain their established defaults.

- Booked-trip overlaps remain visible, with conflict annotations. Do not hide alternatives: Mike may call Club Royale to change an existing booking's offer code.
- Reset and legacy saved searches cannot enable overlap hiding. The old control is disabled and unchecked; filtering no longer excludes overlaps.
- `pnpm test` runs the real Finder functions against current sailing data with simulated form controls, including December 4 Oasis / 26TCR104, Reset after stale June dates, saved-search restoration, and intentional cabin filtering. The production build runs these tests first. This is logic-level coverage, not a substitute for browser/mobile QA.

## Canonical repository and branch

- Repository: `mikehammonds-rgb/club-royale-dashboard`
- Canonical branch: `main`
- Canonical collaboration state: the six root handoff documents plus the current code and data in this repository.
- Chat history, Claude artifacts, `NEXT_SESSION.md`, and `maintenance/docs/` are supporting history only. They must not override newer committed code/data.

## Current architecture

- Hybrid vinext/Next.js application targeting Cloudflare/OpenAI Sites.
- `/` redirects to the static browser dashboard at `/index.html`.
- The editable UI is plain `index.html` + `styles.css` + `app.js`; `scripts/sync-static.mjs` copies it and `data/*.js` to `public/` before development/build.
- `/api/state` provides optional Cloudflare D1 persistence. Without D1, the app continues with seeds and member-scoped `localStorage`.
- D1 is initialized at request time with `db/schema.ts` statements and idempotent seed/migration guards stored in `app_metadata`.
- Mobile install metadata and icons exist. No service worker/offline cache exists.
- Deployment/hosting configuration is not part of this repository. There is no `.openai/hosting.json`, `wrangler.toml`, or equivalent project identifier in the current tree.

## Current verified datasets

- Mike snapshot: 2026-10-26; 12 active codes, 16 slots, 700 itinerary groups and 1,873 dated sailings. See October 26 refresh above for terms, provenance, checksums and pending publication. Standard Florida-port Christmas 2026 results remain available in carried-forward data; neither new offer adds a December 25 match.
- Tully snapshot: 2026-10-13; 10 active unique offer codes, 11 usable slots, 377 itinerary groups expanding to 1,029 dated sailing rows (computed by running `app.js`'s `expandRoyalSailingGroups` logic against the refreshed data). Active codes: `26TCR209` (new, ×1, "Ace of Hearts", Interior only, cruise fare for one plus a discounted fare for the guest, $25 FreePlay online, redeems by Nov 11 2026), `26TCR107` (×2), `26TOR909`, `26TOR808` (redeems Oct 14), `26PAS707`, `26NDS108`, `26JKP607` (Oct 16), `26RCL1007`, `26NPR807`, `26SHC607` (Oct 16); all are comp offers and the nine older codes are unchanged. Nothing was removed since Oct 8. A full "View sailings" capture was run for all 10 codes. Tier unchanged: Choice, 0 credits.
- Mike has four seeded booked cruises. The Christmas 2026 Wonder booking uses historical offer `26PAS603`; its August 29 sailing snapshot is preserved separately and is not part of the active Finder dataset.
- The November 27, 2026 Wonder booking is reconciled to the Royal Caribbean receipt issued March 4, 2026, including itinerary, XB guarantee cabin status, guests, My Time dining, exact taxes/payment balance, gratuities, and protection status.
- The UI keeps members separate except for the account switcher. Do not restore earlier combined comparison/overlap presentation.

## Key shipped features

- Overview with priority offer, live-derived counts, change summary, next trip, and planning shortcuts.
- Complete offer library, urgency sorting, duplicate-copy ledger, and per-slot status.
- Sailing Finder with aboard-date logic, Florida/all-port scope, class/ship/length/cabin/month/FreePlay filters, saved searches, opportunity scoring, conflict and back-to-back detection, and comparison tray.
- Trips/calendar with detailed costs, packages, companions, notes, and checklist completion.
- Per-member cloud/browser persistence for bookings, saved searches, and offer statuses.
- Responsive mobile navigation plus installable web-app metadata.

## October 22 delivery status

- GitHub connector confirms canonical base `0966aadf5b7373396e988d7ae7ac040fafb22478`, matching local main. Earlier October 19 GitHub delivery is now confirmed despite stale prior notes.
- Shell Git pull/push is blocked by DNS for github.com. Connected GitHub create_tree was rejected: MCP tool call requires approval, but approval policy is never. No remote commit/ref update succeeded; the refresh remains local.
- Existing Sites project is version 38 with custom Mike-owner / Michael-Hott-viewer access. Source helper in a clean scratch directory fails resolving git.chatgpt-team.site; no new live publication is possible this session. Version 38 remains unchanged.
- Both new sailing tables checksum-match the live DOM (26TCR304: 128 groups / 319 dates, 24425dc6; 26PAS804: 9 groups / 34 dates, ea06d69d). Eight retained sailing tables are explicitly carried forward from October 13/19.
- All six Finder regression tests and root/public synchronization pass. Both member datasets mechanically reconcile with zero orphan groups, skipped groups, invalid dates, query-string links, or duplicate dated sailings. No qualifying Wonder/Miami sailing within June 18–24, 2027.
- Standard production build fails because vinext is missing. Dependency restoration also fails resolving registry.npmjs.org. Browser/mobile QA, TypeScript compilation, production build and live verification remain unverified; source data was validated directly. Tully and bookings are unchanged.

## Known constraints and risks

- Royal Caribbean data is a manually verified snapshot, not a live API feed. The dashboard cannot authenticate to or refresh the portal by itself.
- Root and `public/` static files are duplicates by deployment design and must remain byte-identical through `sync-static`.
- Current data is committed as executable JS constants with no formal runtime validator or automated test suite.
- `app/api/state/route.ts` duplicates booking/profile seed facts from `data/`; relevant refreshes must update both or introduce a clearer generated source.
- `maintenance/build_member_data.mjs` embeds Tully offer metadata (updated to the 2026-10-08 offers) and overwrites the combined Tully data file; update its offers dict from verified data before running.
- `maintenance/refresh-2026-08-26.mjs`, `maintenance/build_data.py`, and `maintenance/docs/` describe older data shapes or Claude-artifact workflows and are not the current production build path.
- `README.md` still describes an older August snapshot and should be brought into line during the next data/product documentation refresh.
- The HTML sync dialog contains some hard-coded August 26 copy even though live header values are rendered from member data. Treat hard-coded explanatory counts/dates as cleanup debt.
- A clean `pnpm build` currently transforms the application modules, then the OpenAI Sites plugin fails because it expects `.openai/hosting.json`. That hosting configuration lives outside this shared repository; do not invent or commit project-specific values merely to make the local build finish.
- No service worker means no guaranteed offline operation or background content refresh.
- Full member/reservation details are private. Avoid adding further sensitive raw portal material to Git.

## Git push access by agent

- Codex/ChatGPT pushes directly to this repository from its own environment.
- Claude Code running locally on Mike's Mac (this clone at `~/Projects/club-royale-dashboard`, outside Google Drive) can push to `origin/main` directly. Verified 2026-10-05 with a throwaway-branch test (`push-test` created, confirmed on GitHub, then deleted; `main` untouched).
- Claude's cloud sandbox is still blocked from pushing to this repository by its own outbound git proxy at the session level — confirmed independent of credentials. An attempt to route around this via Mike's Mac (device-bridge local shell) also failed; that shell does not start on his device as of 2026-09-16, even after app restarts.
- Cloud-sandbox fallback: Claude commits locally, hands Mike a patch/updated file plus exact git commands, and Mike pushes from any clean, current clone of this GitHub repository. See `WORKFLOW.md` section 10 for detail. Revisit if the sandbox blocker is later resolved.

## Migration state

- GitHub `main` now contains the complete current source rather than only an uploaded archive.
- The product has moved from earlier standalone Claude artifact pages to the current static dashboard inside a vinext/Next.js Cloudflare application.
- Multi-member D1 tables were added after legacy single-member tables. Runtime initialization still retains and migrates legacy rows to Mike once.
- Shared, model-neutral handoff documentation was added on 2026-09-16. GitHub is now the intended handoff point for both ChatGPT/Codex and Claude.
- Deployment deliberately remains a separate, manual ChatGPT Sites action as decided on 2026-09-16. This repository is the shared code/data layer only. Neither Claude nor Codex should infer, trigger, or claim a deployment from repository state alone.
- The existing ChatGPT Site was checked directly on 2026-09-21. Site version 22 was published successfully from the deployment mirror after GitHub commit `6774864`, and the live November 27 booking was verified. The Site retains its custom audience: Mike is owner and Michael Hott is viewer. `NEXT_SESSION.md` is an archived September 12 handoff and is not current publication guidance.
- GitHub and Sites use separate commit histories. The Sites mirror retains environment-managed `.openai/` files; publication copies verified GitHub changes onto the current Sites branch and saves/deploys the exact resulting Sites commit. See `WORKFLOW.md` section 9.

## Next safe priorities

1. Add automated data validation and browser smoke tests before the next portal refresh.
2. Remove hard-coded stale copy by rendering all refresh summaries from `member-profiles.js`.
3. Consider moving the now-clearly-labeled legacy Claude-artifact maintenance material into a dedicated archive if its research history remains useful.
