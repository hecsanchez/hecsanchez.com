import type { VercelRequest, VercelResponse } from '@vercel/node';
import { aiConfig } from '../src/features/ai/config.ts';
import { resourceProvider } from '../src/features/ai/provider.ts';
import { BoundaryError, requireLiveResource } from '../src/features/ai/server.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ ok: false }); }
  try {
    requireLiveResource(aiConfig, resourceProvider);
    const token = req.cookies.ai_resource_context;
    const receipt = token && /^[A-Za-z0-9_-]{32,256}$/.test(token) ? await resourceProvider.readContext(token) : null;
    if (!receipt) return res.status(401).json({ ok: false, code: 'expired' });
    // No contact identity or previously supplied profile is ever returned.
    return res.status(200).json({ ok: true, asset: receipt.asset, delivery: receipt.delivery, profileAllowed: receipt.profileAllowed });
  } catch (error) {
    return res.status(error instanceof BoundaryError ? error.status : 503).json({ ok: false, code: 'unavailable' });
  }
}