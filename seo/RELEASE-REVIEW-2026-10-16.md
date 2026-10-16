# SEO release review — 16 October 2026

## Scope and evidence

Reviewed the 9 October audit at `E:\aog site seo\seo-audit-2026-10-09` against the working website and its unpublished changes. The existing SEO validator passed but missed inaccurate metadata, stale episode counts, unverified form success, and absolute social-image references.

Original live commit and rollback baseline: `752984f61a8e815e3b3fdfe39fce59fce59fb8e4a10d9`. Preserve the baseline audit; this review does not overwrite it.

## Implemented

- Retained and validated the pending canonical, social metadata, JSON-LD, host identity, direct booking links, noindex utility pages, sitemap, crawler policy, shared JavaScript, compressed image, and package-copy changes.
- Added Dr. Lamya Kamal's PCOS/insulin-resistance interview, including its source thumbnail, embedded player, original-source description, guest details, sharing metadata and structured data. Only the verified YouTube destination is offered; no audio-platform episode URLs were invented.
- Updated the archive and homepage to 27 episodes, with the newest interview first. The archive sorts by verified publication time. Existing episode URLs and identifiers remain stable.
- Verified all 27 video publication dates and durations directly against the official YouTube player metadata. Corrected placeholder values in structured data and visible episode metadata. Dates use UTC calendar dates; `uploadDate` preserves the precise source instant. Source observations are saved in `episode-data/youtube-verification-2026-10-16.json`.
- Replaced chapter timestamps with official description chapters where available, and removed the unverified new SABR chapter list and three new guest quotations.
- Replaced unconnected newsletter forms on older episode pages with the existing official WhatsApp channel.
- Booking success now requires explicit positive JSON confirmation. HTTP 200, an HTML error page or an empty JSON object cannot fire a lead event. Error/retry handling preserves the attempt ID. Removed free-text referral values and WhatsApp URLs containing personal query text from analytics events.
- Added a repeatable metadata/archive/sitemap refresh script, stronger SEO validation, script syntax checks, isolated booking contract checks, and a read-only production comparison script.
- Added push/PR validation and daily scheduled validation at 11:00 Asia/Calcutta. Scheduled/manual runs compare the published site with the release. Failure appears in GitHub Actions; no email/Slack alert destination was configured.
- Excluded audit data, build scripts, archived pages and internal planning PDFs from GitHub Pages output.

## Validation

- 30 indexable pages plus 4 noindex utility pages; 30 JSON-LD blocks.
- 1,385 local references, including absolute same-origin and social image references; case-sensitive path checks included.
- 70 image files pass the 350 KB per-image limit. The 55 unique referenced images total 4,803,347 bytes versus 58,853,995 bytes for corresponding previously tracked paths (new assets are included in the new total).
- 96 inline scripts and 2 shared scripts parse successfully.
- 10 isolated booking response scenarios pass, including explicit success, malformed/empty responses, backend rejection, network error and abort. No production leads were submitted.
- The booking backend GET returned 200, `Service is running.`, with `Access-Control-Allow-Origin: *`. This confirms reachability only.
- No browser provider was available for visual desktop/mobile QA. Static checks do not establish visual quality, Lighthouse scores or field Core Web Vitals.

## Remaining dependencies and longer-term work

`backlog.csv` retains all 36 original audit tasks and distinguishes implemented, partial and pending work. This release completes the available technical corrections; it does not claim the entire 90-day strategy is finished.

- Booking backend: the Apps Script/Sheet source and a controlled staging destination are needed to verify durable lead storage, server-side deduplication and the exact success response. Frontend attempt IDs do not establish backend idempotency. The existing script must return JSON with `result: "success"`, `status: "success"` or `success: true` after saving. A returned lead ID is preferred; legacy explicit-success responses retain the attempt ID as reference.
- Search Console/GA4/GTM: authenticated access is needed for sitemap submission, indexing inspection, lead-event configuration, traffic baselines and growth reporting.
- Commercial evidence: current audience metrics, final clip counts, ad budgets, delivery dates, usage rights and tax treatment still need owner confirmation; no new numerical promises were invented.
- Hosting: GitHub Pages serves `main` at `/`; canonical tags handle duplicate HTML entry points. True HTTP permanent redirects require hosting support beyond HTML meta refresh.
- Editorial/authority: host biography, evidence-backed case studies, new guides/topic pages, backlink inventory, platform profile edits and outreach remain planned or access-dependent work. No outreach was sent.
- Performance: image payloads were measured; browser rendering, Lighthouse and field data remain unverified.

Production comparison output is saved locally under `seo/reports/2026-10-16/live-verification.json` after deployment. That directory is excluded from Git and from the website.
