import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  outputDir: './.context/test-results',
  workers: 1,
  reporter: 'list',
  use: { baseURL: process.env.AI_REVIEW_URL ?? 'http://127.0.0.1:4321', headless: true },
  projects: [
    { name: 'draft', testIgnore: '**/published.spec.ts' },
    { name: 'published', testMatch: '**/published.spec.ts', use: { baseURL: 'http://127.0.0.1:4322' } },
  ],
  webServer: [{
    command: 'npm run dev -- --host 127.0.0.1',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: !process.env.CI,
    env: { SIGNUPS_INTEGRATION_VERIFIED: '' },
  }, {
    command: 'npm run dev -- --host 127.0.0.1 --port 4322',
    url: 'http://127.0.0.1:4322',
    reuseExistingServer: !process.env.CI,
    env: { SIGNUPS_WORKER_URL: 'https://hecsanchez-signups.hi-d43.workers.dev', SIGNUPS_SERVICE_TOKEN: 'fictional-browser-test-token-only-12345',
      SIGNUPS_NEWSLETTER_PROVIDER: 'resend', SIGNUPS_PRIVACY_VERSION: '2026-11-05-v1', SIGNUPS_INTEGRATION_VERIFIED: 'true' },
  }],
});