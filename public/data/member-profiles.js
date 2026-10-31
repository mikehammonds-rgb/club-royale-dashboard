const CLUB_ROYALE_MEMBERS = {
  mike: {
    id: "mike",
    displayName: "Mike",
    portalName: "Michael",
    memberNumber: "385823429",
    tier: "Prime",
    tierCredits: 1082,
    progressPercent: 43,
    tierMessage: "1,418 more tier credits to keep Prime",
    snapshot: "2026-10-31",
    offers: MIKE_OFFERS,
    sailingGroups: MIKE_ROYAL_SAILING_GROUPS,
    seedBookings: MIKE_BOOKED_CRUISES,
    returnedOffers: [],
    portalCheck: {
      "checkedAt": "2026-10-31T11:58:54.635Z",
      "uniqueOffers": 12,
      "usableSlots": 17,
      "sailingRows": 2306,
      "newCodes": [
        "26TCR403",
        "26GEM203"
      ],
      "removedCodes": [
        "26TOR905",
        "26PAS703"
      ],
      "changedCodes": [],
      "duplicateCodes": [
        "26TCR104",
        "26TCR205",
        "26TCR304",
        "26TCR403"
      ],
      "note": "October 31 live check of Mike's account: 17 usable slots across 12 unique codes (portal shows All Offers (17)). New: All-In On Thrills (26TCR403, three copies, redeem Nov 27; sail Dec 2, 2026 - May 31, 2027; $75 FreePlay; Balcony (GTY), Ocean View or Interior cruise fare for two, or $800 off an upgraded stateroom) and Jack of All Spades (26GEM203, one copy, redeem Nov 22; sail Nov 1, 2026 - Mar 29, 2027; Bonus FP $125; complimentary Balcony, Interior or Ocean View room for two). Removed (expired Oct 28): Go for Gold (26TOR905, x2) and 2026 Caribbean Chips (26PAS703, x1). All ten retained codes match live tiles by name, redeem-by date and copy count; their sailing groups are carried forward from October 13/19/22/26, not re-captured today. Both new full tables checksum-verified against the signed-in portal and every link slug matched: All-In On Thrills 209 groups / 533 dates (c72dda57), Jack of All Spades 132 groups / 319 dates (ab5d2448). Combined 881 groups / 2,306 dated sailings. Prime tier message (1,418 tier credits to keep Prime) re-verified. Time-sensitive: 26RCL1004 redeems Oct 31 and the earliest 26GEM203 sailing departs Nov 1. Tully and bookings unchanged.",
      "sailingSources": {
        "newCodes": "2026-10-31",
        "retainedCodes": [
          "2026-10-13",
          "2026-10-19",
          "2026-10-22",
          "2026-10-26"
        ]
      },
      "sailingChecksums": {
        "26TCR403": "c72dda57",
        "26GEM203": "ab5d2448"
      }
    }
  },
  tully: {
    id: "tully",
    displayName: "Tully",
    portalName: "Christine",
    memberNumber: "392016861",
    tier: "Choice",
    tierCredits: 0,
    progressPercent: 0,
    tierMessage: "1 tier credit to keep Choice",
    snapshot: "2026-10-13",
    offers: TULLY_OFFERS,
    sailingGroups: TULLY_ROYAL_SAILING_GROUPS,
    seedBookings: [],
    returnedOffers: [],
    portalCheck: {
      checkedAt: "2026-10-13T13:00:00-04:00",
      uniqueOffers: 10,
      usableSlots: 11,
      sailingRows: 1029,
      newCodes: ["26TCR209"],
      removedCodes: [],
      changedCodes: [],
      duplicateCodes: ["26TCR107"],
      note: "Oct 13 refresh: 11 usable slots across 10 active offer codes (portal header: All Offers (11)). One new offer appeared: Ace of Hearts (26TCR209, x1, Interior only, cruise fare for one plus a discounted cruise fare for the guest, $25 FreePlay online, redeem by Nov 11, 2026, sail Dec 7, 2026 - Apr 26, 2027). Nothing was removed since Oct 8. The nine existing codes (26TCR107 x2, 26TOR909, 26TOR808, 26PAS707, 26NDS108, 26JKP607, 26RCL1007, 26NPR807, 26SHC607) are unchanged by tile (name, redeem-by date, copy count, room types); their sail windows narrowed as the portal's date range moved forward. A full 'View sailings' capture was run for all 10 active codes (377 groups, 1,029 dated rows; Interior and Ocean View only). Tier unchanged: Choice, 0 credits (re-read from the portal header)."
    }
  }
};

const DEFAULT_CLUB_ROYALE_MEMBER_ID = "mike";
