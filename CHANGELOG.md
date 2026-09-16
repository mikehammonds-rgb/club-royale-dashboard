# Changelog

All notable project, data, workflow, and deployment changes should be recorded here. Dates use `YYYY-MM-DD`.

## 2026-09-16 — hosting and deployment correction

- Corrected the shared handoff documentation after verifying the supplied patch's intent against the actual `mikehammonds-rgb/club-royale-dashboard` repository.
- Clarified that no `.openai/hosting.json`, `wrangler.toml`, or equivalent hosting/project-ID configuration exists in this repository; that configuration lives in the ChatGPT/Codex environment.
- Recorded the decision that deployment stays manual through ChatGPT Sites. This repository is the shared code/data layer, and neither Claude nor Codex should infer, trigger, or claim a deployment from Git state alone.
- Removed the follow-up instruction to restore a hosting file in this repository. A successful push is not evidence that the live Site was published.
- Source data, database schema, and application behavior are unchanged. No portal access or deployment occurred.

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
