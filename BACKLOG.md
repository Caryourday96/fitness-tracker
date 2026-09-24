# Fitness tracker backlog

Release 12fc926 is deployed to fit.adeticket.com by GitHub Actions run 35992253218 (success). Production remains single-instance SQLite on persistent App Service storage. Private GRS Blob Storage is provisioned and backup integration is prepared in the isolated release candidate; completion still requires deployment, a real snapshot, Azure verification, and restart persistence checks.

## Completed in this release candidate

- **P0 security:** same-origin and `X-Requested-With` checks for state-changing requests; login/setup throttles; bounded JSON parsing; Secure production cookies.
- **P0 session controls:** local logout and sign-out-everywhere UI; hashed opaque sessions; Easy Auth Google sign-in bridge can be revoked until explicit Google re-authentication. Shared session secret removed because none is needed for random, server-side session tokens.
- **P1 first-day setup/settings:** time zone, units, gym access, duration, 3/4 session preference, experience, optional restrictions/clearance; settings can edit the same values.
- **P1 adaptive workout:** fresh check-in before confirmation; recovery after yesterday’s workout; light re-entry after a week away; no missed-session catch-up; rolling seven-day session cap and lighter fourth session when three sessions are already logged. Preferred weekdays and distinct upper/lower 3/4-day templates are still absent.
- **P1 live workout:** resume, cardio-specific fields, set edit/undo, conflict checks, optional rest timer, exercise alternatives with separate linked history, exact-exercise previous settings as a manual suggestion only.
- **P1 daily logging/history:** date-editable end-of-day review, food/snack entries, manually entered sleep and activity; logs appear on Today and in History. Past/future day rules and input ranges are validated.
- **P1 progress:** 7-day average steps/activity coverage, 7-day weight average with coverage, 30-day weight/waist trends; sparse and missing data are labelled and no zero readings are fabricated.
- **P1 food inventory:** add/edit/remove foods, set category/preference/notes/availability, and suggest only currently available items in food entry.
- **P1 private screenshots:** authenticated PNG/JPEG upload/list/preview/caption/date/replace/delete; size, signature and dimensions validated; common metadata stripped. Integration tests cover private image CRUD. Owner must still test iPhone Safari after release.
- **P1 export:** authenticated formula-safe CSV covering saved record types and printable/PDF-friendly summary.
- **Safety/security documentation:** AHA blood-pressure guidance source/review date; storage persistence and backup/restore limitations documented.

## Blocked on owner or external action

- **P0 managed database:** production remains single-instance SQLite on the persistent App Service volume; do not scale out. Evaluate managed database only after backups are verified and present a cost/architecture choice before provisioning. A full disaster-recovery restore rehearsal to a separate target remains outstanding.
- **P0 clinician review:** owner’s clinician needs to review the blood-pressure and exercise guidance and personal restrictions before this is medically cleared. The app retains conservative safety stops meanwhile.
- **P1 password recovery:** no self-service reset exists. Google account recovery is the available alternate sign-in path; add password reset only after an owner-approved secure recovery channel is chosen.
- **Owner-device verification:** Google sign-in, saved workouts (including yesterday), upload/replace/delete, print and export remain to be checked in iPhone Safari after this release. No private production records were inspected by this agent.

## Later / intentionally deferred

- **P1 accountability partner — locally implemented, not deployed:** optional public link with no partner sign-in. Anyone who obtains the link can view up to 60 completed workouts; owner can rotate/revoke. Random token hash is stored; token travels in the fragment and viewer sends no owner cookies. Only dates, exercise names, logged sets and cardio are included. No measurements, food, sleep, notes, images or edits. Required before release: code review and CI; disclose that revocation cannot remove already copied data.

- Preferred training weekdays plus genuinely distinct 3-day/4-day split templates (the current planner uses a rolling session budget and repeatable full-body templates).
- OCR from screenshots, always requiring explicit review before saving.
- Installable PWA/offline queue after private-cache/logout design and tests.
- Optional reminders/push notifications.
- More advanced charts and optional AI copy; deterministic safety logic must remain authoritative.
- Apple Health direct integration is intentionally out of scope; manual logging and screenshot attachment are supported.

## Release status and exact next action

The last isolated release is deployed; GitHub Actions build and deploy jobs both succeeded. Private geo-redundant storage, a private container, system identity, and a container-scoped blob role are provisioned. Backup code and settings are still pending release, and no real cloud snapshot has been verified. Next: deploy the integration, trigger a backup, verify it from Settings and independently from Azure, then check that an app restart preserves the live database and backup availability. Never deploy from the broader dirty root checkout.
