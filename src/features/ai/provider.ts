import type { Attribution } from './campaign.ts';
import type { ResourceAsset } from './config.ts';
import { aiConfig } from './config.ts';
import { cloudflareResourceProvider } from '../signups/worker-client.ts';

export type DeliveryState = 'queued' | 'sent' | 'confirmed' | 'failed';
export interface ResourceCommand {
  email: string;
  resourceId: string;
  resourceVersion: string;
  marketingConsent: boolean;
  consentVersion: 'ai-examples-v1';
  sourcePage: '/es/ia/';
  attribution: Attribution;
  idempotencyKey: string;
  fingerprint: string;
}
export interface Receipt {
  requestId: string;
  delivery: DeliveryState;
  asset: ResourceAsset;
  profileAllowed: boolean;
}
export interface Profile {
  role: 'owner' | 'operations' | 'employee' | 'consultant' | 'developer' | 'other';
  task: string;
  frequency?: 'daily' | 'several_weekly' | 'weekly' | 'less' | 'unknown';
}
/**
 * Durable request boundary; this service is not a CRM.
 * accept must atomically own the request durably BEFORE returning, bind each key
 * to its fingerprint, deduplicate side effects, rate limit deliberate repeats,
 * preserve subscriptions/opt-outs. AI consent is recorded separately and never
 * triggers enrollment. Shipping Notes is a distinct explicit signup purpose.
 * Return failed delivery after persistence without revoking independent access.
 * Tokens must be random, action-scoped, expiring and validated privately.
 * saveProfile attaches write-only answers to that request, never contact identity.
 * Operational accepted/profile events belong in the provider's deduplicated log.
 */
export interface ResourceProvider {
  accept(command: ResourceCommand): Promise<{ receipt: Receipt; contextToken: string }>;
  readContext(token: string): Promise<Receipt | null>;
  saveProfile(token: string, profile: Profile): Promise<'saved' | 'expired'>;
}

// Source configuration still requires verified sender/testing and publication.
// This registration alone never enables the journey or supplies credentials.
export const resourceProvider: ResourceProvider | null = aiConfig.deliveryIntegration?.id === 'cloudflare-d1-resend-v1'
  ? cloudflareResourceProvider : null;