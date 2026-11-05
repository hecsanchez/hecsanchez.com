import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

const [filename, name, mode] = process.argv.slice(2);
let fetches = 0;
globalThis.fetch = async () => { fetches++; throw new Error('Startup checks must not call a provider.'); };
const { default: handler } = await import(pathToFileURL(filename).href);
assert.equal(typeof handler, 'function');
async function invoke(method) {
  let status; let body; const headers = new Map();
  const response = { setHeader: (key, value) => headers.set(key, value),
    status(value) { status = value; return response; },
    json(value) { body = value; return response; },
  };
  await handler({ method, headers: {}, cookies: {} }, response);
  assert.equal(headers.get('Cache-Control'), 'private, no-store');
  return { status, body };
}
// Context supports GET; its unsupported POST must also reach method validation.
assert.equal((await invoke(name === 'ai-context' ? 'POST' : 'GET')).status, 405);
if (name === 'ai-context') {
  const result = await invoke('GET');
  assert.equal(result.status, mode === 'published' ? 401 : 404);
  assert.equal(result.body.ok, false);
}
assert.equal(fetches, 0);
console.log(`Packaged ${name} starts and handles methods (${mode}, Node ${process.versions.node}).`);