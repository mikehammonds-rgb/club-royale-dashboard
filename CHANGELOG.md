# Changelog

All notable project, data, workflow, and deployment changes should be recorded here. Dates use `YYYY-MM-DD`.

## 2026-09-16

### GitHub migration and shared AI handoff

- Established `mikehammonds-rgb/club-royale-dashboard` on `main` as the canonical source of truth for ChatGPT/Codex, Claude, and human contributors.
- Added model-neutral root handoff files: `AGENTS.md`, `PROJECT_MAP.md`, `WORKFLOW.md`, `DATA_SCHEMA.md`, `AI_STATE.md`, and `CHANGELOG.md`.
- Documented the actual hybrid architecture: static dashboard sources synchronized into `public/`, Next.js redirect/API routes, Cloudflare D1 persistence, and browser-storage fallback.
- Mapped the current Mike/Tully offer, sailing, profile, booking, maintenance, PWA, and database files.
- Recorded the exact refresh lifecycle: preflight/pull, authenticated portal comparison, history preservation, canonical data updates, public sync, count and UI validation, production build, mobile/install refresh checks, state/changelog update, and commit/push to `main`.
- Documented current data shapes and the legacy-to-multi-member D1 migration state.
- Clarified that the current web app has install metadata but no service worker or guaranteed offline cache.
- Verified root/public static copies and current Finder counts (Mike: 897; Tully: 1,207). The production build completed module transformation but exposed a pre-existing missing `.openai/hosting.json` requirement in the Sites plugin; this is recorded in `AI_STATE.md` for follow-up.
- No offer, sailing, booking, or application behavior was changed by this documentation-only migration.
