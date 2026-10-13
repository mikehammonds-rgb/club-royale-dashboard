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
    snapshot: "2026-10-13",
    offers: MIKE_OFFERS,
    sailingGroups: MIKE_ROYAL_SAILING_GROUPS,
    seedBookings: MIKE_BOOKED_CRUISES,
    returnedOffers: [],
    portalCheck: {
      checkedAt: "2026-10-13T12:00:00-04:00",
      uniqueOffers: 9,
      usableSlots: 13,
      sailingRows: 1775,
      newCodes: ["26TCR205", "26BAF505"],
      removedCodes: [],
      changedCodes: [],
      duplicateCodes: ["26TCR104", "26TCR205", "26TOR804", "26TOR905"],
      note: "Oct 13 refresh: 13 usable slots across 9 active offer codes (portal header: All Offers (13)). Two new offers appeared: Ace of Hearts (26TCR205, x2 uses, comp Ocean View/Interior/Balcony GTY room for two or $850 off an upgraded stateroom, $50 FreePlay online, redeem by Nov 11, 2026, sail Dec 4, 2026 - Apr 30, 2027) and Reel Riches - Two Room Offer (26BAF505, x1, comp stateroom for two plus a bonus Interior GTY room for two, no FreePlay shown, redeem by Nov 3, 2026, sail Jan 2 - Apr 26, 2027). Nothing was removed since Oct 11. The seven existing codes (26TCR104 x2, 26TOR905 x2, 26TOR804 x2, 26RCL1004, 26BAF405, 26SHC604, 26PAS703) are unchanged by tile (name, redeem-by date, copy count, room types); their sail windows narrowed as the portal's date range moved forward. A full 'View sailings' capture was run for all 9 active codes, so sailing groups for every code are current as of this date (669 groups, 1,775 dated rows). Tier values were not re-read this cycle (Prime, 1,082 credits carried forward)."
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
