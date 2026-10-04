## 4 October 2026 — Fitdays ideas added to canonical backlog

Added15 ordered follow-ups FD01–FD15, consolidating automatic refresh/freshness and preserving the six implemented features as pending release/device verification. Each item has priority/type, user benefit, acceptance criteria, dependencies/files and suggested model. Privacy settings must enforce counts-only at API level; milestones/bests/annual reports require honest history coverage; schedule sharing needs owner opt-in; exports/share cards contain no private health/workout detail. No application files changed or deployment performed. Next: authorize current batch release, verify iPhone native sharing/install, then implement tracker sync confirmationFD01 and refresh/freshnessFD02.

## 4 October 2026 — all six Fitdays improvements built locally

Implemented month picker/previous/next/today and optional full-year view, device-local optional weekly target, Monday-based weekly recorded counts, month-so-far and equal-elapsed-day comparison with date ranges, keyboard-accessible date details, counts-only1080px PNG sharing/download, Fitdays PNG icons/manifest and iPhone installation guide. Retains365-day-window fix, monthly counts and failed-refresh recovery. Public API payload unchanged; no account/private health data added. Target explicitly comparison-only, not a training prescription; unmarked dates distinguish unknown/recovery/future/outside coverage. Calendar-year quick count labels shown-window limitation.

Verification:54 fitness tests passed before final wording/date-boundary refinement; four focused Fitdays regressions passed after refinement plus JS syntax check. Synthetic browser passed320/390px layout, navigation, persisted target, completed/unmarked dialogs and focus,13-month year view, PNG download, installation guide and failed-refresh retention. Native iPhone share sheet/Home Screen installation not physically verified. Browser regression saved release docs/verification/fitdays-browser.spec.ts; PNG assets180/512 and image/png static MIME added. No service worker/offline records feature added.

Files: release public/fitdays.js,fitdays-data.js,fitdays.html,fitdays.css,fitdays.webmanifest,fitdays-icon-180.png,fitdays-icon-512.png; server.js static MIME; fitdays-data.test.js and browser verification notes. Not deployed. Exact next: owner authorize complete Fitdays release, fetch current main, publish scoped changes via existing workflow, verify live manifest/images/JS and dates-only endpoint; owner verify native share and Home Screen on iPhone.

## 4 October 2026 — Fitdays locally verified, not deployed

Fixed365-day total versus12-month display mismatch: all intersecting months shown, current month first. Added monthly recorded-day counts and Refresh/retry; failed refresh retains last loaded calendar with stale message. Dates validated/deduplicated; unmarked dates do not imply missed workouts. No server/database or public-data expansion.52 fitness tests pass, including two date regressions; synthetic browser passes13-month span, newest-first, failed refresh and320/390px overflow checks. Files in fitness release: public/fitdays.js/html/css, public/fitdays-data.js, fitdays-data.test.js; browser evidence script docs/verification/fitdays-browser.spec.ts requires Playwright harness. Publication pending. Exact next: authorize scoped release, fetch current main, push normally and verify live assets. Owner real-history/iPhone check remains.

## 2 October 2026 — three releases deployed and live assets verified

- Fitness77f788c8b1c7b9b391273043b5d98b7f3cb0fc6f deployed: Actions37058706846 success. Live fit.adeticket.com/static/app.js HTTP200 contains separate-activity/daily-total controls and legacy explanation. Unauthenticated /api/progress returns401. Fifty tests passed locally; five focused tests reran after removing duplicated guarded migration. No owner workout/health data read or changed. Physical iPhone and authenticated real-data total remain owner verification.
- Friends Showdownbebdd43c94b0ee0e57982d5b8bbf9a453fc8febe deployed: Azure37058711420, CI37058711700, browser37058711643 all success. Root/health HTTP200; live /assets/index-Bhv51HVi.js contains both refresh-success/failure messages.100 unit/helper and20 browser checks passed locally. Production restart, TV/iPad and broader outage rehearsal remain outstanding.
- Portfolio35280ee38ebd5d960124f39c5aefa6f91fc4426a deployed: both static-site workflows37058714088/37058714159 success. Live adeticket.com HTTP200 contains fitness and budget canonical links, retaining Friends Showdown. No DNS/paid resource changes. Global portfolio preference saved separately at user Codex AGENTS.md.
- Backlogs reconciled for this batch. Next concrete action: fitness F4 unique accessible History measurement labels; for game coordinate owner-authenticated restart/hardware verification or choose next unblocked implementation. Do not represent those device checks as passed.

## 2 October 2026 — verified release approved

Owner authorized publishing fitness activity-minute classification, game stale-host messaging and portfolio project cards. Fitness: 50 tests pass in isolated fixtures; API duplicates use highest daily total, separate activity adds to workout, legacy unknown unchanged. Game: 100 unit/helper tests and 20 browser tests pass. Portfolio phone widths320/390 pass. No production records modified; deployment pending. Next: push normal fast-forward to main, wait for Actions, verify live assets and record evidence.

## 30 September 2026 — past workout completion deployed

- Owner asked to make yesterday’s completed workout appear on Fitdays and authorized deployment. Commit 255a783 pushed to main; GitHub Actions 36667702904 build and deploy both succeeded. Live https://fit.adeticket.com/static/app.js returned HTTP 200 with the new History form. Fitdays public endpoint responded over HTTPS.
- History can mark a date in the previous 365 days completed. Existing active workout exercise data is preserved; a missing workout gets an empty manual completion record. Duplicate/future/today dates rejected. Empty manual dates can be removed; existing workout logs cannot be deleted with this control. This updates the workouts table Fitdays reads.
- Verification: 49/49 isolated tests passed, syntax/diff checks passed. Integration covered invalid/duplicate dates, authenticated access, Fitdays inclusion/removal, preserved existing sets. Synthetic 390px browser showed yesterday completed and correctable with no console errors or overflow. Production owner record was not changed.
- Exact owner action: open fit.adeticket.com, History, select actual completed date, tap Mark past workout completed, then check fitdays.adeticket.com. A missing workout records only the day, not invented sets or cardio. Next backlog investigation is F3 activity overlap.

## 29 September 2026 — past workout date and Fitdays fix prepared

- Cause: History daily review stores a day_review, while Fitdays queries completed rows in workouts; a prior-day workout could not be completed because /api/workout only accepts today.
- Implemented in .deploy/accountability-link: authenticated POST /api/history/workout for a past date inside the visible 365-day range; preserves an active workout’s saved exercise data or creates an empty manual completion; rejects duplicates, today/future/invalid dates. DELETE reverses only empty manually added days. History form defaults to yesterday, explains no sets are invented, and shows a correction button for manual days. Today’s workout route and plan are unchanged.
- Tests: isolated serial suite 49/49 passed; server/client syntax and diff checks passed. Integration checks invalid dates, duplicate prevention, completed record, Fitdays handler inclusion/removal, preserving existing saved sets and protected access. Synthetic 390px browser verified yesterday form, weekly count, correction removal, no console errors or horizontal overflow. This was local synthetic data, not owner production data.
- Deployment authorized by owner but pending at this checkpoint. Exact next step: commit/push scoped worktree files to main, confirm Actions build/deploy, verify live new History code and public Fitdays availability; then guide owner to record yesterday without touching their private record.

## 28 September 2026 — continuation stopped at owner usage threshold

- User requested further backlog work and another deployment. Start-of-turn usage tool reported five-hour 92% used (8% remaining), weekly 28% used. This is below the saved 10% stopping threshold. No application edits, tests, commit, push or deployment in this continuation. No reset redeemed.
- Existing release remains 9a5ee5b, verified deployed in Actions 36509670600; documentation commit a66f98d is on main. Release worktree was clean.
- F3 investigation: progress.js activityTrend chooses workout minutes instead of activity minutes on a shared date. activity_logs has no source/overlap field; /api/activity only stores kind, duration, distance, steps and notes. Simply summing would risk counting manually copied wearable summaries twice.
- Exact next action after usage reset: design an explicit separate-activity vs overlapping-summary choice, preserve legacy records as unknown overlap, add same-day 15+30-minute and duplicate-summary regressions, implement a minimal compatible change, verify and deploy under the latest authorization. Update canonical BACKLOG.md and both checkpoints. Do not re-add owner-removed work.

## 28 September 2026 — deployment verified

- Pushed 9a5ee5b to main. GitHub Actions 36509670600 completed build and Azure deploy successfully. https://fit.adeticket.com/static/app.js returned HTTP 200 and contains the scoped Today selectors and corrected timer deadline calculation; /api/status responded successfully.
- Shipped F1 Today/History navigation, F10 timer and F2 cardio CSV units. 49/49 local tests passed plus CI build/tests. Synthetic browser verified timer start/pause/resume/navigation/refresh/skip; earlier F1 complete logging flow passed. No production records altered and no data migration/new resource.
- Authenticated production CSV and physical iPhone behavior were not retested; server export regressions cover mi/km/no-distance and CI deployment succeeded.
- Remaining first task: investigate F3 distinct activity vs wearable overlap semantics, then implement/tests without double counting. F4 accessibility and F8 Azure header-boundary verification remain open. Review has seven scoped product ideas and uncertainty labels. OCR remains paused; owner-removed backlog work stays removed.
- Local test browser closed and temporary server stopped. Root preexisting source preserved. Latest usage check: five-hour 79% used / weekly 25% used; no reset redeemed. Stop here to preserve usage.

## 28 September 2026 — authorized release prepared

- Scope F1 navigation + F10 timer + F2 CSV. User requested finishing and deployment before usage runs out. No new paid resources, auth/DNS change or data migration.
- Changed release-worktree public/app.js, server.js, today-navigation.test.js, rest-timer.test.js, integration.test.js; reconciled backlog/review/checkpoints. Root dirty source remains untouched.
- 49/49 isolated tests passed; syntax and whitespace checks passed. Browser timer start/pause/resume/navigation/refresh/skip passed; F1 full workout browser checks recorded above. CSV API checks pass for mi, km, missing distance.
- Git fetched origin/main and confirmed base f36fbeb. Next exact action: commit scoped files, push HEAD to main, verify GitHub build/deploy and live static code. Deployment not yet confirmed.
- F3 separate-activity accounting, F4 accessibility, Azure ingress investigation and remaining review items stay open.

## 28 September 2026 — F1 verified locally; release pending

- Owner authorized the first review fix. Completed F1 in `fitness-tracker/.deploy/accountability-link` (base `f36fbeb`): Today workout selectors now stay inside `#view-today`, so hidden History cards cannot be interpreted as today’s planned exercises. No server/database/planning changes; root dirty app files preserved.
- Application file: `public/app.js` (nine changed lines). Added `today-navigation.test.js` with two regression cases: repeated rendering with saved strength/cardio and a no-plan Today with mounted History. Updated canonical backlog/review and mirrored backlog/review into the release worktree; preserved its earlier checkpoint history.
- Checks: `node --check public/app.js` passed; isolated temporary `DATA_DIR`, `node --test --test-concurrency=1`: 48/48 passed; `git diff --check` passed. Synthetic mobile browser at 390px verified setup, check-in, start, strength save, repeated Today–History–Today, correction, undo, replacement set, cardio save, refresh, completion recap and completion. History showed exactly one replacement strength set and one cardio entry. No browser error/warning logs. Today/History fit 320px (305px document width); 390px Today fit (375px document width). This is Chromium viewport testing, not physical iPhone Safari.
- Separate newly confirmed F10: Start 90s rest timer immediately shows Rest complete. `startRestTimer` clears `paused` before calling `restSeconds`, so a fresh timer without a deadline returns zero. Existing unchanged timer logic; not fixed in this scoped F1 change. Add focused start/pause/resume/refresh coverage next.
- Deployment: NOT pushed or deployed; live release remains f36fbeb based on prior evidence. No production health records, DNS, authentication or Azure resources changed. Local synthetic server stopped after verification.
- Usage milestone: five-hour 41% used, weekly 20% used (59%/80% remaining); no reset redeemed.
- Exact next action: review/authorize release of the scoped F1 patch from this worktree; then fix backlog F10 as a separate change before claiming the timer works. F2/F3 and other review items remain outstanding.

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

## Reminder/offline production release — 24 September 2026

- Owner explicitly approved deployment and push configuration. Added `push-reminders.js` to the GitHub Actions deployment artifact, then committed/pushed `8e94346` to `main`. Pre-push focused CI command passed 45/45. Actions run `36085469470` completed successfully.
- Generated a VAPID pair locally and saved it privately as Azure Web App settings without printing or recording values. Existing App Service `alwaysOn` is enabled; no paid resource was added. Azure was restarted after setting changes. After warm-up, live `https://fit.adeticket.com/sw.js`, `/offline.html`, `/static/reminders.js`, and `/api/status` returned 200. Unauthenticated `/api/push/config` returned 401. No user account data was read.
- The owner iPhone check is pending: launch from Home Screen, enable notifications by tapping the button, observe actual generic delivery at the saved local time, disable/re-enable, and test the offline reconnect page in Airplane Mode. Do not mark backlog items 3/4 complete until these device checks pass. Latest known live code `8e94346`; exact next action: collect owner results and triage any failure. The canonical backlog was reconciled locally after deployment; this status-only doc change has not yet been pushed.

## Push delivery self-test follow-up — 24 September 2026

- Added an authenticated, per-device **Send test notification** control so the owner can verify iPhone delivery immediately even after today's check-in. The server checks subscription ownership and limits tests to once per minute; payload contains no health data.
- Local `node --test --test-force-exit` passed 46/46, including ownership and rate-limit checks; `git diff --check` passed. This follow-up is local until its GitHub Actions release is confirmed. Exact next action: push the scoped change, verify workflow and live asset, then collect the owner's iPhone notification/offline results.

## Test-push release verified — 24 September 2026

- Commit `6e5a359` is on `main`; GitHub Actions `36086322316` completed successfully. Live push-settings JavaScript returned HTTP 200 and contains the test button. Existing VAPID settings remain configured privately; no extra Azure resource was created. Local test suite passed 46/46. Actual iPhone permission, push receipt and offline launch remain owner-device checks. Exact next action: collect the owner's iPhone results and triage any failure; do not mark reminder/offline backlog items complete until then.


## Owner iPhone push and offline feedback — 24 September 2026

- Owner replied 'Yes yes' to the two checks requested after the deployed test button: immediate generic Steady notification and offline Home Screen reconnect page. Treat this as owner-reported pass, not direct device inspection. Reconnect recovery, scheduled reminder delivery, no-push-after-check-in, and disable/re-enable remain unverified. Actions `36086562572` for documentation commit `f36fbeb` completed successfully. No application code changed in this checkpoint. Exact next action: collect remaining owner-device results when convenient; keep backlog items 3/4 open until their full acceptance criteria pass.



## Fitdays authorized release — 4 October 2026
Owner authorized publishing the six-feature batch and continuing FD01/FD02. Final 54/54 Node tests and synthetic mobile browser regression pass (320/390px, navigation, target persistence, dialogs, PNG fallback, refresh failure). No private records changed. Push/deployment pending; next verify workflow/live assets then implement sync confirmation and freshness.


## FD01 sync confirmation — 4 October
Existing isolated integration test proves historical save is public once, duplicate save returns409, deletion removes public date, and logged exercise details survive completion. Updated success notices to distinguish server save from next public fetch. 54 release tests pass before this copy-only change; no owner data touched. Next FD02 return refresh/freshness. Release876701a workflow37240063592 in progress.


## FD02 verified — 4 October
Visible page refreshes on return/online/pageshow with30-second throttle and one-minute visible heartbeat for configured server-local day rollover. Single-flight loading prevents concurrent requests. Actual successful-fetch timestamp and stale failure label added. Synthetic browser passes phone layout, bounded return events, next-day response rollover and preserved data on503. Next FD03 owner visibility design; no API privacy expansion. Initial Azure release still in progress.


## Fitdays release verified and FD03 completed — 4 October
876701a deployed: Actions37240063592 success; canonical page/data/manifest/icon HTTP200, warmed icon image/png. FD01–FD03 follow-up passes54 tests and expanded synthetic phone browser: duplicate history persistence, private-owner-only visibility writes (401/403), invalid mode400, counts-only API excludes date list and DOM removes date buttons/dialog/download; defaults preserve dates. Separate settings table avoids profile overwrites; public timezone now matches selected owner. Visible return and minute refresh handles server-local dates. Native iPhone share/install still pending. Next publish follow-up then FD04 monthly device-local goal. No owner workout values inspected or changed.


## FD04 — 4 October
Optional1–31 monthly comparison target saves only on device; no workout edits or catch-up prescription. Mobile browser confirms12 target persists after reload and current month count matches fixture. Next FD05.


## FD05 — 4 October
Threshold acknowledgement10/25/50/100 uses deduplicated rolling365 count, recomputes on every fetch including corrections; no animation/extra exercise/lifetime claims. Uses counts-only data too. Syntax check next, then FD06.


## FD05/FD06 verified — 4 October
56 Node tests pass including milestone correction and Monday weekly aggregation. Eight-week chart has text counts/ranges and partial-week labels; counts-only server supplies aggregates without completed-date lists. Next FD07 dated private History shortcut.


## FD04–FD07 release candidate — 4 October
Monthly target, rolling-window milestones, accessible eight-week chart and dated private History shortcut are implemented. 56 Node tests pass; two synthetic browser flows pass at320/390px, including selected-date form population and zero writes from navigation, freshness rollover/throttle/stale fallback, target persistence and counts-only DOM. Google redirect date continuity uses tab sessionStorage; physical Google/iPhone check pending. FD01–FD03 ffd317c workflow37240440061 status checked separately. Next deploy this scoped batch, verify live assets, then FD08 period filters; FD08–FD15 remain outstanding. No real workout records or paid resources changed.


## Fitdays privacy final refinement — 4 October
Counts-only refresh now clears previously opened dialog date text and dated private link, not just visible calendar. Two mobile browser tests pass again with hidden-DOM assertions. FD01–FD03 deployment ffd317c Actions37240440061 success. FD04–FD07 0acbc25 pushed; latest deploy verification pending. Next FD08 filters.


## FD08 — 4 October
57 tests and two mobile browser flows pass. Selected date window controls calendar boundaries, dedicated count label and recent weekly chart; full-period summary cards retain explicit7/30/365 labels. Counts-only mode supplies aggregate counts/charts without individual dates. Next FD09 share preview.


## FD09 — 4 October
Two browser flows pass including selected30-day count-only image preview, PNG download and privacy clearing.7/30/90/365 periods supported; individual dates never included in image. Native share cancellation/delivery still owner check. Next monthly recap.


## FD10 — 4 October
58 tests pass including monthly weekly-portion reconciliation and oldest/current partial coverage. Monthly recap select uses recorded counts; no calorie/intensity claims. Next FD11 bests.


## FD11 — 4 October
59 tests pass including corrections/ties and exclusion of partial calendar months. Most-recorded complete month and28-day period are labeled within available coverage, not lifetime. Next FD12 private schedule comparison; public schedule stays unpublished without opt-in.


## FD12 — 4 October
60 tests pass. Private Settings compares elapsed preferred weekdays versus unique completed dates; future/active sessions excluded. Nothing publishes preferred weekdays or treats recovery as failure. Public schedule publication remains unavailable, requiring deliberate owner opt-in design if requested. Next FD13 device-local challenge.


## FD13 — 4 October
61 tests pass. Optional device-local start/end/target challenge supports pause/remove; validates real dates and possible day count. Available coverage and in-progress periods labeled; progress hidden in counts-only mode to avoid individual-date reconstruction. No training integration. Next FD14 factual year recap.


## FD14 — 4 October
62 tests pass. Year recap includes available date bounds, covered calendar days and complete/partial status;365-day leap-year window cannot claim full calendar year. Year count can be previewed in a counts-only image. Next FD15 calendar export.


## Fitdays FD08–FD15 final candidate — 4 October
Implemented date-window filters, counts-only image period/year previews, monthly recap, coverage-labeled bests, private preferred-weekday comparison, device-local challenge pause/remove, partial/full year recap and deterministic-ID all-day ICS export. Counts-only excludes completed-date list and disables date export/challenge date-range progress; no public schedule.63 Node tests pass; expanded two phone browser flows pass at320/390px with challenge, share preview/download, leap/coverage regressions, ICS download and private History/Settings. Optional tools collapsed by default to keep calendar prominent. No fake owner records or new paid resources. Next publish named files then confirm Azure/live assets; native iPhone sharing/install, actual ICS import and Google login date continuity remain owner verification.


## Fitdays final label refinement and release — 4 October
12876cf Actions37241598984 succeeded; live page/model/controller/gym-week assets HTTP200 and include final features; public API contains approved fields only, private visibility/export/progress return401. Found short-window boundary month label still used365-day start; corrected to selected-window start and two browser flows pass again including explicit partial-month assertion. docs/FITDAYS.md explains controls, privacy and unverified native checks. Next push label/docs release and confirm workflow; then owner native checks.


## Fitdays production-policy image verification — 4 October
Final review found public CSP img-src self would block blob preview images despite synthetic visible-element checks. Allowed same-origin blob image previews only (no external image hosts). Browser now loads the actual server CSP and asserts1080-pixel natural image width; both flows pass, including ICS download under policy. Next push this scoped fix and confirm final Azure deployment before closing release checkpoint.


## Fitdays final deployment verified — 4 October 2026
Code54c96fc8c3e9c58b35e2a18cda33dd9136088f30; GitHub Actions37241979733 success. Final CI63 tests and two synthetic phone browser scenarios pass. Live final page/controller/model/private schedule module HTTP200; chosen-window boundary label verified. Existing Web App restart required to replace old in-memory CSP; CLI succeeded and live HTML now permits local blob preview images. Private progress/export/visibility return401 without authentication. FD01–FD15 first-pass implementation complete; FD12 remains authenticated/private and no schedule is published. Canonical backlog reconciled; docs/FITDAYS.md explains use and limits. No paid provisioning, DNS changes or owner workout-record edits. Exact next action: owner checks native iPhone PNG sharing, Home Screen launch/icon, actual ICS import and selected History date after Google sign-in; fix any reported failure before expanding scope. Other app backlogs unchanged.


## 4 October — scoped fitness maintenance
Implemented F4 accessible History measurement/BP labels and one CSV action; F5 weekly notes count actual past gaps; F7 isolated unit-test database before dynamic server import. Files: public/app.js, weekly-review.js, weekly-review.test.js, fitness.test.js, docs/verification/fitdays-browser.spec.ts, BACKLOG.md.64 Node tests and two synthetic phone browser scenarios pass. Initial Windows cleanup of open SQLite failed; removed unsafe exit cleanup and retain synthetic OS-temp directory for housekeeping. No owner data or production auth changes. Authorized deployment pending; next verify main workflow and live assets, then checkpoint release evidence.


## 4 October — fitness maintenance deployed
Release8644a47 pushed to main; GitHub Actions37245282596 build/deploy succeeded. Default npm test and CI-style suite each passed64 tests; two synthetic mobile browser scenarios passed. Live app.js HTTP200 contains measurement/BP labels and excludes the duplicate CSV action. Existing fitness-tracker-ca restarted successfully to load weekly-review module; Fitdays HTTP200, unauthenticated private progress401 after temporary startup timeouts. F4/F5/F7 complete; no owner records, paid resources, DNS or auth configuration changed. Physical screen-reader and real-workout verification remain owner checks. Exact next step: inspect F8 Azure header trust at ingress without changing auth; then implement F6 meal variety.
