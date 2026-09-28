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
    snapshot: "2026-09-28",
    offers: MIKE_OFFERS,
    sailingGroups: MIKE_ROYAL_SAILING_GROUPS,
    seedBookings: MIKE_BOOKED_CRUISES,
    returnedOffers: [],
    portalCheck: {
      checkedAt: "2026-09-28T10:15:00-04:00",
      uniqueOffers: 7,
      usableSlots: 10,
      sailingRows: 1109,
      newCodes: ["26TOR905"],
      removedCodes: [],
      changedCodes: [],
      duplicateCodes: ["26TOR704", "26TOR804", "26TOR905"],
      note: "Sep 28 refresh: 10 usable slots across 7 active offer codes. One new offer appeared: Go for Gold (26TOR905, x2 uses, comp Interior/Balcony/Ocean View or $850 off an upgrade, $50 FreePlay). Double Down Days (26BAF405), Limitless Luck (26RSR103), Island Rollers (26SHC604), Isle or Nothing (26TOR804 x2), Super Spins (26TOR704 x2), and September Monthly Mix (26RCL904) are all unchanged from the Sep 22 snapshot (each offer's FreePlay amount, benefit, and cabin terms were individually re-verified in Offer details). September Monthly Mix redeems by Sep 30, 2026 — 2 days away. This refresh also closes out the sailing-groups follow-up flagged on Sep 22: a full 'View sailings' capture was run for all 7 active codes (not just the previously-missing four), so sailingRows now reflects a complete, current expansion (1,109 dated sailings) rather than the stale Sep 16 count."
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
