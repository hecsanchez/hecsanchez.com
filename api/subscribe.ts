import type { VercelRequest, VercelResponse } from '@vercel/node';
import { assertOrigin, BoundaryError, parseBody } from '../src/features/ai/server.ts';
import { parseNewsletter } from '../src/features/signups/contracts.ts';
import { recordNewsletter } from '../src/features/signups/worker-client.ts';
import { subscribeButtondown } from '../src/features/signups/buttondown.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  let email: unknown;
  let body: unknown;
  try {
    assertOrigin(req.headers.origin, req.headers['sec-fetch-site']);
    if (req.headers['content-type']?.split(';')[0].trim() !== 'application/json') throw new BoundaryError(415, 'content_type');
    body = parseBody(req.body);
    ({ email } = body as { email?: unknown });
  } catch (error) {
    return res.status(error instanceof BoundaryError ? error.status : 400).json({ ok: false, error: 'Invalid request' });
  }

  if (typeof email !== 'string' || email.trim().length > 254 || !/^[^\s@<>\x00-\x1f\x7f]+@[^\s@<>\x00-\x1f\x7f]+\.[^\s@<>\x00-\x1f\x7f]+$/.test(email.trim())) {
    return res.status(400).json({ ok: false, error: 'Invalid email address' });
  }

  const resend = process.env.SIGNUPS_NEWSLETTER_PROVIDER === 'resend';
  if (!resend && !process.env.BUTTONDOWN_API_KEY) {
    return res.status(500).json({ ok: false, error: 'Server misconfigured' });
  }

  try {
    // Future switch only. The production website is not being deployed, so its
    // historical Buttondown provider remains active with no subscriber migration.
    if (resend) {
      await recordNewsletter(parseNewsletter(body));
      return res.status(202).json({ ok: true, recorded: true });
    }
    const result = await subscribeButtondown(email.trim());
    if (result.ok) return res.status(200).json({ ok: true, confirm: result.confirm });
    return res.status(400).json({ ok: false, error: 'Subscription failed' });
  } catch {
    return res.status(503).json({ ok: false, error: 'Subscription unavailable' });
  }
}
