# Fitness tracker backlog

## Fix now before any production deployment

- **P0 security** — Add CSRF protection for state-changing requests and login rate limiting. Acceptance: cross-site POSTs are rejected and repeated failures are throttled. Depends on production origin/session policy. Files: `server.js`.
- **P0 storage** — Replace local SQLite with a managed/persistent production database and private object storage for uploads. Acceptance: restart/scale test preserves records and authenticated users can retrieve private images. Files: `server.js`, deployment docs.
- **P0 auth** — Add account recovery, session revocation UI, secure production secret handling, HTTPS-only cookies and first-account setup lock. Acceptance: expired/revoked sessions cannot access any API/export. Files: `server.js`.
- **P0 safety review** — Clinician review of thresholds and copy before personal use; collect explicit clearance/restrictions in onboarding. Acceptance: reviewed copy and documented owner approval. Files: `PRODUCT.md`, `public/app.js`.

## Next up

- **P1** — Complete end-of-day check-in and historical date editing.
- **P1** — Add step/cardio logging, 7-day averages, weight/waist charts and sparse-data labels.
- **P1** — Add per-set undo/edit, alternatives with linked exercise history, rest timer and autosave conflict handling.
- **P1** — Add private PNG/JPG uploads with magic-byte/dimension/size validation and authenticated retrieval.
- **P1** — Add printable summary/PDF-friendly report and formula-safe full CSV export.
- **P1** — Add 3-day/4-day schedule progression and actual missed-session/re-entry logic.

## Nice to have / later

- Screenshot OCR with explicit confirmation.
- PWA install/offline queue after private-cache/logout review.
- Optional reminders/push notifications.
- Advanced charts and optional AI wording that cannot override deterministic safety rules.
- Apple Health integration is intentionally out of scope.
