import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aiConfig, aiStaticPaths, aiSitemapEligible, validateAiConfig, type AiConfig, type ResourceAsset } from '../src/features/ai/config.ts';
import { advanceAttribution, boundedCampaign, sanitizedAnalyticsUrl, sanitizedReferrer } from '../src/features/ai/campaign.ts';
import { quotation } from '../src/features/ai/example.ts';
import { transformAnalyticsPayload } from '../src/features/ai/analytics.ts';
import { assertOrigin, BoundaryError, parseBody, parseProfile, parseRequest, requireLiveResource } from '../src/features/ai/server.ts';
import requestHandler from '../api/ai-resource.ts';
import contextHandler from '../api/ai-context.ts';
import profileHandler from '../api/ai-profile.ts';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Fictional test configuration is NEVER imported by the application or build.
const asset: ResourceAsset = { id: 'test-resource', version: 'test-v1', url: 'https://example.invalid/test-resource.pdf', kind: 'download', formats: 'Fictional test file', contents: ['Test fixture'], prerequisites: 'Test only' };
const complete: AiConfig = { ...aiConfig, journey: 'published', kit: { state: 'available', asset }, privacyHref: '/test-privacy/', deliveryIntegration: { id: 'test-only', verifiedSender: true, tested: true } };
const validBody = { email: ' example+demo@example.invalid ', marketingConsent: false, idempotencyKey: '2a29eddd-a5e5-4f33-981c-f624428bad32' };
const isBoundary = (status: number) => (error: unknown) => error instanceof BoundaryError && error.status === status;

test('default build omits draft routes and entries; development alone can render them', () => {
  assert.doesNotThrow(() => validateAiConfig(aiConfig));
  assert.deepEqual(aiStaticPaths(false), []);
  assert.equal(aiStaticPaths(true).length, 2);
  assert.equal(aiSitemapEligible('/es/ia/'), false);
  assert.equal(aiSitemapEligible('/es/ia/gracias/', complete), false);
  assert.equal(aiSitemapEligible('/es/ia/taller/', complete), false);
  assert.equal(aiSitemapEligible('/es/ia/', complete), true);
  assert.equal(aiSitemapEligible('/es/proyectos/'), true);
});

test('publication requires actual configured adapter, real asset, privacy and evidence', () => {
  assert.throws(() => validateAiConfig({ ...aiConfig, journey: 'published' }));
  assert.throws(() => validateAiConfig(complete));
  assert.doesNotThrow(() => validateAiConfig(complete, true));
  assert.throws(() => validateAiConfig({ ...complete, privacyHref: null }, true));
  assert.throws(() => validateAiConfig({ ...complete, demonstration: 'hidden' }, true));
  assert.throws(() => validateAiConfig({ ...complete, kit: { state: 'available', asset: { ...asset, url: 'javascript:alert(1)' } } }, true));
  for (const workshop of ['interest', 'for_sale', 'closed'] as const) assert.throws(() => validateAiConfig({ ...aiConfig, workshop }));
});

test('only controlled campaigns survive; personal and unexpected data are discarded', () => {
  assert.deepEqual(boundedCampaign(new URLSearchParams('utm_source=tiktok&utm_medium=organic_social&utm_campaign=ia_30_dias&utm_content=w01_d01_a&email=private@example.invalid')), {
    utm_source: 'tiktok', utm_medium: 'organic_social', utm_campaign: 'ia_30_dias', utm_content: 'w01_d01_a',
  });
  assert.deepEqual(boundedCampaign({ utm_source: 'instagram', utm_content: 'private@example.invalid', utm_term: 'secret' }), { utm_source: 'instagram' });
  assert.equal(boundedCampaign({ utm_source: 'person@example.invalid', utm_content: 'w01_d01_a' }), null);
  assert.equal(boundedCampaign({ utm_content: 'w01_d01_a' }), null);
});

test('first touch survives direct navigation; latest touch is replaced as a whole; bio never invents a creative', () => {
  const initial = advanceAttribution({ first: null, latest: null }, boundedCampaign({ utm_source: 'tiktok', utm_content: 'w01_d01_a' }));
  assert.equal(advanceAttribution(initial, null), initial);
  const latest = advanceAttribution(initial, boundedCampaign({ utm_source: 'instagram' }));
  assert.deepEqual(latest.first, initial.first);
  assert.deepEqual(latest.latest, { utm_source: 'instagram' });
  assert.deepEqual(boundedCampaign({ utm_source: 'tiktok', utm_content: 'bio' }), { utm_source: 'tiktok', utm_content: 'bio' });
});

test('automatic analytics locations and referrers do not leak raw query values', () => {
  assert.equal(sanitizedAnalyticsUrl('https://hecsanchez.com/es/ia/?utm_source=tiktok&utm_content=person@example.invalid&source=secret&email=secret&token=private#kit'), 'https://hecsanchez.com/es/ia/?utm_source=tiktok');
  assert.equal(sanitizedReferrer('https://www.tiktok.com/@someone/video/123?private=value'), 'https://www.tiktok.com');
  assert.equal(sanitizedReferrer('https://private.example.invalid/contact?email=secret'), null);
  assert.deepEqual(transformAnalyticsPayload({ n: 'pageview', u: 'https://hecsanchez.com/?email=secret', r: 'https://instagram.com/private?email=secret' }, 'https://hecsanchez.com/es/ia/?utm_source=instagram&email=secret'), { n: 'pageview', u: 'https://hecsanchez.com/es/ia/?utm_source=instagram', r: 'https://instagram.com' });
});

test('server ignores client destinations and identity, preserves plus suffix, binds changed payloads to different fingerprints', () => {
  const original = parseRequest({ ...validBody, resourceId: 'forged', resourceVersion: 'forged', sourcePage: '//evil.invalid', url: 'https://evil.invalid', attribution: { first: { utm_source: 'tiktok', utm_content: 'bio', email: 'secret' } } }, complete);
  assert.equal(original.email, 'example+demo@example.invalid');
  assert.equal(original.resourceId, asset.id);
  assert.equal(original.resourceVersion, asset.version);
  assert.equal(original.sourcePage, '/es/ia/');
  assert.equal(original.marketingConsent, false);
  assert.deepEqual(original.attribution.first, { utm_source: 'tiktok', utm_content: 'bio' });
  assert.equal(original.fingerprint, parseRequest(validBody, complete).fingerprint);
  assert.notEqual(original.fingerprint, parseRequest({ ...validBody, marketingConsent: true }, complete).fingerprint);
  assert.notEqual(original.fingerprint, parseRequest({ ...validBody, email: 'other@example.invalid' }, complete).fingerprint);
});

test('invalid email, oversized input and cross-site operations cannot reach the adapter', () => {
  assert.throws(() => parseRequest({ ...validBody, email: 'invalid' }, complete), isBoundary(400));
  assert.throws(() => parseRequest({ ...validBody, marketingConsent: 'yes' }, complete), isBoundary(400));
  assert.throws(() => parseRequest({ ...validBody, idempotencyKey: 'bad' }, complete), isBoundary(400));
  assert.throws(() => parseBody('x'.repeat(4097)), isBoundary(413));
  assert.throws(() => parseBody('{bad'), isBoundary(400));
  assert.throws(() => assertOrigin('https://evil.invalid', 'cross-site'), isBoundary(403));
  assert.throws(() => requireLiveResource(aiConfig, null), isBoundary(404));
  assert.throws(() => requireLiveResource(complete, null), isBoundary(503));
});

test('qualification is bounded and write-only; client identity/preferences are excluded', () => {
  assert.deepEqual(parseProfile({ role: 'operations', task: ' Review a fictional quote ', email: 'forged@example.invalid', contactId: 'forged', marketingConsent: true }), { role: 'operations', task: 'Review a fictional quote' });
  assert.throws(() => parseProfile({ role: 'owner', task: 'x'.repeat(501) }), isBoundary(400));
  assert.throws(() => parseProfile({ role: 'owner', task: ' ' }), isBoundary(400));
  assert.throws(() => parseProfile({ role: 'forged', task: 'task' }), isBoundary(400));
});

test('all real endpoints reject draft access and never report fixture success', async () => {
  for (const [handler, method] of [[requestHandler, 'POST'], [contextHandler, 'GET'], [profileHandler, 'POST']] as const) {
    let status = 0;
    let result: unknown;
    const headers = new Map();
    const response = { setHeader: (key: string, value: string) => headers.set(key, value), status: (value: number) => { status = value; return response; }, json: (value: unknown) => { result = value; return response; } };
    await handler({ method, headers: {}, body: validBody, cookies: {} } as VercelRequest, response as unknown as VercelResponse);
    assert.equal(status, 404);
    assert.deepEqual(result, { ok: false, code: 'unavailable' });
    assert.equal(headers.get('Cache-Control'), 'private, no-store');
    assert.equal(headers.has('Set-Cookie'), false);
  }
});

test('fictional example flags absent freight, validity and final total without inferring numbers', () => {
  assert.equal(quotation.freight, null);
  assert.equal(quotation.validUntil, null);
  assert.equal(quotation.finalTotal, null);
  assert.deepEqual(quotation.rows.slice(-3).map(row => row[2]), ['Requiere aclaración', 'Requiere aclaración', 'Requiere aclaración']);
});