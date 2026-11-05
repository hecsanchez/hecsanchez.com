export const KIT_DOWNLOAD_URL = 'https://recursos.hecsanchez.com/kit-contexto/v1.1/kit-contexto-v1.1.zip';
export const KIT_ID = 'kit-contexto';
export const KIT_VERSION = 'v1.1';
export const NEWSLETTER_CONSENT_VERSION = 'shipping-notes-request-v1';
export const placements = ['home', 'writing_index', 'writing_post'] as const;
export interface NewsletterInput {
  email: string;
  idempotencyKey: string;
  locale: 'es' | 'en';
  placement: typeof placements[number];
}
export function parseNewsletter(body: unknown): NewsletterInput {
  const data = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  const email = typeof data.email === 'string' ? data.email.trim() : '';
  if (email.length > 254 || !/^[^\s@<>\x00-\x1f\x7f]+@[^\s@<>\x00-\x1f\x7f]+\.[^\s@<>\x00-\x1f\x7f]+$/.test(email) ||
      typeof data.idempotencyKey !== 'string' || !/^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i.test(data.idempotencyKey) ||
      !['es', 'en'].includes(String(data.locale)) || !placements.includes(data.placement as NewsletterInput['placement'])) throw new Error('invalid');
  return { email, idempotencyKey: data.idempotencyKey, locale: data.locale as 'es' | 'en', placement: data.placement as NewsletterInput['placement'] };
}