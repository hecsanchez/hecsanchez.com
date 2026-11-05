import type { Database, Env } from './types.ts';

const idPattern = /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i;
interface Contact { id: string; email: string; unsubscribed: boolean }
export function contactsReady(env: Env): boolean {
  return env.RESEND_CONTACTS_VERIFIED === 'true' && Boolean(env.RESEND_API_KEY) &&
    idPattern.test(env.RESEND_NEWSLETTER_SEGMENT_ID ?? '') && idPattern.test(env.RESEND_NEWSLETTER_TOPIC_ID ?? '');
}
async function api(env: Env, path: string, method: string, payload: unknown, send: typeof fetch) {
  const response = await send(`https://api.resend.com${path}`, { method, signal: AbortSignal.timeout(8000),
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    ...(payload === undefined ? {} : { body: JSON.stringify(payload) }),
  });
  if (response.status === 404) { await response.body?.cancel(); return null; }
  if (!response.ok) { await response.body?.cancel(); throw new Error('provider_unavailable'); }
  return response.json() as Promise<Record<string, unknown>>;
}
// No email goes into a provider URL. Exhaust a bounded, paginated global list
// before creating; an incomplete scan fails closed instead of assuming absence.
async function lookup(env: Env, email: string, send: typeof fetch): Promise<Contact | null> {
  let after = '';
  for (let page = 0; page < 10; page++) {
    const result = await api(env, `/contacts?limit=100${after ? `&after=${after}` : ''}`, 'GET', undefined, send);
    if (!result || !Array.isArray(result.data) || typeof result.has_more !== 'boolean') throw new Error('provider_unavailable');
    const contacts = result.data as Contact[];
    const found = contacts.find(contact => typeof contact.email === 'string' && contact.email.toLowerCase() === email.toLowerCase());
    if (found) {
      if (!idPattern.test(found.id) || typeof found.unsubscribed !== 'boolean') throw new Error('provider_unavailable');
      return found;
    }
    if (!result.has_more) return null;
    after = contacts.at(-1)?.id ?? '';
    if (!idPattern.test(after)) throw new Error('provider_unavailable');
  }
  throw new Error('provider_lookup_limit');
}

export async function drainContacts(db: Database, env: Env, now = Date.now(), send: typeof fetch = fetch): Promise<void> {
  if (!contactsReady(env)) return;
  const due = await db.prepare(`SELECT o.request_id, o.attempts, r.email FROM contact_outbox o JOIN signup_requests r ON r.id = o.request_id
    WHERE o.state IN ('queued', 'sending', 'failed') AND o.next_attempt_at <= ? AND o.lease_until <= ? AND o.attempts < 6
    AND r.consent_status = 'requested' AND NOT EXISTS (SELECT 1 FROM rights_jobs j WHERE lower(j.email) = lower(r.email)) LIMIT 10`).bind(now, now).all<{ request_id: string; attempts: number; email: string }>();
  for (const row of due.results) {
    const claimed = await db.prepare(`UPDATE contact_outbox SET state = 'sending', attempts = attempts + 1, lease_until = ?
      WHERE request_id = ? AND attempts = ? AND lease_until <= ? AND state IN ('queued', 'sending', 'failed') RETURNING request_id`).bind(now + 120000, row.request_id, row.attempts, now).first();
    if (!claimed) continue;
    try {
      const cached = await db.prepare('SELECT contact_id, state FROM provider_contacts WHERE email = ?').bind(row.email).first<{ contact_id: string; state: string }>();
      let id = cached?.contact_id; let state = cached?.state ?? 'preserved';
      if (!id) {
        const existing = await lookup(env, row.email, send);
        if (existing) id = existing.id; // Preserve all existing opt-outs/topics/global state.
        else {
          const created = await api(env, '/contacts', 'POST', { email: row.email,
            segments: [{ id: env.RESEND_NEWSLETTER_SEGMENT_ID }],
            topics: [{ id: env.RESEND_NEWSLETTER_TOPIC_ID, subscription: 'opt_in' }],
          }, send);
          if (!created || typeof created.id !== 'string' || !idPattern.test(created.id)) throw new Error('provider_unavailable');
          id = created.id; state = 'synced';
        }
      }
      await db.batch([
        db.prepare('INSERT INTO provider_contacts(email, contact_id, state) VALUES (?, ?, ?) ON CONFLICT(email) DO NOTHING').bind(row.email, id, state),
        db.prepare('UPDATE contact_outbox SET state = ?, lease_until = 0 WHERE request_id = ?').bind(state, row.request_id),
      ]);
    } catch {
      await db.prepare("UPDATE contact_outbox SET state = 'failed', lease_until = 0, next_attempt_at = ? WHERE request_id = ?").bind(now + Math.min(3600000, 60000 * 2 ** row.attempts), row.request_id).run();
    }
  }
}

export async function drainRights(db: Database, env: Env, now = Date.now(), send: typeof fetch = fetch): Promise<void> {
  if (!env.RESEND_API_KEY) return;
  const due = await db.prepare('SELECT * FROM rights_jobs WHERE next_attempt_at <= ? AND lease_until <= ? LIMIT 10').bind(now, now).all<{ id: string; email: string; action: string; purpose: string | null; contact_id: string | null; attempts: number }>();
  for (const row of due.results) {
    const claimed = await db.prepare('UPDATE rights_jobs SET lease_until = ?, attempts = attempts + 1 WHERE id = ? AND lease_until <= ? RETURNING id').bind(now + 120000, row.id, now).first();
    if (!claimed) continue;
    try {
      if (row.action === 'erase' || row.purpose === 'shipping_notes') {
        const id = row.contact_id ?? (await lookup(env, row.email, send))?.id;
        if (id) {
          if (!idPattern.test(id)) throw new Error('provider_unavailable');
          if (row.action === 'erase') {
            const removed = await api(env, `/contacts/${id}`, 'DELETE', undefined, send);
            if (removed && removed.deleted !== true) throw new Error('provider_unavailable');
          }
          else {
            if (!contactsReady(env)) throw new Error('provider_unavailable');
            await api(env, `/contacts/${id}/topics`, 'PATCH', [{ id: env.RESEND_NEWSLETTER_TOPIC_ID, subscription: 'opt_out' }], send);
          }
        }
      }
      await db.batch([
        db.prepare('DELETE FROM provider_contacts WHERE email = ?').bind(row.email),
        db.prepare('DELETE FROM rights_jobs WHERE id = ?').bind(row.id),
      ]);
    } catch {
      await db.prepare('UPDATE rights_jobs SET lease_until = 0, next_attempt_at = ? WHERE id = ?').bind(now + Math.min(3600000, 60000 * 2 ** Math.min(row.attempts, 6)), row.id).run();
    }
  }
}