// Isolated contract tests: no requests or test leads are sent to production.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '../get-featured/index.html'), 'utf8');
const code = html.slice(html.indexOf('function getOrCreateAttemptLeadId()'), html.indexOf('// Floating Label Logic'));
async function scenario(response, succeeds) {
  const button = { textContent: 'Apply', disabled: false };
  const error = { style: {}, innerHTML: '' };
  const fields = Object.fromEntries(['firstName','lastName','email','mobile','linkedin','pitch','selectedPackage','referralSource'].map(id => [id, { value: `test-${id}` }]));
  const form = { checkValidity: () => true, querySelector: () => button };
  const storage = new Map();
  const events = [];
  const context = vm.createContext({
    document: { getElementById: id => id === 'collab-form' ? form : id === 'form-error-box' ? error : fields[id], referrer: '' },
    window: { location: { search: '', href: '/get-featured/' }, dataLayer: { push: event => events.push(event) } },
    sessionStorage: { getItem: k => storage.get(k), setItem: (k,v) => storage.set(k,v), removeItem: k => storage.delete(k) },
    fetch: async () => { if (response instanceof Error) throw response; return response; },
    AbortController, URLSearchParams, setTimeout, clearTimeout, encodeURIComponent
  });
  vm.runInContext(code, context);
  await context.handleFormSubmit({ preventDefault() {} });
  assert.equal(context.window.location.href === '/thank-you/', succeeds);
  assert.equal(events.some(e => e.event === 'generate_lead'), succeeds);
  assert.equal(button.disabled, succeeds);
  if (!succeeds) {
    assert.equal(error.style.display, 'block');
    assert.ok(storage.get('aog_attempt_lead_id'), 'Retries preserve the attempt ID');
  }
  assert.ok(!JSON.stringify(events).includes('test-email'));
}
(async () => {
  await scenario({ ok:true, json:async()=>({result:'success',leadId:'test-confirmed'}) }, true);
  await scenario({ ok:true, json:async()=>({success:true}) }, true);
  await scenario({ ok:true, json:async()=>({status:'success'}) }, true);
  await scenario({ ok:true, json:async()=>({}) }, false);
  await scenario({ ok:true, json:async()=>({result:'error'}) }, false);
  await scenario({ ok:true, json:async()=>({success:false,status:'success'}) }, false);
  await scenario({ ok:true, json:async()=>{throw new Error('HTML response');} }, false);
  await scenario({ ok:false, status:500 }, false);
  await scenario(new Error('Network error'), false);
  await scenario(new DOMException('Timed out', 'AbortError'), false);
  console.log('PASS: 10 booking success, rejection, retry, and failure scenarios; no live submissions.');
})().catch(error => { console.error(error); process.exitCode = 1; });
