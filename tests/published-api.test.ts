import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SQLite } from './helpers/sqlite-d1.ts';
import type { Env } from '../workers/signups/src/types.ts';
import { SIGNUPS_WORKER_ORIGIN, SIGNUPS_PRIVACY_VERSION } from '../src/features/signups/environment.ts';
import { kitAsset } from '../src/features/signups/kit.ts';

// Separate Node test process: configure before importing the real API modules.
Object.assign(process.env, { SIGNUPS_WORKER_URL: SIGNUPS_WORKER_ORIGIN, SIGNUPS_SERVICE_TOKEN: 'fictional-private-api-test-service-token',
  SIGNUPS_NEWSLETTER_PROVIDER: 'resend', SIGNUPS_PRIVACY_VERSION, SIGNUPS_INTEGRATION_VERIFIED: 'true' });
const [{ default: resource }, { default: context }, { default: profile }, { default: newsletter }, { handle, drainOutbox }] = await Promise.all([
  import('../api/ai-resource.ts'), import('../api/ai-context.ts'), import('../api/ai-profile.ts'), import('../api/subscribe.ts'), import('../workers/signups/src/index.ts'),
]);
async function invoke(handler: typeof resource, method: string, body: unknown, token?: string) {
  let status = 0; let result: any; const headers = new Map<string, string>();
  const response = { setHeader: (key: string, value: string) => headers.set(key, value), status(value: number) { status = value; return response; }, json(value: unknown) { result = value; return response; } };
  await handler({ method, body, headers: { origin: 'https://hecsanchez.com', 'sec-fetch-site': 'same-origin', 'content-type': 'application/json' }, cookies: token ? { ai_resource_context: token } : {} } as VercelRequest, response as unknown as VercelResponse);
  return { status, result, headers };
}

test('published Vercel APIs own durable Worker requests before access and preserve private context/profile semantics', async t => {
  const db = new SQLite();
  const env: Env = { DB: db, SIGNUPS_ENABLED: 'true', RESOURCE_ENABLED: 'true', NEWSLETTER_CAPTURE_ENABLED: 'true', QUALIFICATION_ENABLED: 'true',
    PRIVACY_REVIEWED: 'true', PRIVACY_VERSION: SIGNUPS_PRIVACY_VERSION, RETENTION_MODE: 'until_deletion', DATA_RIGHTS_VERIFIED: 'true',
    SIGNUPS_SERVICE_TOKEN: process.env.SIGNUPS_SERVICE_TOKEN, RESEND_API_KEY: 'test-only', VERIFIED_SENDER: 'true', RESEND_FROM: 'Test <sender@example.invalid>', RESEND_REPLY_TO: 'reply@example.invalid',
    RESEND_CONTACTS_VERIFIED: 'true', RESEND_NEWSLETTER_SEGMENT_ID: 'b6d24b8e-af0b-4c3c-be0c-359bbd97381e', RESEND_NEWSLETTER_TOPIC_ID: '07d84122-7224-4881-9c31-1c048e204602' };
  const previous = globalThis.fetch; t.after(() => { globalThis.fetch = previous; });
  globalThis.fetch = async (url, init) => {
    assert.equal(new URL(String(url)).origin, SIGNUPS_WORKER_ORIGIN);
    return handle(new Request(url, init), env); // No execution context; no external provider call.
  };
  const input = { email: 'fictional+api@example.invalid', marketingConsent: false, idempotencyKey: crypto.randomUUID() };
  const accepted = await invoke(resource, 'POST', input);
  assert.equal(accepted.status, 200); assert.equal(db.count('signup_requests'), 1); assert.equal(db.count('delivery_outbox'), 1);
  assert.equal(accepted.result.asset.url, kitAsset.url); assert.equal(accepted.result.delivery, 'queued');
  assert.ok(!JSON.stringify(accepted.result).includes(input.email)); assert.ok(!('contextToken' in accepted.result));
  const cookie = accepted.headers.get('Set-Cookie')!;
  assert.match(cookie, /HttpOnly; Secure; SameSite=Strict; Max-Age=1800/);
  const token = cookie.split(';')[0].split('=')[1];
  assert.equal((await invoke(context, 'GET', undefined)).status, 401);
  const access = await invoke(context, 'GET', undefined, token);
  assert.equal(access.status, 200); assert.equal(access.result.profileAllowed, true);
  await drainOutbox(env, Date.now(), async () => new Response('{}', { status: 503 }));
  const failedEmail = await invoke(context, 'GET', undefined, token);
  assert.equal(failedEmail.result.asset.url, kitAsset.url); assert.equal(failedEmail.result.delivery, 'failed');
  assert.equal((await invoke(profile, 'POST', { role: 'owner', task: 'A fictional task', email: 'forged@example.invalid' }, token)).status, 200);
  assert.equal(db.count('qualification'), 1); assert.equal(db.count('operational_events'), 2);
  assert.ok(!JSON.stringify((await invoke(context, 'GET', undefined, token)).result).includes('fictional task'));
  assert.equal((await invoke(resource, 'POST', { ...input, marketingConsent: true })).status, 409);
  assert.equal((await invoke(resource, 'POST', input)).status, 200); assert.equal(db.count('signup_requests'), 1);
  const notes = await invoke(newsletter, 'POST', { email: input.email, idempotencyKey: crypto.randomUUID(), locale: 'es', placement: 'home' });
  assert.equal(notes.status, 202); assert.deepEqual(notes.result, { ok: true, recorded: true });
  assert.equal(db.count('contact_outbox'), 1); assert.equal(db.count('signup_requests'), 2);
  db.sql.exec('UPDATE resource_contexts SET expires_at=0');
  assert.equal((await invoke(context, 'GET', undefined, token)).status, 401);
});