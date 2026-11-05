import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { aiConfig, type AiConfig, type ResourceAsset } from '../../../src/features/ai/config.ts';
import { BoundaryError, parseProfile, parseRequest } from '../../../src/features/ai/server.ts';
import { KIT_DOWNLOAD_URL, KIT_ID, KIT_VERSION, NEWSLETTER_CONSENT_VERSION, parseNewsletter } from '../../../src/features/signups/contracts.ts';
import type { Receipt } from '../../../src/features/ai/provider.ts';
import type { Database, Env, Execution } from './types.ts';
import { contactsReady, drainContacts, drainRights } from './contacts.ts';
import { kitAsset } from '../../../src/features/signups/kit.ts';

const origins = new Set(['https://hecsanchez.com', 'https://www.hecsanchez.com']);
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const asset: ResourceAsset = kitAsset;
const resourceConfig: AiConfig = { ...aiConfig, kit: { state: 'available', asset } };
const uuid = /^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i;
const tokenPattern = /^[A-Za-z0-9_-]{43}$/;
type Row = { id: string; fingerprint: string; purpose: string; resource_id: string | null; resource_version: string | null };
type Delivery = { request_id: string; email: string; attempts: number; retry_until: number; created_at: number };

function storageReady(env: Env): asserts env is Env & { DB: Database } {
  if (!env.DB) throw new BoundaryError(503, 'unavailable');
}
function ready(env: Env): asserts env is Env & { DB: Database; SIGNUPS_SERVICE_TOKEN: string } {
  if (env.SIGNUPS_ENABLED !== 'true' || env.PRIVACY_REVIEWED !== 'true' || !/^[a-zA-Z0-9._-]{1,80}$/.test(env.PRIVACY_VERSION ?? '') ||
      env.RETENTION_MODE !== 'until_deletion' || env.DATA_RIGHTS_VERIFIED !== 'true' ||
      !env.DB || !env.SIGNUPS_SERVICE_TOKEN || env.SIGNUPS_SERVICE_TOKEN.length < 32) throw new BoundaryError(503, 'unavailable');
}
function resourceReady(env: Env): void {
  if (env.RESOURCE_ENABLED !== 'true' || env.VERIFIED_SENDER !== 'true' || !env.RESEND_API_KEY ||
      !env.RESEND_FROM || !env.RESEND_REPLY_TO || /[\r\n]/.test(env.RESEND_FROM + env.RESEND_REPLY_TO)) throw new BoundaryError(503, 'unavailable');
}
function authenticate(request: Request, secret: string): void {
  const provided = request.headers.get('authorization') ?? '';
  const expected = `Bearer ${secret}`;
  // Hashes have equal length; comparisons do not expose the service credential.
  if (!timingSafeEqual(Buffer.from(hash(provided)), Buffer.from(hash(expected)))) throw new BoundaryError(403, 'origin');
}
async function body(request: Request): Promise<Record<string, unknown>> {
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') throw new BoundaryError(415, 'content_type');
  const reader = request.body?.getReader();
  if (!reader) throw new BoundaryError(400, 'invalid');
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const part = await reader.read();
    if (part.done) break;
    length += part.value.byteLength;
    if (length > 4096) { await reader.cancel(); throw new BoundaryError(413, 'too_large'); }
    chunks.push(part.value);
  }
  try {
    const value = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error();
    return value;
  } catch { throw new BoundaryError(400, 'invalid'); }
}
async function receipt(db: Database, id: string, env: Env): Promise<Receipt> {
  const row = await db.prepare('SELECT state FROM delivery_outbox WHERE request_id = ?').bind(id).first<{ state: string }>();
  return { requestId: id, asset, delivery: row?.state === 'sent' ? 'sent' : row?.state === 'failed' ? 'failed' : 'queued', profileAllowed: env.QUALIFICATION_ENABLED === 'true' };
}
async function context(db: Database, token: unknown, now: number): Promise<Row | null> {
  if (typeof token !== 'string' || !tokenPattern.test(token)) return null;
  return db.prepare(`SELECT r.id, r.fingerprint, r.purpose, r.resource_id, r.resource_version FROM resource_contexts c
    JOIN signup_requests r ON r.id = c.request_id WHERE c.token_hash = ? AND c.expires_at > ?
    AND c.action = 'resource_access_and_profile' AND r.purpose = 'kit_contexto'`).bind(hash(token), now).first<Row>();
}

async function accept(data: Record<string, unknown>, env: Env & { DB: Database; SIGNUPS_SERVICE_TOKEN: string }, kind: 'resource' | 'newsletter', now: number) {
  const db = env.DB;
  if (data.privacyVersion !== env.PRIVACY_VERSION) throw new BoundaryError(409, 'privacy_version');
  let email: string, key: string, fingerprint: string, source: string, placement: string, locale: 'es' | 'en', consent: boolean, consentVersion: string, attribution: unknown;
  if (kind === 'resource') {
    resourceReady(env);
    const command = parseRequest(data, resourceConfig);
    if (!uuid.test(command.idempotencyKey)) throw new BoundaryError(400, 'invalid');
    ({ email, idempotencyKey: key, sourcePage: source, marketingConsent: consent, consentVersion, attribution } = command);
    placement = 'kit_form'; locale = 'es'; fingerprint = hash(JSON.stringify(['kit_contexto', email, KIT_ID, KIT_VERSION, consent, consentVersion]));
  } else {
    if (env.NEWSLETTER_CAPTURE_ENABLED !== 'true' || !contactsReady(env)) throw new BoundaryError(503, 'unavailable');
    let command;
    try { command = parseNewsletter(data); } catch { throw new BoundaryError(400, 'invalid'); }
    ({ email, idempotencyKey: key, locale, placement } = command);
    source = placement === 'home' ? `/${locale}/` : locale === 'es' ? '/es/escritos/' : '/en/writing/';
    consent = true; consentVersion = NEWSLETTER_CONSENT_VERSION; attribution = { first: null, latest: null };
    fingerprint = hash(JSON.stringify(['shipping_notes', email, locale, placement, consentVersion]));
  }
  if (await db.prepare('SELECT id FROM rights_jobs WHERE lower(email) = lower(?)').bind(email).first()) throw new BoundaryError(409, 'unavailable');
  const existing = await db.prepare('SELECT id, fingerprint, purpose, resource_id, resource_version FROM signup_requests WHERE idempotency_key = ?').bind(key).first<Row>();
  if (existing && existing.fingerprint !== fingerprint) throw new BoundaryError(409, 'idempotency_conflict');
  const id = existing?.id ?? crypto.randomUUID();
  const contextToken = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64url');
  const statements = [];
  if (!existing) {
    // Transactional counters also bound intentional repeats and total accepted writes.
    const emailBucket = createHmac('sha256', env.SIGNUPS_SERVICE_TOKEN).update(email.toLowerCase()).digest('hex');
    for (const bucket of [`global:${Math.floor(now / 60000)}`, `email:${emailBucket}:${Math.floor(now / 3600000)}`]) {
      // Email bucket adds 20, allowing five new requests per hour. No raw email/IP.
      const increment = bucket.startsWith('email:') ? 20 : 1;
      statements.push(db.prepare(`INSERT INTO rate_buckets(bucket, count, expires_at) VALUES (?, ?, ?)
        ON CONFLICT(bucket) DO UPDATE SET count = count + excluded.count`).bind(bucket, increment, now + 7200000));
    }
    statements.push(db.prepare(`INSERT INTO signup_requests(id, idempotency_key, fingerprint, email, purpose, resource_id, resource_version,
      source_page, placement, locale, consent, consent_version, consent_status, privacy_version, attribution, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(idempotency_key) DO NOTHING`).bind(
      id, key, fingerprint, email, kind === 'resource' ? 'kit_contexto' : 'shipping_notes', kind === 'resource' ? KIT_ID : null,
      kind === 'resource' ? KIT_VERSION : null, source, placement, locale, Number(consent), consentVersion, consent ? 'requested' : 'not_requested', env.PRIVACY_VERSION, JSON.stringify(attribution), now));
  }
  if (kind === 'resource') {
    statements.push(db.prepare(`INSERT INTO delivery_outbox(request_id, state, next_attempt_at, retry_until)
      SELECT id, 'queued', ?, ? FROM signup_requests WHERE idempotency_key = ? AND fingerprint = ?
      ON CONFLICT(request_id) DO NOTHING`).bind(now, now + 23 * 3600000, key, fingerprint));
    statements.push(db.prepare(`INSERT INTO resource_contexts(token_hash, request_id, action, expires_at)
      SELECT ?, id, 'resource_access_and_profile', ? FROM signup_requests WHERE idempotency_key = ? AND fingerprint = ?
      ON CONFLICT(request_id) DO UPDATE SET token_hash = excluded.token_hash, expires_at = excluded.expires_at`).bind(hash(contextToken), now + 1800000, key, fingerprint));
  } else {
    statements.push(db.prepare(`INSERT INTO contact_outbox(request_id, state, next_attempt_at)
      SELECT id, 'queued', ? FROM signup_requests WHERE idempotency_key = ? AND fingerprint = ?
      ON CONFLICT(request_id) DO NOTHING`).bind(now, key, fingerprint));
  }
  statements.push(db.prepare(`INSERT INTO operational_events(request_id, event, created_at)
    SELECT id, ?, ? FROM signup_requests WHERE idempotency_key = ? AND fingerprint = ? ON CONFLICT DO NOTHING`).bind(
    kind === 'resource' ? 'kit_request_accepted' : 'newsletter_request_recorded', now, key, fingerprint));
  try { await db.batch(statements); } catch (error) {
    // Do not include SQL, recipient, provider body or exception text in the response/logs.
    if (String(error).includes('CHECK constraint failed')) throw new BoundaryError(429, 'rate_limited');
    throw new BoundaryError(503, 'unavailable');
  }
  const owned = await db.prepare('SELECT id, fingerprint FROM signup_requests WHERE idempotency_key = ?').bind(key).first<Row>();
  if (!owned || owned.fingerprint !== fingerprint) throw new BoundaryError(409, 'idempotency_conflict');
  return kind === 'resource' ? { receipt: await receipt(db, owned.id, env), contextToken } : { recorded: true };
}

export async function drainOutbox(env: Env, now = Date.now(), send: typeof fetch = fetch): Promise<void> {
  const startedAt = Date.now();
  ready(env); resourceReady(env);
  const db = env.DB;
  await db.prepare(`UPDATE delivery_outbox SET state = 'failed' WHERE state IN ('queued', 'sending') AND retry_until <= ?`).bind(now).run();
  const due = await db.prepare(`SELECT o.request_id, r.email, o.attempts, o.retry_until, r.created_at FROM delivery_outbox o
    JOIN signup_requests r ON r.id = o.request_id WHERE o.state IN ('queued', 'sending', 'failed')
    AND o.next_attempt_at <= ? AND o.lease_until <= ? AND o.retry_until > ? AND o.attempts < 6 LIMIT 20`).bind(now, now, now).all<Delivery>();
  for (const row of due.results) {
    const attemptNow = now + Date.now() - startedAt;
    const lease = attemptNow + 60000;
    // Atomic claim prevents concurrent cron/request workers from duplicating a send.
    const claim = await db.prepare(`UPDATE delivery_outbox SET state = 'sending', attempts = attempts + 1, lease_until = ?
      WHERE request_id = ? AND state != 'sent' AND attempts = ? AND lease_until <= ? AND retry_until > ?
      RETURNING request_id`).bind(lease, row.request_id, row.attempts, attemptNow, attemptNow).first<{ request_id: string }>();
    if (!claim) continue;
    let sent = false;
    try {
      const response = await send('https://api.resend.com/emails', {
        method: 'POST', signal: AbortSignal.timeout(8000),
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `kit:${row.request_id}` },
        body: JSON.stringify({ from: env.RESEND_FROM, reply_to: env.RESEND_REPLY_TO, to: [row.email], subject: 'Tu Kit Contexto',
          text: `Aquí tienes el Kit Contexto que solicitaste.\n\nAcceder al kit: ${KIT_DOWNLOAD_URL}\n\nEste correo entrega el recurso solicitado. Tu elección sobre ejemplos de IA se registra por separado.` }),
      });
      sent = response.ok;
      // A 2xx confirms API acceptance, not mailbox delivery. No response/recipient logs.
      await response.body?.cancel();
    } catch { /* The durable outbox retains retry ownership after timeouts. */ }
    await db.prepare(`UPDATE delivery_outbox SET state = ?, sent_at = ?, lease_until = 0, next_attempt_at = ? WHERE request_id = ? AND lease_until = ?`).bind(
      sent ? 'sent' : 'failed', sent ? attemptNow : null, attemptNow + Math.min(3600000, 60000 * 2 ** row.attempts), row.request_id, lease).run();
  }
}

export async function cleanup(env: Env, now = Date.now()): Promise<void> {
  storageReady(env);
  await env.DB.batch([
    env.DB.prepare('DELETE FROM resource_contexts WHERE expires_at <= ?').bind(now),
    env.DB.prepare('DELETE FROM rate_buckets WHERE expires_at <= ?').bind(now),
    env.DB.prepare('DELETE FROM contact_locks WHERE lease_until <= ?').bind(now),
  ]);
}

export async function handle(request: Request, env: Env, execution?: Execution): Promise<Response> {
  const origin = request.headers.get('origin');
  const allowed = origin !== null && origins.has(origin);
  const headers = new Headers({ 'Cache-Control': 'private, no-store', 'Content-Type': 'application/json', 'Vary': 'Origin', 'X-Content-Type-Options': 'nosniff' });
  if (allowed) headers.set('Access-Control-Allow-Origin', origin);
  const respond = (status: number, value: unknown) => new Response(JSON.stringify(value), { status, headers });
  try {
    if (!allowed || new URL(request.url).search) throw new BoundaryError(403, 'origin');
    const fetchSite = request.headers.get('sec-fetch-site');
    if (fetchSite && fetchSite !== 'same-origin') throw new BoundaryError(403, 'origin');
    if (request.method === 'OPTIONS') {
      headers.set('Access-Control-Allow-Methods', 'POST');
      headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return new Response(null, { status: 204, headers });
    }
    if (request.method !== 'POST') { headers.set('Allow', 'POST'); return respond(405, { ok: false }); }
    storageReady(env);
    const path = new URL(request.url).pathname;
    if (path.startsWith('/v1/admin/')) {
      if (!env.SIGNUPS_ADMIN_TOKEN || env.SIGNUPS_ADMIN_TOKEN.length < 32 || env.SIGNUPS_ADMIN_TOKEN === env.SIGNUPS_SERVICE_TOKEN) throw new BoundaryError(503, 'unavailable');
      authenticate(request, env.SIGNUPS_ADMIN_TOKEN);
    } else { ready(env); authenticate(request, env.SIGNUPS_SERVICE_TOKEN); }
    const data = await body(request);
    if (path === '/v1/resource' || path === '/v1/newsletter') {
      ready(env);
      const result = await accept(data, env, path === '/v1/resource' ? 'resource' : 'newsletter', Date.now());
      if (path === '/v1/resource' && execution) execution.waitUntil(drainOutbox(env).catch(() => {}));
      if (path === '/v1/newsletter' && execution) execution.waitUntil(drainContacts(env.DB, env).catch(() => {}));
      return respond(200, { ok: true, ...result });
    }
    if (path === '/v1/context' || path === '/v1/profile') {
      resourceReady(env);
      const row = await context(env.DB, data.contextToken, Date.now());
      if (!row || row.resource_id !== KIT_ID || row.resource_version !== KIT_VERSION) throw new BoundaryError(401, 'expired');
      if (path === '/v1/context') return respond(200, { ok: true, receipt: await receipt(env.DB, row.id, env) });
      if (env.QUALIFICATION_ENABLED !== 'true') throw new BoundaryError(404, 'unavailable');
      const profile = parseProfile(data.profile);
      await env.DB.batch([
        env.DB.prepare(`INSERT INTO qualification(request_id, role, task, frequency, saved_at) VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(request_id) DO UPDATE SET role = excluded.role, task = excluded.task, frequency = excluded.frequency, saved_at = excluded.saved_at`).bind(row.id, profile.role, profile.task, profile.frequency ?? null, Date.now()),
        env.DB.prepare(`INSERT INTO operational_events(request_id, event, created_at) VALUES (?, 'lead_profile_saved', ?) ON CONFLICT DO NOTHING`).bind(row.id, Date.now()),
      ]);
      return respond(200, { ok: true });
    }
    // Owner-operated, authenticated rights workflow after verifying the requester.
    // An ordinary site service credential cannot withdraw consent or erase data.
    if (path === '/v1/admin/erase' || path === '/v1/admin/withdraw') {
      let input;
      try { input = parseNewsletter({ ...data, idempotencyKey: crypto.randomUUID(), locale: 'es', placement: 'home' }); }
      catch { throw new BoundaryError(400, 'invalid'); }
      const erase = path.endsWith('/erase');
      if (!erase && !['kit_contexto', 'shipping_notes'].includes(String(data.purpose))) throw new BoundaryError(400, 'invalid');
      const contact = await env.DB.prepare('SELECT contact_id FROM provider_contacts WHERE lower(email) = lower(?)').bind(input.email).first<{ contact_id: string }>();
      const jobs = [env.DB.prepare(`INSERT INTO rights_jobs(id, email, action, purpose, contact_id, next_attempt_at) VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(email) DO UPDATE SET action = CASE WHEN excluded.action = 'erase' THEN 'erase' ELSE rights_jobs.action END,
        purpose = CASE WHEN excluded.action = 'erase' OR rights_jobs.action = 'erase' THEN NULL
          WHEN excluded.purpose = 'shipping_notes' OR rights_jobs.purpose = 'shipping_notes' THEN 'shipping_notes' ELSE 'kit_contexto' END,
        contact_id = COALESCE(rights_jobs.contact_id, excluded.contact_id),
        next_attempt_at = MAX(rights_jobs.next_attempt_at, excluded.next_attempt_at)`).bind(
        crypto.randomUUID(), input.email.toLowerCase(), erase ? 'erase' : 'withdraw', erase ? null : data.purpose, contact?.contact_id ?? null, Date.now() + 120000)];
      if (erase) {
        jobs.push(env.DB.prepare('DELETE FROM signup_requests WHERE lower(email) = lower(?)').bind(input.email));
        jobs.push(env.DB.prepare('DELETE FROM provider_contacts WHERE lower(email) = lower(?)').bind(input.email));
      } else {
        jobs.push(env.DB.prepare("UPDATE signup_requests SET consent_status = 'withdrawn' WHERE lower(email) = lower(?) AND purpose = ?").bind(input.email, data.purpose));
        jobs.push(env.DB.prepare(`DELETE FROM contact_outbox WHERE request_id IN (SELECT id FROM signup_requests WHERE lower(email) = lower(?) AND consent_status = 'withdrawn')`).bind(input.email));
      }
      await env.DB.batch(jobs);
      return respond(202, { ok: true, providerCleanup: 'pending' });
    }
    return respond(404, { ok: false, code: 'unavailable' });
  } catch (error) {
    return respond(error instanceof BoundaryError ? error.status : 503, { ok: false, code: error instanceof BoundaryError ? error.code : 'unavailable' });
  }
}

export default {
  fetch: handle,
  async scheduled(_controller: unknown, env: Env, execution: Execution) {
    storageReady(env);
    // Rights jobs remain operable when capture/delivery is deliberately disabled.
    // A provider failure must not starve erasure or expired-context cleanup.
    execution.waitUntil(Promise.allSettled([
      cleanup(env), drainRights(env.DB, env),
      ...(env.SIGNUPS_ENABLED === 'true' && env.RESOURCE_ENABLED === 'true' ? [drainOutbox(env)] : []),
      ...(env.SIGNUPS_ENABLED === 'true' && env.NEWSLETTER_CAPTURE_ENABLED === 'true' ? [drainContacts(env.DB, env)] : []),
    ]));
  },
};