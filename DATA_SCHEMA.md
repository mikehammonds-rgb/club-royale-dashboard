# Data Schema

The dashboard uses JavaScript constants rather than JSON modules so the static page can load data directly with `<script>` tags. Root `data/*.js` files are canonical; `public/data/*.js` are synchronized copies.

## Offers

`data/club-royale-data.js` defines `MIKE_OFFERS`. `data/tully-data.js` defines `TULLY_OFFERS`. Both are dictionaries keyed by offer code.

```js
{
  "26TOR704": {
    name: "Super Spins",
    redeemBy: "2026-10-07", // YYYY-MM-DD
    uses: 2,                 // separate redeemable copies
    fp: 0,                   // bonus FreePlay dollars
    perk: "",
    benefit: "Room for two ...",
    cabinOptions: ["Balcony", "Ocean View", "Interior"], // currently present on Mike offers
    comp: true               // currently explicit on Tully offers; false excludes Finder rows
  }
}
```

Required by current UI logic: `name`, `redeemBy`, `uses`, `fp`, `perk`, and `benefit`. `cabinOptions` and `comp` are optional in existing data. Absence of `comp` means eligible; only `comp: false` is filtered out.

Do not represent duplicate live tiles as duplicate dictionary keys. Store one code and set `uses` to the verified number of copies. Per-copy state uses slot keys such as `CODE-1`, `CODE-2` in the persistence layer.

## Sailing groups

`MIKE_ROYAL_SAILING_GROUPS`, `MIKE_26PAS603_SAILING_GROUPS`, and `TULLY_ROYAL_SAILING_GROUPS` are arrays of compact itinerary groups:

```js
{
  offer: "26TOR704",
  dates: ["2026", "Oct 15, Dec 3, Dec 10", "2027", "Jan 14, Jan 21"],
  itin: "3 Night Ensenada Cruise",
  link: "https://www.royalcaribbean.com/itinerary/...",
  port: "San Diego",
  room: "Balcony", // Balcony | Ocean View | Interior | All Rooms
  ship: "Serenade of the Seas"
}
```

`app.js` expands each date into:

```js
{
  offer, ship, port, itin, nights, room,
  depart: "YYYY-MM-DD",
  return: "YYYY-MM-DD",
  link
}
```

`nights` is parsed from `itin`; groups without a parseable `N Night` phrase or without `room` are silently skipped. Expansion removes ` of the Seas` from the runtime ship name and de-duplicates by offer, ship, port, itinerary, room, and departure date.

An itinerary-group count is not a dated-sailing count. Document which count is being reported.

## Member profiles and refresh metadata

`data/member-profiles.js` defines `CLUB_ROYALE_MEMBERS` and `DEFAULT_CLUB_ROYALE_MEMBER_ID`.

```js
{
  id: "mike",
  displayName: "Mike",
  portalName: "Michael",
  memberNumber: "...",
  tier: "Prime",
  tierCredits: 1082,
  progressPercent: 43,
  tierMessage: "1,418 more tier credits to keep Prime",
  snapshot: "2026-09-12",
  offers: MIKE_OFFERS,
  sailingGroups: MIKE_ROYAL_SAILING_GROUPS,
  seedBookings: MIKE_BOOKED_CRUISES,
  returnedOffers: ["26TOR604"],
  portalCheck: {
    checkedAt: "ISO-8601 timestamp",
    uniqueOffers: 4,
    usableSlots: 6,
    sailingRows: 897, // expanded dated sailings
    newCodes: [],
    removedCodes: [],
    changedCodes: [],
    duplicateCodes: [],
    note: "..."
  }
}
```

The UI switches the entire active dataset through this object. Do not combine member arrays.

## Booked cruises

`data/booked-cruises.js` defines `MIKE_BOOKED_CRUISES`. Core fields used broadly are:

- Identity/schedule: `id`, `line`, `ship`, `port`, `depart`, `return`, `nights`, `offer`, `cabin`.
- Reservation/account: `reservation`, optional `companionReservation`, `crownAnchor`, optional `companionCrownAnchor`, `issueDate`.
- Cabin/itinerary: optional `itinerary`, `itineraryStops[]`, `cabinCode`, `stateroom`, `obstructedView`, `departureTime`, `checkInWindow`.
- Costs: optional `fare`, `fareLabel`, `taxesFees`, `total`, `amountPaid`, `balanceDue`, `totalPaid`, `paymentStatus`, `protection`, `freePlay`.
- Packages/gratuities: `gratuities`, `cruiseGratuitiesStatus`, `dining`, `diningPackage*`, `diningGratuitiesStatus`, `drinks`, `drinkPackage*`, `drinkGratuitiesStatus`.
- Planning: `companions[]`, `maybes[]`, `notes`, `checklist[]`; runtime persistence may add `completed[]` containing checklist indexes.

Bookings are flexible JSON records. Missing package status fields are standardized to `"Not recorded"` by the API on save. Preserve unknown fields during edits.

## Saved searches and offer status

A saved Finder search is a JSON object with `id`, `name`, `date`, `departStart`, `returnEnd`, `weekendOnly`, `excludeConflicts`, `ports[]`, `classes[]`, `nights`, `room`, `month`, `minFreePlay`, `duplicateOnly`, `hideSailedShips`, `backToBackOnly`, `ship`, `sort`, optional `offer`, and `savedAt`.

Offer status values are currently `Available`, `Planning`, `Booked`, `Used`, `Returned`, or `Expired`. The API stores `slot_key`, `status`, free-form `notes`, and `updated_at` per member.

Browser fallback keys are member-scoped:

- `club-royale-saved-searches-v1-<memberId>`
- `club-royale-offer-statuses-v1-<memberId>`
- `club-royale-bookings-v1-<memberId>`

Legacy unscoped keys are read only for the default member.

## D1 schema

`db/schema.ts` is executed idempotently by `/api/state`. SQL migrations live under `drizzle/`.

Current multi-member tables:

| Table | Key | Important columns |
| --- | --- | --- |
| `member_profiles` | `id` | display/portal names, tier, credits, last four, snapshot date, updated time |
| `member_bookings` | `(member_id, id)` | `data_json`, `updated_at` |
| `member_saved_searches` | `(member_id, id)` | `name`, `criteria_json`, created/updated times |
| `member_offer_statuses` | `(member_id, slot_key)` | `status`, `notes`, `updated_at` |
| `member_offer_snapshots` | `(member_id, id)` | snapshot date, unique offers, usable slots, sailing rows, `data_json` |
| `app_metadata` | `key` | migration/seed guard value |

Legacy single-member tables (`bookings`, `saved_searches`, `offer_statuses`, `offer_snapshots`) remain in the schema so `initialize()` can migrate their contents to Mike once, guarded by `app_metadata.multi_member_v1`. Do not remove them without a deliberate, verified database migration.

`GET /api/state?member=mike|tully` returns `memberId`, all `profiles`, `viewer.email`, member-scoped `bookings`, `savedSearches`, `offerStatuses`, and `snapshots`. `POST` accepts `save_searches`, `save_status`, and `save_booking`. Unknown members/actions return HTTP 400. With no D1 binding, GET returns seed/local state and POST reports `localOnly: true` without persistence.
