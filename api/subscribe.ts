import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

  if (!email) {
    return res.status(400).json({ ok: false, error: 'Email is required' });
  }

  const apiKey = process.env.BUTTONDOWN_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ ok: false, error: 'Server misconfigured' });
  }

  try {
    const response = await fetch('https://api.buttondown.com/v1/subscribers', {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: email,
        tags: ['website'],
      }),
    });

    if (response.ok || response.status === 201) {
      return res.status(200).json({ ok: true });
    }

    const data = await response.json().catch(() => ({}));
    return res.status(400).json({ ok: false, error: data.detail || 'Subscription failed' });
  } catch {
    return res.status(500).json({ ok: false, error: 'Failed to reach Buttondown' });
  }
}
