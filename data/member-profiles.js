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
    snapshot: "2026-10-22",
    offers: MIKE_OFFERS,
    sailingGroups: MIKE_ROYAL_SAILING_GROUPS,
    seedBookings: MIKE_BOOKED_CRUISES,
    returnedOffers: [],
    portalCheck: {
      "checkedAt": "2026-10-22T19:57:02.166Z",
      "uniqueOffers": 10,
      "usableSlots": 14,
      "sailingRows": 1667,
      "newCodes": [
        "26TCR304",
        "26PAS804"
      ],
      "removedCodes": [
        "26BAF405"
      ],
      "changedCodes": [],
      "duplicateCodes": [
        "26TCR104",
        "26TCR205",
        "26TOR905",
        "26TCR304"
      ],
      "note": "October 22 live check of Mike's account: 14 slots across 10 unique codes. New: Bankroll Blitz (26TCR304, two copies, redeem Nov 20; sail Dec 2, 2026 - Apr 30, 2027; cruise fare for two in Ocean View/Balcony/Interior GTY or $650 upgrade discount; $75 online FreePlay per redemption) and Quick Getaways (26PAS804, one copy, redeem Nov 11; sail Dec 4, 2026 - Apr 19, 2027; cruise fare for two in Interior/Balcony/Ocean View GTY; no FreePlay shown). Removed: expired Double Down Days (26BAF405, one copy, deadline Oct 21). All eight retained codes match the live tiles; sailing groups carried forward from October 13 (six codes) and October 19 (26FLS104, 26VAR604), not re-captured today. Both new full tables captured and checksum-verified: 128 and 9 groups; total 627 groups / 1667 dated sailings. Prime / 1,082 credits re-verified. Tully not checked."
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
