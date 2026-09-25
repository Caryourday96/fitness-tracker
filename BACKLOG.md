# Fitness tracker backlog — canonical

This is the **single source of truth** for fitness-tracker priorities and handoffs in this workspace. Release worktrees must reconcile and carry this same root `BACKLOG.md` before push; do not maintain conflicting task lists.

## Current release and decisions

- Latest verified deployment is `6e5a359`; Actions run `36086322316` passed. Live push-settings JavaScript contains **Send test notification**. The prior `8e94346` release established live `/sw.js`, `/offline.html`, `/static/reminders.js`, and `/api/status` with private VAPID settings on the existing Azure Web App. Owner iPhone offline launch and notification delivery remain unverified.
- Production uses the existing single-instance Linux B1 App Service and SQLite on persistent App Service storage. Do not scale out or migrate the database until an approved design exists.
- `fitdays.adeticket.com` DNS, App Service hostname and Azure managed TLS binding are configured. On 24 September 2026 Azure reported `SniEnabled`, direct HTTPS requests without certificate bypass returned 200 for `/` and `/api/public-workout-days`, and the in-app browser loaded the calendar totals. This serves the existing deployed workout-days page.
- Private off-site backup integration was deployed earlier. The owner reports manually creating and verifying a backup. Azure blob contents were not independently inspected in this workspace.
- Owner explicitly removed post-restart backup verification, separate-target restore rehearsal, and populated-database release regression checks from the required backlog. Their removal is a scope decision, not evidence those tests were run.
- Do not create paid Azure resources, alter production DNS/authentication, or deploy code without the relevant explicit authorization. No secret belongs in this file.
- Medical guidance remains conservative; a clinician, not a model, must review personal restrictions and clearance.
- Public accountability link is the current owner-approved mode: no partner sign-in for now, limited read-only workout fields, and owner rotation/revocation. Authenticated invitation sharing is deferred unless the owner asks to change this decision.

## Current release state — deployed vs. local

- **Motion and quick-glance polish — deployed in `c3e7110`.** Main Today, public workout-share and Fitdays pages use restrained CSS animation with reduced-motion support; Fitdays has a top-right current-calendar-year workout count and retains its rolling 7/30/365 totals. No external GIF library. Local 390px preview had no overflow; live HTTPS page/assets returned 200.
- **Rest-day choices, cardio progression, and weight-loss-supportive strength framing — deployed in `c3e7110`.** Eligible high-energy recovery days can choose the usual plan or easy walk; server safety gates and active/completed-workout protection remain enforced. Exact-exercise treadmill history suggests a five-minute increase only after two target-reaching sessions, capped by session duration and paused for lower readiness. Re-entry and lighter fourth sessions omit cardio. Strength copy describes muscle maintenance, not guaranteed weight loss or spot reduction. GitHub Actions run `36057228505` passed all 26 tests and deployment.
- **First-pass feature batch `d628326` is deployed**, with public-path patch `0fbd7a1`; preferred-day templates, legacy workout-sequence recovery, progress charts, rest timer persistence and private photo timeline are in the app. Live app/static and public routes returned 200; private upload routes returned 401 without a session. iPhone Add to Home Screen metadata is present, but offline/service-worker support is deferred because Azure EasyAuth strips the root-scope header from the static worker. No production auth configuration was changed.
- The selected model for this continuation is Sol. The current owner instruction is to preserve at least 10% of both usage windows, checkpoint, and push any ready release to main at that threshold. Do not consume usage just to reach the threshold.
- Screenshot OCR stays explicitly paused at the user's request. No OCR package or screenshot-reading feature was added. The physical iPhone Safari checklist remains owner-run.
- Keep the current public accountability-link product decision. The owner chose both iPhone push and in-app reminders; the local implementation separates background push from an app-open notice. Push still needs VAPID configuration and owner-device delivery verification.

## Recommended implementation order

Model assignments are recommendations for which model should own the next task; they do not switch models, run automatically, reduce usage guarantees, or authorize deployment/provisioning. Use medium effort by default; choose high effort only for an actual cross-cutting safety/security/design problem. Work one item at a time, verify against current code/Git state, and update this backlog plus `CODEX_PROGRESS.md` and workspace `PROJECT_STATUS.md` with evidence.

Only outstanding work appears here. Completed releases are recorded below. Sol is the last explicitly selected model; model assignments are guidance, not automatic routing.

| Order | Priority | Item and status | Best model | Acceptance criteria, gates, and main files |
| --- | --- | --- | --- | --- |
| 1 | P1 | Owner iPhone Safari verification — in progress; History now passes, real-session checks deferred | Owner, with Sol triage of reported failures | Owner reported pass for sign-in/refresh/logout, whole-workout and exercise choices, online Home Screen launch, image upload/preview/caption/replace/delete, CSV/print, Share create/view/revoke, and History after the CSS release. Real workout logging/resume and rest timer await an actual session. Device: iPhone 15 Pro Max, iOS 27.0; Safari version not reported. |
| 2 | P1 | Screenshot-to-log OCR proposals — paused by owner | Astra design; Sol implementation if resumed | Once resumed, propose sleep/workout fields from private PNG/JPEG, show each value for correction and explicit save, detect duplicates, and keep images off external AI without separate consent. `server.js`, `public/app.js`, upload/record tests. |
| 3 | P2 | Offline Home Screen support — deployed; physical iPhone offline launch pending | Owner, with Sol triage | Root `/sw.js` and public reconnect page are live. Confirm Home Screen launches the offline page without network and returns to the live account after reconnect. Private records and workout edits remain online-only. Do not cache private API responses. `server.js`, `public/sw.js`, `public/offline.html`, `pwa.test.js`. |
| 4 | P2 | Gentle reminders — deployed/configured; iPhone subscription and delivery pending | Owner, with Sol triage | Owner chose both. In-app notice is app-open only; iPhone push has private VAPID configuration, authenticated Apple subscriptions, generic payload, single-instance scheduler and saved-day deduplication. Confirm explicit iOS permission, enable/disable, actual generic delivery at saved local time, and no reminder after today's check-in. `server.js`, `push-reminders.js`, `public/push-settings.js`, `public/reminders.js`. |

## Completed and deployed

- Whole-workout **Show another workout** action, yesterday-name avoidance and its same-pattern/sets/cardio safety guards deployed in `97ee25e`; Actions `36075358573` passed, and live app JavaScript contains the button. Signed-in iPhone use is pending item 1.
- iPhone Home Screen guide and Steady SVG favicon deployed in `97ee25e`; live JavaScript, root favicon link and icon asset returned HTTP 200.

- Base security/session controls: same-origin write validation, request throttles, bounded JSON parsing, secure cookies, hashed opaque sessions, logout/sign-out-everywhere, and Google sign-in bridge.
- First-day setup/settings, daily check-ins, deterministic adaptive workout generation, resume and workout logging; cardio has duration/distance/incline fields; set edit/undo, conflict checks, rest timer, alternatives and equipment-specific history suggestions.
- End-of-day/history edits, steps/activity/sleep/food logging, weight/waist trends, 7-day averages and sparse-data labels, inventory-based meal guidance and favorites, formula-safe CSV and printable summary.
- Private PNG/JPEG image upload/list/preview/caption/date/replace/delete with server validation and authenticated retrieval.
- Private off-site backup integration; owner reports manual backup and verification succeeded. See current deployment evidence above; no extra restore rehearsal is required by owner decision.
- Suggested meals/editable meal and snack times `4397ab9` (Actions `36011790168`); one-handed workout UI `e5239d0` (Actions `36012412766`); Today hierarchy/form feedback `d78a166` (Actions `36013130305`); completion recap `722d333` (Actions `36014053130`); equipment profiles `0aca563` (Actions `36014941989`); unplanned activity logging `8ac5775` (Actions `36015984471`); saved meals `4835ab6` (Actions `36016719416`); weekly review `d6f6004` (Actions `36017579996`). All listed Actions passed build/tests and deployment as recorded in the originating release notes; owner’s authenticated iPhone review remains outstanding.
- Starter foods, public workout accountability link and its cardio/unit rendering correction were deployed; link is bearer-accessible until rotated/revoked and can expose copied information. No partner login is required per owner choice.
- Public date-only workout tracker deployed in `24503c4` (Actions `36039028731`); `fitdays.adeticket.com` now serves it over verified HTTPS as noted above.

## Intentionally out of scope / deferred decisions

- Apple Health direct integration/import/export.
- Saving screenshot-derived sleep or workout values without owner confirmation, or sending private screenshots to an external AI without explicit consent. OCR-assisted prefill of the sleep/workout forms followed by owner review and confirmation is in scope under backlog item 3.
- Paid database/storage changes without an owner-approved cost and architecture choice.
- Post-restart backup verification, separate-target restore rehearsal, and populated-database release regression check (removed by owner request).

## Model handoff prompt

> Read available project instructions, `PROJECT_STATUS.md`, `CODEX_PROGRESS.md`, and the canonical `fitness-tracker/BACKLOG.md`. Work only on the highest-priority uncompleted item assigned to your selected model. Verify it against the current code and Git status; make the smallest safe change; run the focused checks allowed by the owner; update this backlog and both checkpoints with evidence, deployment status, blockers and exact next action. Do not deploy or provision paid resources without explicit authorization. Do not re-add backlog items the owner removed.
