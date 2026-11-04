export type Campaign = Partial<Record<'utm_source' | 'utm_medium' | 'utm_campaign' | 'utm_content', string>>;
export interface Attribution { first: Campaign | null; latest: Campaign | null }

// Controlled identifiers for the selected 30 day campaign; never accept free text.
const rules = {
  utm_source: /^(tiktok|instagram)$/,
  utm_medium: /^organic_social$/,
  utm_campaign: /^ia_30_dias$/,
  utm_content: /^(bio|w0[1-5]_d0[1-7]_[ab])$/,
};

export function boundedCampaign(input: URLSearchParams | Record<string, unknown>): Campaign | null {
  const get = (key: string) => input instanceof URLSearchParams ? input.get(key) : input[key];
  const campaign: Campaign = {};
  for (const [key, pattern] of Object.entries(rules)) {
    const value = get(key);
    if (typeof value === 'string' && value.length <= 100 && pattern.test(value)) {
      campaign[key as keyof Campaign] = value;
    }
  }
  // A creative by itself cannot establish a source. Unknown/partial visits do not erase prior attribution.
  return campaign.utm_source ? campaign : null;
}

export function advanceAttribution(previous: Attribution, incoming: Campaign | null): Attribution {
  return incoming ? { first: previous.first ?? { ...incoming }, latest: { ...incoming } } : previous;
}

export function sanitizedAnalyticsUrl(raw: string): string {
  const url = new URL(raw, 'https://hecsanchez.com');
  const campaign = boundedCampaign(url.searchParams);
  url.search = '';
  url.hash = '';
  url.username = '';
  url.password = '';
  for (const [key, value] of Object.entries(campaign ?? {})) url.searchParams.set(key, value);
  return url.toString();
}

export function sanitizedReferrer(raw: string): string | null {
  try {
    const hostname = new URL(raw).hostname;
    return ['tiktok.com', 'www.tiktok.com', 'instagram.com', 'www.instagram.com'].includes(hostname)
      ? `https://${hostname}` : null;
  } catch { return null; }
}