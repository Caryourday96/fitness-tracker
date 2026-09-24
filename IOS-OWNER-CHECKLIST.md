# iPhone Safari owner verification

Run these checks on the iPhone you use for the tracker at `https://fit.adeticket.com`. They are not verified by desktop or CI checks.

1. Sign in with Google, refresh once, and confirm the dashboard remains signed in. Sign out and sign in again.
2. Open an active workout, record one strength set and one treadmill entry with your actual units, leave the page, return, and confirm **Resume workout** restores the entries.
3. On a workout set, start a rest timer, switch to another app for at least 10 seconds, then return. Confirm the remaining time reflects the elapsed time. Pause, resume, skip, and refresh once to verify the saved timer state.
4. Open History. Confirm charts fit the screen, gaps stay empty, units are clear, and the “days recorded” coverage matches your entries.
5. Upload a non-sensitive test PNG/JPEG, preview it, edit caption/date/category, replace it, and delete it. Confirm the preview is visible only while signed in.
6. Download CSV and use Print / Save PDF. Confirm no screenshot image is included in the export.
7. Open Share, copy the read-only public link, verify it shows the allowed workout details, then revoke it and confirm the old link no longer opens data.
8. If installed to Home Screen, launch in standalone mode and check navigation, sign-in, workout logging and logout. The app must never show private API data offline.

Record pass/fail, iOS version, Safari version, and any exact error text in `CODEX_PROGRESS.md`. Do not include passwords, account identifiers, health measurements, screenshots, or private share tokens in the checkpoint.
