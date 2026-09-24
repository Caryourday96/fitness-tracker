# Fitness app first-pass handoff

Updated 24 September 2026. Feature batch `d628326` and its public static-path correction `0fbd7a1` are deployed; both GitHub Actions runs passed tests and Azure deployment. Live checks found that Azure App Service EasyAuth strips the `Service-Worker-Allowed` header from `/static/sw.js`, so a worker served under `/static/` cannot control `/`. No Azure authentication rules were changed.

## Implemented in the first pass

- Deterministic preferred training weekdays and distinct 3-day full-body A/B/C and 4-day upper/lower A/B plans, with safety/recovery precedence and persisted plan snapshots.
- Legacy history inference so accounts without a saved template marker advance from the movement patterns they actually trained. A self-reported workout yesterday still gives recovery unless the existing guarded, explicit high-energy override is selected.
- 30-day History charts for weight and rolling average, waist, steps, logged workout days, and comparable strength. Missing values remain gaps and each chart shows its coverage.
- Rest timer deadline/paused-time persistence across app suspension and page reload; pause, resume and skip controls. No background timer or notification is promised.
- Private dated screenshot/progress-photo timeline with date/type/caption editing, preview, replace and delete. Images remain authenticated, validated and included in the existing backup process; replacement uploads before deleting the old image.
- iPhone standalone manifest and metadata. Offline pages/data are not supported. The current local correction unregisters only this app's earlier `/static/sw.js` worker and clears its named public-shell cache, since Azure does not provide the wider scope header needed for a working root worker.
- Focused regression tests and an iPhone Safari checklist. README explains Home Screen installation and the network requirement.

## Verified

- The initial worker-cleanup commit `aeb889a` is deployed; GitHub Actions run `36064833990` passed build/test and Azure deployment. Live smoke verified app and manifest are 200 and unauthenticated upload routes remain 401.
- Live smoke also found Azure retained the deleted static worker file from the previous package and still served `/static/sw.js`. A follow-up now explicitly denies that one URL; its focused regression test is part of the current release candidate.
- Latest local checks after the explicit denial: `npm test` passed 38/38; syntax checks passed for server and app; `git diff --check` passed.
- Earlier local disposable-account preview at 390×844 showed onboarding, Today and History without horizontal overflow. No personal/production records were used. Physical iPhone Safari is unverified.
- Live checks after `aeb889a`: `/static/manifest.webmanifest` and app assets returned 200; private upload APIs returned 401; Azure still served stale `/static/sw.js` after package removal. The next release must make that route return 404 and confirm the public manifest and private-route gate remain correct.

## Explicitly not implemented

- Screenshot OCR remains paused by the owner. No OCR library, auto-fill, automatic save or external screenshot transmission is included.
- The physical iPhone checklist needs the owner's device.
- Reliable timezone-aware background reminders need an explicit notification delivery design and scheduler/push infrastructure.
- Authenticated partner invitations remain deferred by the owner's existing choice to use a public revocable link. Do not change that access model.
- No external exercise API is called. The workout plan remains local and deterministic. Optional catalog-only API enrichment is proposed in the backlog; review movement mappings, licensing and attribution, and send no profile/health/history/image data to providers.

## Next actions

1. **Sol, current run:** commit and push the narrow explicit 404 for `/static/sw.js` (tests pass locally), monitor Actions, then verify the old worker route is 404, the manifest/app are 200, and private routes remain 401. Confirm deployed JS includes the old-worker cleanup.
2. **Owner:** use `IOS-OWNER-CHECKLIST.md` on the iPhone after deployment; record actual Safari/iOS outcomes. Desktop checks do not substitute for this.
3. **Sol, backlog follow-up:** if exercise API enrichment is requested, import/cache exercise catalog fields and map alternatives through reviewed local movement/equipment rules. Keep planning deterministic and offline-capable; no personal or health data leaves the app.
4. **Astra, only if needed:** independently review planner safety and template precedence. Do not rewrite the completed planner without a reproducible defect.
5. **Astra, only after an owner decision change:** design authenticated partner grants. Current public sharing stays unchanged.
6. **Sol, after delivery infrastructure is chosen:** implement opt-in timezone-aware reminders with pause/disable controls and no health details in notification text.

## Exact next step

Push the explicit old-worker URL denial to `main`, wait for successful build/test and deployment, then verify `/static/sw.js` returns 404 while the manifest remains 200 and private upload routes stay 401. The iPhone checklist remains the owner's action.
