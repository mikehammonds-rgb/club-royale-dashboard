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
    snapshot: "2026-09-12",
    offers: MIKE_OFFERS,
    sailingGroups: MIKE_ROYAL_SAILING_GROUPS,
    seedBookings: MIKE_BOOKED_CRUISES,
    returnedOffers: ["26TOR604"],
    portalCheck: {
      checkedAt: "2026-09-12T00:00:00+08:00",
      uniqueOffers: 4,
      usableSlots: 6,
      sailingRows: 897,
      newCodes: ["26TOR704"],
      removedCodes: ["26VAR504", "26MIX504", "26EST204"],
      changedCodes: [],
      duplicateCodes: ["26TOR704", "26TOR604"],
      note: "The Sep 12 refresh found 6 usable slots across 4 active offer codes. Super Spins is new and appears twice. Three expired codes were retired from the active listing. Play Your Way also remains available twice."
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
