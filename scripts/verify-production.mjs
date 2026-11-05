import { spawnSync } from 'node:child_process';
import { SIGNUPS_WORKER_ORIGIN, SIGNUPS_PRIVACY_VERSION } from '../src/features/signups/environment.ts';

const draft = { ...process.env, VERCEL_ENV: '', SIGNUPS_INTEGRATION_VERIFIED: '' };
const published = { ...process.env, VERCEL_ENV: 'production', SIGNUPS_WORKER_URL: SIGNUPS_WORKER_ORIGIN,
  SIGNUPS_SERVICE_TOKEN: 'fictional-production-build-test-token-only', SIGNUPS_NEWSLETTER_PROVIDER: 'resend',
  SIGNUPS_PRIVACY_VERSION, SIGNUPS_INTEGRATION_VERIFIED: 'true' };
for (const [mode, env] of [['draft', draft], ['published', published]]) {
  console.log(`Checking ${mode} production artifacts with local-only test configuration.`);
  for (const [command, args] of [['npm', ['run', 'build']], [process.execPath, ['--experimental-strip-types', '--test', 'tests/production.test.ts']]]) {
    const result = spawnSync(command, args, { env, stdio: 'inherit' });
    if (result.status !== 0) process.exit(result.status ?? 1);
  }
}