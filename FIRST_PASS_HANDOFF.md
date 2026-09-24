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

- Before the final worker-cleanup migration: `npm test` passed 38/38; syntax checks passed for server, app, progress charts and rest timer; `git diff --check` passed.
- The final release candidate still needs its test rerun after the worker cleanup change. Do not describe it as deployed until GitHub Actions and live checks succeed.
- Earlier local disposable-account preview at 390×844 showed onboarding, Today and History without horizontal overflow. No personal/production records were used. Physical iPhone Safari is unverified.
- Live checks after `0fbd7a1`: `/static/manifest.webmanifest` returned 200; `/static/sw.js` returned 200 but the platform omitted `Service-Worker-Allowed`; private upload APIs returned 401 without a session. The follow-up removes the unusable worker and retains the manifest.

## Explicitly not implemented

- Screenshot OCR remains paused by the owner. No OCR library, auto-fill, automatic save or external screenshot transmission is included.
- The physical iPhone checklist needs the owner's device.
- Reliable timezone-aware background reminders need an explicit notification delivery design and scheduler/push infrastructure.
- Authenticated partner invitations remain deferred by the owner's existing choice to use a public revocable link. Do not change that access model.
- No external exercise API is called. The workout plan remains local and deterministic. Optional catalog-only API enrichment is proposed in the backlog; review movement mappings, licensing and attribution, and send no profile/health/history/image data to providers.

## Next actions

1. **Sol, current run:** rerun the 38-test suite and syntax/whitespace checks after removing the worker. Confirm the migration removes this app's old worker/cache without changing other registrations; commit and push to `main` under the owner's existing deployment authorization; monitor Actions; verify the manifest/static app routes and private-route authentication. Confirm the live deployed JS includes the old-worker cleanup.
2. **Owner:** use `IOS-OWNER-CHECKLIST.md` on the iPhone after deployment; record actual Safari/iOS outcomes. Desktop checks do not substitute for this.
3. **Sol, backlog follow-up:** if exercise API enrichment is requested, import/cache exercise catalog fields and map alternatives through reviewed local movement/equipment rules. Keep planning deterministic and offline-capable; no personal or health data leaves the app.
4. **Astra, only if needed:** independently review planner safety and template precedence. Do not rewrite the completed planner without a reproducible defect.
5. **Astra, only after an owner decision change:** design authenticated partner grants. Current public sharing stays unchanged.
6. **Sol, after delivery infrastructure is chosen:** implement opt-in timezone-aware reminders with pause/disable controls and no health details in notification text.

## Exact next step

Rerun focused verification for the worker-cleanup migration, push the safe release correction to `main`, wait for successful build/test and deployment, then verify live public assets and anonymous private-route denial. The iPhone checklist remains the owner's action.
