# Club Royale dashboard handoff

## Refresh completed locally on September 12, 2026

- Portal checked once using Mike's signed-in Royal Caribbean session.
- Active offer set: 4 unique codes and 6 usable slots.
- Added `26TOR704` (Super Spins), available twice, with all 113 eligible sailing groups.
- Retained active offers `26TOR604`, `26RCL904`, and `26QFP204`.
- Retired expired offers `26VAR504`, `26MIX504`, and `26EST204` from the active listing.
- Finder index now contains 897 dated casino-comp sailings.
- The standard Florida-port Christmas 2026 search still has no qualifying cruise covering December 25.
- Source build passed and the refresh is committed.
- The refreshed source was successfully pushed to the cloud repository, and a deployment archive was prepared. Nothing has been published yet because the user asked to stop. Resume at the final Site version save-and-deploy step with the site's current custom audience.

## Interface separation completed

Keep Mike and Tully completely separate throughout the presentation layer:

- Preserve only the user switcher at the top.
- Never combine their offers on one page.
- Remove all comparison, shared-eligibility, overlap, and combined-offer views or summaries.
- When Mike is selected, show only Mike's offers, Finder results, saved searches, and trips.
- When Tully is selected, show only Tully's corresponding data.

Completed after the September 12 refresh was published: the account dropdown remains, while all cross-member comparison, overlap, and combined-offer presentation has been removed.
