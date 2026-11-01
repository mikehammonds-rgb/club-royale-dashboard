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
    snapshot: "2026-11-01",
    offers: MIKE_OFFERS,
    sailingGroups: MIKE_ROYAL_SAILING_GROUPS,
    seedBookings: MIKE_BOOKED_CRUISES,
    returnedOffers: [],
    portalCheck: {
      "checkedAt": "2026-11-01T22:49:31.586Z",
      "uniqueOffers": 11,
      "usableSlots": 16,
      "sailingRows": 2153,
      "newCodes": [],
      "removedCodes": [
        "26RCL1004"
      ],
      "changedCodes": [
        "26GEM203"
      ],
      "duplicateCodes": [
        "26TCR104",
        "26TCR205",
        "26TCR304",
        "26TCR403"
      ],
      "note": "November 1 live check of Mike's account: 16 usable slots across 11 unique codes (portal shows All Offers (16)). Removed (expired Oct 31): October Monthly Mix (26RCL1004, x1). Changed: Jack of All Spades (26GEM203, one copy, redeem Nov 22) now shows sail dates Jan 2 - Mar 29, 2027 (was Nov 1, 2026 - Mar 29, 2027); perks (Bonus FP $125) and room types unchanged. Its full sailing table was re-captured and checksum-verified against the signed-in portal (131 groups / 323 dated sailings, checksum 92b3eff5) and all 131 link slugs matched; the one earlier Nov 1 sailing dropped off and the Jewel of the Seas / Tampa / 5 Night Western Caribbean Getaway Balcony group now carries Jan 2, Jan 16, Feb 13, Feb 27, Mar 8, Mar 22 and Mar 27 under link code JW05W696 (the stored JW05W695 Balcony entry covering only Mar 8 and Mar 22 was stale and was replaced). The ten other active codes match live tiles by name, redeem-by date, copy count and sail window; their sailing groups are carried forward from October 13/19/22/26/31, not re-captured today. Combined 831 groups / 2,153 dated sailings. Prime tier message (1,418 tier credits to keep Prime; 1,082 tier credits) re-verified. Tully and bookings unchanged.",
      "sailingSources": {
        "newCodes": "2026-10-31",
        "recapturedCodes": {
          "26GEM203": "2026-11-01"
        },
        "retainedCodes": [
          "2026-10-13",
          "2026-10-19",
          "2026-10-22",
          "2026-10-26"
        ]
      },
      "sailingChecksums": {
        "26TCR403": "c72dda57",
        "26GEM203": "92b3eff5"
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
