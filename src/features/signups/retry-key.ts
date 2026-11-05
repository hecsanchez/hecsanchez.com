/** Keep only a random key and digest in this tab, never the email or consent.
 * An uncertain submission can be retried after reload without a second request.
 * A deliberate new request after success receives a new key.
 */
const memory = new Map<string, { digest: string; key: string }>();
export async function retryKey(scope: string, values: unknown, storage?: Pick<Storage, 'getItem' | 'setItem'> | null): Promise<string> {
  let target = storage;
  if (target === undefined) { try { target = sessionStorage; } catch { target = null; } }
  const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(values)))))
    .map(value => value.toString(16).padStart(2, '0')).join('');
  const slot = `signup-retry:${scope}`;
  const previous = memory.get(slot);
  if (previous?.digest === digest) return previous.key;
  try {
    const old = JSON.parse(target?.getItem(slot) ?? 'null');
    if (old?.digest === digest && typeof old.key === 'string' && /^[a-f\d-]{36}$/i.test(old.key)) { memory.set(slot, old); return old.key; }
  } catch { /* Unavailable storage does not block an explicitly submitted form. */ }
  const key = crypto.randomUUID();
  memory.set(slot, { digest, key });
  try { target?.setItem(slot, JSON.stringify({ digest, key })); } catch { /* In-memory form state still retains this key. */ }
  return key;
}
export function clearRetryKey(scope: string): void {
  memory.delete(`signup-retry:${scope}`);
  try { sessionStorage.removeItem(`signup-retry:${scope}`); } catch { /* No persistent identity is stored. */ }
}