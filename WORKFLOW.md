# Club Royale Refresh, Validation, and Release Workflow

## What “refresh the dashboard” means

A refresh is a repository update based on a newly verified, signed-in Royal Caribbean Club Royale portal session for a named member. It is not a browser reload and the dashboard cannot fetch portal offers by itself.

Never label a maintenance-only build or documentation update as a portal refresh.

## 1. Preflight

1. Read `AGENTS.md`, `AI_STATE.md`, `PROJECT_MAP.md`, `DATA_SCHEMA.md`, and the latest `CHANGELOG.md` entries.
2. Confirm which member is in scope. Do not mix Mike and Tully.
3. Inspect `git status`; preserve unrelated user changes.
4. Record the current offer codes, `uses` counts, snapshot date, portal summary, group count, expanded dated-sailing count, and relevant booked trips.
5. Treat `data/` and the current code as authoritative. Use `maintenance/docs/` only as historical evidence.

## 2. Obtain live evidence

1. Use `https://www.royalcaribbean.com/club-royale/offers?country=USA` in the user's authenticated browser session. If redirected, let the user sign in; never request or store credentials.
2. If the portal briefly reports zero offers or fails to load, retry and cross-check before treating everything as removed. Royal Caribbean has previously produced transient empty/error states.
3. Inventory every visible offer instance, including duplicate copies. Capture:
   - offer code and name;
   - number of issued copies;
   - redeem-by date;
   - benefit text and complimentary/discounted cabin terms;
   - bonus FreePlay and other details;
   - whether it is cruise-comp eligible or FreePlay-only.
4. Compare with both the active dataset and known removed/history references. Offers can disappear early or later return.
5. Open each issued offer's own “View sailings” link. Royal Caribbean uses an instance-specific `playerOfferId`; a guessed bare offer URL is not reliable.
6. Capture every eligible row needed by the dashboard: ship, departure port, itinerary, room category, departure dates, and itinerary link. Confirm itinerary night count because the client derives return dates from the `N Night` text.
7. Do not download exports without the user's explicit approval.

## 3. Reconcile without destroying history

Classify differences as new, removed, changed, returned, or duplicate-count changes.

- Active inventory must match the live member account.
- Do not delete confirmed cruises when an offer disappears.
- Do not make historical `data/mike-26pas603.js` rows active unless live evidence says the offer is currently active and the active datasets are intentionally updated.
- A missing offer is removed from the active offer map and active sailing groups, but its existence belongs in the new snapshot/change summary and changelog.
- A returned offer is restored from freshly verified evidence and added to that member's `returnedOffers` when the UI should badge it.
- Keep “itinerary groups” distinct from “dated sailings.” `sailingGroups.length` counts groups; the client expands each group's compact date tokens into individual dated rows and deduplicates by offer, ship, port, itinerary, room, and departure.
- Preserve each member's local/D1 saved searches, offer statuses, and bookings. Source refreshes must not overwrite user state.

## 4. Update canonical source files

For Mike:

1. Update `data/club-royale-data.js` (`MIKE_OFFERS`).
2. Update `data/live-sailing-groups.js` (`MIKE_ROYAL_SAILING_GROUPS`).
3. Update Mike's entry in `data/member-profiles.js`: `snapshot`, `returnedOffers`, and every `portalCheck` field.
4. Add an idempotent member snapshot/profile update in `app/api/state/route.ts` if the refreshed state should appear in cloud history. Use a unique metadata key and do not rewrite earlier snapshots.

For Tully:

1. Update both `TULLY_OFFERS` and `TULLY_ROYAL_SAILING_GROUPS` in `data/tully-data.js`.
2. Update Tully's entry in `data/member-profiles.js`.
3. Add an idempotent member snapshot/profile update in `app/api/state/route.ts` when appropriate.

For booking changes, update both `data/booked-cruises.js` and the matching seed/migration behavior in `app/api/state/route.ts`. A D1 row that already exists is not changed by `INSERT OR IGNORE`; use an idempotent migration marker for intended updates.

Do not edit `public/` directly. Run `pnpm sync-static` or `pnpm build` to regenerate it.

## 5. Recheck product behavior

After any refresh:

1. Re-run standing/saved searches affected by added, changed, or removed rows. The built-in Christmas search means aboard on Dec. 25, 2026; a cruise qualifies when that date is within the sailing interval, not only when it departs that day.
2. Confirm active Finder results only reference active, cruise-comp-eligible offers.
3. Confirm duplicate offers create the correct number of slot ledger entries.
4. Confirm `portalCheck.uniqueOffers`, `usableSlots`, and `sailingRows` agree with the active data.
5. Confirm Mike and Tully still show only their own offers, Finder results, searches, statuses, and trips.
6. Update `AI_STATE.md` and append a dated `CHANGELOG.md` entry with the exact member, evidence date, counts, files, schema status, validation, and deployment status.

If this refresh changes any procedure or project convention—not just the offer data—update every affected handoff file in the same change. Never leave a new workflow only in chat, code comments, or one model's memory. Reconcile `AGENTS.md`, `PROJECT_MAP.md`, `WORKFLOW.md`, `DATA_SCHEMA.md`, `AI_STATE.md`, and `CHANGELOG.md` before handing the repository to another AI.

## 6. Validate and build

Run from the repository root:

```sh
pnpm build
```

The build runs `scripts/sync-static.mjs` first. Then verify:

- root `index.html`, `app.js`, and `styles.css` match their `public/` copies;
- every canonical `data/*.js` listed by the sync script matches `public/data/`;
- no active sailing group references a missing offer;
- all `uses` values are positive integers;
- ISO dates are valid and each itinerary contains a usable night count;
- active group and expanded-row counts match `portalCheck` for each refreshed member;
- the rendered page contains no visible `undefined` or `NaN`.

For UI changes, run the development server and test at minimum:

- desktop width and a narrow mobile viewport (about 390 px);
- all four bottom-navigation views;
- member switching and isolation;
- update-instructions dialog (it must explain the manual workflow, not imply a direct refresh);
- offer sorting/statuses and duplicate slots;
- Finder defaults, date semantics, filters, saved search flow, pagination, comparison dialog, and Christmas preset;
- Trips/calendar/dialog and persistence;
- browser console for runtime errors.

## 7. Commit and deploy

1. Review the diff for unrelated or generated-only edits.
2. Commit the source and its synchronized `public/` copies together when the task includes a commit.
3. Push only when requested or when continuing an explicitly authorized release workflow.
4. The existing Site is identified by `.openai/hosting.json`; do not create a new project. Build/package the current verified commit, save a new version to that project, retain its current custom audience, and deploy the saved version.
5. Verify the live URL on mobile and desktop after deployment. A successful local build or prepared deployment archive is not a deployment.
6. Record the deployed commit/version and timestamp in `AI_STATE.md` and `CHANGELOG.md`. If publishing is intentionally stopped, say exactly where it stopped.

## Refresh completion checklist

- [ ] Named member and live evidence date recorded
- [ ] Offer instances and duplicate counts reconciled
- [ ] Offer details and every active sailing group checked
- [ ] Active data updated; booked/history data preserved
- [ ] Profile and cloud snapshot metadata updated
- [ ] Standing searches rechecked
- [ ] Canonical files synchronized to `public/`
- [ ] Data invariants passed
- [ ] Production build passed
- [ ] Mobile and desktop behavior checked when UI changed
- [ ] `AI_STATE.md` and `CHANGELOG.md` updated
- [ ] Any changed workflow/schema/architecture/rule is reflected across the six handoff files
- [ ] Deployment status stated accurately
