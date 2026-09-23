# Deployment plan

Recommended architecture: a separate app such as `fit.adeticket.com`, isolated from `ff.adeticket.com`, `play.adeticket.com`, `adeticket.com`, and `kayodeadetunji.com`. Use a separate Azure App Service or Container App with HTTPS, a persistent mounted volume only for development SQLite, and preferably Azure Database for PostgreSQL plus private Blob Storage for production.

Before deployment: create a new GitHub repository, configure `SESSION_SECRET` and database/storage settings as platform secrets, enable HTTPS-only, set secure cookie behavior, configure backups and restore testing, then add a subdomain DNS record. No DNS, hosting, or production authentication changes have been made by this build.

## Current Azure proposal

Create a separate Canada Central Azure Web App in resource group `Kayode_IGO`, with a unique app name such as `fitness-tracker-ca`. Connect the GitHub `main` branch through an OIDC deployment workflow, configure a persistent database/storage service, and map a dedicated subdomain such as `fit.adeticket.com`. Do not reuse the Friends Showdown app or its storage. The exact Web App name and persistence service must be selected before deployment.

The repository now includes `.github/workflows/azure-webapp.yml`. In Azure, create the Web App `fitness-tracker-ca` in `Kayode_IGO` / Canada Central, set startup command `node server.js`, configure `SESSION_SECRET`, `NODE_ENV=production`, HTTPS-only, and the three GitHub Actions OIDC secrets (`AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`). Configure a persistent database/volume before enabling personal use. The workflow runs tests before deployment. DNS for `fit.adeticket.com` remains a separate approval step.

## Low-cost preview option

For a temporary technical preview, choose App Service **Free F1**. This avoids a normal monthly App Service charge but has quotas, no production reliability guarantee, and local files should be treated as disposable. Do not enter real health history or upload private screenshots on F1. Keep the app on its temporary Azure URL until durable storage and a custom-domain plan are approved. Upgrade only when ready for personal use: a small paid App Service plus a durable database and private Blob Storage is the safer minimum.
