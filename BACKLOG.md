# Fitness tracker backlog

## Completed in the current release

- **Google sign-in** — Azure Google provider, canonical `fit.adeticket.com` callback, and a production Easy Auth-to-single-account bridge are implemented and deployed.
- **iPhone layout** — Safe-area spacing, touch-sized controls, mobile tabs, stacked actions, and responsive workout/table layouts are implemented and deployed.
- **Canonical URL** — Use `https://fit.adeticket.com` for all normal access; the Azure hostname is infrastructure-only.

## Fix now before any production deployment

- **P0 security** — Add CSRF protection for state-changing requests and login rate limiting. Acceptance: cross-site POSTs are rejected and repeated failures are throttled. Depends on production origin/session policy. Files: `server.js`.
- **P0 storage** — Replace local SQLite with a managed/persistent production database and private object storage for uploads. Acceptance: restart/scale test preserves records and authenticated users can retrieve private images. Files: `server.js`, deployment docs.
- **P0 auth** — Add account recovery, session revocation UI, secure production secret handling, HTTPS-only cookies and first-account setup lock. Acceptance: expired/revoked sessions cannot access any API/export. Files: `server.js`.
- **P0 safety review** — Clinician review of thresholds and copy before personal use; collect explicit clearance/restrictions in onboarding. Acceptance: reviewed copy and documented owner approval. Files: `PRODUCT.md`, `public/app.js`.

## Next up

- **P1 quick win** — Add a first-run “Today” setup card that confirms units, duration, gym schedule, and safety disclosures before the first check-in. Acceptance: a new account can finish setup and reach a clear workout recommendation without opening Settings. Depends on: onboarding fields in `server.js` and `public/app.js`.
- **P1** — Complete end-of-day check-in and historical date editing.
- **P1** — Add step/cardio logging, 7-day averages, weight/waist charts and sparse-data labels.
- **P1** — Add per-set undo/edit, alternatives with linked exercise history, rest timer and autosave conflict handling.
- **P1** — Finish the private PNG/JPG upload UI (server validation and authenticated retrieval are implemented); acceptance: upload, preview, replace, caption, and delete work on iPhone.
- **P1** — Add printable summary/PDF-friendly report and formula-safe full CSV export.
- **P1** — Add 3-day/4-day schedule progression and actual missed-session/re-entry logic.

## Nice to have / later

- Screenshot OCR with explicit confirmation.
- PWA install/offline queue after private-cache/logout review.
- Optional reminders/push notifications.
- Advanced charts and optional AI wording that cannot override deterministic safety rules.
- Apple Health integration is intentionally out of scope.
