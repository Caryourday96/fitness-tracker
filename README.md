# Fitness Tracker

## Install on iPhone

Open `https://fit.adeticket.com` in Safari. Tap **Share** (or **Page Menu**, then **Share**), scroll to **Add to Home Screen**, turn on **Open as Web App** if shown, then tap **Add**. If Add to Home Screen is missing, scroll to **Edit Actions** and add it there. The sign-in and Today screens also have an expandable guide. When offline, the installed app can show a public reconnect page; sign-in, private records and workout edits still require a network connection. Sign out before lending the device to someone else.

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
- Daily food and snack entries, manually entered sleep/activity, private screenshot uploads, daily reviews and protected history exports are supported. Private off-site SQLite and screenshot backups are stored in Azure Blob Storage and can be integrity-verified from Settings. The live app remains single-instance SQLite. Offline private workout edits and OCR are not implemented.

## Gentle reminders and offline Home Screen behavior

The installed app uses a root-scope service worker for a public offline reconnect page. Its cache contains only that page, CSS and icon; it never caches account APIs, workouts, images or exports. Reconnect before recording a workout.

In Settings, choose a reminder time in your saved time zone and opt in to the in-app reminder. It appears only while Steady is open and today's check-in is unfinished. It can be dismissed for the day. To receive iPhone notifications while Steady is closed, launch from the Home Screen icon, tap **Enable on this iPhone** in Settings, and allow the iOS notification prompt. This is a separate opt-in. Notifications contain only a generic check-in message. **Send test notification** checks delivery immediately, even if today's check-in is complete; repeat tests are limited to one per minute. **Disable on this iPhone** revokes that device's push subscription.

Push requires `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` as private App Service settings, plus optional `VAPID_SUBJECT` (defaults to `https://fit.adeticket.com/`). Generate one VAPID key pair with the installed `web-push` library, store the private key only in Azure app settings, and keep the same pair across deployments so existing subscriptions remain valid. Do not put it in Git or chat. The single-instance scheduler checks each minute; Azure App Service **Always On** must remain enabled. Push may be delayed when the platform or phone is offline; the app does not promise exact-time delivery. Test actual iPhone delivery and disable/re-enable before calling it complete. [WebKit's iOS Web Push guide](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/) explains the Home Screen and user-gesture requirement; [web-push](https://github.com/web-push-libs/web-push) documents VAPID keys.

## Local setup

1. Run `node server.js`.
2. Open `http://localhost:3030`.
3. The first account created becomes the only account; public registration is disabled afterwards.

The database is created at `data/fitness.sqlite`. Never commit `.env`, `data/`, or `uploads/`.

## Safety

This app supports tracking and general guidance and does not replace a clinician. It stops workout generation for urgent symptoms and very high blood pressure readings, while keeping history accessible. It does not diagnose, prescribe medication changes, set medication-based heart-rate targets, or compensate for food intake with exercise.

## Deployment

Use the dedicated Azure Web App at `fit.adeticket.com`. HTTPS-only is required. Current SQLite runs on a persistent mounted volume with one instance. Private geo-redundant Blob backup configuration and verification are documented in [DEPLOYMENT.md](DEPLOYMENT.md).
