# Current AI State

Last reconciled against repository code: 2026-09-16. This documentation pass did not access either live Royal Caribbean account and did not refresh offer data.

## Repository state

- Canonical repository: `club-royale-source`, branch `main`.
- Repository HEAD before this documentation change: `abba4de` (`Standardize booked cruise details`, 2026-09-13).
- Local branch was 8 commits ahead of its configured remote at inspection time.
- Application stack: static HTML/CSS/JavaScript dashboard served from `public/`, Next/vinext redirect and API shell, Cloudflare D1 member state, OpenAI Sites project configured in `.openai/hosting.json`.
- Production build command: `pnpm build` (runs static synchronization first).

## Last verified portal snapshots in source

### Mike

- Snapshot date: 2026-09-12.
- Active source data: 4 unique codes, 6 usable slots, 897 expanded dated casino-comp rows.
- Active codes: `26TOR704` (2 uses), `26RCL904` (1), `26TOR604` (2), `26QFP204` (1).
- September 12 change summary: added `26TOR704`; removed `26VAR504`, `26MIX504`, and `26EST204`; `26TOR704` and `26TOR604` have duplicate copies.
- `26TOR604` is marked as a returned offer.
- Four confirmed cruises are seeded for Mike. Booked offer `26PAS603` is no longer in the active offer map; its booked trip and separate Aug. 29 sailing snapshot are intentionally preserved.
- Source says the standard Florida-port Christmas 2026 search had no qualifying active-offer cruise covering Dec. 25 as of the Sep. 12 refresh. Mike's already booked Dec. 24 Wonder cruise is preserved in Trips.

### Tully

- Snapshot date: 2026-08-27.
- Active source data: 12 unique codes, 12 usable slots, 1,207 expanded dated rows in the portal summary.
- One offer (`26FRP109`) is FreePlay-only with `comp: false`, so it is excluded from Finder's casino-comp results.
- No confirmed cruises are seeded for Tully.

These are source snapshots, not claims about the portal on 2026-09-16. Several stored redeem-by dates are now at or before the current date, so the next “refresh” request must perform a new live reconciliation rather than merely changing dates or marking everything expired by assumption.

## Current product decisions

- Mike and Tully remain completely separate in presentation and persisted state; only the account switcher is shared.
- The app has four views: Overview, Offers, Find, and Trips.
- Finder is member-scoped, expands compact itinerary groups to dated sailings, defaults to Florida ports and Oasis class, supports aboard-date semantics, and ranks cabin category before FreePlay in its cabin-value calculation.
- Duplicate offers create separate redemption slots.
- Bookings and history survive removal of an active offer.
- The update control is instructional. The dashboard cannot authenticate to or refresh Royal Caribbean on its own.
- Mobile/PWA behavior and bottom navigation are first-class requirements.
- No scheduled expiring-offer push notification is wanted; prior project history says the user declined it.

## Deployment state

- `.openai/hosting.json` points to the existing Site project and D1 binding.
- The Sep. 12 source refresh was built and pushed; historical notes say a deployment archive was prepared and the final Site save/deploy was stopped at the user's request.
- A later note says the member-separation change was completed “after the September 12 refresh was published,” which conflicts with the earlier deployment sentence. Git proves the source changes exist but does not prove the live Site version.
- Therefore deployment status is **not independently verified**. Before publishing or claiming the live site is current, inspect the existing Site's deployed version and compare it with the current commit. Preserve its custom audience.

## Known issues and documentation debt

- `README.md` still describes an Aug. 23/Aug. 26-era offer count and should not be used for current counts.
- `index.html` contains old placeholder verification text in the update dialog, but `app.js` replaces it at runtime with the active member's current source snapshot.
- `maintenance/docs/03-workflow-procedures.md` describes superseded Claude artifact pages and an older source hierarchy. It remains historical reference only.
- `NEXT_SESSION.md` contains conflicting publication wording, reconciled above.
- The repository has no dedicated automated test script; build plus invariant/browser verification is required.

## Next safe actions

1. For an offer refresh, follow `WORKFLOW.md` with the named member's signed-in portal session.
2. Before any release, verify the existing Site's live version/audience and run `pnpm build` plus browser checks.
3. After a real refresh or deployment, replace the relevant state above and append `CHANGELOG.md`; do not simply add another contradictory note.
