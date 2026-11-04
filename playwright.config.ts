import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  outputDir: './.context/test-results',
  workers: 1,
  reporter: 'list',
  use: { baseURL: process.env.AI_REVIEW_URL ?? 'http://127.0.0.1:4321', headless: true },
  webServer: process.env.AI_REVIEW_URL ? undefined : {
    command: 'npm run dev -- --host 127.0.0.1',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: !process.env.CI,
  },
});