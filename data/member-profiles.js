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
    snapshot: "2026-10-08",
    offers: MIKE_OFFERS,
    sailingGroups: MIKE_ROYAL_SAILING_GROUPS,
    seedBookings: MIKE_BOOKED_CRUISES,
    returnedOffers: [],
    portalCheck: {
      checkedAt: "2026-10-08T12:32:00-04:00",
      uniqueOffers: 6,
      usableSlots: 9,
      sailingRows: 1271,
      newCodes: ["26TCR104"],
      removedCodes: ["26TOR704", "26RSR103"],
      changedCodes: [],
      duplicateCodes: ["26TCR104", "26TOR804", "26TOR905"],
      note: "Oct 8 refresh: 9 usable slots across 6 active offer codes (portal header: All Offers (9)). One new offer appeared: Mega Spins (26TCR104, x2, comp Ocean View/Balcony/Interior GTY room for two or $725 off an upgraded stateroom, $50 FreePlay when redeemed online, redeem by Nov 6, 2026, sailings Dec 2, 2026 - May 31, 2027). Super Spins (26TOR704 x2) and Limitless Luck (26RSR103) are no longer on the account after their Oct 7 and Oct 5 redeem-by dates. Go for Gold (26TOR905 x2), Isle or Nothing (26TOR804 x2), October Monthly Mix (26RCL1004), Double Down Days (26BAF405), and Island Rollers (26SHC604) are unchanged by tile (name, redeem-by date, sail window, room types). A full 'View sailings' capture was run for the new code only (156 itinerary groups); the sailing groups for the five unchanged codes were carried forward from the Oct 1 capture. 456 itinerary groups expand to 1,271 dated sailings."
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
    snapshot: "2026-08-27",
    offers: TULLY_OFFERS,
    sailingGroups: TULLY_ROYAL_SAILING_GROUPS,
    seedBookings: [],
    returnedOffers: [],
    portalCheck: {
      checkedAt: "2026-08-27T13:40:00-04:00",
      uniqueOffers: 12,
      usableSlots: 12,
      sailingRows: 1207,
      newCodes: [],
      removedCodes: [],
      changedCodes: [],
      duplicateCodes: [],
      note: "Tully's first saved baseline contains 12 Club Royale offers. One is FreePlay-only and is excluded from the casino-comp Finder."
    }
  }
};

const DEFAULT_CLUB_ROYALE_MEMBER_ID = "mike";
