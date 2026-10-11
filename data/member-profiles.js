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
    snapshot: "2026-10-11",
    offers: MIKE_OFFERS,
    sailingGroups: MIKE_ROYAL_SAILING_GROUPS,
    seedBookings: MIKE_BOOKED_CRUISES,
    returnedOffers: [],
    portalCheck: {
      checkedAt: "2026-10-11T15:18:00-04:00",
      uniqueOffers: 7,
      usableSlots: 10,
      sailingRows: 1597,
      newCodes: ["26PAS703"],
      removedCodes: [],
      changedCodes: [],
      duplicateCodes: ["26TCR104", "26TOR804", "26TOR905"],
      note: "Oct 11 refresh: 10 usable slots across 7 active offer codes (portal header: All Offers (10)). One new offer appeared: 2026 Caribbean Chips (26PAS703, x1, complimentary Interior, Balcony (GTY), or Ocean View room for two - just pay taxes & fees, redeem by Oct 28, 2026, sailings Jan 2 - Mar 29, 2027; no FreePlay perk shown on the tile or in Offer details). Nothing was removed. Mega Spins (26TCR104 x2), Go for Gold (26TOR905 x2), Isle or Nothing (26TOR804 x2), October Monthly Mix (26RCL1004), Double Down Days (26BAF405), and Island Rollers (26SHC604) are unchanged by tile (name, redeem-by date, sail window, room types). A full 'View sailings' capture was run for the new code only (134 itinerary groups / 326 dated sailings); the sailing groups for the six unchanged codes were carried forward from the Oct 8 data. 590 itinerary groups expand to 1,597 dated sailings."
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
    snapshot: "2026-10-08",
    offers: TULLY_OFFERS,
    sailingGroups: TULLY_ROYAL_SAILING_GROUPS,
    seedBookings: [],
    returnedOffers: [],
    portalCheck: {
      checkedAt: "2026-10-08T13:00:00-04:00",
      uniqueOffers: 9,
      usableSlots: 10,
      sailingRows: 987,
      newCodes: ["26TCR107", "26TOR909", "26TOR808", "26PAS707", "26NDS108", "26JKP607", "26RCL1007", "26NPR807", "26SHC607"],
      removedCodes: ["26TOR608", "26TOR508", "26TOR408", "26PAS607", "26QFP207", "26VAR507", "26PAS507", "26MIX508", "26EST207", "26OCT108", "26RCL807", "26FRP109"],
      changedCodes: [],
      duplicateCodes: ["26TCR107"],
      note: "Oct 8 refresh: Tully's full account turned over: all 12 Aug 27 codes expired and 9 new codes (10 usable slots) are live: Mega Spins (26TCR107 x2, redeem by Nov 6), Go for Gold (26TOR909), Isle or Nothing (26TOR808), 2026 Caribbean Chips (26PAS707), Winter Wins (26NDS108), Fortune Flash (26JKP607), October Monthly Mix (26RCL1007), Suit Escape (26NPR807), and Island Rollers (26SHC607). Full 'View sailings' capture was run for all nine codes; 372 itinerary groups expand to 987 dated sailings. Tier is unchanged: Choice, 0 tier credits."
    }
  }
};

const DEFAULT_CLUB_ROYALE_MEMBER_ID = "mike";
