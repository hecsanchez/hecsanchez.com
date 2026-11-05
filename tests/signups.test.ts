import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { handle, drainOutbox, cleanup } from '../workers/signups/src/index.ts';
import { drainContacts, drainRights } from '../workers/signups/src/contacts.ts';
import type { Database, Statement, Env } from '../workers/signups/src/types.ts';
import { KIT_DOWNLOAD_URL, parseNewsletter } from '../src/features/signups/contracts.ts';
import { subscribeButtondown } from '../src/features/signups/buttondown.ts';
import { retryKey } from '../src/features/signups/retry-key.ts';
import { workerEnvironmentReady } from '../src/features/signups/worker-client.ts';
import newsletterHandler from '../api/subscribe.ts';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Real SQLite executes the checked-in D1 migration and every production query.
// This adapter supplies only D1's async shape, not emulated SQL behavior.
class SQLite implements Database {
  sql = new DatabaseSync(':memory:');
  constructor() { this.sql.exec(readFileSync('workers/signups/migrations/0001_signups.sql', 'utf8')); }
  prepare(query: string): Statement {
    let values: SQLInputValue[] = [];
    const statement: Statement = {
      bind(...input) { values = input as SQLInputValue[]; return statement; },
      first: async <T>() => this.sql.prepare(query).get(...values) as T ?? null,
      all: async <T>() => ({ results: this.sql.prepare(query).all(...values) as T[] }),
      run: async () => this.sql.prepare(query).run(...values),
    };
    return statement;
  }
  async batch(statements: Statement[]) {
    this.sql.exec('BEGIN');
    try { const result = []; for (const statement of statements) result.push(await statement.run()); this.sql.exec('COMMIT'); return result; }
    catch (error) { this.sql.exec('ROLLBACK'); throw error; }
  }
  count(table: string): number { return Number(this.sql.prepare(`SELECT count(*) AS n FROM ${table}`).get()!.n); }
}
function fixture() {
  const db = new SQLite();
  const env: Env = { DB: db, SIGNUPS_ENABLED: 'true', RESOURCE_ENABLED: 'true', NEWSLETTER_CAPTURE_ENABLED: 'true', QUALIFICATION_ENABLED: 'true',
    PRIVACY_REVIEWED: 'true', PRIVACY_VERSION: 'test-only-v1', RETENTION_MODE: 'until_deletion', DATA_RIGHTS_VERIFIED: 'true', VERIFIED_SENDER: 'true',
    SIGNUPS_ADMIN_TOKEN: 'fictional-admin-token-for-local-tests-only', RESEND_CONTACTS_VERIFIED: 'true',
    RESEND_NEWSLETTER_SEGMENT_ID: 'b6d24b8e-af0b-4c3c-be0c-359bbd97381e', RESEND_NEWSLETTER_TOPIC_ID: '07d84122-7224-4881-9c31-1c048e204602',
    SIGNUPS_SERVICE_TOKEN: 'fictional-service-token-for-local-tests-only', RESEND_API_KEY: 'test-only',
    RESEND_FROM: 'Test <sender@example.invalid>', RESEND_REPLY_TO: 'reply@example.invalid' };
  return { db, env };
}
const command = () => ({ email: 'fictional+kit@example.invalid', marketingConsent: false, idempotencyKey: crypto.randomUUID() });
const newsletter = () => ({ email: 'fictional+notes@example.invalid', idempotencyKey: crypto.randomUUID(), locale: 'en', placement: 'writing_post' });
async function call(env: Env, path: string, data: unknown, headers: Record<string, string> = {}) {
  const response = await handle(new Request(`https://worker.example.invalid${path}`, { method: 'POST',
    headers: { Origin: 'https://hecsanchez.com', 'Content-Type': 'application/json', Authorization: `Bearer ${env.SIGNUPS_SERVICE_TOKEN}`, ...headers },
    body: typeof data === 'string' ? data : JSON.stringify(data) }), env);
  return { response, body: await response.json() as any };
}

test('worker remains unavailable without explicit readiness, storage and verified sender', async () => {
  const { env } = fixture();
  for (const change of [{ SIGNUPS_ENABLED: 'false' }, { DB: undefined }, { PRIVACY_REVIEWED: 'false' }, { PRIVACY_VERSION: '' },
    { RETENTION_MODE: '' }, { DATA_RIGHTS_VERIFIED: 'false' }, { VERIFIED_SENDER: 'false' }, { RESEND_API_KEY: '' }, { RESOURCE_ENABLED: 'false' }]) {
    assert.equal((await call({ ...env, ...change }, '/v1/resource', command())).response.status, 503);
  }
  assert.equal((await call({ ...env, RESEND_CONTACTS_VERIFIED: 'false' }, '/v1/newsletter', newsletter())).response.status, 503);
});

test('exact origins, server credential, JSON, sizes and methods are enforced without reflected secrets', async () => {
  const { env, db } = fixture();
  for (const Origin of ['https://evil.invalid', 'https://hecsanchez.com.evil.invalid', 'http://hecsanchez.com', 'https://hecsanchez.com:444', 'null']) {
    const result = await call(env, '/v1/resource', command(), { Origin });
    assert.equal(result.response.status, 403);
    assert.equal(result.response.headers.get('Access-Control-Allow-Origin'), null);
  }
  assert.equal((await call(env, '/v1/resource', command(), { Authorization: 'Bearer forged' })).response.status, 403);
  assert.equal((await call(env, '/v1/resource', command(), { 'Sec-Fetch-Site': 'cross-site' })).response.status, 403);
  assert.equal((await call(env, '/v1/resource?email=private', command())).response.status, 403);
  assert.equal((await call(env, '/v1/resource', command(), { 'Content-Type': 'text/plain' })).response.status, 415);
  assert.equal((await call(env, '/v1/resource', 'x'.repeat(4097))).response.status, 413);
  assert.equal((await call(env, '/v1/resource', '{bad')).response.status, 400);
  const get = await handle(new Request('https://worker.example.invalid/v1/resource', { headers: { Origin: 'https://hecsanchez.com' } }), env);
  assert.equal(get.status, 405);
  const options = await handle(new Request('https://worker.example.invalid/v1/resource', { method: 'OPTIONS', headers: { Origin: 'https://www.hecsanchez.com' } }), env);
  assert.equal(options.status, 204);
  assert.equal(options.headers.get('Access-Control-Allow-Origin'), 'https://www.hecsanchez.com');
  assert.equal(db.count('signup_requests'), 0);
});

test('resource acceptance atomically persists explicit purpose, source, false consent and one outbox/event', async () => {
  const { env, db } = fixture();
  const input = command();
  const result = await call(env, '/v1/resource', { ...input, url: 'https://evil.invalid', resourceVersion: 'forged', sourcePage: 'private',
    attribution: { first: { utm_source: 'tiktok', email: input.email }, latest: { utm_source: 'person@example.invalid' } } });
  assert.equal(result.response.status, 200);
  assert.equal(result.body.receipt.asset.url, KIT_DOWNLOAD_URL);
  assert.equal(result.body.receipt.delivery, 'queued');
  assert.equal(result.response.headers.get('Cache-Control'), 'private, no-store');
  const row = db.sql.prepare('SELECT * FROM signup_requests').get()!;
  assert.equal(row.email, input.email);
  assert.equal(row.purpose, 'kit_contexto'); assert.equal(row.resource_version, 'v1.1');
  assert.equal(row.source_page, '/es/ia/'); assert.equal(row.placement, 'kit_form');
  assert.equal(row.consent, 0); assert.equal(row.consent_version, 'ai-examples-v1');
  assert.equal(row.privacy_version, 'test-only-v1');
  assert.deepEqual(JSON.parse(String(row.attribution)), { first: { utm_source: 'tiktok' }, latest: null });
  assert.equal(db.count('delivery_outbox'), 1); assert.equal(db.count('operational_events'), 1);
  assert.equal(db.count('contact_outbox'), 0);
  assert.ok(!JSON.stringify(result.body).includes(input.email));
  assert.ok(!JSON.stringify(db.sql.prepare('SELECT * FROM resource_contexts').all()).includes(result.body.contextToken));
});

test('retries own one request; changed email, consent or signup purpose conflicts', async () => {
  const { env, db } = fixture(); const input = command();
  const first = await call(env, '/v1/resource', input);
  const retry = await call(env, '/v1/resource', input);
  assert.equal(retry.body.receipt.requestId, first.body.receipt.requestId);
  for (const changed of [{ ...input, email: 'other@example.invalid' }, { ...input, marketingConsent: true }]) {
    assert.equal((await call(env, '/v1/resource', changed)).response.status, 409);
  }
  assert.equal((await call(env, '/v1/newsletter', { ...newsletter(), idempotencyKey: input.idempotencyKey })).response.status, 409);
  assert.equal(db.count('signup_requests'), 1); assert.equal(db.count('delivery_outbox'), 1); assert.equal(db.count('operational_events'), 1);
});

test('failed durable write rolls back acceptance and never returns a resource success', async () => {
  const { env, db } = fixture();
  db.sql.exec("CREATE TRIGGER fail_outbox BEFORE INSERT ON delivery_outbox BEGIN SELECT RAISE(ABORT, 'test storage failure'); END");
  assert.equal((await call(env, '/v1/resource', command())).response.status, 503);
  assert.equal(db.count('signup_requests'), 0); assert.equal(db.count('rate_buckets'), 0);
});

test('delivery failure preserves access, retries use one opaque provider key, and sent means API acceptance', async () => {
  const { env, db } = fixture(); const accepted = await call(env, '/v1/resource', command());
  const keys: string[] = [];
  const send: typeof fetch = async (url, init) => {
    assert.equal(url, 'https://api.resend.com/emails');
    assert.ok(!String(url).includes('@'));
    const headers = new Headers(init!.headers);
    keys.push(headers.get('Idempotency-Key')!);
    const email = JSON.parse(String(init!.body));
    assert.equal(email.subject, 'Tu Kit Contexto'); assert.ok(email.text.includes(KIT_DOWNLOAD_URL));
    assert.equal(email.reply_to, 'reply@example.invalid');
    return new Response('{}', { status: keys.length === 1 ? 503 : 200 });
  };
  const now = Date.now(); await drainOutbox(env, now, send);
  let access = await call(env, '/v1/context', { contextToken: accepted.body.contextToken });
  assert.equal(access.response.status, 200); assert.equal(access.body.receipt.delivery, 'failed');
  assert.equal(access.body.receipt.asset.url, KIT_DOWNLOAD_URL);
  await drainOutbox(env, now + 61000, send);
  access = await call(env, '/v1/context', { contextToken: accepted.body.contextToken });
  assert.equal(access.body.receipt.delivery, 'sent'); assert.equal(keys.length, 2); assert.equal(keys[0], keys[1]);
  await drainOutbox(env, now + 120000, send); assert.equal(keys.length, 2);
  assert.equal(db.count('operational_events'), 1);
});

test('outbox lease prevents parallel sends and retries stop before the provider idempotency window expires', async () => {
  const { env, db } = fixture(); await call(env, '/v1/resource', command());
  let sends = 0; const send: typeof fetch = async () => { sends++; return new Response('{}'); };
  await Promise.all([drainOutbox(env, Date.now(), send), drainOutbox(env, Date.now(), send)]);
  assert.equal(sends, 1);
  db.sql.exec("UPDATE delivery_outbox SET state='queued', attempts=0, next_attempt_at=0, retry_until=1");
  await drainOutbox(env, Date.now(), send); assert.equal(sends, 1);
  assert.equal(db.sql.prepare('SELECT state FROM delivery_outbox').get()!.state, 'failed');
});

test('qualification is write-only, optional, idempotently attached and unavailable after context expiry', async () => {
  const { env, db } = fixture(); const accepted = await call(env, '/v1/resource', command());
  const token = accepted.body.contextToken;
  const data = { contextToken: token, profile: { role: 'operations', task: 'Review a fictional process', frequency: 'weekly', email: 'forged', marketingConsent: true } };
  assert.equal((await call(env, '/v1/profile', data)).response.status, 200);
  assert.equal((await call(env, '/v1/profile', data)).response.status, 200);
  assert.equal(db.count('qualification'), 1); assert.equal(db.count('operational_events'), 2);
  assert.equal(db.sql.prepare('SELECT consent FROM signup_requests').get()!.consent, 0);
  const access = await call(env, '/v1/context', { contextToken: token });
  assert.ok(!JSON.stringify(access.body).includes('fictional process'));
  assert.equal((await call({ ...env, QUALIFICATION_ENABLED: 'false' }, '/v1/profile', data)).response.status, 404);
  assert.equal((await call(env, '/v1/profile', { ...data, profile: { role: 'owner', task: 'x'.repeat(501) } })).response.status, 400);
  assert.equal((await call(env, '/v1/context', { contextToken: 'a'.repeat(43) })).response.status, 401);
  db.sql.exec('UPDATE resource_contexts SET expires_at=0');
  assert.equal((await call(env, '/v1/profile', data)).response.status, 401);
  assert.equal((await call(env, '/v1/context', { contextToken: token })).response.status, 401);
});

test('intentional requests are bounded while a retry does not consume a new quota', async () => {
  const { env, db } = fixture(); const first = command();
  await call(env, '/v1/resource', first); await call(env, '/v1/resource', first);
  for (let i = 0; i < 4; i++) assert.equal((await call(env, '/v1/resource', command())).response.status, 200);
  assert.equal((await call(env, '/v1/resource', command())).response.status, 429);
  assert.equal(db.count('signup_requests'), 5);
  assert.ok(!JSON.stringify(db.sql.prepare('SELECT * FROM rate_buckets').all()).includes('fictional'));
});

test('newsletter records separate intent once and syncs only new contacts through a scoped Resend create', async () => {
  const { env, db } = fixture(); const input = newsletter();
  const result = await call(env, '/v1/newsletter', { ...input, sourcePage: 'forged', consent: false });
  assert.equal(result.response.status, 200);
  const row = db.sql.prepare('SELECT * FROM signup_requests').get()!;
  assert.equal(row.purpose, 'shipping_notes'); assert.equal(row.consent, 1);
  assert.equal(row.source_page, '/en/writing/'); assert.equal(row.placement, 'writing_post');
  assert.equal(row.consent_version, 'shipping-notes-request-v1'); assert.equal(row.resource_id, null);
  assert.equal(db.count('delivery_outbox'), 0);
  assert.equal(row.consent_status, 'requested');
  let creates = 0;
  const send: typeof fetch = async (url, init) => {
    assert.ok(!String(url).includes(input.email));
    if (init!.method === 'GET') return Response.json({ data: [], has_more: false });
    assert.equal(String(url), 'https://api.resend.com/contacts');
    assert.deepEqual(JSON.parse(String(init!.body)), { email: input.email,
      segments: [{ id: env.RESEND_NEWSLETTER_SEGMENT_ID }], topics: [{ id: env.RESEND_NEWSLETTER_TOPIC_ID, subscription: 'opt_in' }] });
    creates++; return Response.json({ id: 'e169aa45-1ecf-4183-9955-b1499d5701d3' });
  };
  await drainContacts(db, env, Date.now(), send);
  await call(env, '/v1/newsletter', input); await drainContacts(db, env, Date.now(), send);
  assert.equal(creates, 1); assert.equal(db.count('signup_requests'), 1);
  assert.equal(db.sql.prepare('SELECT state FROM contact_outbox').get()!.state, 'synced');
});

test('existing Resend contacts and unsubscribed recipients are preserved without updates or re-enrollment', async () => {
  const { env, db } = fixture(); const input = newsletter();
  await call(env, '/v1/newsletter', input);
  let calls = 0;
  const send: typeof fetch = async (url, init) => {
    calls++; assert.equal(init!.method, 'GET'); assert.ok(!String(url).includes('@'));
    return Response.json({ has_more: false, data: [{ id: 'e169aa45-1ecf-4183-9955-b1499d5701d3', email: input.email, unsubscribed: true }] });
  };
  await drainContacts(db, env, Date.now(), send);
  assert.equal(calls, 1); assert.equal(db.sql.prepare('SELECT state FROM contact_outbox').get()!.state, 'preserved');
  assert.equal(db.count('delivery_outbox'), 0);
});

test('contact lookup failure and incomplete pagination retain a failed outbox instead of creating blindly', async () => {
  const { env, db } = fixture(); await call(env, '/v1/newsletter', newsletter());
  let creates = 0;
  const send: typeof fetch = async (_url, init) => {
    if (init!.method !== 'GET') creates++;
    return Response.json({ has_more: true, data: [{ id: 'e169aa45-1ecf-4183-9955-b1499d5701d3', email: 'different@example.invalid', unsubscribed: false }] });
  };
  await drainContacts(db, env, Date.now(), send);
  assert.equal(creates, 0); assert.equal(db.sql.prepare('SELECT state FROM contact_outbox').get()!.state, 'failed');
  assert.equal(db.count('signup_requests'), 1);
});

test('uncertain contact creation retries by discovery and preserves an already created contact', async () => {
  const { env, db } = fixture(); const input = newsletter(); await call(env, '/v1/newsletter', input);
  let created = false; let creates = 0;
  const send: typeof fetch = async (_url, init) => {
    if (init!.method === 'GET') return Response.json({ has_more: false, data: created ? [{ id: 'e169aa45-1ecf-4183-9955-b1499d5701d3', email: input.email, unsubscribed: true }] : [] });
    creates++; created = true; throw new Error('uncertain test transport');
  };
  const now = Date.now(); await drainContacts(db, env, now, send); await drainContacts(db, env, now + 61000, send);
  assert.equal(creates, 1); assert.equal(db.sql.prepare('SELECT state FROM contact_outbox').get()!.state, 'preserved');
});

test('records have no age purge; authenticated erasure cascades all requests and retains a provider cleanup job', async () => {
  const { env, db } = fixture(); const kit = await call(env, '/v1/resource', command());
  await call(env, '/v1/profile', { contextToken: kit.body.contextToken, profile: { role: 'owner', task: 'Test' } });
  const notes = { ...newsletter(), email: command().email }; await call(env, '/v1/newsletter', notes);
  db.sql.exec('UPDATE signup_requests SET created_at=1');
  db.sql.exec('UPDATE resource_contexts SET expires_at=0');
  await cleanup(env);
  assert.equal(db.count('signup_requests'), 2); assert.equal(db.count('qualification'), 1); assert.equal(db.count('delivery_outbox'), 1); assert.equal(db.count('resource_contexts'), 0);
  assert.equal((await call(env, '/v1/admin/erase', { email: notes.email })).response.status, 403);
  assert.equal((await call({ ...env, SIGNUPS_ENABLED: 'false' }, '/v1/admin/erase', { email: notes.email }, { Authorization: `Bearer ${env.SIGNUPS_ADMIN_TOKEN}` })).response.status, 202);
  assert.equal(db.count('signup_requests'), 0); assert.equal(db.count('qualification'), 0); assert.equal(db.count('contact_outbox'), 0);
  assert.equal(db.count('operational_events'), 0); assert.equal(db.count('rights_jobs'), 1);
  assert.equal((await call(env, '/v1/resource', command())).response.status, 409);
  await drainRights(db, env, Date.now() + 121000, async () => Response.json({ data: [], has_more: false }));
  assert.equal(db.count('rights_jobs'), 0);
});

test('explicit withdrawal changes consent status without changing transactional kit access', async () => {
  const { env, db } = fixture(); const input = { ...command(), marketingConsent: true };
  const kit = await call(env, '/v1/resource', input);
  assert.equal((await call(env, '/v1/admin/withdraw', { email: input.email, purpose: 'kit_contexto' }, { Authorization: `Bearer ${env.SIGNUPS_ADMIN_TOKEN}` })).response.status, 202);
  assert.equal(db.sql.prepare('SELECT consent_status FROM signup_requests').get()!.consent_status, 'withdrawn');
  assert.equal((await call(env, '/v1/context', { contextToken: kit.body.contextToken })).response.status, 200);
  assert.equal(db.count('delivery_outbox'), 1);
});

test('provider erasure failure retains a retry job and deletes by opaque ID without email in URL', async () => {
  const { env, db } = fixture(); const input = newsletter(); await call(env, '/v1/newsletter', input);
  db.sql.prepare("INSERT INTO provider_contacts(email, contact_id, state) VALUES (?, ?, 'synced')").run(input.email, 'e169aa45-1ecf-4183-9955-b1499d5701d3');
  await call(env, '/v1/admin/erase', { email: input.email }, { Authorization: `Bearer ${env.SIGNUPS_ADMIN_TOKEN}` });
  const now = Date.now() + 121000;
  await drainRights(db, env, now, async () => new Response('private', { status: 503 }));
  assert.equal(db.count('rights_jobs'), 1); assert.equal(db.count('signup_requests'), 0);
  await drainRights(db, env, now + 61000, async (url, init) => {
    assert.equal(url, 'https://api.resend.com/contacts/e169aa45-1ecf-4183-9955-b1499d5701d3'); assert.equal(init!.method, 'DELETE');
    return Response.json({ deleted: true });
  });
  assert.equal(db.count('rights_jobs'), 0);
});

test('newsletter withdrawal scopes provider opt-out to Shipping Notes and leaves kit requests intact', async () => {
  const { env, db } = fixture(); const input = newsletter(); await call(env, '/v1/newsletter', input);
  await call(env, '/v1/resource', { ...command(), email: input.email });
  db.sql.prepare("INSERT INTO provider_contacts(email, contact_id, state) VALUES (?, ?, 'synced')").run(input.email, 'e169aa45-1ecf-4183-9955-b1499d5701d3');
  await call(env, '/v1/admin/withdraw', { email: input.email, purpose: 'shipping_notes' }, { Authorization: `Bearer ${env.SIGNUPS_ADMIN_TOKEN}` });
  await drainRights(db, env, Date.now() + 121000, async (url, init) => {
    assert.equal(url, 'https://api.resend.com/contacts/e169aa45-1ecf-4183-9955-b1499d5701d3/topics');
    assert.equal(init!.method, 'PATCH');
    assert.deepEqual(JSON.parse(String(init!.body)), [{ id: env.RESEND_NEWSLETTER_TOPIC_ID, subscription: 'opt_out' }]);
    return Response.json({ object: 'contact_topics' });
  });
  assert.equal(db.count('rights_jobs'), 0); assert.equal(db.count('signup_requests'), 2); assert.equal(db.count('delivery_outbox'), 1);
});

test('Buttondown adapter preserves create/tag/confirmation behavior without reactivation or AI enrollment', async t => {
  const previous = process.env.BUTTONDOWN_API_KEY; process.env.BUTTONDOWN_API_KEY = 'test-only';
  t.after(() => { if (previous === undefined) delete process.env.BUTTONDOWN_API_KEY; else process.env.BUTTONDOWN_API_KEY = previous; });
  for (const [data, confirm] of [[{ type: 'unactivated' }, true], [{ subscriber_type: 'regular' }, false], [{}, true]] as const) {
    const send: typeof fetch = async (url, init) => {
      assert.equal(url, 'https://api.buttondown.com/v1/subscribers'); assert.equal(init!.method, 'POST');
      assert.deepEqual(JSON.parse(String(init!.body)), { email_address: 'fictional@example.invalid', tags: ['website'] });
      return Response.json(data);
    };
    assert.deepEqual(await subscribeButtondown('fictional@example.invalid', send), { ok: true, confirm });
  }
  assert.deepEqual(await subscribeButtondown('fictional@example.invalid', async () => new Response('private details', { status: 400 })), { ok: false, uncertain: false });
  assert.deepEqual(await subscribeButtondown('fictional@example.invalid', async () => { throw new Error('private'); }), { ok: false, uncertain: true });
});

test('retry storage recovers uncertain keys across reload without storing email or consent text', async () => {
  const store = new Map<string, string>(); const storage = { getItem: (key: string) => store.get(key) ?? null, setItem: (key: string, value: string) => { store.set(key, value); } };
  const first = await retryKey('test', ['fictional@example.invalid', false], storage);
  assert.equal(await retryKey('test', ['fictional@example.invalid', false], storage), first);
  assert.notEqual(await retryKey('test', ['fictional@example.invalid', true], storage), first);
  assert.ok(![...store.values()].join().includes('fictional'));
  assert.equal(workerEnvironmentReady({ SIGNUPS_WORKER_URL: 'https://worker.example.invalid/', SIGNUPS_SERVICE_TOKEN: 'a'.repeat(32) }), true);
  for (const url of ['http://worker.example.invalid', 'https://user:private@worker.example.invalid', 'https://worker.example.invalid/?email=private']) assert.equal(workerEnvironmentReady({ SIGNUPS_WORKER_URL: url, SIGNUPS_SERVICE_TOKEN: 'a'.repeat(32) }), false);
  assert.throws(() => parseNewsletter({ ...newsletter(), placement: 'private@example.invalid' }));
});

async function vercel(body: unknown) {
  let status = 0; let data: any; const headers = new Map<string, string>();
  const response = { setHeader: (key: string, value: string) => headers.set(key, value), status(value: number) { status = value; return response; }, json(value: unknown) { data = value; return response; } };
  await newsletterHandler({ method: 'POST', headers: { origin: 'https://hecsanchez.com', 'content-type': 'application/json', 'sec-fetch-site': 'same-origin' }, body } as VercelRequest, response as unknown as VercelResponse);
  return { status, data, headers };
}
test('Vercel keeps Buttondown default; future Resend selection records in D1 without calling Buttondown', async t => {
  const { env, db } = fixture(); const originalFetch = globalThis.fetch;
  const previous = { ...process.env };
  t.after(() => { globalThis.fetch = originalFetch; for (const key of ['BUTTONDOWN_API_KEY', 'SIGNUPS_WORKER_URL', 'SIGNUPS_SERVICE_TOKEN', 'SIGNUPS_NEWSLETTER_PROVIDER']) {
    if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key];
  } });
  process.env.BUTTONDOWN_API_KEY = 'test-only'; process.env.SIGNUPS_WORKER_URL = 'https://worker.example.invalid/'; process.env.SIGNUPS_SERVICE_TOKEN = env.SIGNUPS_SERVICE_TOKEN;
  delete process.env.SIGNUPS_NEWSLETTER_PROVIDER;
  let sends = 0;
  globalThis.fetch = async (url, init) => {
    if (String(url).startsWith('https://api.buttondown.com/')) {
      sends++;
      return Response.json({ type: 'unactivated' });
    }
    return handle(new Request(url, init), env);
  };
  assert.equal((await vercel({ email: 'fictional@example.invalid' })).status, 200);
  assert.equal(db.count('signup_requests'), 0); assert.equal(sends, 1);
  process.env.SIGNUPS_NEWSLETTER_PROVIDER = 'resend'; const input = newsletter();
  assert.deepEqual((await vercel(input)).data, { ok: true, recorded: true });
  assert.deepEqual((await vercel(input)).data, { ok: true, recorded: true });
  assert.equal(sends, 1); assert.equal(db.count('signup_requests'), 1);
  env.SIGNUPS_ENABLED = 'false';
  assert.equal((await vercel(newsletter())).status, 503); assert.equal(sends, 1);
});