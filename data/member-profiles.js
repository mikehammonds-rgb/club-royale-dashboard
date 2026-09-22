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
    snapshot: "2026-09-22",
    offers: MIKE_OFFERS,
    sailingGroups: MIKE_ROYAL_SAILING_GROUPS,
    seedBookings: MIKE_BOOKED_CRUISES,
    returnedOffers: [],
    portalCheck: {
      checkedAt: "2026-09-22T00:00:00-04:00",
      uniqueOffers: 6,
      usableSlots: 8,
      sailingRows: 459,
      newCodes: ["26BAF405", "26RSR103", "26SHC604", "26TOR804"],
      removedCodes: ["26QFP204"],
      changedCodes: [],
      duplicateCodes: ["26TOR704", "26TOR804"],
      note: "Sep 22 refresh: 8 usable slots across 6 active offer codes. Autumn Showdown (26QFP204) redeemed by Sep 16 as scheduled and is no longer on the account. Four new offers appeared: Double Down Days (26BAF405, comp Ocean View or Interior + bonus Interior room for two, no FreePlay listed), Limitless Luck (26RSR103, comp Balcony for two, $50 FreePlay), Island Rollers (26SHC604, comp Balcony or Ocean View for two, $50 bonus FreePlay), and Isle or Nothing (26TOR804, x2 uses, comp Interior/Balcony/Ocean View or $725 off an upgrade, $50 FreePlay). Super Spins (26TOR704, x2) and September Monthly Mix (26RCL904) are unchanged from the Sep 16 snapshot. Offer-level details only — sailingRows/sailingGroups (Finder dated-sailing expansion) were not re-pulled this refresh and still reflect the Sep 16 snapshot; treat Finder results as stale until a full 'View sailings' capture is run for the four new offers."
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
