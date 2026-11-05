import type { VercelRequest, VercelResponse } from '@vercel/node';
import { aiConfig } from '../src/features/ai/config.ts';
import { resourceProvider } from '../src/features/ai/provider.ts';
import { assertOrigin, BoundaryError, parseBody, parseProfile, requireLiveResource } from '../src/features/ai/server.ts';
import { WorkerError } from '../src/features/signups/worker-client.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false }); }
  try {
    requireLiveResource(aiConfig, resourceProvider);
    assertOrigin(req.headers.origin, req.headers['sec-fetch-site']);
    if (req.headers['content-type']?.split(';')[0].trim() !== 'application/json') throw new BoundaryError(415, 'content_type');
    const token = req.cookies.ai_resource_context;
    if (!token || !/^[A-Za-z0-9_-]{32,256}$/.test(token)) throw new BoundaryError(401, 'expired');
    const result = await resourceProvider.saveProfile(token, parseProfile(parseBody(req.body)));
    return res.status(result === 'saved' ? 200 : 401).json({ ok: result === 'saved', code: result });
  } catch (error) {
    return res.status(error instanceof BoundaryError || error instanceof WorkerError ? error.status : 503).json({ ok: false, code: error instanceof BoundaryError || error instanceof WorkerError ? error.code : 'unavailable' });
  }
}