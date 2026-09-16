# Club Royale Dashboard: AI Operating Guide

This repository is the shared source of truth for any coding assistant working on the Club Royale Offer Compass. These instructions are model-agnostic and apply to ChatGPT, Codex, Claude, and other agents.

## Start here

Before changing the project, read these files in order:

1. `AGENTS.md` — operating rules and preservation requirements.
2. `AI_STATE.md` — current verified state, known limitations, and deployment status.
3. `PROJECT_MAP.md` — runtime architecture and file ownership.
4. `DATA_SCHEMA.md` — JavaScript and D1 data contracts.
5. `WORKFLOW.md` — refresh, validation, build, and deployment procedure.
6. `CHANGELOG.md` — cross-agent change history.

Then inspect `git status` and the current implementation. Do not assume chat history is current.

## Product and architecture

Club Royale Offer Compass is a private, mobile-first dashboard for two separate Royal Caribbean Club Royale members. It shows active casino offers, offer-copy status, eligible dated sailings, saved Finder searches, confirmed cruises, deadlines, and trip-preparation details.

The browser experience is intentionally a static HTML/CSS/JavaScript application. `app/page.tsx` redirects `/` to `/index.html`; `scripts/sync-static.mjs` copies the canonical root UI and `data/` files into `public/` before development and production builds. `/api/state` adds member-scoped persistence through Cloudflare D1 when the `DB` binding exists and falls back to seed/local state when it does not.

## Source-of-truth rules

- Edit root `index.html`, `app.js`, `styles.css`, and files under `data/`. Do not hand-edit their generated `public/` copies.
- Run `pnpm sync-static` or `pnpm build` after canonical UI/data changes; both refresh `public/`.
- Keep Mike and Tully fully separated. The member switcher is allowed; combined, overlap, shared-eligibility, and cross-member comparison views are not.
- Active offer inventory is member-specific. Preserve duplicate `uses`; one offer code with `uses: 2` means two independently trackable redemption slots.
- Do not surface a removed or expired offer as currently bookable merely because its historical sailing data remains in the repository or a booked trip references it.
- Preserve booked cruises and historical snapshots when offers leave the live portal. A booked trip can validly reference an offer that is no longer active.
- Do not change identifiers, dates, cabin categories, monetary values, member ownership, or portal facts without evidence.
- Do not invent missing Royal Caribbean data. Record uncertainty and the source checked.
- Never store portal passwords, session cookies, authentication tokens, or full downloaded account exports in Git.
- Do not download portal files without the user's explicit approval.

## Refresh behavior and mobile contract

The dashboard cannot pull Royal Caribbean offers itself. The “Verified … · How to update” control opens an instructional dialog; it is not a network refresh button. A real offer refresh requires a human-authenticated Royal Caribbean browser session plus an agent updating the repository and redeploying it. Preserve that behavior and wording unless the architecture intentionally changes.

Mobile behavior is core product behavior, not optional polish. Preserve the four-view bottom navigation (`Overview`, `Offers`, `Find`, `Trips`), member isolation, touch-friendly dialogs and controls, responsive Finder/cards/calendar, PWA metadata, and safe-area spacing. Validate at a narrow mobile viewport as well as desktop after UI changes.

## Validation and release discipline

- Minimum verification for documentation-only changes: confirm all six handoff files exist, links and file names resolve, and their claims agree with the code.
- Minimum verification for application/data changes: `pnpm build`, canonical/generated-file comparison, data invariants, and browser checks described in `WORKFLOW.md`.
- Do not claim a portal refresh unless the relevant account was actually checked.
- Do not claim a deployment unless the Site version was saved and deployed successfully.
- Deployment is a separate, user-visible action. Preserve the existing Site project and custom audience; do not create a duplicate site.
- Update `AI_STATE.md` whenever current state, known issues, snapshot dates, or deployment status changes.
- Append a dated entry to `CHANGELOG.md` for every meaningful change. State whether source data, schema, and deployment changed.

## Mandatory cross-agent synchronization

The handoff files must evolve with the project. If any agent changes a refresh procedure, data contract, module location, preservation rule, validation/build/deploy step, mobile behavior, or other operating workflow, that agent must update the affected handoff files in the same change. At minimum:

- workflow or release changes update `WORKFLOW.md`;
- architecture or file ownership changes update `PROJECT_MAP.md`;
- data-model or persistence changes update `DATA_SCHEMA.md`;
- project rules or safety constraints update `AGENTS.md`;
- current status, known issues, or deployment changes update `AI_STATE.md`;
- every such change gets a dated `CHANGELOG.md` entry.

Before finishing, re-read all six files for contradictions. A change is not complete if the code and handoff system disagree. This rule applies equally to ChatGPT, Codex, Claude, and any future AI agent so the next model can resume without reconstructing decisions from conversation history.

## Legacy material

`maintenance/docs/` contains useful historical research, but parts describe an older pair of Claude-hosted artifacts and a former build pipeline. It is not authoritative for the current runtime. When it conflicts with the current code or these six handoff files, use the current code and these files. `NEXT_SESSION.md` is also historical handoff context; reconcile it with Git and `AI_STATE.md` before acting.

## Agent completion report

At the end of a task, report:

- files changed and why;
- portal/member data actually checked;
- validation performed and its result;
- whether a build was produced;
- whether deployment occurred;
- remaining uncertainty or next action.
