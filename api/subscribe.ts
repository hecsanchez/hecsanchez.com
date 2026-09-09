import type { VercelRequest, VercelResponse } from '@vercel/node';

/** Buttondown marks a subscriber `unactivated` when the list uses double opt-in. */
const PENDING_CONFIRMATION = 'unactivated';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  let email: unknown;
  try {
    ({ email } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {});
  } catch {
    return res.status(400).json({ ok: false, error: 'Invalid request body' });
  }

  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ ok: false, error: 'Invalid email address' });
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
        email_address: email.trim(),
        tags: ['website'],
      }),
    });

    const data = await response.json().catch(() => ({} as Record<string, unknown>));

    if (response.ok) {
      // Report what actually happened so the form can show the matching message.
      // If Buttondown omits the field, assume an opt-in email is on its way.
      const type = (data as Record<string, unknown>).type ?? (data as Record<string, unknown>).subscriber_type;
      const confirm = typeof type === 'string' ? type === PENDING_CONFIRMATION : true;
      return res.status(200).json({ ok: true, confirm });
    }

    return res.status(400).json({
      ok: false,
      error: (data as Record<string, string>).detail || 'Subscription failed',
    });
  } catch {
    return res.status(500).json({ ok: false, error: 'Failed to reach Buttondown' });
  }
}
