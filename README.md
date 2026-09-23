# Fitness Tracker

Private single-user fitness and weight-loss tracker for a future subdomain (for example `fit.adeticket.com`). It is intentionally isolated from the existing Friends Showdown and portfolio sites.

## Architecture

- Node 24 HTTP server with built-in `node:sqlite` for durable SQLite storage.
- `crypto.scrypt` password hashing; random opaque sessions in HttpOnly cookies.
- Server-rendered JSON API plus a mobile-first vanilla client in `public/`.
- Private data is scoped to the authenticated account. No health data is in public assets or fixtures.
- Image upload, backups, PWA installability, OCR and reminders remain staged enhancements.

## Local setup

1. `Copy-Item .env.example .env` and set a long random `SESSION_SECRET`.
2. `node server.js`.
3. Open `http://localhost:3030`.
4. The first account created becomes the only account; public registration is disabled afterwards.

The database is created at `data/fitness.sqlite`. Never commit `.env`, `data/`, or `uploads/`.

## Safety

This app supports tracking and general guidance and does not replace a clinician. It stops workout generation for urgent symptoms and very high blood pressure readings, while keeping history accessible. It does not diagnose, prescribe medication changes, set medication-based heart-rate targets, or compensate for food intake with exercise.

## Deployment

Use a separate Node-capable Azure App Service or Container Apps app and a dedicated subdomain. Do not connect DNS or deploy until the production plan, storage, HTTPS, backups, and secret settings have been reviewed and approved. SQLite needs a persistent mounted volume in production; otherwise use Azure Database for PostgreSQL/SQLite-compatible durable storage before launch.
