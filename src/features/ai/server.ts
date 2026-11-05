import { createHash } from 'node:crypto';
import { boundedCampaign } from './campaign.ts';
import type { AiConfig } from './config.ts';
import type { Profile, ResourceCommand, ResourceProvider } from './provider.ts';

export class BoundaryError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string) { super(code); this.status = status; this.code = code; }
}

export function requireLiveResource(config: AiConfig, provider: ResourceProvider | null): asserts provider is ResourceProvider {
  if (config.journey !== 'published' || config.kit.state !== 'available') throw new BoundaryError(404, 'unavailable');
  if (!provider || !config.privacyHref || !config.deliveryIntegration?.tested || !config.deliveryIntegration.verifiedSender) {
    throw new BoundaryError(503, 'unavailable');
  }
}

export function parseRequest(body: unknown, config: AiConfig): ResourceCommand {
  if (!body || typeof body !== 'object' || config.kit.state !== 'available') throw new BoundaryError(400, 'invalid');
  const data = body as Record<string, unknown>;
  const email = typeof data.email === 'string' ? data.email.trim() : '';
  if (email.length > 254 || !/^[^\s@<>\x00-\x1f\x7f]+@[^\s@<>\x00-\x1f\x7f]+\.[^\s@<>\x00-\x1f\x7f]+$/.test(email)) throw new BoundaryError(400, 'email');
  if (typeof data.marketingConsent !== 'boolean' ||
      typeof data.idempotencyKey !== 'string' || !/^[a-f\d-]{36}$/i.test(data.idempotencyKey)) {
    throw new BoundaryError(400, 'invalid');
  }
  // Conservative email handling: trim only; provider owns supported normalization.
  // Source, version and destinations are never trusted from the browser.
  const campaign = (value: unknown) => boundedCampaign(value && typeof value === 'object' ? value as Record<string, unknown> : {});
  const attribution = data.attribution as Record<string, unknown> | undefined;
  const fingerprint = createHash('sha256').update(JSON.stringify([
    email, config.kit.asset.id, config.kit.asset.version, data.marketingConsent,
  ])).digest('hex');
  return {
    email, resourceId: config.kit.asset.id, resourceVersion: config.kit.asset.version,
    marketingConsent: data.marketingConsent, consentVersion: 'ai-examples-v1', sourcePage: '/es/ia/',
    attribution: { first: campaign(attribution?.first), latest: campaign(attribution?.latest) },
    idempotencyKey: data.idempotencyKey, fingerprint,
  };
}

export function parseProfile(body: unknown): Profile {
  const data = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  if (!['owner', 'operations', 'employee', 'consultant', 'developer', 'other'].includes(String(data.role)) ||
      typeof data.task !== 'string' || !data.task.trim() || data.task.length > 500 ||
      (data.frequency !== undefined && !['daily', 'several_weekly', 'weekly', 'less', 'unknown'].includes(String(data.frequency)))) {
    throw new BoundaryError(400, 'profile');
  }
  return { role: data.role as Profile['role'], task: data.task.trim(), ...(data.frequency ? { frequency: data.frequency as Profile['frequency'] } : {}) };
}

export function parseBody(body: unknown): unknown {
  if (typeof body === 'string') {
    if (Buffer.byteLength(body) > 4096) throw new BoundaryError(413, 'too_large');
    try { return JSON.parse(body); } catch { throw new BoundaryError(400, 'invalid'); }
  }
  if (Buffer.byteLength(JSON.stringify(body ?? {})) > 4096) throw new BoundaryError(413, 'too_large');
  return body;
}

export function assertOrigin(origin: unknown, fetchSite: unknown): void {
  if (origin !== 'https://hecsanchez.com' && origin !== 'https://www.hecsanchez.com') throw new BoundaryError(403, 'origin');
  if (fetchSite && fetchSite !== 'same-origin') throw new BoundaryError(403, 'origin');
}