"""Build episode metadata and discovery surfaces from verified local episode data."""
import json
import re
from datetime import datetime
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ORIGIN = 'https://attitude-ofgratitude.com'
DATA = ROOT / 'seo/episode-data/episodes.json'


def update_jsonld(path, transform):
    text = path.read_text(encoding='utf-8')
    def replace(match):
        obj = json.loads(match[1])
        transform(obj)
        return '<script type="application/ld+json">\n' + json.dumps(obj, ensure_ascii=False, indent=2) + '\n  </script>'
    path.write_text(re.sub(r'<script type="application/ld\+json">\s*(.*?)\s*</script>', replace, text, flags=re.S), encoding='utf-8')


def main():
    data = json.loads(DATA.read_text(encoding='utf-8'))
    episodes = data['episodes']
    for ep in episodes:
        path = ROOT / 'episodes' / ep['slug'] / 'index.html'
        def transform(obj):
            for node in obj.get('@graph', []):
                if node.get('@type') == 'PodcastEpisode':
                    node['datePublished'] = ep['datePublished']
                    node['timeRequired'] = ep['durationISO']
                elif node.get('@type') == 'VideoObject':
                    node['uploadDate'] = ep['uploadDate']
                    node['duration'] = ep['durationISO']
        update_jsonld(path, transform)
        text = path.read_text(encoding='utf-8')
        duration = re.fullmatch(r'PT(\d+)M(\d+)S', ep['durationISO'])
        date_label = datetime.fromisoformat(ep['datePublished']).strftime('%d %B %Y').lstrip('0')
        meta = (f'<div class="ep-meta fade-up delay-2"><span><time datetime="{ep["datePublished"]}">{date_label}</time></span>'
                f'<span>{duration[1]} min {duration[2]} sec watch</span></div>')
        text = re.sub(r'<div class="ep-meta\b[^>]*>.*?</div>', lambda m: meta, text, count=1, flags=re.S)
        path.write_text(text, encoding='utf-8')

    ordered = sorted(episodes, key=lambda e: e['uploadDate'], reverse=True)
    archive = ROOT / 'episodes/index.html'
    def archive_schema(obj):
        for node in obj.get('@graph', []):
            if node.get('@type') == 'ItemList':
                node['numberOfItems'] = len(episodes)
                node['itemListElement'] = [
                    {'@type': 'ListItem', 'position': i, 'url': ep['url'], 'name': ep['headline']}
                    for i, ep in enumerate(ordered, 1)]
            if node.get('@type') == 'CollectionPage':
                node['description'] = re.sub(r'all \d+ episodes', f'all {len(episodes)} episodes', node['description'])
    update_jsonld(archive, archive_schema)
    text = archive.read_text(encoding='utf-8')
    cards = []
    for i, ep in enumerate(ordered):
        label = 'LATEST EPISODE' if i == 0 else datetime.fromisoformat(ep['datePublished']).strftime('%d %b %Y').upper().lstrip('0')
        cards.append(f'''          <a href="/episodes/{ep['slug']}/" class="episode-card card-solid scale-hover ds-block">
            <div class="episode-thumb"><img src="{escape(ep['thumbnail'])}" alt="{escape(ep['headline'])}" width="640" height="360" loading="{'eager' if i < 3 else 'lazy'}" /><span class="play-badge">&#9654;</span></div>
            <div class="episode-body"><h3>{label}</h3><p>{escape(ep['headline'])}</p></div>
          </a>''')
    text = re.sub(r'(<div class="ep-index-grid(?: fade-scroll)?">).*?(\n        </div>)', lambda m: m[1] + '\n' + '\n'.join(cards) + m[2], text, count=1, flags=re.S)
    text = re.sub(r'all \d+ episodes', f'all {len(episodes)} episodes', text)
    archive.write_text(text, encoding='utf-8')

    # Keep the existing homepage selection, with the newest interview first.
    home = ROOT / 'index.html'
    text = home.read_text(encoding='utf-8')
    latest = ordered[0]
    marker = f'href="/episodes/{latest["slug"]}/" class="episode-card'
    if marker not in text:
        text = text.replace('<h3>LATEST EPISODE</h3>', '<h3>9 SEPTEMBER 2026</h3>')
        text = text.replace('<div class="swiper-wrapper">', '<div class="swiper-wrapper">\n            <div class="swiper-slide">\n' + cards[0] + '\n            </div>', 1)
    text = re.sub(r'all \d+ episodes', f'all {len(episodes)} episodes', text)
    # The hero's latest-episode button should open the episode itself.
    text = re.sub(r'href="[^"]+"([^>]*>\s*(?:&#9654;|▶)?\s*LATEST EPISODE)', lambda m: f'href="/episodes/{latest["slug"]}/"' + m[1], text, count=1)
    home.write_text(text, encoding='utf-8')

    urls = ['/', '/get-featured/', '/episodes/'] + [f'/episodes/{ep["slug"]}/' for ep in ordered]
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    xml += ''.join(f'  <url><loc>{ORIGIN}{url}</loc><lastmod>2026-10-16</lastmod></url>\n' for url in urls)
    (ROOT / 'sitemap.xml').write_text(xml + '</urlset>\n', encoding='utf-8')
    print(f'Updated {len(episodes)} episode schemas, archive, homepage and sitemap.')


if __name__ == '__main__':
    main()
