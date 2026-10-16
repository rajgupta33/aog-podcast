const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
function element() {
  const classes = new Set(), attributes = {}, listeners = {};
  return {
    id: '', attributes, listeners,
    classList: { toggle(name, value) { if (value) classes.add(name); else classes.delete(name); }, contains: name => classes.has(name) },
    addEventListener(name, callback) { listeners[name] = callback; },
    setAttribute(name, value) { attributes[name] = value; },
    getAttribute(name) { return attributes[name]; },
    focus() { document.activeElement = this; }
  };
}
const toggle = element(), links = element(), firstLink = element(), lastLink = element();
links.querySelectorAll = () => [firstLink, lastLink];
const document = element();
document.readyState = 'complete';
document.documentElement = element();
document.querySelector = selector => selector === '.nav-toggle' ? toggle : links;
const window = element();
window.innerWidth = 390;
window.location = { pathname: '/episodes/' };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../site-components.js'), 'utf8'), { document, window, Array });
assert.equal(toggle.getAttribute('aria-controls'), 'site-navigation');
assert.equal(toggle.getAttribute('aria-expanded'), 'false');
toggle.listeners.click();
assert.equal(links.classList.contains('open'), true);
assert.equal(document.documentElement.classList.contains('nav-open'), true);
links.listeners.click({ target: { closest: () => firstLink } });
assert.equal(toggle.getAttribute('aria-expanded'), 'false');
assert.equal(document.documentElement.classList.contains('nav-open'), false);
toggle.listeners.click();
document.listeners.keydown({ key: 'Escape' });
assert.equal(toggle.getAttribute('aria-expanded'), 'false');
assert.equal(document.activeElement, toggle);
toggle.listeners.click();
document.activeElement = lastLink;
let prevented = false;
document.listeners.keydown({ key: 'Tab', preventDefault() { prevented = true; } });
assert.equal(prevented, true);
assert.equal(document.activeElement, toggle);
document.listeners.keydown({ key: 'Tab', shiftKey: true, preventDefault() {} });
assert.equal(document.activeElement, lastLink);
window.innerWidth = 1366;
window.listeners.resize();
assert.equal(toggle.getAttribute('aria-expanded'), 'false');
assert.equal(document.documentElement.classList.contains('nav-open'), false);
console.log('PASS: mobile menu open/close, link navigation, Escape, focus wrapping and desktop resize.');
