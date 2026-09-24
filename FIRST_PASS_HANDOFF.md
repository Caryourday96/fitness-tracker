# Fitness app first-pass handoff

Updated 24 September 2026. This file describes one local implementation batch on the isolated release worktree. The latest production version remains the earlier deployed commit until GitHub Actions confirms this batch.

## Implemented in this first pass

- Deterministic preferred training weekdays and distinct 3-day full-body A/B/C and 4-day upper/lower A/B plans, with safety/recovery precedence and persisted plan snapshots.
- Legacy history inference so accounts without a saved template marker advance from the movement patterns they actually trained. A self-reported workout yesterday still gives recovery unless the existing guarded, explicit high-energy override is selected.
- 30-day History charts for weight and rolling average, waist, steps, logged workout days, and comparable strength. Missing values remain gaps and each chart shows its coverage.
- Rest timer deadline/paused-time persistence across app suspension and page reload; pause, resume and skip controls. No background timer or notification is promised.
- Private dated screenshot/progress-photo timeline with date/type/caption editing, preview, replace and delete. Images remain authenticated, validated, and backed up with the existing upload process; replacement uploads before deleting the old image.
- PWA manifest and standalone metadata. The worker caches only a small public shell allowlist, uses network-first refresh, excludes `/api/`, `/.auth/` and images, and clears its shell cache when signing out.
- Focused tests and an iPhone Safari checklist. README explains Home Screen installation and offline limits.

## Verified

- `npm test`: 38 passed, 0 failed.
- `node --check`: server, training planner, app UI, chart helper, timer helper and service worker passed.
- `git diff --check` passed.
- Local disposable account preview at 390×844 displayed onboarding, Today and History without horizontal overflow. Sparse charts state zero of 30 days; no personal or production records were used.
- GitHub CI, push, Azure deployment, production behavior, and a physical iPhone Safari session have not yet been verified for this batch.

## Explicitly not implemented

- Screenshot OCR stays paused by the owner. No OCR library, auto-fill, automatic save, or external screenshot transmission is included.
- iPhone checklist needs the owner’s device.
- Reliable timezone-aware background reminders need an explicit notification delivery design and scheduler/push infrastructure.
- Authenticated partner invitations remain deferred by the owner's existing choice to use the public revocable link. Do not change that access model.
- No external exercise API is called. The plan stays local and deterministic. Catalog API enrichment is a separate proposed backlog item; imported movement mappings and licensing/attribution need review, and no health/profile/history data should be sent.

## Next actions by owner/model

1. **Sol (current run):** inspect the scoped diff, reconcile the canonical backlog/checkpoints, push this batch to `main` as authorized, monitor required Actions, fix any failure, then verify public status and asset endpoints. Do not inspect private production data.
2. **Owner:** use `IOS-OWNER-CHECKLIST.md` on the iPhone after deployment; record actual Safari/iOS outcomes. No desktop check substitutes for this.
3. **Sol, later:** evaluate catalog-only import/caching for extra exercise alternatives with source attribution and deterministic local fallback. Keep profile/health data out of vendor requests.
4. **Astra, only if needed:** independently review the planner’s safety and template precedence. Do not rewrite the completed planner without a reproducible defect.
5. **Astra, only after owner changes the decision:** design authenticated partner grants. Current public sharing stays unchanged.
6. **Sol, after delivery infrastructure is chosen:** implement opt-in timezone-aware reminders with pause/disable controls and no health details in notification text.

## Exact next step

Review `git diff` and the final staged paths. If scoped changes and tests remain clean, commit and push to `main`; then wait for GitHub Actions build/test/deploy success and verify public routes before marking deployment complete.
