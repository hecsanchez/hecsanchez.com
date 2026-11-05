import type { VercelRequest, VercelResponse } from '@vercel/node';
import { assertOrigin, BoundaryError, parseBody } from '../src/features/ai/server.ts';
import { parseNewsletter } from '../src/features/signups/contracts.ts';
import { recordNewsletter } from '../src/features/signups/worker-client.ts';
import { siteEnvironmentReady } from '../src/features/signups/environment.ts';

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

  if (!siteEnvironmentReady(process.env)) {
    return res.status(503).json({ ok: false, error: 'Subscription unavailable' });
  }

  try {
    await recordNewsletter(parseNewsletter(body));
    return res.status(202).json({ ok: true, recorded: true });
  } catch {
    return res.status(503).json({ ok: false, error: 'Subscription unavailable' });
  }
}
