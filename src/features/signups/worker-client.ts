import { KIT_DOWNLOAD_URL, KIT_ID, KIT_VERSION, type NewsletterInput } from './contracts.ts';
import type { Receipt, ResourceCommand, ResourceProvider } from '../ai/provider.ts';
import { SIGNUPS_PRIVACY_VERSION } from './environment.ts';

export function workerEnvironmentReady(env: NodeJS.ProcessEnv = process.env): boolean {
  try {
    const url = new URL(env.SIGNUPS_WORKER_URL ?? '');
    return url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash && url.pathname === '/' &&
      (env.SIGNUPS_SERVICE_TOKEN?.length ?? 0) >= 32;
  } catch { return false; }
}
export class WorkerError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string) { super(code); this.status = status; this.code = code; }
}
export async function workerCall(path: string, body: unknown, send: typeof fetch = fetch): Promise<Record<string, unknown>> {
  if (!workerEnvironmentReady()) throw new WorkerError(503, 'unavailable');
  const response = await send(new URL(path, process.env.SIGNUPS_WORKER_URL), {
    method: 'POST', signal: AbortSignal.timeout(10000),
    headers: { 'Content-Type': 'application/json', Origin: 'https://hecsanchez.com', Authorization: `Bearer ${process.env.SIGNUPS_SERVICE_TOKEN}` },
    body: JSON.stringify({ ...(body as Record<string, unknown>), privacyVersion: SIGNUPS_PRIVACY_VERSION }),
  });
  const result = await response.json() as Record<string, unknown>;
  if (!response.ok || result.ok !== true) {
    const codes = ['expired', 'idempotency_conflict', 'rate_limited', 'email', 'invalid'];
    throw new WorkerError([400, 401, 409, 429].includes(response.status) ? response.status : 503,
      typeof result.code === 'string' && codes.includes(result.code) ? result.code : 'unavailable');
  }
  return result;
}
function verifiedReceipt(value: unknown): Receipt {
  const receipt = value as Receipt | undefined;
  if (!receipt || typeof receipt.requestId !== 'string' || receipt.asset?.url !== KIT_DOWNLOAD_URL ||
      receipt.asset.id !== KIT_ID || receipt.asset.version !== KIT_VERSION || receipt.asset.kind !== 'download' ||
      !['queued', 'sent', 'failed'].includes(receipt.delivery) || typeof receipt.profileAllowed !== 'boolean') throw new WorkerError(503, 'unavailable');
  return receipt;
}
export const cloudflareResourceProvider: ResourceProvider = {
  async accept(command: ResourceCommand) {
    const result = await workerCall('/v1/resource', { email: command.email, marketingConsent: command.marketingConsent,
      idempotencyKey: command.idempotencyKey, attribution: command.attribution });
    if (typeof result.contextToken !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(result.contextToken)) throw new WorkerError(503, 'unavailable');
    return { receipt: verifiedReceipt(result.receipt), contextToken: result.contextToken };
  },
  async readContext(contextToken) {
    try { return verifiedReceipt((await workerCall('/v1/context', { contextToken })).receipt); }
    catch (error) { if (error instanceof WorkerError && error.status === 401) return null; throw error; }
  },
  async saveProfile(contextToken, profile) {
    try { await workerCall('/v1/profile', { contextToken, profile }); return 'saved'; }
    catch (error) { if (error instanceof WorkerError && error.status === 401) return 'expired'; throw error; }
  },
};

// Future newsletter acceptance uses D1 + Resend Contacts. This never imports or
// migrates existing Buttondown subscribers and never claims mailbox confirmation.
export async function recordNewsletter(input: NewsletterInput): Promise<void> {
  const result = await workerCall('/v1/newsletter', input);
  if (result.recorded !== true) throw new WorkerError(503, 'unavailable');
}