# Fitness tracker checkpoint — 23 September 2026

## Findings and decision

- Existing workspace contains the Friends Showdown, scraper, and personal-site projects; no fitness app existed.
- Chose an isolated Node 24 app with built-in SQLite, `crypto.scrypt`, opaque HttpOnly sessions, and a vanilla mobile client. No existing site, DNS, Azure resource, or production auth was changed.
- Repository: `https://github.com/Caryourday96/fitness-tracker`.

## Implemented

- First-account setup lock and login/logout with hashed passwords and 30-day sessions.
- Private profile, check-in, deterministic plan, workout, measurements, and food inventory tables.
- Safety stop for concerning symptoms and blood pressure at or above 180/120; history remains accessible.
- Today flow requires check-in before plan confirmation; plan reasons and safety guidance are shown.
- Resume/save/complete workout flow, set logging, settings, inventory, and CSV check-in export.
- Product, safety-source, deployment, and prioritized backlog docs.

## Verification

- `node --test`: 6 tests passed (hashing, urgent gates, deterministic adaptation, timezone format).
- Local HTTP smoke: `/` returned 200 and `/api/status` returned unauthenticated status.
- GitHub commit `46ad357` pushed to `main`.
- No Azure/DNS/deployment approval was requested or performed.

## Risks / remaining work

- Before personal use: CSRF, rate limiting, recovery/revocation UI, HTTPS-only production cookie, managed durable database, private object storage, upload validation, historical editing, end-of-day flow, charts, and broader mobile/browser tests remain.
- SQLite is suitable for local development only unless a persistent mounted volume is guaranteed.
- Medical thresholds and wording need clinician review before treating this as medical guidance.

## Exact next action

Add CSRF protection and login rate limiting, then add integration tests proving unauthenticated access is denied and state-changing cross-site requests are rejected. Do not deploy until the P0 backlog is addressed and reviewed.

## Daily food, sleep, activity and cardio tracking — 23 September 2026

- Added durable `food_logs`, `sleep_logs`, and `activity_logs` tables and protected API routes.
- Added daily food/snack, sleep-hours/quality, activity duration, steps, and treadmill-specific duration/distance/incline fields to the Today flow.
- Treadmill plans now show conservative speaking-pace settings rather than weight/reps. Strength fields remain load/reps based.
- The app explicitly explains that manual wearable/Apple Health entry is available now; private screenshot upload/OCR remains deferred until storage validation.
- Existing deterministic safety tests remain passing; a full browser integration check is still needed after this UI extension.
- Next: add history-based, user-confirmed load suggestions and weekly charts after the P0 auth/storage work.

## Private image storage implementation — 23 September 2026

- Added authenticated upload/list/read/delete endpoints for PNG and JPEG data URLs.
- Files are stored under `data/uploads` outside `public/`, with randomized names, 0600 file mode, 5 MB maximum, declared-type checks, PNG/JPEG magic-byte checks, private no-store responses, and user ownership checks.
- Added an `uploads` metadata table keyed to the account and day. No public image URLs are issued.
- Production still requires a persistent private volume or private object storage and backup/restore testing; Azure deployment is not yet performed.
- Cost decision: use Azure App Service Free F1 only as a disposable technical preview; do not store real health data or private images there. Production needs durable storage and a paid/appropriate tier.

## Azure plan upgrade — 23 September 2026

- User approved upgrading the shared `Kayode_IGO` App Service Plan `adeticket`.
- Azure CLI verified the plan is now Canada Central, Premium v3 `P0v3`, one worker.
- This affects all apps on that plan and increases billing. The fitness app itself is not yet healthy on the existing Windows runtime; the next step is either a Windows-compatible entry point or a separate Linux plan.

## Linux preview deployed — 23 September 2026

- Broken Windows fitness Web App was removed and recreated as `fitness-tracker-ca` on separate Linux B1 plan `fitness-linux-b1` in Canada Central.
- Current live verification passed: `https://fitness-tracker-ca.azurewebsites.net/` returned HTTP 200 and the app hero; `/api/status` returned `{"authenticated":false,"hasUser":false}`.
- Friends Showdown remains on the shared Windows B1 plan `adeticket`.
- No custom domain or real health data has been connected. Before personal use, configure backups, persistent storage expectations, and the GitHub OIDC workflow.

## Azure GitHub OIDC prepared — 23 September 2026

- Created managed identity `fitness-tracker-github` in `Kayode_IGO`, scoped Contributor only to the `fitness-tracker-ca` Web App.
- Added federated trust for `Caryourday96/fitness-tracker` main branch.
- Repository still needs the three GitHub Actions secrets added by the owner; no secret values are stored in this checkpoint.
- Verification still needed: authenticated integration tests for cross-user access denial, malformed signatures, size limits, deletion, and browser upload UI.

## Azure Google identity provider configured — 23 September 2026

- Azure App Service Authentication for `fitness-tracker-ca` is enabled with unauthenticated requests allowed, preserving the app's existing private account login flow.
- Google is listed as an active identity provider in the Azure portal. The client identifier is intentionally not recorded here; the client secret remains only in Azure configuration.
- This enables the Azure Easy Auth endpoint, but the application has not yet been changed to map Google identities to its local account. Google login is therefore an optional gateway, not a replacement for the app login.
- Portal verification: Authentication page showed `App Service authentication: Enabled`, `Restrict access: Allow unauthenticated requests`, `Token store: Enabled`, and a Google provider row.
- Direct endpoint test could not be completed from the browser automation environment because the authentication URL was blocked by the browser client; no claim of successful Google sign-in is made.
- Next exact action: manually open `https://fitness-tracker-ca.azurewebsites.net/.auth/login/google`, complete Google consent, then confirm the app returns. After HTTPS is bound for `fit.adeticket.com`, add and test the custom-domain callback if Google should work there.

## Custom-domain TLS verified — 23 September 2026

- Azure Custom Domains page now reports `fit.adeticket.com` as `Secured`, with `SNI SSL` binding and certificate `fit-adeticket-com`.
- This removes the previous TLS wrong-principal blocker for the custom domain.
- Google Cloud OAuth client currently shows the custom redirect URI `https://fit.adeticket.com/.auth/login/google/callback` in its authorized redirect URI list.
- The Azure hostname callback remains optional for testing; the intended user-facing callback is the secured `fit.adeticket.com` hostname.
- Next exact action: test `https://fit.adeticket.com/.auth/login/google` in a normal browser session. If Google rejects the redirect, add `https://fitness-tracker-ca.azurewebsites.net/.auth/login/google/callback` to the same Google client and save.

## Google app sign-in and iPhone layout — 24 September 2026

- Added a secure Azure Easy Auth bridge in `server.js`: in production, an authenticated `x-ms-client-principal` email can create the first local account or match the existing single account. A different email is rejected; Google passwords/tokens are not stored.
- Added a `Sign in / sign up with Google` link to the auth screen, targeting the canonical `fit.adeticket.com` flow.
- Added iPhone-focused responsive CSS: safe-area padding, larger touch targets, horizontally scrollable tabs, stacked action buttons, mobile exercise set rows, and readable overflow handling for tables.
- Updated README and deployment guidance to make `fit.adeticket.com` the only user-facing URL.
- Verification: `node --check server.js`, `node --check public/app.js`, `node --test --test-force-exit` — 7 tests passed. `git diff --check` passed.
- Not yet deployed: the live custom domain still serves the previous release until the tracked changes are committed and the GitHub/Azure workflow succeeds.
- Next exact action: commit and push these tracked changes, then verify the live iPhone auth layout and Google redirect at `https://fit.adeticket.com`.

## Google/iPhone changes pushed — 24 September 2026

- Commit `0b2a488` is pushed to `Caryourday96/fitness-tracker` main after rebasing the repository's latest Azure workflow commit.
- Two deployment workflows started for this commit: generated Azure Deployment Center run `35939852009` and the existing custom workflow run `35939851993`. Both were still in progress at the last check; live publication is not yet claimed.
- Once a workflow succeeds, manually verify the canonical site at `https://fit.adeticket.com` from iPhone Safari: auth layout, Google button, and dashboard touch targets.

## Backlog quick win: Google button polish — 24 September 2026

- Live release `0b2a488` was verified on `https://fit.adeticket.com`; the Google redirect reached Google's account chooser, confirming the custom-domain OAuth route is active.
- Updated the Google action to a clearer `Continue with Google` button with an inline Google mark, visible focus state, press state, and iPhone-sized touch target. Updated backlog to record completed Google/mobile work and add a first-run setup card as the next quick win.
- Local verification: 7 Node tests passed, syntax checks passed, and `git diff --check` passed.
- Pushed follow-up commit `48e294e`; its Azure deployment is pending. Next exact action: wait for that run to succeed, then refresh `fit.adeticket.com` on iPhone and complete the first check-in to start today's workout.

## Login blocker and persistence checkpoint
- User returns to login after Google. Confirmed local API query used invalid SQLite quoted identifier for completed status; fixed with bound parameter. Nine local tests pass including HTTP account, CSRF, workout-save/conflict, reconnect and logout. Reconnect test is not full-process restart or Azure persistence proof.
- Narrow live SQL fix is being applied using Azure single-file static deployment of .deploy/login-hotfix.js to server.js with clean=false; no database files targeted. Client error-display-only file also deploying. Deployment completion and signed-in result pending.
- Uncommitted security.js, server.js, public/app.js, onboarding and button changes remain local. OWNER_EMAIL required by new code; must configure/confirm before full release. Storage still uses original data directory until backup/migration is verified. Do not deploy full dirty tree. No usage resets used.
- Next: finish live hotfix verification, persist same fix on GitHub without shipping unfinished changes, then backup/migrate live SQLite/uploads outside wwwroot and prove preservation.

- Live check: fit.adeticket.com/static/app.js returns 200 with new error handler; /api/status returns 200 and hasUser=true. Existing account remains present. Server deployment health polling still pending despite public app responding. Google sign-in completion not yet verified.

## Live persistence migration verified
- Stopped Azure app; copied complete original data to /home/steady-data and timestamped /home/steady-backups. File hashes matched; SQLite integrity OK. Original retained.
- Set DATA_DIR=/home/steady-data and WEBSITES_ENABLE_APP_SERVICE_STORAGE=true, restarted. Existing users/workouts/checkins/upload metadata matched original. Public status returned200 and hasUser=true. No private record values exposed.
- Scoped release worktree .deploy/persistence-release at d9029a9 pushed to main. Includes only SQL login fix, error display, button correction, persistent path and deployment allowlist. CI run35941437612 pending. Root worktree still contains unfinished security/onboarding/logging changes; do not overwrite with release worktree.
- Next verify CI success and post-deployment data, then owner Google login. Off-service backup/restore rehearsal and broader mobile/security QA remain.

- Release d9029a9 CI35941437612 build/deploy succeeded. Post-deployment original-record comparison against backup passed; public /api/status200 and account present. Google end-to-end owner sign-in still not verified; broad changes not deployed.

## Luna model routing check — 24 September 2026
- Owner confirmed this task is running Luna. Read root/project instructions, workspace `PROJECT_STATUS.md`, canonical `BACKLOG.md`, current Git status, and the latest worktree checkpoint.
- The ordered canonical backlog has no uncompleted, unblocked item assigned to Luna. Item 1 is Sol implementation with Astra safety review; the later open items are assigned to Sol/Astra or the owner. No item was reassigned or implemented.
- Root checkout is `main` behind `origin/main` by 18 commits and has unrelated existing modifications; `.deploy/accountability-link` has local unshipped changes. Git status for `.deploy/persistence-release` was blocked by a dubious-ownership warning; no global safe-directory exception was added.
- No application code, tests, commit, push, deployment, or Azure resources changed. Updated only the canonical backlog routing note and the checkpoints. Exact next action: run the task with Sol for item 1, or assign a specific bounded backlog item to Luna before a Luna-only run.

## Sol item 1 and fitdays HTTPS checkpoint — 24 September 2026
- Owner corrected the selected model to Sol light and explicitly requested `fitdays.adeticket.com` work. Canonical backlog item 1 remains the highest eligible item.
- Azure `fitness-tracker-ca` already had an issued free managed certificate for `fitdays.adeticket.com`; bound its thumbprint with SNI. Azure hostname status is `SniEnabled`. Direct HTTPS requests without certificate bypass returned HTTP 200 for the page and public workout-days API. The public route exposes dates only by design. No app code was deployed.
- In `.deploy/accountability-link`, focused `rest-day.test.js` passed 3 tests: safety/recovery precedence, two-target cardio progression/time caps/readiness pause, high-energy regular override, blocked unsafe choices, clinician/injury restrictions, easy-walk choice and started-workout protection. Server/client syntax and scoped whitespace checks passed.
- A 390px local browser check found that recovery rendering removed `#startWorkout` before the override controls could find their panel. Changed the controls to find the recovery plan heading/panel. After reload both choices were visible with no horizontal overflow; selecting regular showed its strength/cardio plan. Preview used a synthetic account and temporary local data only.
- Item 1 remains local and unshipped in a dirty worktree. Root checkout is behind `origin/main` with unrelated edits; no commit, push, GitHub Actions, application deployment or paid resource provisioning occurred. Exact next action: review the scoped worktree diff, run required CI on a release branch, then request final authorization before deployment; verify live behavior after release.
- Follow-up public browser verification: `https://fitdays.adeticket.com/` opened over trusted HTTPS and loaded the workout-day calendar totals. The focused regression file was rerun after adding the 90-minute cap case: 3 tests passed; no application deployment.

## Fitdays quick-glance counter and motion polish — 24 September 2026
- Request: add a quick-glance counter to the upper-right of Fitdays; preceding request also asked for subtle animation across Fitdays, the main fitness app, and the public accountability page.
- In isolated `.deploy/accountability-link`, the Fitdays hero now shows the number of completed workout dates from January 1 through the API's current date, labelled with the current year. Existing rolling 7-, 30-, and 365-day totals remain unchanged. Counts still come only from public completed workout dates.
- Added a compact responsive header badge. Local browser preview at 390x844 showed the counter and label in the top-right without horizontal overflow (document width 375 inside 390 viewport). DOM showed 3 year-to-date dates against synthetic preview data. Main, sharing, and Fitdays pages have restrained CSS entrance/number animations and lightweight manga-inspired speed-line/sparkle accents; `prefers-reduced-motion` disables movement. No third-party GIFs or libraries were added.
- Files changed for this request: `public/fitdays.html`, `public/fitdays.js`, `public/fitdays.css`; animation work also touches `public/app.js`, `public/app.css`, `public/partner.js`, `public/partner.css`. The isolated branch also contains prior unshipped app/product changes; keep the current release scoped.
- Verification: `node --check public/fitdays.js`, `node --check public/app.js`, `node --check public/partner.js`, and `git diff --check` passed. Local responsive browser check passed at 390px. No test suite run, per owner preference. Usage snapshot: 24% five-hour used, 51% weekly used; no reset redeemed.
- Status: local only, not committed/pushed/deployed. No production deployment or DNS changes. Exact next step: review the scoped release diff and CI for the authorized changes, then deploy only after explicit authorization.

- Update: deployment for commit `c3e711073563cb2cc7b0df8766bdc362eda1fb54` finished successfully in GitHub Actions run `36057228505` (build/test and deploy jobs both success). Live HTTPS requests returned 200 for `fitdays.adeticket.com/`, its JS/CSS, `/api/public-workout-days`, `fit.adeticket.com/`, and public app/share JS assets. The live public API was checked for status only; no workout dates or private records were printed. Canonical backlog reflects this release. Begin item 2 now; do not deploy subsequent changes until each is reviewed and the final batch passes CI.

## First-pass order: preferred weekdays and training templates — 24 September 2026
- In isolated release worktree `.deploy/accountability-link` based on deployed `c3e7110`, completed the preferred-weekday and distinct 3-/4-day template work. `training.js` now provides deterministic full-body A/B/C and upper/lower A/B sequences, matching-day scheduling, saved-template history context, and safety/recovery/weekly-cap precedence. Server validates empty or exact-count weekday schedules, stores a server-derived snapshot with a session, and does not silently replace active/completed work. Onboarding and Settings both support weekday choices.
- Focused tests cover schedule validation, distinct and cycling templates, safety precedence, saved history context, future-record exclusion, profile validation/persistence, and plan snapshots on reconnect.
- Verification: `npm test` passed 30/30; `node --check` passed for `training.js`, `server.js`, and `public/app.js`; `git diff --check` passed. A local 390px browser smoke test verified weekday selection, validation, saving, Settings edit, and changing from a 3-day to a 4-day schedule without horizontal overflow. It used a synthetic local account and data only.
- Not yet committed, pushed, or deployed. Remaining concern: no physical iPhone Safari check; no cross-device live user data was inspected. The release is isolated from dirty main-checkout changes.
- Usage checked: 27% of five-hour used and 51% weekly used. User requested stop and finalize at 45% five-hour usage; check before substantial work and checkpoint at that threshold.
- Exact next action: inspect the screenshot OCR option in backlog order, keep all extraction local and owner-confirmed, and avoid automatic save or third-party image processing.

## Sol first-pass backlog implementation — 24 September 2026
- See the current, detailed checkpoint in `.deploy/accountability-link/CODEX_PROGRESS.md` and `FIRST_PASS_HANDOFF.md`; canonical queue is `BACKLOG.md`.
- Locally implemented preferred templates plus legacy repeat prevention, sparse History charts, app-switch-safe rest timer, private dated progress-photo timeline, and a public-shell-only PWA. OCR is paused by owner; reminders and secure invite sharing are deferred for the documented infrastructure/decision reasons. External workout-catalog API review is documented; no external user data is sent.
- Verification: 38/38 node tests; JavaScript syntax and whitespace checks pass; synthetic 390px local browser preview has no horizontal overflow. Not pushed/deployed yet. Latest visible usage at checkpoint 30% five-hour used/52% weekly used; stop by 45% five-hour usage.
- Exact next: inspect scope, reconcile canonical docs into release worktree, push to main, monitor CI/deploy and check public status/assets only.

## Pre-release verification update — 24 September 2026
- Tightened upload creation so invalid image categories are rejected instead of silently stored as screenshots; verified the additive `uploads.kind` migration against the existing schema in integration coverage.
- Final pre-release suite: `npm test` passed 38/38. Syntax checks and `git diff --check` passed after all source changes.
- Git fetch confirmed release HEAD and `origin/main` are both deployed base `c3e7110`; no upstream commits are missing. The isolated worktree contains only the listed app, tests, backlog and handoff files. Review/stage these paths, then push to `main` as explicitly authorized.
- Usage now 32% five-hour used and 52% weekly used. Stop by 45% five-hour use.

## First deployment smoke finding — PWA public route compatibility — 24 September 2026
- Commit `d628326` reached GitHub Actions run `36063235879`; build/test and Azure deploy jobs both succeeded. Live root, existing `/static/*` assets, `/api/status`, public `/partner`, and Fitdays page/API returned HTTP 200. Owner uploads/list/image routes returned HTTP 401 when unauthenticated as expected.
- The new root-level `/manifest.webmanifest` and `/sw.js` returned HTTP 401 from Azure EasyAuth, despite their local routes being public. Root cause is platform-level unauthenticated-path policy; no production auth rules were modified.
- Corrected locally to reference `/static/manifest.webmanifest` and register `/static/sw.js` with `Service-Worker-Allowed: /`. These use the already-public static path while preserving root worker scope and keep all private APIs/images excluded.
- Local `npm test` remains 38/38 after the route correction; server/app/worker syntax and `git diff --check` pass. Follow-up commit is not yet pushed; current public `main` is `d628326` with all other first-pass work deployed and PWA install disabled until this small patch deploys.
- Exact next: commit/push only this scoped route fix; wait for Actions; verify `https://fit.adeticket.com/static/manifest.webmanifest` and `/static/sw.js` return 200, service-worker header permits `/`, and authenticated upload routes remain unauthorized without a session.

## PWA EasyAuth route correction — 24 September 2026
- Production deployed commit `d628326` through successful Actions run `36063235879`, but smoke testing found root-level PWA manifest and worker requests return Azure EasyAuth 401. Existing app and `/static/*` assets were 200; unauthenticated upload endpoints stayed 401 as expected. No Azure authentication config was weakened.
- Moved manifest and service-worker URLs to `/static/` (already-public path), added `Service-Worker-Allowed: /` for root scope, and kept API/image caching exclusions unchanged.
- Focused local verification rerun: `npm test` 38/38, syntax checks and `git diff --check` pass. Correction awaits a small follow-up push and a second live smoke check.

## PWA cleanup and exercise-catalog question — 24 September 2026

- Investigation confirmed `0fbd7a1` is the deployed base. `/static/manifest.webmanifest` works, but Azure omits `Service-Worker-Allowed`, making the static-path worker incapable of controlling the root page without changing EasyAuth. No auth change is authorized or needed for standalone Home Screen metadata.
- Inspection of the proposed worker removal found a stale `clearAppShell()` call in the sign-out-everywhere handler. Removed the call and added a migration that unregisters only this app's prior `/static/sw.js` registration and clears only `steady-public-shell-v1`; it does not register/cache new content. Updated regression coverage and user-facing docs to say offline use is unavailable.
- The user also asked about reputable APIs for more weight-loss-focused workout mixes. The existing P2 catalog-only backlog row remains the right scope: wger exposes public exercise catalog endpoints; ExerciseAPI documents 100 anonymous free calls/day and CC BY 4.0 attribution. Neither provides medically reviewed individualized weight-loss plans. No API calls or private data sharing were added. Source links are in `PRODUCT.md`.
- Verification after implementation: `npm test` passed 38/38; `node --check` passed for server, app, chart and rest timer; `git diff --check` passed. Grep confirmed no stale `clearAppShell`/worker-registration call remains and only the targeted old-cache migration is present.
- Commit `aeb889a` was pushed and deployed successfully by GitHub Actions run `36064833990` (build and deploy success). Live checks show app/manifest 200 and private uploads 401, but Azure retained and still served the old `/static/sw.js` file after package deletion.
- Follow-up implementation explicitly returns 404 for only `/static/sw.js`; integration coverage asserts this. After this additional narrow fix: `npm test` 38/38, server/app syntax and `git diff --check` pass. No authentication rules or Azure resources were changed.
- Latest visible usage at investigation: five-hour 34% used, weekly 52% used; stop before the user's 45% five-hour ceiling.
- Explicit denial commit `f2774a0` was pushed to `main`; GitHub Actions run `36065292733` passed both build/test and deploy. The Azure app was restarted because the successful package deploy left the old Node route process active. After restart, live checks returned 200 for the root, manifest and icon; 404 for `/static/sw.js`; 200 for `/api/status`; and 401 for unauthenticated upload list/image endpoints. `fitdays.adeticket.com` page/API returned 200.
- Focused verification remains 38/38 tests, syntax checks for server/app/chart/timer and `git diff --check`.
- The exact next step is to reconcile canonical backlog/progress records in the workspace root and push the final verified release note. No more application code or Azure changes are planned in this pass.

## Optional ExerciseAPI alternatives — 24 September 2026

- User asked for additional weight-loss-focused workout mixes from a reputable fitness API. Reviewed wger and ExerciseAPI. wger has public exercise endpoints but record licenses vary CC BY-SA; ExerciseAPI's API docs expose a smaller structured catalog with explicit CC BY 4.0 attribution. This is catalog metadata, not evidence of clinical review or individualized weight-loss programming.
- Imported a fixed allowlist of five API records into `exercise-catalog.json` (dataset 1.1.0): goblet squat, cable pull-through, chest-supported dumbbell row, single-arm dumbbell row and band seated row. Local movement mappings are exact-pattern only (squat, hinge, horizontal pull); no push/vertical pattern crossovers. Alternatives display equipment and source attribution, save under their own exercise names, and do not transfer performance loads. Coarse home equipment profiles receive no API-sourced gym options.
- `npm run catalog:sync` downloads only public catalog endpoints, checks the API license and each approved movement pattern before rewriting the snapshot. Normal workout plans make no external API request and send no personal, health, history or screenshot data. Existing 3-/4-day plan sequence, sets, safety/recovery and cardio rules remain unchanged; no API-created weight-loss plan or extra volume is implied.
- Verification: `npm test` passed 41/41; `catalog:sync` successfully generated the 5-record snapshot; `node --check` passed sync script, catalog module, training planner, server and app; `git diff --check` passed. Release is local only; no deployment occurred for this catalog change.
- Usage at checkpoint: 38% used in five-hour window and 53% weekly. Exact next step: review the scoped diff, push the catalog feature to `main` under existing deployment authorization, monitor Actions, and verify a new plan returns attributed alternatives with no runtime vendor dependency. Stop before the owner's 45% five-hour ceiling.

## Exercise catalog expansion and release — 24 September 2026

- Expanded the reviewed snapshot from 5 to 13 ExerciseAPI dataset 1.1.0 entries: three or more selectable options for squat, hinge, horizontal push and horizontal pull. The catalog API supplies choices and equipment/cue metadata only; it does not dictate a weight-loss program. Existing plan sequence, set volume, cardio progression and safety restrictions remain local. The change does not randomize workouts or change the active exercise without the owner selecting “Use alternative.”
- Alternatives store their own equipment/source/license/cue and keep performance history separate. The UI uses the selected exercise's muscle and cue details. Home profiles receive no third-party gym alternatives; attribution appears when alternatives are included. The production process loads a committed snapshot and makes no vendor API request.
- `npm run catalog:sync` fetched fixed public endpoints and generated all 13 reviewed records after checking the license and movement-pattern mapping. `npm test` passed 41/41; syntax checks passed for the sync script, catalog, training planner, server and client; `git diff --check` passed. An initial assertion expecting three hinge choices inside every generated template was corrected to require at least two where a template includes that pattern; final suite passes.
- Files changed: `.github/workflows/main_fitness-tracker-ca.yml`, `exercise-catalog.js`, `exercise-catalog.json`, `scripts/sync-exercise-catalog.js`, `package.json`, `training.js`, `server.js`, `public/app.js`, `training.test.js`, `exercise-catalog.test.js`, `integration.test.js`, `README.md`, `PRODUCT.md`, `BACKLOG.md`, `FIRST_PASS_HANDOFF.md`, and this checkpoint.
- Commit `92856ef` is on `main`; GitHub Actions run `36068156462` passed build/tests and Azure deployment. Live checks: app root, app JS, manifest and `/api/status` returned 200; obsolete service-worker route remained 404; unauthenticated private upload route remained 401. Public app JS contains ExerciseAPI attribution, CC BY 4.0 credit, equipment and alternative-selection UI. No authenticated production plan was opened, so account-specific rendering was not verified live.
- Final verification: `npm run catalog:sync` saved 13 reviewed records; `npm test` passed 41/41; five JS syntax checks and `git diff --check` passed. Usage last checked 39% five-hour / 53% weekly, under the 45% stop point.
- Exact next action: owner opens `https://fit.adeticket.com`, completes the normal check-in, starts/resumes the workout and uses **Use alternative** to review equipment/cues. This item is deployed; don't change program volume/cardio based on catalog data without a separate, evidence-based task.

## Ready-screen catalog choices checkpoint — 24 September 2026
- Cause: ExerciseAPI alternatives appeared only after Start workout; the owner's confirmed pre-release plan lacked saved catalog metadata. Screenshot shows a Ready rest-day-override plan with no choice control.
- Implemented locally in isolated release worktree: decorate saved plan responses with catalog options without changing plan sets/cardio; show labelled choices and equipment/cue preview before Start; carry chosen exercise identity into workout logging. Focused legacy-plan regression added. Files: training.js, server.js, public/app.js, public/app.css, training.test.js, integration.test.js, README.md, BACKLOG.md.
- Checks: npm test 42/42, node syntax for server/client, git diff --check passed. Local HTTP responds 200. In-app browser could not reach localhost despite that response, so phone-width visual check is unverified. No commit, push, or deployment for this fix yet.
- Usage now 52% used five-hour / 55% weekly, past owner's 45% stop threshold. Stop work here. Exact next action: inspect the scoped diff; do a mobile browser check when available; commit/push the fix from the isolated release worktree; monitor GitHub Actions and live status; then mark backlog item 12 complete with verified deployment evidence. Do not claim this is live yet.

## Ready-screen catalog choices deployed — 24 September 2026
- Owner explicitly requested `PUSH TO MAIN`. Committed and pushed `ef5ff4a` (`Show workout alternatives before starting`) from the isolated release worktree to `main`.
- Verification before push: `npm test` passed 42/42 and `git diff --check` passed after removing one trailing blank line. GitHub Actions run `36073202783` completed successfully for build/test/deploy.
- Live public smoke checks after deployment: `https://fit.adeticket.com/`, `/static/app.js`, and `/api/status` returned 200; deployed `app.js` contains the new ready-screen catalog selector code. `https://fitdays.adeticket.com/` and `/api/public-workout-days` returned 200 with date-only data. No private account/workout data was inspected.
- Backlog item 12 is complete from a code/deployment standpoint. Remaining owner action: sign in on iPhone, open today's Ready workout, confirm selectors appear before Start, choose one, start the workout, and confirm the chosen exercise is what gets logged. Usage at release check: 56% five-hour / 56% weekly; no reset credit used.

## Sol backlog item 5 preparation — 24 September 2026

- Checked the clean release worktree at `0793056` against fetched `origin/main`; the root fitness checkout remains dirty and 28 commits behind. The highest unfinished Sol item is owner iPhone Safari verification. Screenshot OCR is paused by owner; reminders and offline support are deferred pending product/platform decisions.
- Updated `IOS-OWNER-CHECKLIST.md` to include the deployed Ready-screen exercise-choice flow. The physical signed-in iPhone walkthrough remains unverified and requires the owner; do not mark it passed from desktop or CI evidence.
- Updated the canonical backlog release header and item 5 status. This is documentation only: no app code, production configuration, private data, paid resources, push, or deployment changed in this run. Focused `git diff --check` passed; app tests were not run for a checklist-only change.
- Latest visible usage: five-hour 74% used (26% remaining), weekly 59% used (41% remaining). The owner changed the stop-and-release threshold to 10% remaining in either window. Exact next action: owner runs the iPhone checklist and reports pass/fail plus iOS/Safari versions without sharing private data. Record results, then revisit the next unblocked assigned item. No threshold-triggered release has occurred; this documentation update remains local.

## Whole-workout alternatives and iPhone install preparation — 24 September 2026

- Owner clarified that a single button should propose a different suitable daily workout, avoiding yesterday’s logged exercises where same-pattern choices exist, while preserving the longer-term weight-loss-supportive training sequence. The previous Ready selectors only changed exercises one by one; existing confirmed plans could still show yesterday’s exercise names.
- In isolated release worktree `fitness-tracker/.deploy/accountability-link`, added a server-side `/api/plan/alternative` action for confirmed, unstarted plans. It cycles a whole strength-exercise mix, prefers names not logged in the latest session, preserves movement patterns, sets and cardio, and rejects safety stops, blocked recovery overrides, and started/completed workouts. Fresh template plans also avoid yesterday’s exact names where a suitable same-pattern choice exists. No randomization or load transfer.
- Added the Ready-screen **Show another workout** button, an iPhone Safari Home Screen guide, a Steady SVG favicon link, README instructions, and focused regression coverage. Local verification: `npm test` 43/43 passed; `node --check` for planner/server/client and `git diff --check` passed. No authenticated iPhone/browser run or production data check yet.
- Backlog items 13 and 14 are local release candidates. Latest visible usage: five-hour 85% used (15% remaining), weekly 60% used (40% remaining). Owner requested deployment at 10% remaining and an immediate stop, so no push/deploy yet. Exact next action: inspect final scoped diff, then commit and push this isolated release before usage falls below the 10% reserve; verify GitHub Actions and public live assets, update deployed status, then stop.

## Ten-percent stop and release handoff — 24 September 2026

- Pushed scoped fitness release commit `97ee25e` (`Offer another suitable daily workout`) to `Caryourday96/fitness-tracker` `main`. Push succeeded; GitHub Actions/Azure deployment completion has not been verified. The local `gh` executable is unavailable, so do not claim the site is updated yet.
- Release includes the Ready **Show another workout** action, yesterday-name avoidance for fresh plans, same-pattern/sets/cardio and recovery safeguards, an iPhone Add to Home Screen guide, and the Steady favicon. `npm test` passed 43/43 before final equipment filter; focused planner/API tests passed 11/11 after that filter. JavaScript syntax and `git diff --check` passed.
- Latest visible usage: five-hour 90% used (10% remaining), weekly 61% used (39% remaining). Per owner instruction, stop now. No reset credit redeemed. Exact next action after usage reset: check the GitHub Actions run for `97ee25e`, verify `https://fit.adeticket.com` serves the new app JS/favicon and the signed-in iPhone Ready button; then update backlog items 13/14 to deployed only if evidence supports it. Preserve the dirty root fitness checkout.

## Backlog reconciliation after workout-choice deployment — 24 September 2026

- Verified commit `97ee25e` on GitHub Actions run `36075358573`: completed successfully. Live `https://fit.adeticket.com/`, `/static/app.js`, `/static/steady-icon.svg`, and `/api/status` returned HTTP 200. The served app JavaScript contains **Show another workout** and the iPhone installation guide; root HTML contains the favicon link. These checks establish public deployment, not a signed-in iPhone walkthrough.
- Reconciled canonical `fitness-tracker/BACKLOG.md` and isolated release copy: recommended implementation order now lists only open work. Deployed workout-choice and install/favicon items moved to Completed; owner-removed backup/release checks remain absent. Current first item is physical iPhone Safari verification, prepared but dependent on the owner’s device. OCR remains paused by owner; offline support needs an approved Azure worker-scope path; reminders need a delivery decision; authenticated partner sharing remains deferred by the owner’s public-link choice.
- No app code, production configuration, DNS, paid resource, push, or deployment changed in this reconciliation. Focused `git diff --check` passed for the release worktree and root fitness checkout. The root checkout is still dirty/behind and was not reset. Latest visible usage: five-hour 5% used, weekly 62% used; no reset credit redeemed. Exact next action: collect owner iPhone checklist results; triage a specific failure if reported. If the owner resumes a paused item, verify its gate and implement only that item. No usage should be spent just to hit the requested budget.

## Backlog scope correction — 24 September 2026

- Owner explicitly requested removal of the P2 row for invited authenticated partner sharing, which was deferred under the current public-link decision. Removed the row from canonical `fitness-tracker/BACKLOG.md` and the isolated release copy. A targeted search found no remaining row, and `git diff --check` passed in both checkouts.
- This is a backlog-only change. Existing public workout-link behavior remains as-is; no application code, authentication, production data, push or deployment changed. Exact next action: continue with the remaining recommended backlog items in priority order; do not restore the removed work unless the owner requests it.

## Owner iPhone Safari verification — partial, 24 September 2026

- The owner reported that Google sign-in survives refresh and Today shows Ready on iPhone Safari. The owner also reported that Show another workout changes the strength mix and avoids yesterday's exercises, an individual exercise selector works, and the installed Home Screen icon opens the site while online. These are owner-observed results, not a direct device session inspected by Codex.
- Updated `IOS-OWNER-CHECKLIST.md` and marked backlog item 1 in progress in both canonical and release copies. No app code or production configuration changed; no deployment is needed for this verification checkpoint.
- Remaining verification: real-session logging/resume and rest timer; History layout/coverage; private image upload flow; CSV/print export; public Share create/view/revoke; logout. iOS/Safari version not yet reported. Exact next action: collect the owner's remaining pass/fail reports, investigate any specific failure, and keep the item open until those checks finish.

## Owner iPhone Safari verification — findings and local History fix, 24 September 2026

- Owner additionally reported pass for private PNG/JPEG upload, preview, caption edit, replace and delete; CSV download and printable summary; public Share link create/view/revoke; and logout requiring sign-in before private records reappear. Owner was not working out, so set/cardio persistence, Resume workout and rest timer remain deferred until a real session. Owner reported whole-page horizontal overflow on History using an iPhone 15 Pro Max with iOS 27.0; Safari version was not reported.
- In `public/app.css`, changed the chart grid track to `minmax(0,1fr)`, constrained History panels/chart sections, and prevented SVG charts from extending the viewport. This is a plausible cause-directed CSS fix, but the exact owner's private History content has not been reproduced locally and the live iPhone result is not yet verified.
- Focused local browser check with representative History content: document scroll width equalled viewport width at 390px (390) and stayed below viewport at 320px (305); chart widths were 330px and 245px respectively. `git diff --check` passed. No application unit suite was run for CSS-only change. No push or deployment occurred. Exact next action: review and release the scoped CSS fix with authorization, then owner rechecks History on iPhone; verify logging/timer during a real workout. Keep backlog item 1 open until then.

## History release and date-sensitive CI repair — 24 September 2026

- With explicit owner authorization, pushed History CSS/checklist/backlog commit `2584e79` to `main`. Actions run `36083833299` failed in the test step; deployment was skipped and live CSS still lacked the fix. The integration test used September 25, 2026 as a supposedly future day, which ceased being future in UTC on September 25.
- Replaced hardcoded integration-test days with UTC-relative recorded/prior/future days. Local CI command `node --test --test-force-exit` passed 43/43; `git diff --check` passed. Pushed repair commit `2b68a6f` to `main`; Actions run `36084005412` was still in progress at this checkpoint. Exact next action: verify Actions success and live CSS, then request owner History recheck. No private data or paid resources changed.

## History live verification and reminder/offline implementation — 24 September 2026

- Actions run `36084005412` completed successfully; live `https://fit.adeticket.com/static/app.css` returned 200 and contained the History `minmax(0,1fr)` fix. Owner answered yes to the subsequent iPhone History recheck. Real workout logging/resume and rest timer are still deferred until a real session. iPhone 15 Pro Max, iOS 27.0.
- Owner requested iPhone push plus in-app gentle reminders and offline Home Screen support. In the isolated release worktree, added root `/sw.js` and public `/offline.html`; the worker only caches public offline assets and never API/private responses. Added opt-in, timezone-aware in-app check-in notice and iPhone push controls. Push subscriptions are authenticated and restricted to Apple endpoints; generic payloads, one-send-per-day tracking, 10-minute send window, and explicit device disable are implemented. Added `web-push` dependency and documented VAPID configuration. Azure App Service `alwaysOn` was read-only verified true.
- Verification: `node --test --test-force-exit` passed 45/45; focused local HTTP routes for `/sw.js` and `/offline.html` returned 200; `node --check` and `git diff --check` passed. No VAPID settings, production push delivery, offline iPhone launch, or new deployment has been verified. Exact next action: review the local diff and deploy only with explicit owner approval, configure VAPID keys privately, then owner tests offline launch and actual notification delivery/revocation. Backlog items 3/4 remain open until device checks pass.

## Reminder/offline release gate — 24 September 2026

- Final local verification repeated: 45/45 tests passed, JavaScript syntax checks and `git diff --check` passed. Browser-independent unit tests cover timezone timing, one push send per day, check-in suppression and rejection of a loopback push endpoint. The live History fix remains deployed; reminder/offline changes remain only in the isolated worktree.
- Asked the owner whether to deploy code and privately set VAPID keys in the existing Azure Web App, deploy code only, or keep local. No answer had arrived at this checkpoint; do not treat elapsed time as approval. Latest visible usage: 46% five-hour and 30% weekly remaining. Exact next action after approval: commit/push the scoped release, verify Actions and public worker/offline routes, configure VAPID only if authorized, then ask the owner to test actual iPhone delivery and offline launch. No secret was generated or recorded.
