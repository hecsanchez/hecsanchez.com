import type { VercelRequest, VercelResponse } from '@vercel/node';
import { aiConfig } from '../src/features/ai/config.ts';
import { resourceProvider } from '../src/features/ai/provider.ts';
import { assertOrigin, BoundaryError, parseBody, parseRequest, requireLiveResource } from '../src/features/ai/server.ts';
import { WorkerError } from '../src/features/signups/worker-client.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false }); }
  try {
    requireLiveResource(aiConfig, resourceProvider);
    assertOrigin(req.headers.origin, req.headers['sec-fetch-site']);
    if (req.headers['content-type']?.split(';')[0].trim() !== 'application/json') throw new BoundaryError(415, 'content_type');
    const result = await resourceProvider.accept(parseRequest(parseBody(req.body), aiConfig));
    // Provider tokens never enter public URLs, analytics or response bodies.
    if (!/^[A-Za-z0-9_-]{32,256}$/.test(result.contextToken)) throw new Error('Invalid context');
    res.setHeader('Set-Cookie', `ai_resource_context=${result.contextToken}; Path=/api/; HttpOnly; Secure; SameSite=Strict; Max-Age=1800`);
    return res.status(200).json({ ok: true, next: '/es/ia/gracias/', asset: result.receipt.asset, delivery: result.receipt.delivery });
  } catch (error) {
    return res.status(error instanceof BoundaryError || error instanceof WorkerError ? error.status : 503).json({ ok: false, code: error instanceof BoundaryError || error instanceof WorkerError ? error.code : 'unavailable' });
  }
}