# Fitness Tracker

## Install on iPhone

Open `https://fit.adeticket.com` in Safari, sign in, tap **Share**, then **Add to Home Screen**. Launching from the new icon opens the app in a standalone window on supported iOS versions. The service worker may keep the public app shell available, but it never caches account APIs, login responses, workout records, or private images; logging in and saving data still require a network connection. Sign out before lending the device to someone else.

## Workout catalog decision

Workout plans remain generated locally from deterministic movement templates and safety/recovery rules. A third-party exercise catalog may later provide more descriptions or movement alternatives, but it must not generate personalized weight-loss or medical advice. Any imported item needs a reviewed movement-pattern/equipment mapping and clear source attribution; do not send account, health, workout-history, or screenshot data to the catalog provider. The user can still track workouts without an external API.

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
