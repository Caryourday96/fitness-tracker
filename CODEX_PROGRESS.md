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

## Persistence and login hotfix
- Existing data copied with app stopped to /home/steady-data and /home/steady-backups; original retained. Every file hash matched and target SQLite integrity passed. DATA_DIR set and app restarted. Post-restart comparison pending at checkpoint.
- SQL history query fixed using a bound parameter; login errors now visible. Button styles apply at all widths and SVG has explicit dimensions. Broader security/onboarding changes are deliberately excluded from this scoped release.
- Production artifact allowlist excludes databases, uploads and tests. Duplicate push deployment disabled. Full live Google flow remains owner verification.

## Gym-day release checkpoint
- Implemented first-run Today setup: timezone, load units, duration, weekly sessions, equipment, experience and optional restrictions. Existing saved profiles preserved; defaults no longer contain personal measurements/food list.
- Resume no longer resets sets. Saves use optimistic version checks; stale writes rejected; saved sets can be corrected. Cardio retains duration/distance/incline and units. Input retained after failed saves; saving/saved messages added.
- History offers date-specific daily reviews, step entries and a seven-calendar-day weight summary with coverage. Null measurements remain missing. This is a summary, not the full requested charts/end-of-day feature set.
- 11 tests pass, including HTTP login/private access/workout persistence/conflicts/daily reviews and calendar/trend tests. Phone-width local inspection reached workout controls, but final browser persistence assertion was inconclusive; do not claim full iPhone/Safari acceptance.
- Deferred: private upload UI + decoding, Blob/managed database, multi-instance verification, rest timer, alternatives, full charts, comprehensive safety/auth review. Original root worktree has broader unfinished auth edits. Do not merge blindly.
- Release worktree: fitness-tracker/.deploy/persistence-release. Next: verify deployment then owner gym flow at fit.adeticket.com.

## Backlog continuation — investigation — 24 September 2026

- Current scoped release is `fix/persistent-data` at `6085a76`; only `server.js` and `public/app.js` are modified locally for History. Preserve these edits and do not merge the dirty root checkout.
- Verified implementation: first-run setup, workout resume, treadmill-specific entries, set correction/version checks, daily reviews, steps, and seven-day weight average with coverage. Active workouts are now returned and rendered in History, which should surface an already-saved workout from yesterday without reading the private record here.
- Verified remaining security gap: `security.js` has an `allowedWrite` helper but the request router does not use it; there is no login rate limiting. Session cookie lacks Secure flag, repeated Easy Auth requests issue new local sessions, and no session-management UI exists.
- Verified upload gap: authenticated upload/list/read/delete APIs exist, but there is no UI, caption update route, decoded image dimension limit, or strict base64 validation. Files remain on the App Service persistent disk; no Blob storage or off-service restore exists.
- Other verified gaps: CSV export contains check-ins only; no printable summary, full trend charts, rest timer or implemented exercise substitutions; history daily reviews are date-editable but do not yet collect the requested complete end-of-day metrics.
- Usage at investigation: 0% five-hour used; 16% weekly used (84% remaining). No reset used.
- Exact next action: enforce CSRF on state-changing routes and add bounded login/setup throttling with regression tests; then run the entire suite and update this checkpoint before proceeding.

## Security and upload implementation — 24 September 2026

- Implemented same-origin plus `X-Requested-With: Steady` checks before all state-changing routes; production origin is fixed to `APP_ORIGIN` or `https://fit.adeticket.com`. The client sends the request marker. Added setup/login throttles, bounded JSON bodies with useful 400/413 statuses, Secure production session cookies, Easy Auth session reuse, and Azure logout from the sign-out action.
- Implemented phone upload screen in Today: PNG/JPEG selection, date, caption save, private preview, replace (new upload completes before old one is deleted), and delete. Added authenticated caption update. Server validates strict base64, signatures/dimensions and date; limits images to 5 MB and 25 MP/8,000 px per side; strips common EXIF/JPEG comments and PNG text/time metadata. It does not use external AI.
- Verification: `node --check server.js`, `node --check public/app.js`, `node --test --test-force-exit` (11/11), and `git diff --check` passed. Integration coverage exercises cross-origin and missing-header denial, throttle, active workout history, private image create/read/list/caption/delete, and malformed data rejection.
- Unresolved: image bytes still live under the single-instance persistent App Service volume; no managed DB, Blob Storage, offsite backup/restore or scale test. Image decoder is not a full image re-encoder. No authenticated iPhone manual session run in this phase.
- Next exact action: add a useful 30-day weight/waist history view and complete date-editable end-of-day fields; then expand export and remaining low-risk workout tools.

## Backlog continuation — activity, inventory, weekly schedule and release gate — 24 September 2026

- Reconciled the old backlog against current candidate code and replaced stale outstanding entries in `BACKLOG.md` with tested implementation, true blockers, later items and a release gate. Kept the shared root backlog synchronized. Added `PROJECT_STATUS.md` checkpoint. Removed unused `SESSION_SECRET` from `.env.example`.
- Completed user-visible meal/snack, sleep and activity confirmation on Today; added date fields and strict server validation preventing future entries. History now lists past-year food/sleep/activity records and calculates a seven-day average step count plus recorded-day coverage and activity minutes. Review steps take precedence over activity-log steps to avoid duplicate daily counts; logged workout cardio minutes take precedence over manually-entered activity minutes for the same date.
- Added food inventory edit/remove UI for category, preferred/limited/avoid, notes and available/unavailable. Only currently available foods are suggested in the food-entry picker. Added an additive SQLite availability migration and API validation.
- Added rolling seven-day planning against the selected 3/4 sessions preference: recovery after the session preference is met and a reduced fourth session after three logged sessions. Full-day weekday selection and separate upper/lower splits remain later work and are explicitly not claimed.
- Closed the race in first-account creation by rechecking after request-body parsing immediately before insert; integration test submits simultaneous first-account requests and requires one success and one conflict.
- Mobile preview at localhost:3031 verified: onboarding, check-in, plan/start, alternative substitution history, snack submit/display, sleep/activity submit/display, History trend/log display, food inventory edit/availability. In the saved 375px-wide view the page was a single column; no authenticated iPhone production session was used, and browser upload was not tested because no test file transfer was authorized.
- Verification after latest code: `node --check server.js`, `node --check public/app.js`, `node --check progress.js`, `node --test --test-force-exit` (13/13), `git diff --check` passed. Git ancestry reconciled: local candidate HEAD, `origin/main`, and fetched `main` all `6085a76`. No push or deploy.
- Release remains gated: `az storage account list` failed because Azure CLI is not logged in. No fresh backup of the current production data was verified in this run. Do not deploy or change Azure resources without first authenticating, verifying backup plus SQLite integrity/WAL and uploaded files. No resource/cost was incurred.
- Usage at checkpoint: 7% five-hour used; 17% weekly used (93%/83% remaining). No reset credit redeemed.
- Exact next action: finish the pending Azure device sign-in, make/verify a fresh production backup, push only the isolated release branch, and verify workflow plus live health before asking the owner to inspect their workout History on iPhone. Remaining non-release blockers and intentionally later work are listed in `BACKLOG.md`.

## Release workflow compatibility audit — 24 September 2026

- Confirmed the Azure workflow’s actual `npm test` command passes all 13 tests; the app artifact excludes ignored `data/` and `node_modules/`. Remote `origin/main`, fetched `main`, and the release candidate parent were all `6085a76` before local commit `676f519`.
- Replaced stale duplicated legacy app code in `server.cjs` with a CommonJS bootstrap into `server.js`, preventing IIS compatibility routing from diverging from current security, storage path, and routes. Verified `node --check server.cjs`, started it against an isolated temporary data directory on port 3032, and got `/api/status` → `{"authenticated":false,"hasUser":false}`. Temporary data contains no real user information.
- Local commit `676f519` exists on `fix/persistent-data`; it has not been pushed. The isolated release candidate is ready for backup-gated push/deploy after Azure CLI authentication.
- Azure device sign-in has been initiated. Waiting for owner to complete device authorization; the one-time code is intentionally not written here. Then take a fresh complete production backup (SQLite plus WAL and uploads), verify hashes/integrity, and only then release.
