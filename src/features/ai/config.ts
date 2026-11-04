export interface ResourceAsset {
  id: string;
  version: string;
  url: string;
  kind: 'download' | 'hosted';
  formats: string;
  contents: string[];
  prerequisites: string;
}

export interface AiConfig {
  journey: 'draft' | 'published';
  kit: { state: 'unavailable' } | { state: 'available'; asset: ResourceAsset };
  demonstration: 'illustrative' | 'verified' | 'hidden';
  /** P1 boundary only. Enabling an extension requires a separate implementation. */
  workshop: 'hidden' | 'interest' | 'for_sale' | 'closed';
  assessment: { state: 'hidden' } | { state: 'inquiry'; destination: string; verified: true };
  privacyHref: string | null;
  deliveryIntegration: { id: string; verifiedSender: true; tested: true } | null;
}

// Deliberately edited in source; URLs and query parameters cannot publish offers.
export const aiConfig: AiConfig = {
  journey: 'draft',
  kit: { state: 'unavailable' },
  demonstration: 'illustrative',
  workshop: 'hidden',
  assessment: { state: 'hidden' },
  privacyHref: null,
  deliveryIntegration: null,
};

export function validateAiConfig(config: AiConfig, providerConfigured = false): void {
  if (config.workshop !== 'hidden') throw new Error('Workshop P1 is not implemented or selected.');
  if (config.demonstration === 'verified') throw new Error('Approved real demonstration material must be implemented first.');
  if (config.assessment.state === 'inquiry' &&
      (!config.assessment.verified || !/^\/es\/contacto\/(?:\?topic=ia)?$/.test(config.assessment.destination))) {
    throw new Error('Assessment requires a verified existing Spanish contact destination.');
  }
  if (config.kit.state === 'available') {
    const asset = config.kit.asset;
    if (!asset.id || !asset.version || !asset.formats || !asset.prerequisites || !asset.contents.length ||
        !/^https:\/\/[^\s?#]+$/.test(asset.url)) {
      throw new Error('A real versioned resource, accurate contents and durable HTTPS URL are required.');
    }
  }
  if (config.journey === 'published' && (
    config.kit.state !== 'available' || config.demonstration === 'hidden' ||
    !config.privacyHref || !/^\/(?!\/)[^\s?#]+$/.test(config.privacyHref) ||
    !config.deliveryIntegration?.tested || !config.deliveryIntegration?.verifiedSender || !providerConfigured
  )) throw new Error('Publishing requires the real kit, privacy policy and verified durable delivery adapter.');
}

export function showAiEntry(development: boolean, config: AiConfig = aiConfig): boolean {
  return development || config.journey === 'published';
}

export function aiStaticPaths(development: boolean, config: AiConfig = aiConfig) {
  return showAiEntry(development, config)
    ? [{ params: { page: undefined } }, { params: { page: 'gracias' } }]
    : [];
}

export function aiSitemapEligible(pathname: string, config: AiConfig = aiConfig): boolean {
  return !/^\/es\/ia(?:\/|$)/.test(pathname) ||
    (config.journey === 'published' && /^\/es\/ia\/?$/.test(pathname));
}