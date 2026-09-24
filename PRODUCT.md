# Product and acceptance notes

## Core stories

- As the private account owner, I can sign in and keep progress in durable server storage.
- As the user, I complete a daily check-in before a plan is confirmed, and the same inputs produce the same plan.
- As the user, I can resume a saved workout, log sets, and complete it without duplicate records.
- As the user, I can edit profile settings and food inventory (category, preference, notes, availability), log meals/snacks, sleep and activity, and export saved records as CSV or a printable summary.
- As the user, urgent symptoms or an urgent blood-pressure reading stop plan generation while history remains accessible.

## Screens and flows

Login/setup → Today/check-in → proposed plan → live workout → history/export; Settings contains profile and food inventory.

## Schema

`users`, `profiles`, `sessions`, `checkins`, `plans`, `workouts`, `measurements`, `foods`, `food_logs`, `sleep_logs`, `activity_logs`, `day_reviews`, and `uploads` are SQLite tables. Every record except the account is keyed by `user_id`; protected API routes resolve that ID from an opaque, hashed session cookie. Uploaded image files are kept separately under the private data directory and served only through authenticated routes.

## Adaptation precedence

1. Urgent symptoms or pressure safety stop.
2. Pain/soreness and recovery readiness.
3. Available minutes and equipment.
4. Repeatable training sequence.
5. Cardio progression only after comparable completed sessions meet their saved duration targets; pace and incline remain comfort-led and are never auto-increased.
6. Strength progression only after actual logged sets; load changes remain manual suggestions and are never silently increased.

The planner can optionally schedule around exactly the selected number of preferred weekdays, or leave days unspecified and use activity history. Three-day programs cycle through three distinct full-body templates; four-day programs cycle upper/lower templates. The server preserves the plan template in each workout so the next unstarted plan can continue the sequence. Safety stops, recovery after yesterday's work, readiness limits, rolling session caps and missed-session re-entry take precedence over weekday preferences; missed days never stack. Changing settings does not rewrite an active or completed plan.

The repeatable resistance templates are intended to support sustainable weight management by training major movement patterns and helping maintain muscle while weight is lost; they are not a promise of weight loss or spot reduction. Cardio uses the exact-exercise treadmill history when available: after two completed logged treadmill sessions meet their saved duration targets, the next suitable plan suggests a single five-minute increase, capped according to selected session time. Lower readiness pauses the increase. The app leaves speed and incline adjustable at a comfortable speaking effort and asks the user to log actual duration rather than pre-filling a completed value.

## Safety sources reviewed

- American Heart Association, “When to call 911 for high blood pressure”: https://www.heart.org/en/health-topics/high-blood-pressure/when-to-call-911-about-high-blood-pressure (reviewed 2026-09-23).
- American Heart Association, “Blood Pressure Explained”: https://www.heart.org/en/health-topics/high-blood-pressure/blood-pressure-explained (reviewed 2026-09-24). Above 180 systolic or 120 diastolic, repeat after at least one minute; if still high, contact a health professional without symptoms and call emergency services when concerning symptoms occur.
- American Heart Association, “Getting active to control high blood pressure”: https://www.heart.org/en/healthy-living/fitness/fitness-basics/getting-active-to-control-high-blood-pressure (reviewed 2026-09-23).
- CDC, “Measuring Physical Activity Intensity”: https://www.cdc.gov/physical-activity-basics/measuring/index.html (reviewed 2026-09-23).
- NIDDK, “Health Tips for Adults”: https://www.niddk.nih.gov/health-information/weight-management/healthy-eating-physical-activity-for-life/health-tips-for-adults (reviewed 2026-09-24). Resistance activity may help maintain muscle during weight loss; the app does not imply that strength exercise alone causes weight loss.
- NIDDK, “Tips to Keep Moving”: https://www.niddk.nih.gov/health-information/weight-management/tips-get-active/tips-keep-moving (reviewed 2026-09-24). Activity duration and strength work should progress gradually.

The app uses conservative symptom and pressure gating and general moderate-effort guidance. It does not diagnose, prescribe medication changes, or set medication-dependent heart-rate targets.

## Exercise library and external API review

The current workout generator uses a local, deterministic catalog with 3-day full-body A/B/C and 4-day upper/lower A/B templates. Each substitution is mapped to its movement pattern; changing templates does not change safety precedence, recent-training limits, or history-based cardio behavior. An external exercise catalog is not needed to generate the plan and must not be treated as a weight-loss prescription.

Reviewed 2026-09-24: [wger REST API docs](https://github.com/wger-project/docs/blob/master/docs/api/api.rst) describe public exercise-list endpoints, while user-owned routines require authentication. wger is open-source, but its exercise data carries CC BY-SA licenses that vary by record, so catalog redistribution needs license review. [ExerciseAPI docs](https://exercise-api.com/docs) describe a public catalog, 100 anonymous requests/day, and CC BY 4.0 attribution requirements. The import uses a fixed allowlist of 13 reviewed entries from ExerciseAPI dataset 1.1.0; it maps same-pattern alternatives and equipment locally, includes visible attribution, and makes no runtime API calls. These catalogs do not provide individualized weight-loss coaching or medical validation. No user profile, health, workout-history or screenshot data is sent. Plans and safety rules remain local with an API-free fallback.

## Add to Home Screen

On iPhone, open the site in Safari and choose Share → Add to Home Screen. The standalone metadata is configured, but the current app does not cache pages or data offline. Azure EasyAuth blocks new root-level worker paths unless production auth exclusions are changed; this build does not change those auth rules. Workout logging, sign-in and saved records require a network connection. No background notifications are provided.
