"""Source-level CSS cascade regressions; this is not a browser rendering test."""
from pathlib import Path
from html.parser import HTMLParser
import re
import xml.etree.ElementTree as ET
import tinycss2
import cssselect2

ROOT = Path(__file__).resolve().parent.parent
WIDTHS = (320, 360, 390, 768, 1024, 1366)
VOID = set('area base br col embed hr img input link meta param source track wbr'.split())


class DOM(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.root = ET.Element('document')
        self.stack = [self.root]
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        node = ET.SubElement(self.stack[-1], tag, {k: v or '' for k, v in attrs})
        if tag not in VOID:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                self.stack = self.stack[:i]
                break


def declarations(content):
    return [(d.lower_name, tinycss2.serialize(d.value).strip(), d.important)
            for d in tinycss2.parse_declaration_list(content, skip_comments=True, skip_whitespace=True)
            if d.type == 'declaration']


def matcher(css, width, reduced=False):
    result = cssselect2.Matcher()
    def add(rules):
        for rule in rules:
            if rule.type == 'qualified-rule':
                # The parser has no input state. Model empty placeholder fields
                # for matching static label styles; focus interactions are separate.
                selector_text = tinycss2.serialize(rule.prelude).replace(':placeholder-shown', '[placeholder]:not([value])')
                for selector in cssselect2.compile_selector_list(selector_text):
                    result.add_selector(selector, declarations(rule.content))
            elif rule.type == 'at-rule' and rule.lower_at_keyword == 'media':
                query = tinycss2.serialize(rule.prelude)
                applies = all(width <= int(n) for n in re.findall(r'max-width:\s*(\d+)px', query))
                applies &= all(width >= int(n) for n in re.findall(r'min-width:\s*(\d+)px', query))
                if 'prefers-reduced-motion' in query:
                    applies &= reduced
                if applies:
                    add(tinycss2.parse_rule_list(rule.content, skip_comments=True, skip_whitespace=True))
    add(tinycss2.parse_stylesheet(css, skip_comments=True, skip_whitespace=True))
    return result


def computed(element, rules):
    values = {}
    weights = {}
    for specificity, order, pseudo, decls in rules.match(element):
        if pseudo:
            continue
        for name, value, important in decls:
            weight = (important, 0, *specificity, order)
            if weight >= weights.get(name, (-1,)):
                values[name], weights[name] = value, weight
    for name, value, important in declarations(element.etree_element.get('style', '')):
        weight = (important, 1, 0, 0, 0, 0)
        if weight >= weights.get(name, (-1,)):
            values[name], weights[name] = value, weight
    return values


pages = [ROOT / name for name in ('index.html', 'get-featured/index.html', 'episodes/index.html', 'thank-you/index.html', '404.html')]
pages += list((ROOT / 'episodes').glob('*/index.html'))
shared = (ROOT / 'styles.css').read_text(encoding='utf-8')
checks = 0
for page in pages:
    html = page.read_text(encoding='utf-8')
    root = cssselect2.ElementWrapper.from_html_root(DOM(html).root)
    css = shared + '\n' + '\n'.join(re.findall(r'<style[^>]*>(.*?)</style>', html, re.S))
    assert re.search(r'styles.css\?v=20261016-(?:layout2|home3)', html), page
    assert "const navToggle =" not in html, page
    for width in WIDTHS:
        rules = matcher(css, width)
        if page == ROOT / 'index.html':
            gallery = root.query('.hero-gallery-wrap')
            assert computed(gallery, rules).get('grid-row') == ('1' if width <= 700 else 'auto'), (width, 'hero guest placement')
            assert root.query('.cf-card img').etree_element.get('fetchpriority') == 'high'
            checks += 2
        for img in root.query_all('.episode-thumb img'):
            actual = computed(img, rules)
            frame = computed(img.parent, rules)
            assert actual.get('width') == '100%' and actual.get('height') == '100%', (page, width, actual)
            assert actual.get('object-fit') == 'contain', (page, width)
            assert re.sub(r'\s', '', frame.get('aspect-ratio', '')) == '16/9', (page, width)
            checks += 1
        for el in root.query_all('.fade-scroll'):
            assert computed(el, rules).get('opacity') == '1', (page, width, 'content hidden')
            checks += 1
        for el in root.query_all('.nav-toggle'):
            assert computed(el, rules).get('display') == ('block' if width <= 1080 else 'none'), (page, width, 'navigation breakpoint')
            checks += 1
        for el in root.query_all('.container'):
            assert 'vw' not in computed(el, rules).get('width', ''), (page, width, 'nested container exceeds parent')
            checks += 1
        if width <= 760:
            for el in root.query_all('.floating-label-group label'):
                assert computed(el, rules).get('position') == 'static', (page, width, 'overlapping form label')
                checks += 1
        if width <= 480:
            for el in root.query_all('.hero-actions .button'):
                assert computed(el, rules).get('white-space') == 'normal', (page, width, 'button text clips')
                checks += 1
    reduced = matcher(css, 390, reduced=True)
    for el in root.query_all('.fade-up'):
        assert computed(el, reduced).get('opacity') == '1', (page, 'reduced motion hides content')
        checks += 1

print(f'PASS: {checks} CSS cascade checks across {len(pages)} pages at {WIDTHS}px, plus reduced motion.')
print('These checks verify source rules; browser rendering remains a separate check.')
