"""Read-only production verification against the checked-out release."""
import concurrent.futures
import hashlib
import json
import re
import sys
from datetime import datetime, timezone
from html import unescape
from pathlib import Path
from urllib.parse import quote, unquote, urljoin, urlsplit
from urllib.request import Request, urlopen
from urllib.error import HTTPError

ROOT = Path(__file__).resolve().parent.parent
ORIGIN = 'https://attitude-ofgratitude.com'
data = json.loads((ROOT / 'seo/episode-data/episodes.json').read_text(encoding='utf-8'))
pages = ['index.html', 'get-featured/index.html', 'episodes/index.html', 'thank-you/index.html', '404.html', 'collab-booking.html', 'collab-booking/index.html']
pages += ['episodes/' + e['slug'] + '/index.html' for e in data['episodes']]
resources = set(pages + ['robots.txt', 'sitemap.xml', 'site-components.js'])


def public_path(relative):
    return '/' + (relative[:-10] if relative.endswith('index.html') else relative)


for relative in pages:
    text = (ROOT / relative).read_text(encoding='utf-8')
    for target in re.findall(r'(?:src|href)="([^"]+)"', text):
        target = unescape(target)
        if target.startswith(('#', 'mailto:', 'tel:', 'data:', 'javascript:')):
            continue
        url = urljoin(ORIGIN + public_path(relative), target)
        parts = urlsplit(url)
        if parts.netloc != urlsplit(ORIGIN).netloc:
            continue
        local = unquote(parts.path).lstrip('/')
        if not local or local.endswith('/'):
            local += 'index.html'
        if (ROOT / local).is_file():
            resources.add(local)


def check(relative):
    url = ORIGIN + quote(public_path(relative), safe='/')
    try:
        with urlopen(Request(url, headers={'User-Agent': 'AOG-Release-Verification/1.0', 'Cache-Control': 'no-cache'}), timeout=35) as response:
            actual = response.read()
            expected = (ROOT / relative).read_bytes()
            if relative.endswith(('.html', '.js', '.css', '.txt', '.xml')):
                actual = actual.replace(b'\r\n', b'\n').strip()
                expected = expected.replace(b'\r\n', b'\n').strip()
            matches = actual == expected
            return {'url': url, 'status': response.status, 'matches_release': matches, 'bytes': len(actual)}
    except Exception as error:
        return {'url': url, 'error': str(error), 'matches_release': False}


with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    results = list(pool.map(check, sorted(resources)))
failed = [r for r in results if not r['matches_release']]
report = {'checked_at': datetime.now(timezone.utc).isoformat(), 'resource_count': len(results), 'failed': len(failed), 'resources': results}
out = ROOT / 'seo/reports/2026-10-16'
out.mkdir(parents=True, exist_ok=True)
(out / 'live-verification.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print(f'Production verification: {len(results) - len(failed)}/{len(results)} resources match this release.')
for failure in failed:
    print(json.dumps(failure))
sys.exit(bool(failed))
