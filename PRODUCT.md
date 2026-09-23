# Product and acceptance notes

## Core stories

- As the private account owner, I can sign in and keep progress in durable server storage.
- As the user, I complete a daily check-in before a plan is confirmed, and the same inputs produce the same plan.
- As the user, I can resume a saved workout, log sets, and complete it without duplicate records.
- As the user, I can edit settings, inventory, measurements, and export check-ins as CSV.
- As the user, urgent symptoms or an urgent blood-pressure reading stop plan generation while history remains accessible.

## Screens and flows

Login/setup → Today/check-in → proposed plan → live workout → history/export; Settings contains profile and food inventory.

## Schema

`users`, `profiles`, `sessions`, `checkins`, `plans`, `workouts`, `measurements`, and `foods` are SQLite tables. Every record except the account is keyed by `user_id`; protected API routes resolve that ID from an opaque, hashed session cookie.

## Adaptation precedence

1. Urgent symptoms or pressure safety stop.
2. Pain/soreness and recovery readiness.
3. Available minutes and equipment.
4. Repeatable training sequence.
5. Performance progression only after actual logged sets; no automatic load increase is implemented in this MVP.

## Safety sources reviewed

- American Heart Association, “When to call 911 for high blood pressure”: https://www.heart.org/en/health-topics/high-blood-pressure/when-to-call-911-about-high-blood-pressure (reviewed 2026-09-23).
- American Heart Association, “Getting active to control high blood pressure”: https://www.heart.org/en/healthy-living/fitness/fitness-basics/getting-active-to-control-high-blood-pressure (reviewed 2026-09-23).
- CDC, “Measuring Physical Activity Intensity”: https://www.cdc.gov/physical-activity-basics/measuring/index.html (reviewed 2026-09-23).

The app uses conservative symptom and pressure gating and general moderate-effort guidance. It does not diagnose, prescribe medication changes, or set medication-dependent heart-rate targets.
