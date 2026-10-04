# Fitdays operation and verification

Public page: https://fitdays.adeticket.com. Private tracker: https://fit.adeticket.com.

## Using the features
- Record actual completion in the private tracker. For a past day, use History or the public date dialog's private History shortcut. The shortcut itself never writes records.
- Fitdays refreshes on return with a30-second throttle, and once a minute while visible. Refresh remains available. Failed requests retain data and mark it stale.
- The calendar and weekly chart support30/90/365-day windows. Summary cards explicitly retain their7/30/365-day scopes. Only saved completed dates count; unmarked dates are not evidence of inactivity.
- Open Goals, trends and sharing for optional device-local weekly/monthly targets, challenges with pause/remove, monthly recaps, recorded bests and year recaps. They do not alter training, prescribe catch-up sessions or create completions. Device settings do not sync between browsers.
- Choose a summary period or year, preview the counts-only PNG, then share or download. Individual dates, exercise loads and health records are never included. Native sharing depends on device support.
- Dates mode allows ICS export for the selected window. Events use stable date-based IDs, all-day dates and no private details. Import behavior depends on the calendar app.
- In private Settings, the first registered owner can select dates or counts-only public visibility. Counts-only removes completed-date lists from the API/DOM and disables date export and date-range challenge progress. Previously downloaded/shared information cannot be recalled.
- Preferred-weekday comparison remains in authenticated Settings. No preferred schedule is published.

## Coverage and privacy boundaries
Only the current rolling365-calendar-day window is available. Recaps identify partial months/years; a rolling365-day window is never called a full leap year or lifetime history. Bests use recorded counts, not intensity or health outcomes. Counts-only provides aggregate period counts/ranges, not individual completion records.

No paid resources, production DNS changes, private workout rewrites or new external analytics are part of this release. The existing persistent database retains workout records; the new visibility setting uses a separate additive table.

## Verification
63 Node tests pass with the existing release command: node --test --test-force-exit. Expanded synthetic browser scenarios in docs/verification/fitdays-browser.spec.ts pass using the workspace's existing local Playwright harness at320/390px. They cover date/goal controls, challenge pause/remove, previews/downloads, refresh throttling/rollover/failure, private date navigation without writes, private schedule UI and counts-only clearing. Pure tests cover leap dates, deduplication, period bounds, recap reconciliation, milestone corrections, best ties, year coverage and ICS IDs/date semantics.

Still owner-device checks: iPhone native share sheet, Home Screen icon/launch, actual calendar-app ICS import, and selected History date surviving the real Google sign-in redirect. No real owner workout was inserted to test these flows.
