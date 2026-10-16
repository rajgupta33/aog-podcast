# Layout correction — 16 October 2026

The user's screenshot exposed rendering defects that the earlier SEO and file-integrity checks did not cover.

## Confirmed causes and fixes

- Thumbnail images supplied an HTML height of 360 or 720 while CSS changed only their width. Their resulting tall boxes cropped the landscape artwork with `object-fit: cover`. The thumbnail container now establishes a 16:9 frame, its image fills that frame with `object-fit: contain`, and hover no longer zooms/crops it. Episode cards no longer inherit generic card padding around thumbnails.
- The full 27-item archive had `fade-scroll`, which started at opacity zero and required a 10% intersection. A long single-column mobile grid can never meet that threshold. Shared scroll content is now visible by default, independently of JavaScript, and the archive no longer has the reveal class.
- Mobile containers used viewport width inside already padded parents, which could exceed the available space. Containers now size relative to their parent, grid children can shrink, and the footer no longer doubles the mobile inset.
- Full desktop navigation remained active at tablet widths where it could not fit. The compact menu now starts at 1080px. The header logo is smaller, and the overlay supports scrolling on short screens.
- Shared menu code now handles link clicks, Escape, focus wrapping and desktop resizing. Per-page duplicate menu code was removed. Closing the menu unlocks document scrolling.
- Narrow-screen form labels now occupy their own line, and controls can shrink inside their grid cells. Long hero/button text wraps and the smallest-screen hero buttons stack.
- Removed stale inline homepage CSS that overrode the shared mobile fixes.
- Added a readable grid fallback if the optional homepage carousel library fails to load, plus a guard against calling a missing Swiper constructor.
- Reduced-motion mode explicitly keeps animated headings visible.
- All public content pages request `styles.css?v=20261016-layout2` and the updated shared script version.

## Verification

- 4,829 CSS cascade assertions across 32 pages at widths 320, 360, 390, 768, 1024 and 1366, plus reduced-motion checks. This models CSS source rules and specificity; it is not a browser layout engine.
- Shared navigation tests cover open, close, link click, Escape, keyboard focus wrapping and desktop resize.
- CSS syntax validation passed; 96 inline scripts and 2 shared scripts parse successfully.
- Existing 34-page SEO/asset validation and 10 isolated booking tests passed.
- Added CSS cascade and menu checks to GitHub validation.

## Visual verification limitation

Computer Use was attempted through the installed Computer Use skill. The tool stopped with: "browser URL policy enforcement is not yet supported for the current Windows browser." Browser control was stopped, and no alternative browser-control method was used to bypass that restriction. Desktop/mobile rendered screenshots and real-device interaction therefore remain unverified. The supplied screenshot and the confirmed CSS/observer defects were the basis for the fixes.

The deployment commit and live file comparison are recorded separately in the review folder at `E:\aog site seo\seo-review-2026-10-16`.
