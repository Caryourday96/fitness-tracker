# Fitness tracker backlog

Release 12fc926 is deployed to fit.adeticket.com by GitHub Actions run 35992253218 (success). The production app remains single-instance SQLite and uploads on persistent App Service storage; this is not managed database/object storage or off-site backup. The deployment did not include a verified fresh backup. This list distinguishes deployed code from owner or infrastructure work.

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

- **P0 managed storage/off-site backup and restore:** production is single-instance SQLite and uploads on its mounted App Service volume. Restart/deployment persistence is verified, but this is not scale-safe, managed database/object storage, off-site backup or disaster recovery. Do not provision paid resources without price/choice approval. Next: regain authenticated Azure access, inspect existing storage and pricing, choose an approved low-cost destination, then run a restore test.
- **P0 clinician review:** owner’s clinician needs to review the blood-pressure and exercise guidance and personal restrictions before this is medically cleared. The app retains conservative safety stops meanwhile.
- **P1 password recovery:** no self-service reset exists. Google account recovery is the available alternate sign-in path; add password reset only after an owner-approved secure recovery channel is chosen.
- **Owner-device verification:** Google sign-in, saved workouts (including yesterday), upload/replace/delete, print and export remain to be checked in iPhone Safari after this release. No private production records were inspected by this agent.

## Later / intentionally deferred

- Preferred training weekdays plus genuinely distinct 3-day/4-day split templates (the current planner uses a rolling session budget and repeatable full-body templates).
- OCR from screenshots, always requiring explicit review before saving.
- Installable PWA/offline queue after private-cache/logout design and tests.
- Optional reminders/push notifications.
- More advanced charts and optional AI copy; deterministic safety logic must remain authoritative.
- Apple Health direct integration is intentionally out of scope; manual logging and screenshot attachment are supported.

## Release status and exact next action

The isolated release is deployed; GitHub Actions build and deploy jobs both succeeded. https://fit.adeticket.com/ and /api/status returned HTTP 200; status reports hasUser=true. A fresh backup was not verified before deployment, and this agent did not inspect private health records. Next: the owner should test Google sign-in, yesterday's saved workout, image upload/replace/delete, export and print on iPhone Safari. Then set up and test an off-site backup/restore path before future schema-changing releases. Never deploy from the broader dirty root checkout.
