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
    snapshot: "2026-10-19",
    offers: MIKE_OFFERS,
    sailingGroups: MIKE_ROYAL_SAILING_GROUPS,
    seedBookings: MIKE_BOOKED_CRUISES,
    returnedOffers: [],
    portalCheck: {
      checkedAt: "2026-10-19T16:05:29.890Z",
      uniqueOffers: 9,
      usableSlots: 12,
      sailingRows: 1360,
      newCodes: ["26FLS104", "26VAR604"],
      removedCodes: ["26TOR804", "26SHC604"],
      changedCodes: [],
      duplicateCodes: ["26TCR104", "26TCR205", "26TOR905"],
      note: "October 19 live check of Mike's account: 12 slots across 9 unique codes. New: Tropic Hopper (26FLS104, redeem Nov 18; sail Nov 22, 2026 - Mar 29, 2027) and Sunny Shuffle (26VAR604, redeem Nov 12; sail Dec 3, 2026 - Feb 26, 2027), each one complimentary Ocean View or Balcony GTY room for two, taxes and fees payable; no FreePlay shown. Removed expired codes: 26TOR804 (2 slots, Oct 14) and 26SHC604 (1 slot, Oct 16). Seven other codes match the live tiles; their sailing groups are carried forward from October 13, not re-captured today. Both new sailing tables were checksum-verified (21 and 24 groups); total 518 groups / 1360 dated sailings. Prime / 1,082 credits re-verified. Tully was not checked."
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
