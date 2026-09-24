# Fitness Tracker

## Install on iPhone

Open `https://fit.adeticket.com` in Safari. Tap **Share** (or **Page Menu**, then **Share**), scroll to **Add to Home Screen**, turn on **Open as Web App** if shown, then tap **Add**. If Add to Home Screen is missing, scroll to **Edit Actions** and add it there. The sign-in and Today screens also have an expandable guide. The current release requires a network connection for sign-in and saved records. Sign out before lending the device to someone else.

## Workout catalog decision

Workout plans remain generated locally from deterministic movement templates and safety/recovery rules. A small ExerciseAPI snapshot adds optional, same-pattern exercise alternatives for commercial-gym plans; it does not create weight-loss or medical advice. Each choice keeps its movement pattern, names its equipment, and saves as a separate exercise history. Home plans do not assume access to gym equipment. The plan and app still work without an API connection.

On Today, complete the check-in and confirm the plan. On the **Ready** screen, tap **Show another workout** to cycle through suitable exercise mixes before starting. New plans avoid yesterday’s exact exercise names when same-pattern choices are available. You can also use **Choose an exercise** under a strength movement to preview its equipment and cue. Tap **Start workout** to save your choices. Existing saved plans can use the button without changing their prescribed sets or cardio. Once a workout has started, its plan cannot be replaced; **Use alternative** can still change an unfinished exercise.

The imported catalog snapshot is in `exercise-catalog.json`, retrieved from [ExerciseAPI](https://exercise-api.com) and licensed CC BY 4.0. The plan shows the required attribution when these alternatives are present. To refresh the allowlisted snapshot, run `npm run catalog:sync`; the import verifies the license and each reviewed movement-pattern mapping before writing. This is a development-time request only: production workouts do not send account, health, workout-history, or screenshot data to the provider.

Private single-user fitness and weight-loss tracker at `https://fit.adeticket.com`. It is intentionally isolated from the existing Friends Showdown and portfolio sites. Use the custom subdomain for normal access; the Azure Web App hostname is infrastructure-only.

## Architecture

- Node 24 HTTP server with built-in `node:sqlite` for durable SQLite storage.
- `crypto.scrypt` password hashing; random opaque sessions in HttpOnly cookies.
- Optional Google sign-in through Azure App Service Authentication; the first Google account creates the private account and later sign-ins must use the same email.
- Server-rendered JSON API plus a mobile-first vanilla client in `public/`.
- Private data is scoped to the authenticated account. No health data is in public assets or fixtures.
- The primary URL is `https://fit.adeticket.com`; the responsive layout is designed for iPhone Safari with safe-area padding and large touch targets.
- Daily food and snack entries, manually entered sleep/activity, private screenshot uploads, daily reviews and protected history exports are supported. Private off-site SQLite and screenshot backups are stored in Azure Blob Storage and can be integrity-verified from Settings. The live app remains single-instance SQLite; managed database migration, a full restore rehearsal, PWA installability, OCR and reminders remain later work.

## Local setup

1. Run `node server.js`.
2. Open `http://localhost:3030`.
3. The first account created becomes the only account; public registration is disabled afterwards.

The database is created at `data/fitness.sqlite`. Never commit `.env`, `data/`, or `uploads/`.

## Safety

This app supports tracking and general guidance and does not replace a clinician. It stops workout generation for urgent symptoms and very high blood pressure readings, while keeping history accessible. It does not diagnose, prescribe medication changes, set medication-based heart-rate targets, or compensate for food intake with exercise.

## Deployment

Use the dedicated Azure Web App at `fit.adeticket.com`. HTTPS-only is required. Current SQLite runs on a persistent mounted volume with one instance. Private geo-redundant Blob backup configuration and verification are documented in [DEPLOYMENT.md](DEPLOYMENT.md).
