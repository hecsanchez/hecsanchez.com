export const SIGNUPS_WORKER_ORIGIN = 'https://hecsanchez-signups.hi-d43.workers.dev';
export const SIGNUPS_PRIVACY_VERSION = '2026-11-05-v1';
export type SiteEnvironment = Record<string, string | undefined>;
export function siteEnvironmentReady(env: SiteEnvironment): boolean {
  try {
    const url = new URL(env.SIGNUPS_WORKER_URL ?? '');
    return url.origin === SIGNUPS_WORKER_ORIGIN && url.pathname === '/' && !url.search && !url.hash && !url.username && !url.password &&
      (env.SIGNUPS_SERVICE_TOKEN?.length ?? 0) >= 32 && env.SIGNUPS_NEWSLETTER_PROVIDER === 'resend' &&
      env.SIGNUPS_PRIVACY_VERSION === SIGNUPS_PRIVACY_VERSION && env.SIGNUPS_INTEGRATION_VERIFIED === 'true';
  } catch { return false; }
}
export function assertProductionEnvironment(env: SiteEnvironment): void {
  if (env.VERCEL_ENV === 'production' && !siteEnvironmentReady(env)) throw new Error(
    'Production requires SIGNUPS_WORKER_URL, SIGNUPS_SERVICE_TOKEN, SIGNUPS_NEWSLETTER_PROVIDER=resend, the current SIGNUPS_PRIVACY_VERSION and SIGNUPS_INTEGRATION_VERIFIED=true.');
}