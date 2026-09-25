# iPhone Safari owner verification

Run these checks on the iPhone you use for the tracker at `https://fit.adeticket.com`. They are not verified by desktop or CI checks.

1. Sign in with Google, refresh once, and confirm the dashboard remains signed in. Leave the sign-out check until you have finished or safely saved any active workout.
2. If Today shows **Ready**, tap **Show another workout** once and confirm the strength exercise mix changes while the planned sets and cardio target stay the same. It should prefer exercises you did not log yesterday where suitable choices exist. Check the individual exercise selectors before **Start workout**. Start only when you intend to train; confirm your chosen exercise appears in the log. If Today shows **Resume workout** or **Done**, mark the Ready-only checks as not applicable today and do not replace that saved workout.
3. During a real workout, record one strength set and one treadmill entry with your actual units, leave the page, return, and confirm **Resume workout** restores the entries. If no workout is in progress, defer this check instead of entering invented activity.
4. On a workout set, start a rest timer, switch to another app for at least 10 seconds, then return. Confirm the remaining time reflects the elapsed time. Pause, resume, skip, and refresh once to verify the saved timer state.
5. Open History. Confirm charts fit the screen, gaps stay empty, units are clear, and the “days recorded” coverage matches your entries.
6. Upload a non-sensitive test PNG/JPEG, preview it, edit caption/date/category, replace it, and delete it. Confirm the preview is visible only while signed in.
7. Download CSV and use Print / Save PDF. Confirm no screenshot image is included in the export.
8. Open Share, copy the read-only public link, verify it shows the allowed workout details, then revoke it and confirm the old link no longer opens data.
9. If installed to Home Screen, launch with a network connection and check navigation, sign-in and logout. Offline use is not supported.

Record pass/fail, iOS version, Safari version, and any exact error text in `CODEX_PROGRESS.md`. Do not include passwords, account identifiers, health measurements, screenshots, or private share tokens in the checkpoint.
