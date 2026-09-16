# Club Royale Data Schema

The dashboard uses classic browser globals rather than imported modules for the static datasets. Field names are case-sensitive. Dates are ISO `YYYY-MM-DD` unless a compact sailing-group date token is explicitly described.

## Member profile

Defined in `data/member-profiles.js` under `CLUB_ROYALE_MEMBERS`.

```js
{
  id: "mike",                  // stable member key; also D1 member_id
  displayName: "Mike",
  portalName: "Michael",
  memberNumber: "...",        // private; UI masks it by default
  tier: "Prime",
  tierCredits: 1082,
  progressPercent: 43,
  tierMessage: "...",
  snapshot: "2026-09-12",
  offers: MIKE_OFFERS,
  sailingGroups: MIKE_ROYAL_SAILING_GROUPS,
  seedBookings: MIKE_BOOKED_CRUISES,
  returnedOffers: ["26TOR604"],
  portalCheck: { /* Portal check */ }
}
```

`DEFAULT_CLUB_ROYALE_MEMBER_ID` is `mike`. The API allowlist must contain every usable member ID.

## Offer map

`MIKE_OFFERS` and `TULLY_OFFERS` are objects keyed by offer code.

```js
{
  "26ABC123": {
    name: "Offer name",                // required string
    redeemBy: "2026-10-07",            // required ISO date
    uses: 2,                            // required positive integer; issued copies
    fp: 75,                             // required number; FreePlay dollars, 0 if none
    perk: "$75 FreePlay ...",           // required string; may be empty
    benefit: "Room for two ...",        // required user-facing terms
    cabinOptions: ["Balcony", "Ocean View", "Interior"], // used where supplied
    comp: true                          // optional; false excludes from Finder
  }
}
```

The client may infer FreePlay from `perk` if `fp` is zero. Cabin ranking is `Balcony > Ocean View > Interior`. The exact active cabin choices ultimately come from sailing-group `room` values.

## Sailing group

Stored in `MIKE_ROYAL_SAILING_GROUPS`, `TULLY_ROYAL_SAILING_GROUPS`, and the preserved `MIKE_26PAS603_SAILING_GROUPS` snapshot.

```js
{
  offer: "26ABC123",                    // offer-code foreign key
  dates: ["2026", "Nov 2, Nov 9", "2027", "Jan 4"],
  itin: "4 Night Bahamas & Perfect Day",// must contain “N Night”
  link: "https://www.royalcaribbean.com/itinerary/...",
  port: "Miami",
  room: "Balcony",                     // Interior | Ocean View | Balcony | All Rooms
  ship: "Wonder of the Seas"
}
```

`dates` is a token stream. A four-digit token changes the current year. Each following string is comma-separated and may set a three-letter month on any token; later day-only tokens inherit the current month. `app.js` expands groups into rows shaped as follows:

```js
{
  offer: "26ABC123",
  ship: "Wonder",                      // “of the Seas” removed
  port: "Miami",
  itin: "4 Night Bahamas & Perfect Day",
  nights: 4,
  room: "Balcony",
  depart: "2026-11-02",
  return: "2026-11-06",
  link: "https://..."
}
```

Return date is departure plus `nights`. Duplicate expanded rows are removed by the composite of offer, normalized ship, port, itinerary, room, and departure.

## Portal check

```js
{
  checkedAt: "2026-09-12T00:00:00+08:00",
  uniqueOffers: 4,
  usableSlots: 6,              // sum of offer.uses
  sailingRows: 897,            // expanded dated active comp rows, not group count
  newCodes: ["26TOR704"],
  removedCodes: ["26VAR504"],
  changedCodes: [],
  duplicateCodes: ["26TOR704"],
  note: "Human-readable reconciliation summary."
}
```

## Booking

Bookings are flexible JSON records stored canonically in `data/booked-cruises.js`, seeded in `app/api/state/route.ts`, and persisted in `member_bookings.data_json`.

Core fields:

```js
{
  id: "wonder-2026-12-24",     // stable within member
  line: "Royal Caribbean",     // optional in API seed but present in source data
  ship: "Wonder",
  port: "Miami",
  depart: "2026-12-24",
  return: "2026-12-28",
  nights: 4,
  offer: "26PAS603",           // may reference a no-longer-active offer
  cabin: "Interior",
  checklist: ["..."],
  completed: [0, 2],            // checklist indexes, added by runtime
  notes: "..."
}
```

Optional detail groups include itinerary/stops, cabin code/stateroom/obstruction, reservation and loyalty identifiers, fare/taxes/paid/balance totals, payment status, gratuities, dining and beverage package names/totals/statuses, FreePlay, companions/maybes, protection, check-in/departure times, and other user-entered notes. Preserve unknown fields. The API supplies default `Not recorded` values for the five standardized package/gratuity status fields when saving a booking.

## Saved Finder search

Saved searches are created by `captureCurrentSearch` and stored as full criteria JSON:

```js
{
  id: "...",
  name: "Christmas Day",
  aboard: "2026-12-25",
  ports: ["Miami", "Fort Lauderdale"],
  classes: ["Oasis"],
  nights: "any",
  room: "any",
  month: "any",
  minFreePlay: 0,
  departStart: "",
  returnEnd: "",
  ship: "any",
  sort: "score",
  weekendOnly: false,
  excludeConflicts: true,
  duplicateOnly: false,
  hideSailedShips: false,
  backToBackOnly: false,
  portScope: "florida",
  offer: null,
  matchCountAtSave: 0,
  savedAt: "2026-09-16T...Z"
}
```

Runtime code is tolerant of omitted older fields. The UI keeps at most 12 locally; the API accepts at most 20.

## Offer status

Each issued copy has slot key `${offerCode}-${oneBasedIndex}`.

```js
{
  slot_key: "26TOR704-1",
  status: "Available",          // Available | Planning | Booked | Used | Returned | Expired
  notes: "",
  updated_at: "2026-09-16T...Z"
}
```

Client local storage uses the same information keyed by slot key, with camel-free API fields tolerated.

## D1 tables

Current member-scoped tables from `db/schema.ts`:

- `member_profiles(id PK, display_name, portal_name, tier, tier_credits, member_number_last4, snapshot_date, updated_at)`
- `member_bookings(member_id + id PK, data_json, updated_at)`
- `member_saved_searches(member_id + id PK, name, criteria_json, created_at, updated_at)`
- `member_offer_statuses(member_id + slot_key PK, status, notes, updated_at)`
- `member_offer_snapshots(member_id + id PK, snapshot_date, unique_offers, usable_slots, sailing_rows, data_json)`
- `app_metadata(key PK, value)` for idempotent migrations

Legacy `bookings`, `saved_searches`, `offer_statuses`, and `offer_snapshots` tables remain so the multi-member initializer can migrate earlier Mike data. Do not build new features on those legacy tables.

Snapshot `data_json` holds change metadata such as `note`, `newCodes`, `removedCodes`, `changedCodes`, `duplicateCodes`, and `christmasMatch`.

## Privacy and integrity invariants

- Member-scoped records must always include and filter by `member_id`.
- Full membership/reservation identifiers already in private source data must remain private; do not repeat them in logs, changelogs, or new documentation.
- Active sailing groups must reference an active offer with `comp !== false` to appear in Finder.
- `usableSlots` equals the sum of `uses`; `uniqueOffers` equals the number of offer-map keys.
- `sailingRows` means expanded, deduplicated, dated rows—not itinerary groups.
