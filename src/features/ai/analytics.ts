import { advanceAttribution, boundedCampaign, sanitizedAnalyticsUrl, sanitizedReferrer, type Attribution } from './campaign.ts';

type PlausiblePayload = { u?: string; r?: string | null; [key: string]: unknown };
interface Plausible {
  (name: string, options?: { props?: Record<string, string>; url?: string }): void;
  q?: unknown[][];
  init?: (options: Record<string, unknown>) => void;
  o?: Record<string, unknown>;
}
declare global { interface Window { plausible?: Plausible } }

let attribution: Attribution = { first: null, latest: null };
export function currentAttribution(): Attribution {
  // Current document only, in memory. No persistent tracking or personal data storage.
  attribution = advanceAttribution(attribution, boundedCampaign(new URLSearchParams(location.search)));
  return attribution;
}

export function transformAnalyticsPayload(payload: PlausiblePayload, currentUrl: string): PlausiblePayload {
  return { ...payload, u: sanitizedAnalyticsUrl(currentUrl), r: sanitizedReferrer(typeof payload.r === 'string' ? payload.r : '') };
}

export function emitAiEvent(name: string, data: DOMStringMap = {}): void {
  const root = document.querySelector<HTMLElement>('[data-ai-published]');
  if (root?.getAttribute('data-ai-published') !== 'true') return;
  if (!['ai_landing_view', 'kit_cta_click', 'kit_access_click', 'assessment_cta_click'].includes(name)) return;
  const props: Record<string, string> = { locale: 'es', environment: 'production', ...currentAttribution().latest };
  if (['header', 'hero', 'closing', 'help', 'web'].includes(data.placement ?? '')) props.placement = data.placement!;
  const resourceId = data.resourceId ?? root.dataset.resourceId;
  if (resourceId && /^[a-z0-9_-]{1,64}$/.test(resourceId)) props.resource_id = resourceId;
  if (data.resourceVersion && /^[a-z0-9._-]{1,64}$/.test(data.resourceVersion)) props.resource_version = data.resourceVersion;
  if (['download', 'hosted'].includes(data.accessKind ?? '')) props.access_kind = data.accessKind!;
  if (currentAttribution().latest?.utm_content === 'bio') props.creative = 'unknown';
  try { window.plausible?.(name, { props, url: sanitizedAnalyticsUrl(location.href) }); } catch { /* Never block access. */ }
}

export function initializeAnalytics(mode: 'site' | 'ai'): void {
  const queue: Plausible = window.plausible ?? function (...args: unknown[]) { queue.q = queue.q ?? []; queue.q.push(args); };
  window.plausible = queue;
  queue.init = (options) => { queue.o = options; };
  queue.init({
    autoCapturePageviews: mode !== 'ai',
    formSubmissions: false, fileDownloads: false, outboundLinks: false,
    transformRequest: (payload: PlausiblePayload) => transformAnalyticsPayload(payload, location.href),
  });
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://plausible.io/js/pa-LLj1kLisNbG0bzRIrzcq1.js';
  // Prevent the browser request Referer header from carrying the raw page query.
  script.referrerPolicy = 'no-referrer';
  document.head.appendChild(script);
  if (mode === 'ai' && /^\/es\/ia\/?$/.test(location.pathname)) {
    queue('pageview', { url: sanitizedAnalyticsUrl(location.href) });
    emitAiEvent('ai_landing_view');
  }
}