# Deployment plan

Recommended architecture: a separate app such as `fit.adeticket.com`, isolated from `ff.adeticket.com`, `play.adeticket.com`, `adeticket.com`, and `kayodeadetunji.com`. Use a separate Azure App Service or Container App with HTTPS, a persistent mounted volume only for development SQLite, and preferably Azure Database for PostgreSQL plus private Blob Storage for production.

Before deployment: create a new GitHub repository, configure `SESSION_SECRET` and database/storage settings as platform secrets, enable HTTPS-only, set secure cookie behavior, configure backups and restore testing, then add a subdomain DNS record. No DNS, hosting, or production authentication changes have been made by this build.

## Current Azure proposal

Create a separate Canada Central Azure Web App in resource group `Kayode_IGO`, with a unique app name such as `fitness-tracker-ca`. Connect the GitHub `main` branch through an OIDC deployment workflow, configure a persistent database/storage service, and map a dedicated subdomain such as `fit.adeticket.com`. Do not reuse the Friends Showdown app or its storage. The exact Web App name and persistence service must be selected before deployment.
