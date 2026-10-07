## 6 October — weekly highlights and host shortcut control prepared

Fitness I5: weekly review highlights list completed-workout dates, recorded planned recovery dates and step coverage, with sparse/empty wording. Missing days never imply failed workouts; no food-compensation or automated target changes. Future-dated workouts/reviews/activity do not enter current-week highlights or counts. Files: weekly-review.js, weekly-review.test.js, public/app.js. Five focused weekly tests pass, including empty/future/sparse cases; syntax passes. Existing schema and records unchanged.

Friends Showdown N3: added an explicit host single-key shortcut toggle with key descriptions and page-lifetime scope. When off, answer/strike/undo keys do nothing while buttons remain available. Files: Host.tsx, e2e/host-recovery.spec.ts. Typecheck/build and four keyboard/dialog/reconnect browser tests pass. Physical screen-reader/contrast and hardware rehearsals remain unverified. Both fetched origin/main match release HEAD before changes. Deployment authorized; next finish release checks, push both scoped commits and verify Actions/live assets.
## 5 October — fitness and Friends Showdown releases complete

Fitness51e1143 deployed successfully in Actions37403525999, following equipment release42901ec. Live app.js200 confirms both features; anonymous recent-foods/progress return401. I2 inline equipment creation and I3 recent-food shortcuts are complete/deployed. 70 Node tests plus synthetic phone equipment and recent-food flows pass; actual iPhone remains owner verification.

Friends Showdownb126860 deployed: Azure37403548213 attempt2 succeeded including production smoke. Validation37403548168 and browser37403548096 succeeded. First attempt was aborted by Windows OneDeploy during copy; retry resolved it without code/config changes. Live index-Dk3rOXoc.js matches tested bundle. Player readiness text and library dialog focus shipped; proxy-addr2.0.8/source-map-js1.2.2 patch the audit findings.102 unit/helper and23 browser tests pass, audit clean, typecheck/build/format pass.

No owner records modified or new paid resources provisioned. Shared/root backlogs reconciled. Next: fitness I4 optional baseline/cadence design or Sol I5 factual weekly highlights; game N3 broader physical screen-reader/contrast review, and F2/F4 controlled production/hardware rehearsal. Removed infrastructure items and paused OCR remain excluded. Working release paths: fitness-tracker/.deploy/accountability-link and .deploy/ihechi-birthday. Do not use the dirty root fitness source as the release checkout.
## 5 October — I3 recent-food shortcut verified; deployment authorized

Added private GET /api/recent-foods with at most eight distinct recent food/meal/portion combinations from the signed-in account. Today offers a fill-and-review shortcut; viewing or selecting does not write records. Portion and date remain editable and explicit Log food saves. Long labels wrap on phones. 70 Node tests pass, including unauthenticated rejection and historical recent-food retrieval. Synthetic phone flow verifies no implicit writes, edited portion save and 320/390px layout. Fixed form collection item-name collision found by browser test. I2 equipment release42901ec deployed successfully in Actions37403099241. Current I3 release pending at this checkpoint. Next implementation: I4 baseline/cadence design, or Sol I5 factual highlights; physical iPhone follow-up remains.
## 5 October — I2 implemented and locally verified; release pending

Inline equipment-profile creation is available in active workout cards. It retains typed set values and failed form input, selects equipment for new sets only, and preserves completed-set identities. Syntax and two API integration tests pass; synthetic phone browser regression passes retry, profile selection, new-set linkage, prior-set preservation and 320/390px layout. Test: docs/verification/equipment-browser.spec.ts. No deployment or physical iPhone claim. Next implementation: I3 recent-food/snack shortcut.
## 5 October — release closeout

Coaching batch deployed and final live checks pass after startup timeouts: fitness/Fitdays/coaching module200; private progress401 anonymously. No new implementation outstanding for this batch; owner physical-device follow-up remains.

## 4 October — coaching batch deployed641f7ca

Actions37254979078 succeeded. Live coaching module200 and private progress401. Optional review/finish feedback and private five-day training outlook implemented.70 Node tests and one synthetic mobile finish/refresh flow pass. No future workout is pre-confirmed; no automatic load increase or public health-data expansion. F8 tested ingress cases pass; owner sign-in remains. Existing gym mode, equipment profile selection and saved meal reuse reconciled below; remaining rows describe only follow-up work. Source/review notes: docs/COACHING_NOTES.md.

## 4 October — daily meal variety

F6 implemented: suggestions rotate deterministically using the account-local date and available food categories, vary across meals, preserve disclosed-allergy/restriction pause, and never log food automatically.66 Node tests pass. Deployed424db55; Actions37246202815 succeeded. Existing app restarted; fitness/Fitdays200 and private progress401. Next: F8 authentication ingress investigation; owner device checks remain.

## Fitness maintenance — 4 October 2026

F4 History labels and duplicate export link fixed; F5 sparse coverage now counts only past gaps; F7 unit tests use a unique temporary database before importing the server. Local64 tests and two synthetic phone browser scenarios pass. Deployed8644a47; Actions37245282596 succeeded; live History assets200, Fitdays200, private progress401 after temporary startup timeouts. Temporary unit databases contain synthetic data only and remain in the OS temp directory until housekeeping. Next: F8 ingress investigation, then F6 meal variety; owner real-workout/device checks remain.

## Latest Fitdays verification — 4 October 2026

Code54c96fc deployed successfully (Actions37241979733). Final CI63 tests pass; two synthetic mobile browser scenarios pass. Canonical live page/assets return200; corrected preview CSP verified after restarting the existing Web App; private visibility/export/progress return401 without sign-in. FD01–FD15 first-pass behavior is implemented, including FD12 as private-only schedule comparison. Native owner checks below remain; earlier pending-release notes are superseded. No new paid resources or owner workout edits.

## Fitdays — release and remaining verification (4 October 2026)

Owner requested adding the proposed improvements. Owner authorized deployment and follow-up implementation on 4 October; no paid provisioning authorized. Existing Fitdays six-feature batch is deployed in876701a; native device verification remains; it is not re-listed as unbuilt work.

| Order / ID | Priority / type | Improvement and benefit | Testable acceptance criteria | Dependencies / relevant files | Suggested model |
| --- | --- | --- | --- | --- | --- |
| 0 | Owner device verification | Native iPhone follow-up only — code deployed | Verify native share sheet, Home Screen icon/launch, actual ICS import and selected History date through Google sign-in. No synthetic owner workouts needed. | docs/FITDAYS.md; docs/verification/fitdays-browser.spec.ts | Owner with Sol triage |

Keep workout logging and private notes in the main fitness app. None of these items authorizes expanding public health data or restoring owner-removed infrastructure tasks. All FD01–FD15 have implemented first-pass behavior and focused synthetic verification. FD12 deliberately stays private; no preferred weekday publication. Next: native iPhone share/install, ICS import and Google date-link continuity checks.

## Fitdays complete enhancement batch — 4 October

Deployed in876701a (Actions37240063592 success): month navigation, optional device-local weekly target, date-range-labeled month trends, public date details, counts-only summary PNG sharing/download and iPhone icons/install guide. Includes prior rolling-year/refresh fixes. Deployment verified; all follow-up FD01–FD15 now deployed in54c96fc. Native iPhone share sheet/install and real historical dates remain owner checks; no private data added. Older partial Fitdays notes are superseded by this batch.

## Fitdays — 4 October local update

- Locally complete: rolling-year calendar includes oldest partial month, newest month first, monthly counts and Refresh/retry.52 tests and phone-width browser check pass.
- Pending: authorized deployment/live verification and real-history/iPhone checks. Public dates-only payload unchanged.

## 2 October release evidence

F3 deployed77f788c; Actions37058706846 success. Live JavaScript contains activity classification; private progress returns401 without authentication. Local50 tests pass. Physical iPhone follow-up remains; next implementation is F4 History accessible labels. Earlier pending F3 notes below are superseded.

# Fitness tracker backlog — canonical

## 2 October local implementation update

- F3 activity-minute overlap: implementation and focused regressions complete locally in `.deploy/accountability-link`; isolated API/integration verification passed; deployment and physical iPhone verification pending. Acceptance: 15 treadmill + 30 separate walk = 45; duplicate daily summaries count once; old unknown-overlap records retain previous behavior. Steps unchanged. Next: isolated API/UI check before release.


This is the **single source of truth** for fitness-tracker priorities and handoffs in this workspace. Release worktrees must reconcile and carry this same root `BACKLOG.md` before push; do not maintain conflicting task lists.

## Current release and decisions

- Latest verified deployment is `9a5ee5b`; Actions run `36509670600` passed build and deploy. Live app JavaScript returned HTTP 200 with both navigation and timer fixes. The code release `6e5a359` added **Send test notification**. The prior `8e94346` release established live `/sw.js`, `/offline.html`, `/static/reminders.js`, and `/api/status` with private VAPID settings on the existing Azure Web App. Owner reports the immediate iPhone test notification and offline reconnect page worked; scheduled delivery and reconnect recovery remain unverified.
- Production uses the existing single-instance Linux B1 App Service and SQLite on persistent App Service storage. Do not scale out or migrate the database until an approved design exists.
- `fitdays.adeticket.com` DNS, App Service hostname and Azure managed TLS binding are configured. On 24 September 2026 Azure reported `SniEnabled`, direct HTTPS requests without certificate bypass returned 200 for `/` and `/api/public-workout-days`, and the in-app browser loaded the calendar totals. This serves the existing deployed workout-days page.
- Private off-site backup integration was deployed earlier. The owner reports manually creating and verifying a backup. Azure blob contents were not independently inspected in this workspace.
- Owner explicitly removed post-restart backup verification, separate-target restore rehearsal, and populated-database release regression checks from the required backlog. Their removal is a scope decision, not evidence those tests were run.
- Do not create paid Azure resources, alter production DNS/authentication, or deploy code without the relevant explicit authorization. No secret belongs in this file.
- Medical guidance remains conservative; a clinician, not a model, must review personal restrictions and clearance.
- Public accountability link is the current owner-approved mode: no partner sign-in for now, limited read-only workout fields, and owner rotation/revocation. Authenticated invitation sharing is deferred unless the owner asks to change this decision.

## Current release state — deployed vs. local

- **Past workout completion — deployed in 255a783, Actions 36667702904 passed:** History has a dated completion action for an earlier day within Fitdays’ 365-day range. It preserves existing saved sets on an active workout, otherwise records the completed day without inventing exercise details. Repeat completion is rejected; an empty manually added day can be removed. Fitdays reads the completed workouts table, so this action now supplies its date. Local integration and phone-width checks passed; live app JS and Fitdays endpoint returned HTTP 200. Owner has not yet entered the real past date.

- **Motion and quick-glance polish — deployed in `c3e7110`.** Main Today, public workout-share and Fitdays pages use restrained CSS animation with reduced-motion support; Fitdays has a top-right current-calendar-year workout count and retains its rolling 7/30/365 totals. No external GIF library. Local 390px preview had no overflow; live HTTPS page/assets returned 200.
- **Rest-day choices, cardio progression, and weight-loss-supportive strength framing — deployed in `c3e7110`.** Eligible high-energy recovery days can choose the usual plan or easy walk; server safety gates and active/completed-workout protection remain enforced. Exact-exercise treadmill history suggests a five-minute increase only after two target-reaching sessions, capped by session duration and paused for lower readiness. Re-entry and lighter fourth sessions omit cardio. Strength copy describes muscle maintenance, not guaranteed weight loss or spot reduction. GitHub Actions run `36057228505` passed all 26 tests and deployment.
- **First-pass feature batch `d628326` is deployed**, with public-path patch `0fbd7a1`; preferred-day templates, legacy workout-sequence recovery, progress charts, rest timer persistence and private photo timeline are in the app. Live app/static and public routes returned 200; private upload routes returned 401 without a session. iPhone Add to Home Screen metadata is present, but offline/service-worker support is deferred because Azure EasyAuth strips the root-scope header from the static worker. No production auth configuration was changed.
- The selected model for this continuation is Sol. The current owner instruction is to preserve at least 10% of both usage windows, checkpoint, and push any ready release to main at that threshold. Do not consume usage just to reach the threshold.
- Screenshot OCR stays explicitly paused at the user's request. No OCR package or screenshot-reading feature was added. The physical iPhone Safari checklist remains owner-run.
- Keep the current public accountability-link product decision. The owner chose both iPhone push and in-app reminders; background push and the app-open notice are separate. VAPID is configured privately and the owner reports an immediate test notification arrived on iPhone.

## Recommended implementation order

Model assignments are recommendations for which model should own the next task; they do not switch models, run automatically, reduce usage guarantees, or authorize deployment/provisioning. Use medium effort by default; choose high effort only for an actual cross-cutting safety/security/design problem. Work one item at a time, verify against current code/Git state, and update this backlog plus `CODEX_PROGRESS.md` and workspace `PROJECT_STATUS.md` with evidence.

Only outstanding work appears here. Completed releases are recorded below. The 28 September review at `APP_REVIEW_2026-09-28.md` verified findings against deployed-release source `f36fbeb` and a synthetic browser session. F1 is fixed locally below; F10 was reproduced during that verification. Model assignments are guidance, not automatic routing. The root checkout has unrelated dirty source; implement from a reconciled clean release checkout.

| Order | Priority | Item and status | Best model | Acceptance criteria, gates, and main files |
| --- | --- | --- | --- | --- |
| 1 | P1 verification | **F8 edge probe passed; owner Google sign-in follow-up only** | Owner with Sol triage | Forged anonymous principal headers returned401 on /api/me and302 to / without session issuance on callback. Enabled Azure middleware confirmed. Owner verify normal Google sign-in; no auth configuration change made. |
| 2 | P1 | Owner iPhone Safari verification — real-session logging/timer pending | Owner, with Sol triage | Owner previously reported pass for sign-in/refresh/logout, workout and exercise choices, online Home Screen launch, private images, CSV/print, Share and History. Confirm real set/cardio save, resume and rest timer during an actual workout. Device: iPhone 15 Pro Max, iOS 27.0; Safari version unknown. |
| 3 | P2 verification | **I1 focused Today already implemented; new outlook/feedback verified locally** | Owner with Sol triage | Existing one-exercise gym mode and review/finish confirmed; synthetic phone feedback save/refresh passes. Owner confirm next-set navigation during actual gym use. |
| 4 | P2 | **I2 In-workout equipment creation — deployed 42901ec** | Sol | A user can create a new equipment profile without leaving a workout; existing profiles are already selectable; load comparisons remain separated by exercise, equipment and unit. `public/app.js`, equipment-profile route/tests. |
| 5 | P2 | **I3 Recent-food shortcut — deployed 51e1143** | Sol | A recent snack can be logged in two taps with editable portion; viewing a suggestion never records it. `public/app.js`, food routes/tests. |
| 6 | P2 | **I4 Optional step baseline and measurement cadence** | Astra | Unknown baseline remains unknown; conservative step targets wait for real observations; setup remains skippable. `public/app.js`, `server.js`, planning tests. |
| 7 | P2 | **I5 Factual weekly highlights — implemented; release pending** | Sol | Summary cites recorded dates/counts, handles sparse evidence and suggests no food-compensation workout. `weekly-review.js`, `public/app.js`. |
| 8 | P2 investigation | **F9 Suspected: large-history mobile payload** | Sol | Measure 1–2-year synthetic fixture response size, p95 API time and phone render time; split/paginate only if budget exceeded. `server.js:174`, `public/app.js`. |
| 9 | P2 | Offline Home Screen reconnect recovery pending | Owner, with Sol triage | Owner reported offline page works. Confirm return to the live account after reconnect; private records and edits remain online-only and no private API response is cached. `public/sw.js`, `public/offline.html`, `pwa.test.js`. |
| 10 | P2 | Scheduled gentle reminder delivery pending | Owner, with Sol triage | Immediate iPhone test push was owner-reported. Confirm scheduled local-time delivery, no reminder after check-in, and disable/re-enable. `push-reminders.js`, `public/push-settings.js`. |
| 11 | P3 | **I6 Private in-app month calendar** | Sol | Calendar distinguishes completed, active, planned rest and missing days; public Fitdays remains date-only. `public/app.js`, `public/fitdays.js`. |
| 12 | P3 | **I7 Date-range export preview** | Sol | After F2, chosen date range exports correct units and excludes screenshots by default. `server.js`, `public/app.js`, export tests. |

Paused by owner: screenshot-to-log OCR proposals. If resumed, propose sleep/workout fields from private PNG/JPEG, require correction and explicit save, detect duplicates, and do not send images to external AI without separate consent. `server.js`, `public/app.js`, upload/record tests.

## Completed release — 9a5ee5b deployed

- **F1 Today–History navigation:** scoped workout selectors in `.deploy/accountability-link/public/app.js`; two new regressions and 48/48 isolated tests pass. Synthetic 390px browser verified repeat navigation, strength edit/undo, cardio, refresh and completion without console errors or lost/duplicated saved sets; 320px Today/History fit. Live release verified below; physical iPhone follow-up remains. F10 has since been fixed and verified below.

- **F10 rest timer:** remaining time calculated before changing paused state. Actual-handler regression plus 390px browser verified start/pause/resume, navigation/refresh countdown (82s remaining) and skip with no console errors.
- **F2 cardio CSV:** duration always uses `min`; distance has a separate `set-distance` row with its recorded unit. API regressions cover mi, km and omitted distance. Existing strength rows and formula escaping preserved.
- Release validation: 49/49 tests with isolated DATA_DIR, syntax and diff checks pass. Owner explicitly authorized deployment; Actions 36509670600 succeeded. F3 remains first outstanding code item; requires overlap semantics before changing totals.

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

### F3 resume note
Read-only inspection confirms activity_logs has no source/overlap marker. Decide explicit separate activity vs overlapping summary semantics and preserve ambiguous legacy entries before summing totals. Continuation stopped at 8% five-hour usage remaining; no implementation or new deployment. Latest authorization permits testing and deployment of the next finished backlog change.


## Completed Fitdays follow-up implementation — 4 October
FD01–FD15 deployed in54c96fc; earlier releases are superseded. Native device checks remain separate.

| Order / ID | Priority / type | Improvement | Acceptance evidence / criteria | Files | Suggested model |
| --- | --- | --- | --- | --- | --- |
| 1 / FD01 | P1 / integration | FD01 implemented and deployed: tracker sync confirmation (deployed) | Completing or correcting a real past date in private History changes public counts after fetch; duplicate saves do not add days; owner sees explicit success or pending-refresh status. No fake owner records in verification. | Private History completion route/UI and public-workout-days endpoint; public/app.js, workout-days.js, integration tests | Sol |
| 2 / FD02 | P1 / reliability | FD02 implemented and deployed: auto-refresh and freshness (deployed) | Returning to a visible app fetches dates once with throttling; crossing the configured local day updates the window. Display actual successful-fetch time. Failures keep old data and show stale status; retries never multiply requests. | Current Refresh flow; public/fitdays.js and fitdays-data.js | Sol |
| 3 / FD03 | P1 / privacy | FD03 implemented and deployed: owner-controlled dates/counts visibility (deployed) | Only authenticated owner can change mode. Counts-only removes exact dates from the public API as well as the DOM; no public write path. Calendar, dialogs, exports and share cards respect mode. Default preserves existing owner-approved mode until explicitly changed. | Authenticated setting/schema/API design; security review before any wider public payload. server.js, workout-days.js, public/app.js, public/fitdays.js | Astra |
| 4 / FD04 | P2 / goals | FD04 implemented and deployed: Flexible monthly consistency goals (deployed) | Optional user-chosen goal such as12 recorded days/month; progress uses unique dates and stated period. Editing/clearing goal never changes completed records or prescribes catch-up workouts. State whether goal is device-local or owner-account-saved. | Extend existing optional weekly comparison setting; public/fitdays.js, fitdays-data.js; profile route only if owner-saved scope approved | Sol |
| 5 / FD05 | P2 / encouragement | FD05 implemented and deployed: Recorded-day milestones (deployed) | Acknowledge10/25/50/100 unique days using available coverage; historical corrections recompute accurately. No lifetime claims from365-day-only data, extra exercise pressure or private detail in public celebrations; reduced motion respected. | FD03 visibility; explicit data coverage. fitdays-data.js, public/fitdays.js/css; aggregate endpoint only if needed/approved | Sol |
| 6 / FD06 | P2 / visualization | FD06 implemented and deployed: weekly history chart (deployed) | Recent weeks show recorded-day counts with Monday-based ranges, partial current week and coverage labeled. Phone layout and text alternative work; missing records are not described as inactivity or missed workouts. | Existing consistency model; public/fitdays-data.js, fitdays.js/css | Sol |
| 7 / FD07 | P2 / correction UX | FD07 implemented and deployed: dated private History shortcut (deployed) | From selected public date, link opens that date in private History after sign-in. Only authenticated owner can edit; link itself performs no mutation and future/invalid dates are rejected. | Private date navigation; public/app.js, fitdays.js, authenticated routes/tests | Sol |


## Fitdays FD08–FD15 first-pass completion — 4 October
63 Node tests and two synthetic mobile browser flows pass. Actual calendar-app import, native iPhone Web Share/Home Screen and Google redirect continuity remain owner-device checks. FD12 comparison stays authenticated/private; publishing preferred weekdays is not implemented or enabled. No outstanding automatic implementation item remains in this Fitdays batch, subject to owner feedback and verification.

| Order / ID | Priority / type | Implemented improvement | Criteria / boundaries | Files | Suggested model |
| --- | --- | --- | --- | --- | --- |
| 8 / FD08 | P2 / navigation | FD08 implemented and deployed: Quick30/90/365-day filters (deployed) | Selected period changes calendar/chart/count labels consistently; boundary dates and duplicates tested; restoring full year preserves actual records. | Current month/year controls; fitdays-data.js, fitdays.js/css | Sol |
| 9 / FD09 | P2 / sharing | FD09 implemented and deployed: Share-card options and preview (deployed) | Owner/viewer can choose period and preview image before sharing; counts-only default. Exact dates require deliberate choice and permitted visibility. Download/cancel/error paths work on iPhone; no profiles, notes, loads or health values rendered. | Existing PNG generator; FD03; public/fitdays.js/html/css | Sol |
| 10 / FD10 | P2 / recap | FD10 implemented and deployed: Monthly recap (deployed) | Show unique recorded days, weekly breakdown and clearly labeled comparison; current/partial months labeled. Optional share uses the same facts; never invent intensity, calories or health outcomes. | FD06/FD09; public/fitdays-data.js, fitdays.js | Sol |
| 11 / FD11 | P3 / insights | FD11 implemented and deployed: Personal recorded-consistency bests (deployed) | Identify busiest covered month or four-week period with tie handling and exact date ranges; incomplete periods clearly identified. Edits/removals recompute; labels say within available records rather than all-time unless full history exists. | Coverage model; FD03; fitdays-data.js, fitdays.js | Sol |
| 12 / FD12 | P3 / planning | FD12 completed privately: Planned gym-day comparison (deployed; no public schedule) | Optional chosen schedule compares planned versus recorded activity without treating recovery/safety stops as failure; never creates completed records. Publishing schedule requires owner opt-in; otherwise remains private. | Existing preferred weekdays and clinician/safety rules in tracker; owner visibility decision. training.js, server.js, workout-days.js, fitdays.js | Astra |
| 13 / FD13 | P3 / goals | FD13 implemented and deployed: Optional date-bounded challenges (deployed) | User selects start/end and recorded-day target, can pause/remove it; no mandatory streak, catch-up volume or automatic workout override. Clearly identify device-local versus authenticated owner settings. | FD04; safety/product review if connected to training; fitdays-data.js, fitdays.js | Sol, Astra if training integration |
| 14 / FD14 | P3 / reporting | FD14 implemented and deployed: Factual year-in-review (deployed) | Recap covers a chosen year with explicit earliest/latest available date and completeness; rolling365 data must not masquerade as a complete leap year or lifetime history. Share/export follows visibility mode. | FD03, coverage/backend aggregate decision; workout-days.js, fitdays-data.js, fitdays.js | Astra design, Sol implementation |
| 15 / FD15 | P3 / export | FD15 implemented and deployed: Recorded-date calendar export (deployed) | Download ICS with valid unique all-day events, deterministic IDs and date semantics; importing twice does not create different identities. Export includes recorded dates only, no private details, and is unavailable publicly in counts-only mode. | FD03; clarified export scope and date coverage; public/fitdays.js, export helper/tests | Sol |
