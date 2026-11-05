/** Preserve Shipping Notes' existing create-subscriber call and opt-in semantics.
 * No update, reactivation, unsubscribe, or AI-list enrollment operation exists here.
 */
export type SubscriptionResult = { ok: true; confirm: boolean } | { ok: false; uncertain: boolean };
export async function subscribeButtondown(email: string, send: typeof fetch = fetch): Promise<SubscriptionResult> {
  const apiKey = process.env.BUTTONDOWN_API_KEY;
  if (!apiKey) return { ok: false, uncertain: false };
  try {
    const response = await send('https://api.buttondown.com/v1/subscribers', {
      method: 'POST', signal: AbortSignal.timeout(8000),
      headers: { Authorization: `Token ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_address: email, tags: ['website'] }),
    });
    if (!response.ok) { await response.body?.cancel(); return { ok: false, uncertain: response.status >= 500 }; }
    const data = await response.json().catch(() => ({})) as Record<string, unknown>;
    const type = data.type ?? data.subscriber_type;
    return { ok: true, confirm: typeof type === 'string' ? type === 'unactivated' : true };
  } catch { return { ok: false, uncertain: true }; }
}