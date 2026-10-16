#!/usr/bin/env python3
"""
Automated SEO, Structured Data, Asset Integrity & Performance Validator
for The Attitude of Gratitude Podcast (https://attitude-ofgratitude.com/).
"""
import os
import re
import sys
import json
import xml.etree.ElementTree as ET
from urllib.parse import unquote, urlsplit
from html import unescape

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ORIGIN = "https://attitude-ofgratitude.com"
with open(os.path.join(ROOT, 'seo', 'episode-data', 'episodes.json'), encoding='utf-8') as source:
    EPISODES = json.load(source)['episodes']
EXPECTED_PAGES = len(EPISODES) + 3

errors = []
warnings = []
stats = {
    "indexable_pages": 0,
    "noindex_pages": 0,
    "jsonld_blocks": 0,
    "local_assets_checked": 0,
    "images_checked": 0,
}

def check_file_exists(rel_or_abs, source_page):
    stats["local_assets_checked"] += 1
    clean = unquote(unescape(rel_or_abs).split("?")[0].split("#")[0])
    if clean.startswith("/"):
        full = os.path.join(ROOT, clean.lstrip("/").replace("/", os.sep))
    else:
        full = os.path.normpath(os.path.join(os.path.dirname(source_page), clean.replace("/", os.sep)))
    if os.path.isdir(full):
        full = os.path.join(full, "index.html")
    if not os.path.exists(full):
        errors.append(f"[BROKEN ASSET/LINK] {os.path.relpath(source_page, ROOT)} -> {rel_or_abs} (resolved: {full})")
    else:
        # Windows accepts filename case differences that fail on GitHub Pages.
        relative = os.path.relpath(full, ROOT)
        parent = ROOT
        for part in relative.split(os.sep):
            if part not in os.listdir(parent):
                errors.append(f'[FILENAME CASE MISMATCH] {source_page} -> {relative}')
                break
            parent = os.path.join(parent, part)

def validate_html_page(filepath, is_indexable=True):
    rel = os.path.relpath(filepath, ROOT).replace("\\", "/")
    with open(filepath, "r", encoding="utf-8") as f:
        html = f.read()

    # 1. Title check
    t_m = re.search(r"<title>(.*?)</title>", html, re.S)
    if not t_m or not t_m.group(1).strip():
        errors.append(f"[MISSING TITLE] {rel}")
    else:
        t_val = t_m.group(1)
        if "<span" in t_val or "\n" in t_val.strip():
            errors.append(f"[RAW HTML/NEWLINE IN TITLE] {rel}: {t_val!r}")

    # 2. Meta description
    d_m = re.search(r'<meta\s+name="description"\s+content="(.*?)"', html, re.S)
    if is_indexable and (not d_m or not d_m.group(1).strip()):
        errors.append(f"[MISSING META DESCRIPTION] {rel}")

    # 3. Canonical
    c_m = re.search(r'<link\s+rel="canonical"\s+href="(.*?)"', html)
    if is_indexable and not c_m:
        errors.append(f"[MISSING CANONICAL] {rel}")
    elif c_m and not c_m.group(1).startswith(ORIGIN + "/"):
        errors.append(f"[INVALID CANONICAL ORIGIN] {rel}: {c_m.group(1)}")
    elif c_m and is_indexable:
        expected = ORIGIN + '/' + (rel[:-10] if rel.endswith('index.html') else rel)
        if c_m.group(1) != expected:
            errors.append(f'[CANONICAL DOES NOT MATCH PAGE] {rel}: {c_m.group(1)} expected {expected}')

    # 4. Robots meta
    r_m = re.search(r'<meta\s+name="robots"\s+content="(.*?)"', html)
    if not is_indexable:
        stats["noindex_pages"] += 1
        if not r_m or "noindex" not in r_m.group(1):
            errors.append(f"[EXPECTED NOINDEX] {rel}")
    else:
        stats["indexable_pages"] += 1
        if r_m and "noindex" in r_m.group(1):
            errors.append(f"[UNEXPECTED NOINDEX ON INDEXABLE PAGE] {rel}")

    # 5. Open Graph & Twitter tags on indexable pages
    if is_indexable:
        for prop in ["og:title", "og:description", "og:url", "og:image", "og:type"]:
            if not re.search(rf'<meta\s+property="{prop}"\s+content="[^"]+"', html):
                errors.append(f"[MISSING {prop}] {rel}")
        for tw in ["twitter:card", "twitter:title", "twitter:description", "twitter:image"]:
            if not re.search(rf'<meta\s+name="{tw}"\s+content="[^"]+"', html):
                errors.append(f"[MISSING {tw}] {rel}")

    # 6. Single H1 check
    h1s = re.findall(r"<h1\b[^>]*>.*?</h1>", html, re.S)
    if len(h1s) != 1:
        errors.append(f"[H1 COUNT = {len(h1s)}] {rel}")

    # 7. JSON-LD validation on indexable pages
    ld_blocks = re.findall(r'<script\s+type="application/ld\+json">\s*(.*?)\s*</script>', html, re.S)
    if is_indexable and not ld_blocks:
        errors.append(f"[MISSING JSON-LD] {rel}")
    for idx, block in enumerate(ld_blocks):
        try:
            parsed = json.loads(block)
            stats["jsonld_blocks"] += 1
            if "@context" not in parsed:
                errors.append(f"[JSON-LD MISSING @context] {rel} block #{idx+1}")
        except Exception as e:
            errors.append(f"[INVALID JSON-LD] {rel} block #{idx+1}: {e}")

    # 8. Host name consistency & legacy link checks
    if is_indexable:
        if "Sadhna Rishi" in html or "host Sadna" in html:
            errors.append(f"[LEGACY HOST NAME] {rel} contains 'Sadhna Rishi' or 'host Sadna'")
        if 'href="/collab-booking/"' in html or "attitudeofgratitudepodcast.com" in html:
            errors.append(f"[LEGACY LINK] {rel} links to /collab-booking/ or attitudeofgratitudepodcast.com")
        if "episodes/xxxxxxxx" in html or "________________" in html:
            errors.append(f"[CORRUPTED PLATFORM HREF] {rel}")

    # 9. Local asset existence (img src, script src, link href)
    for attr_val in re.findall(r'(?:src|href)="([^"]+)"', html):
        if attr_val.startswith(ORIGIN + '/'):
            attr_val = attr_val[len(ORIGIN):]
        if attr_val.startswith(("http://", "https://", "mailto:", "tel:", "javascript:", "#", "data:")):
            continue
        check_file_exists(attr_val, filepath)

    for asset in re.findall(r'<meta[^>]+(?:property="og:image"|name="twitter:image")[^>]+content="([^"]+)"', html):
        if asset.startswith(ORIGIN + '/'):
            check_file_exists(asset[len(ORIGIN):], filepath)

def main():
    # Validate core indexable pages
    validate_html_page(os.path.join(ROOT, "index.html"), is_indexable=True)
    validate_html_page(os.path.join(ROOT, "get-featured", "index.html"), is_indexable=True)
    validate_html_page(os.path.join(ROOT, "episodes", "index.html"), is_indexable=True)

    ep_root = os.path.join(ROOT, "episodes")
    for slug in sorted(os.listdir(ep_root)):
        ep_html = os.path.join(ep_root, slug, "index.html")
        if os.path.isfile(ep_html):
            validate_html_page(ep_html, is_indexable=True)

    # Validate utility / noindex pages
    validate_html_page(os.path.join(ROOT, "thank-you", "index.html"), is_indexable=False)
    validate_html_page(os.path.join(ROOT, "collab-booking", "index.html"), is_indexable=False)
    validate_html_page(os.path.join(ROOT, "collab-booking.html"), is_indexable=False)
    validate_html_page(os.path.join(ROOT, "404.html"), is_indexable=False)

    # Validate robots.txt & sitemap.xml
    robots_path = os.path.join(ROOT, "robots.txt")
    if not os.path.isfile(robots_path):
        errors.append("[MISSING /robots.txt]")
    else:
        with open(robots_path, "r", encoding="utf-8") as f:
            r_txt = f.read()
        if "Sitemap: https://attitude-ofgratitude.com/sitemap.xml" not in r_txt:
            errors.append("[robots.txt MISSING SITEMAP DIRECTIVE]")

    sitemap_path = os.path.join(ROOT, "sitemap.xml")
    if not os.path.isfile(sitemap_path):
        errors.append("[MISSING /sitemap.xml]")
    else:
        tree = ET.parse(sitemap_path)
        ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        locs = [el.text for el in tree.findall(".//sm:loc", ns)]
        expected_locs = {ORIGIN + '/', ORIGIN + '/get-featured/', ORIGIN + '/episodes/'} | {ep['url'] for ep in EPISODES}
        if set(locs) != expected_locs or len(locs) != EXPECTED_PAGES:
            errors.append(f'[SITEMAP INVENTORY MISMATCH] expected {EXPECTED_PAGES} unique canonical URLs')
        for forbidden in ["/thank-you/", "/collab-booking/", "/404.html"]:
            if any(forbidden in loc for loc in locs):
                errors.append(f"[SITEMAP CONTAINS NOINDEX URL] {forbidden}")

    for ep in EPISODES:
        path = os.path.join(ROOT, 'episodes', ep['slug'], 'index.html')
        with open(path, encoding='utf-8') as source:
            text = source.read()
        graph = json.loads(re.search(r'<script type="application/ld\+json">\s*(.*?)\s*</script>', text, re.S)[1])['@graph']
        podcast = next(n for n in graph if n.get('@type') == 'PodcastEpisode')
        video = next(n for n in graph if n.get('@type') == 'VideoObject')
        if podcast['datePublished'] != ep['datePublished'] or podcast['timeRequired'] != ep['durationISO'] or video['duration'] != ep['durationISO'] or video['uploadDate'] != ep['uploadDate']:
            errors.append(f'[EPISODE METADATA OUT OF SYNC] {ep["slug"]}')
        if ep['youtubeId'] not in video['embedUrl'] or f'datetime="{ep["datePublished"]}"' not in text:
            errors.append(f'[VISIBLE EPISODE METADATA OUT OF SYNC] {ep["slug"]}')
        check_file_exists(ep['thumbnail'], path)
    with open(os.path.join(ROOT, 'episodes', 'index.html'), encoding='utf-8') as source:
        archive = source.read()
    cards = re.findall(r'<a href="(/episodes/[^\"]+/)" class="episode-card', archive)
    expected_cards = {'/episodes/' + ep['slug'] + '/' for ep in EPISODES}
    if set(cards) != expected_cards or len(cards) != len(EPISODES):
        errors.append('[EPISODE ARCHIVE INVENTORY MISMATCH]')

    # Validate image byte budgets
    for folder in ["", "guest images", "thumbnails", "icons"]:
        d = os.path.join(ROOT, folder) if folder else ROOT
        if not os.path.isdir(d):
            continue
        for fn in os.listdir(d):
            if fn.lower().endswith((".png", ".jpg", ".jpeg", ".webp")):
                stats["images_checked"] += 1
                sz_kb = os.path.getsize(os.path.join(d, fn)) / 1024.0
                if sz_kb > 350:
                    errors.append(f"[IMAGE EXCEEDS 350KB BUDGET] {folder}/{fn}: {sz_kb:.1f} KB")

    print("=" * 64)
    print("ATTITUDE OF GRATITUDE — SEO & TECHNICAL VALIDATION REPORT")
    print("=" * 64)
    if stats['indexable_pages'] != EXPECTED_PAGES:
        errors.append('[INDEXABLE PAGE INVENTORY MISMATCH]')
    print(f"Indexable HTML pages validated : {stats['indexable_pages']} (expected {EXPECTED_PAGES})")
    print(f"Noindex utility pages validated: {stats['noindex_pages']} (expected 4)")
    print(f"Valid JSON-LD blocks verified  : {stats['jsonld_blocks']}")
    print(f"Local asset/link refs verified : {stats['local_assets_checked']}")
    print(f"Optimized image files checked  : {stats['images_checked']}")
    print("-" * 64)
    if errors:
        print(f"FAILED WITH {len(errors)} ERROR(S):")
        for err in errors:
            print("  -", err)
        sys.exit(1)
    else:
        print(f"STATUS: PASS (0 errors across all {EXPECTED_PAGES + 4} HTML pages, sitemap.xml, robots.txt, and image budgets)")

if __name__ == "__main__":
    main()
