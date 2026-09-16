# Changelog

Meaningful project changes should be appended under an ISO date. Each entry should identify member scope, source-data/schema impact, validation, and deployment status.

## 2026-09-16

- Added a model-agnostic AI handoff system: `AGENTS.md`, `PROJECT_MAP.md`, `WORKFLOW.md`, `DATA_SCHEMA.md`, `AI_STATE.md`, and `CHANGELOG.md`.
- Documented the current static-dashboard/Next API/D1 architecture, canonical-versus-generated file ownership, exact member-scoped refresh workflow, preservation rules, mobile update behavior, schemas, validation, build, and Site deployment procedure.
- Added a mandatory cross-agent synchronization rule: any agent that changes workflows, architecture, schemas, operating rules, current state, or release behavior must update the affected handoff files in the same change and check all six for consistency.
- Reconciled current repository state from code and Git. Flagged stale legacy documentation and the unresolved historical contradiction about whether the latest Site version was deployed.
- Source data: unchanged. Database schema: unchanged. Application behavior: unchanged.
- Portal access: none; this was a documentation-only change and did not refresh Mike or Tully.
- Deployment: not performed.

## Earlier history

Git history and D1 snapshot seed records remain the authoritative detailed record for changes before this handoff system was introduced. Notable current-source milestones include:

- 2026-09-13: standardized booked-cruise details and completed member-view separation work.
- 2026-09-12: refreshed Mike to 4 active codes, 6 usable slots, and 897 dated casino-comp rows; added `26TOR704` and retired three expired active codes.
- 2026-08-27: created Tully's initial separate baseline with 12 offers and 1,207 dated rows; one FreePlay-only offer is excluded from Finder.
