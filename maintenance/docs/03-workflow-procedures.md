# Club Royale — Workflow Procedures

This doc is the single reference for HOW to run this project's recurring tasks — refresh, date search, and page
updates — so every session executes them the same way instead of re-deriving the process.

## The two published pages (read this first)

Both are claude.ai-hosted artifacts, openable from any device.

**1. Offers Dashboard** — the "what do I have" view.
- URL: https://claude.ai/code/artifact/10666cab-28a6-4f14-bd72-05e44d80ab66
- Source: `club-royale-offers.html` (single self-contained file, data arrays inline — see `../src/`)
- Sections: masthead/stats, change banner, saved-search panel, **redeem-by timeline** (added Aug 23, 2026 — a
  horizontal bar per active offer, sorted soonest-first, colored by urgency: ≤7 days critical, 8–14 days alert,
  15+ days good, same thresholds `redeemMarkup()` already used on cards), offer cards, footer. The timeline needs
  no separate data — it's computed client-side from each offer's existing `redeemBy` field, so keeping the
  `offers` array accurate is all that's required to keep it correct. This is the only redeem-by "alerting" the
  project does — a push-notification version of it was built and removed the same day (Aug 23, 2026) as
  redundant with what's already visible here.

**2. Sailing Finder** — the "where can I go" search, built Aug 21, 2026.
- URL: https://claude.ai/code/artifact/4daf5e9a-2f7e-425d-94b0-a6c6619117b7
- Source: generated — see the build pipeline below (`../src/`). Do NOT hand-edit `club-royale-finder.html`; it is
  output of `build_data.py` + `_template.html`.

**Updating either (in Claude):** edit the source, then call the `Artifact` tool with that page's URL as the `url`
parameter — publishing without it creates a duplicate at a new link.

**Artifact file format:** the source files do NOT contain doctype/html/head/body tags — they start with `<title>`,
then `<link>` font tags, then `<style>`, then content and `<script>`. The hosting wraps them in a page skeleton at
publish time. (This detail matters only if reconstructing the Claude-side publish flow; for a ChatGPT rebuild it's
just informational — the HTML files are otherwise ordinary self-contained pages and will render as-is in any
browser if you add the missing `<!doctype html><html><head></head><body>...</body></html>` wrapper, or just open
them directly since most browsers tolerate the missing wrapper fine.)

## Terminology: "matching sailings" vs "itinerary groups"

These are NOT the same number, and mixing them up is a real accuracy bug hit on Aug 22–23, 2026. Each offer's
"View sailings" table has one row per ship/port/itinerary/room-category combination, and each row lists several
departure dates. The dashboard's `sailingCount` and both docs' "X matching sailings" figures count **rows**
(itinerary groups) — the dashboard labels this explicitly as "itinerary groups" on cards and in the stats line.
The finder's per-offer counts in search results count **individual departure dates** after expanding every row,
which is always a bigger number for the same offer (e.g. 26RCL804: 4 itinerary groups, 26 individual dated
sailings). When writing either doc or the dashboard, say which one you mean — never write bare "sailings" without
specifying group-count or date-count.

## Finder build pipeline
The finder embeds every sailing as structured data, so its search runs entirely client-side against the snapshot.
Three files (all in `../src/`):

- `build_data.py` — the sailing dataset in compact form (one `add(...)` call per ship/port/itinerary/room series,
  with a date-list string like `"2026: Sep 14, 21, Oct 5; 2027: Jan 4"`). Expands to one record per sailing,
  computes return dates from night counts, tags Tier 1 vs Tier 2, scores each sailing, and writes `_data.js`.
  It prints sanity output — total sailings, tier split, date range, and who's aboard on Christmas — check those
  numbers every run.
- `_template.html` — the page itself, with a `/*__DATA__*/` placeholder where the data goes.
- Merge: `python3 -c "t=open('_template.html').read(); d=open('_data.js').read(); open('club-royale-finder.html','w').write(t.replace('/*__DATA__*/', d))"`

**To update the finder after a refresh:** edit the `add(...)` lines and `OFFERS`/`BENEFITS` dicts in
`build_data.py` to match the new snapshot, re-run it, re-merge, verify, republish.

**Finder behavior decisions Mike made (Aug 21, 2026):**
- Date search means **aboard on that date** — sailing underway, departing before and returning after. Not
  departure-date matching. A sailing whose return date equals the searched date is included but labeled
  "docks that morning."
- **"Best deal" ranks room category first** (Balcony > Ocean View > Interior, since the room is free either way),
  **then bonus Free Play.** Score = roomRank × 25 + freePlay. Every offer tied at the top score gets the badge,
  unless all of them tie.
- Tier 2 results (non-Oasis ship, or Tampa) only appear when "Any ship" is selected, and are marked. Their
  coverage is acknowledged as partial in the page footer — they were captured during specific date searches
  rather than swept comprehensively.

## Source of truth hierarchy
1. `01-offers-baseline.md` — offer codes, counts, redeem-by dates, benefits, perks.
2. `02-sailings-detail.md` — sailing-level detail per offer, plus search history.
3. Both published pages are GENERATED FROM #1 and #2. Never hand-edit page data independently of the docs —
   update the docs first, then regenerate. This prevents silent drift.

The dashboard derives several things from its own arrays rather than storing them twice: the "Checked <date>"
line and Total Offers stat come from `refreshHistory[0]`; the "Added <date>" / "↩ Returned <date>" chips come
from scanning `refreshHistory` for each code's first appearance in a `newOffers` list, badged as "Returned"
instead of "Added" when the offer object also carries `returned: true`; the redeem-by timeline and card
countdowns both compute against the viewer's real current date at render time. So updating `refreshHistory`
correctly (and setting `returned: true` on an offer object when it's coming back from the removed section) is
what keeps everything consistent.

## Refresh procedure (checking for offer changes)
Only run when Mike explicitly asks — never proactively or on a schedule.
1. Navigate to `https://www.royalcaribbean.com/club-royale/offers?country=USA`. Expect a redirect to
   `/club-royale/signin` most sessions — the site expires logins aggressively. Have Mike log in, then re-navigate
   to the offers URL.
2. Compare against `01-offers-baseline.md`, respecting duplicate counts. Flag as NEW any code appearing more
   times than the snapshot or absent from it — and as REMOVED any code appearing fewer times or gone. **Check
   removals as carefully as additions.** On Aug 21, 2026 two offers vanished weeks before their stated redeem-by
   dates — a redeem-by date is an outside limit, not a guarantee. **Also check whether a code in the "Removed
   offers" history section has come back** — it happened for the first time Aug 23, 2026 (26TOR604 and 26TOR404
   both returned with identical terms two days after removal). Removed is not necessarily permanent: treat every
   code on the live page as a fresh lookup against both the active table AND the removed-history section, not
   just the active table.
3. For each offer, open "View sailings," filtered to ships = Allure/Harmony/Oasis/Symphony/Utopia/Wonder of the
   Seas and ports = Miami/Fort Lauderdale/Orlando (Port Canaveral). The site's own "View Sailings" link carries a
   `playerOfferId` query param unique to that specific issued offer instance — a bare `/club-royale/offers/<code>`
   URL without that id returns an "Ineligible Offer" error, not real data. Also open "Offer details" for bonus
   Free Play terms not shown on the tile. Some offers' tables don't render itinerary names cleanly — cross-
   reference matching ship/port/date rows against other offers to infer night counts, and flag them as inferred
   so they get verified before booking.
4. Do NOT download any file from the site without asking Mike first, even if the tooling could — the export
   button downloads to Mike's own device and needs a one-time confirmation each time.
5. Update both docs (`01-offers-baseline.md`, `02-sailings-detail.md`). Keep removed offers in a clearly-marked
   history section so their sailings never surface as bookable search results — but see step 2: check that
   section for returns too, not just as write-only history.
6. Update the dashboard (`refreshHistory` entry at the top, `offers` array regenerated, `returned: true` set on
   any offer object coming back from removed status) and the finder (`build_data.py`, then re-merge). Verify
   both (see "Verifying page changes" below), then republish.
7. If anything found is relevant to a standing search — especially Christmas — re-check it and report
   proactively, in chat and in `searchHistory`, without being asked.

## Date search procedure (Tier 1 → Tier 2)
Triggered when Mike asks in chat for a cruise on/around a date. He explicitly prefers asking in chat over a rigid
form — the finder page supplements this, it doesn't replace it.
1. **Tier 1**: `02-sailings-detail.md`, preferred 3 ports + Oasis-class.
2. **Tier 2** (only if Tier 1 is empty): live re-check with all 4 Florida ports (add Tampa) and no ship filter —
   still Florida-only. NEVER surface out-of-state ports (Galveston, LA, San Diego, New Orleans, San Juan, Cape
   Liberty/NY) even as a last resort. If nothing matches in Florida, say so plainly.
3. Report which tier produced the match, and the closest alternative if the exact ask isn't available.
4. Append to `searchHistory` in the doc AND the dashboard, then republish.

## Standing search: Christmas Day 2026
Mike wants to be aboard on **Dec 25, 2026**, ideally 3–4 nights from a Florida port. Best answer, unchanged across
six checks: **Freedom of the Seas, Miami — 5-Night Western Caribbean Holiday, departing Dec 21, 2026 (Interior),
offer 26PAS403**, sailing Dec 21–26. Tier 2 (non-Oasis). Two Tampa 7-nights also span Christmas on the same offer
— Radiance Dec 19–26 and Enchantment Dec 20–27 — but both are longer and from a port he likes less.

**⚠️ 26PAS403 must be redeemed by Aug 25, 2026.** If it lapses, nothing else on the account covers Dec 25 —
re-verified Aug 23, 2026 against all 11 active codes, including the two that just returned (26TOR604, 26TOR404 —
neither covers it).

## Verifying page changes before publishing
Both pages render content from JS, so a broken array shows as an empty page rather than an error. Verify
headlessly: `npm install jsdom`, load the file into a JSDOM instance with `runScripts: "dangerously"`, and assert
on real output. For the finder, drive the controls — dispatch `change` events on the selects, click the preset
buttons — and check result counts and row contents, not just that something rendered. Scan rendered text nodes
for `undefined`/`NaN` (scanning the whole body gives a false positive, since the script source contains the word
"undefined" — clone `document.body`, strip `<script>`/`<style>` from the clone, then check the clone's
`textContent`, not the raw body).

## Things Mike has explicitly declined — don't re-propose
- **A scheduled "redeem-by expiring" push notification.** Proposed and built Aug 23, 2026, then removed the same
  day at Mike's request — the dashboard's own redeem-by timeline and per-card countdown already surface this, and
  a separate daily ping was redundant. If a future idea overlaps with "tell Mike proactively that something is
  expiring," check whether the dashboard already shows it before suggesting a notification for it.
