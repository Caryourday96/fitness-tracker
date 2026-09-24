# Fitness app first-pass handoff

Updated 24 September 2026. First-pass commit `d628326` was pushed to `main`; GitHub Actions run `36063235879` passed build/test and Azure deploy. A live smoke test found Azure EasyAuth returns 401 for the new root-level PWA manifest/worker paths. The follow-up correction to use `/static/manifest.webmanifest` and `/static/sw.js` is local and must be redeployed before calling PWA installation complete.

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
- GitHub CI and Azure deployment for `d628326` succeeded. Public app, static assets, status, partner page and Fitdays page/API returned 200; private upload routes returned 401 without a session. The PWA root routes failed with 401 and were corrected locally. Physical iPhone Safari is still unverified.

## Explicitly not implemented

- Screenshot OCR stays paused by the owner. No OCR library, auto-fill, automatic save, or external screenshot transmission is included.
- iPhone checklist needs the owner’s device.
- Reliable timezone-aware background reminders need an explicit notification delivery design and scheduler/push infrastructure.
- Authenticated partner invitations remain deferred by the owner's existing choice to use the public revocable link. Do not change that access model.
- No external exercise API is called. The plan stays local and deterministic. Catalog API enrichment is a separate proposed backlog item; imported movement mappings and licensing/attribution need review, and no health/profile/history data should be sent.

## Next actions by owner/model

1. **Sol (current run):** commit/push the `/static/` PWA path correction, monitor Actions, verify the manifest and service worker return 200 with `/` scope, and confirm private upload APIs still return 401 without a session. Do not inspect private production data.
2. **Owner:** use `IOS-OWNER-CHECKLIST.md` on the iPhone after deployment; record actual Safari/iOS outcomes. No desktop check substitutes for this.
3. **Sol, later:** evaluate catalog-only import/caching for extra exercise alternatives with source attribution and deterministic local fallback. Keep profile/health data out of vendor requests.
4. **Astra, only if needed:** independently review the planner’s safety and template precedence. Do not rewrite the completed planner without a reproducible defect.
5. **Astra, only after owner changes the decision:** design authenticated partner grants. Current public sharing stays unchanged.
6. **Sol, after delivery infrastructure is chosen:** implement opt-in timezone-aware reminders with pause/disable controls and no health details in notification text.

## Exact next step

Finish the small PWA path correction, run the focused suite, push it to `main`, wait for GitHub Actions success, then verify public manifest/worker and private-route authentication. After that, update release status and stop; the iPhone checklist remains the owner's action.
