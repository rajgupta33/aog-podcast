const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const pages = ['index.html', 'get-featured/index.html', 'episodes/index.html', 'thank-you/index.html', '404.html'];
for (const entry of fs.readdirSync(path.join(root, 'episodes'), { withFileTypes: true })) {
  if (entry.isDirectory()) pages.push(`episodes/${entry.name}/index.html`);
}
let count = 0;
for (const file of pages) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/application\/ld\+json/.test(match[1]) || /\bsrc=/.test(match[1])) continue;
    new vm.Script(match[2], { filename: file });
    count++;
  }
}
for (const file of ['site-components.js', 'timestamp-toggle.js']) new vm.Script(fs.readFileSync(path.join(root, file), 'utf8'), { filename: file });
console.log(`PASS: ${count} inline scripts and 2 shared scripts parse successfully.`);
