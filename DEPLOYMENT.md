# Deployment plan

Recommended architecture: a separate app such as `fit.adeticket.com`, isolated from `ff.adeticket.com`, `play.adeticket.com`, `adeticket.com`, and `kayodeadetunji.com`. This app currently uses single-instance SQLite on persistent App Service storage; private geo-redundant Blob Storage provides an off-site backup. SQLite is still not a managed database and must not be scaled across instances.

Before deployment: configure database/storage settings, enable HTTPS-only, confirm production cookies are Secure, and configure off-site backups with a restore rehearsal. The app stores only a SHA-256 hash of a cryptographically random 256-bit session token, so it has no shared session-signing secret. Production currently uses a persistent App Service volume and one instance.

## Current Azure proposal

Create a separate Canada Central Azure Web App in resource group `Kayode_IGO`, with the app resource named `fitness-tracker-ca` and the user-facing hostname `fit.adeticket.com`. The Azure Web App hostname is infrastructure-only. Connect the GitHub `main` branch through an OIDC deployment workflow, configure a persistent database/storage service, and keep this app isolated from Friends Showdown and its storage.

The Web App `fitness-tracker-ca` in `Kayode_IGO` / Canada Central uses startup command `node server.js`, `NODE_ENV=production`, HTTPS-only, and GitHub Actions OIDC secrets (`AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`). DNS and the secured TLS binding for `fit.adeticket.com` are configured; use the custom subdomain. The deployment workflow runs tests first. `server.cjs` is only an IIS compatibility bootstrap that imports the same `server.js`; it must not contain a second copy of app logic.

Google sign-in uses the Azure Easy Auth provider. Configure the Google client redirect URI as `https://fit.adeticket.com/.auth/login/google/callback`, keep unauthenticated requests allowed so the app's own account flow remains available, and test from the custom domain. The app bridges the authenticated Azure principal to its single local account; it does not store a Google password or token.

## Low-cost preview option

For a temporary technical preview, choose App Service **Free F1**. This avoids a normal monthly App Service charge but has quotas, no production reliability guarantee, and local files should be treated as disposable. Do not enter real health history or upload private screenshots on F1. Keep the app on its temporary Azure URL until durable storage and a custom-domain plan are approved. Upgrade only when ready for personal use: a small paid App Service plus a durable database and private Blob Storage is the safer minimum.

## Persistent Azure data

Production DATA_DIR is /home/steady-data, outside /home/site/wwwroot. Database, WAL files and uploads stay together. WEBSITES_ENABLE_APP_SERVICE_STORAGE=true. Keep one app instance for this SQLite configuration.

### Private off-site backups

The production Web App uses its system-assigned managed identity to access the private `workout-backups` container in the Canada Central `fitnessbackupca20260924` storage account. The account uses Standard GRS (geo-replicated to Canada East), Cool tier, HTTPS-only, and blocks anonymous blob access and shared-key authentication. The app identity has `Storage Blob Data Contributor` scoped to this container only. No storage key or SAS token is stored in the app.

Configure App Service settings `BACKUP_STORAGE_URL=https://fitnessbackupca20260924.blob.core.windows.net`, `BACKUP_CONTAINER=workout-backups`, and `BACKUP_RETENTION_DAYS=30`. Enable Always On and keep one instance so the in-process schedule runs. Backups start shortly after app startup, run at least daily, and retry hourly after failures. The signed-in owner can inspect backup status in Settings, request a backup, and verify the newest snapshot.

Each backup contains an online-consistent SQLite snapshot, checksums, record counts, and every referenced private screenshot. Image objects are content-addressed and deduplicated between retained snapshots. Verification downloads a temporary copy, checks hashes, SQLite integrity, record counts, and image signatures, then removes the temporary files; it does not overwrite live data. Manifests and database snapshots are retained for 30 days. Unreferenced images are pruned; Azure blob soft-delete is enabled for 7 days. Rehearse an actual restore to a separate temporary data directory or staging app before relying on recovery.

To test: use Settings → Private off-site backups → Back up now, then select Verify latest backup and confirm a timestamp and successful result. Never expose backup blobs publicly or put credentials in source control.

Before schema changes: stop the app, copy the complete DATA_DIR to a timestamped /home/steady-backups directory, verify every file and SQLite integrity, then restart. Never copy only fitness.sqlite while the app writes; SQLite may have committed records in WAL.

Restore: stop the app; preserve the current data directory; choose a verified complete backup; copy it to a fresh /home restore directory; run PRAGMA integrity_check; set DATA_DIR to that directory; restart; verify account and workout access. Do not overwrite the only backup. These local backups protect deployment/migration mistakes, not deletion of the App Service storage. Off-service backups are configured in production; the owner previously reported that creating and verifying one succeeded. This task did not inspect backup contents or perform a restore. Azure CLI blob listing was denied for the current operator identity; the App Service managed identity remains separately configured with container-scoped access.

The deployment artifact includes the server, backup helper, package manifests, public client, and production dependencies. The redundant deployment workflow is manual-only. Do not re-enable two concurrent production deployments.

## Optional accountability link

The owner can create an unlisted, read-only link from the app's Share tab. Anyone who receives it can view up to 60 completed workouts (date, exercise names, logged sets and cardio). It excludes measurements, blood pressure, food, sleep, notes, screenshots and editing. The link uses a random 256-bit token; only its hash is stored. The token is in the URL fragment and the viewer sends no owner session cookie. The owner can replace or revoke it. Revocation prevents future loads, but cannot erase information a viewer already saw or saved. Do not post the link publicly; access is based on possession, not verified identity.
