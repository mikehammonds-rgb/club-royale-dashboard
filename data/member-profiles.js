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
    snapshot: "2026-10-01",
    offers: MIKE_OFFERS,
    sailingGroups: MIKE_ROYAL_SAILING_GROUPS,
    seedBookings: MIKE_BOOKED_CRUISES,
    returnedOffers: [],
    portalCheck: {
      checkedAt: "2026-10-01T11:50:00-04:00",
      uniqueOffers: 7,
      usableSlots: 10,
      sailingRows: 1132,
      newCodes: ["26RCL1004"],
      removedCodes: ["26RCL904"],
      changedCodes: [],
      duplicateCodes: ["26TOR704", "26TOR804", "26TOR905"],
      note: "Oct 1 refresh: 10 usable slots across 7 active offer codes. One new offer appeared: October Monthly Mix (26RCL1004, x1, comp Ocean View or Balcony GTY room for two, $50 bonus FreePlay, redeem by Oct 31, 2026, sailings Oct 1, 2026 - May 31, 2027). September Monthly Mix (26RCL904) is no longer on the account after its Sep 30 redeem-by date. Go for Gold (26TOR905 x2), Super Spins (26TOR704 x2), Double Down Days (26BAF405), Limitless Luck (26RSR103), Island Rollers (26SHC604), and Isle or Nothing (26TOR804 x2) are unchanged. A full 'View sailings' capture was run for all 7 active codes: 457 itinerary groups expand to 1,132 dated sailings."
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
