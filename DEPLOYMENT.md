# Deployment plan

Recommended architecture: a separate app such as `fit.adeticket.com`, isolated from `ff.adeticket.com`, `play.adeticket.com`, `adeticket.com`, and `kayodeadetunji.com`. Use a separate Azure App Service or Container App with HTTPS, a persistent mounted volume only for development SQLite, and preferably Azure Database for PostgreSQL plus private Blob Storage for production.

Before deployment: configure database/storage settings, enable HTTPS-only, confirm production cookies are Secure, and configure off-site backups with a restore rehearsal. The app stores only a SHA-256 hash of a cryptographically random 256-bit session token, so it has no shared session-signing secret. Production currently uses a persistent App Service volume and one instance.

## Current Azure proposal

Create a separate Canada Central Azure Web App in resource group `Kayode_IGO`, with the app resource named `fitness-tracker-ca` and the user-facing hostname `fit.adeticket.com`. The Azure Web App hostname is infrastructure-only. Connect the GitHub `main` branch through an OIDC deployment workflow, configure a persistent database/storage service, and keep this app isolated from Friends Showdown and its storage.

The Web App `fitness-tracker-ca` in `Kayode_IGO` / Canada Central uses startup command `node server.js`, `NODE_ENV=production`, HTTPS-only, and GitHub Actions OIDC secrets (`AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`). DNS and the secured TLS binding for `fit.adeticket.com` are configured; use the custom subdomain. The deployment workflow runs tests first. `server.cjs` is only an IIS compatibility bootstrap that imports the same `server.js`; it must not contain a second copy of app logic.

Google sign-in uses the Azure Easy Auth provider. Configure the Google client redirect URI as `https://fit.adeticket.com/.auth/login/google/callback`, keep unauthenticated requests allowed so the app's own account flow remains available, and test from the custom domain. The app bridges the authenticated Azure principal to its single local account; it does not store a Google password or token.

## Low-cost preview option

For a temporary technical preview, choose App Service **Free F1**. This avoids a normal monthly App Service charge but has quotas, no production reliability guarantee, and local files should be treated as disposable. Do not enter real health history or upload private screenshots on F1. Keep the app on its temporary Azure URL until durable storage and a custom-domain plan are approved. Upgrade only when ready for personal use: a small paid App Service plus a durable database and private Blob Storage is the safer minimum.

## Persistent Azure data

Production DATA_DIR is /home/steady-data, outside /home/site/wwwroot. Database, WAL files and uploads stay together. WEBSITES_ENABLE_APP_SERVICE_STORAGE=true. Keep one app instance for this SQLite configuration. No additional paid service was created.

Before schema changes: stop the app, copy the complete DATA_DIR to a timestamped /home/steady-backups directory, verify every file and SQLite integrity, then restart. Never copy only fitness.sqlite while the app writes; SQLite may have committed records in WAL.

Restore: stop the app; preserve the current data directory; choose a verified complete backup; copy it to a fresh /home restore directory; run PRAGMA integrity_check; set DATA_DIR to that directory; restart; verify account and workout access. Do not overwrite the only backup. These local backups protect deployment/migration mistakes, not deletion of the App Service storage. Off-service backup remains outstanding.

The deployment artifact includes only server.js, package.json and public/. The redundant deployment workflow is manual-only. Do not re-enable two concurrent production deployments.
