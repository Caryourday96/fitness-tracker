# Deployment plan

Recommended architecture: a separate app such as `fit.adeticket.com`, isolated from `ff.adeticket.com`, `play.adeticket.com`, `adeticket.com`, and `kayodeadetunji.com`. Use a separate Azure App Service or Container App with HTTPS, a persistent mounted volume only for development SQLite, and preferably Azure Database for PostgreSQL plus private Blob Storage for production.

Before deployment: create a new GitHub repository, configure `SESSION_SECRET` and database/storage settings as platform secrets, enable HTTPS-only, set secure cookie behavior, configure backups and restore testing, then add a subdomain DNS record. No DNS, hosting, or production authentication changes have been made by this build.
