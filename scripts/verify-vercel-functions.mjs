import assert from 'node:assert/strict';
import { mkdir, mkdtemp } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import builder from '@vercel/node';
import { FileFsRef, downloadFile } from '@vercel/build-utils';

assert.equal(Number(process.versions.node.split('.')[0]), 24, 'Run the Vercel packaging smoke with Node.js 24.');
const root = process.cwd();
await mkdir('.context/vercel-functions', { recursive: true });
const outputRoot = await mkdtemp(path.join(root, '.context/vercel-functions/run-'));
let failures = 0;
for (const name of ['subscribe', 'ai-resource', 'ai-context', 'ai-profile']) {
  const entrypoint = `api/${name}.ts`;
  // Exercise Vercel's production tracer/transpiler, not Astro or Node's TS loader.
  // Sources/dependencies are already installed; skip download/install and use a
  // harmless version command instead of rebuilding Astro for every function.
  const { output } = await builder.build({
    files: { [entrypoint]: new FileFsRef({ fsPath: path.join(root, entrypoint) }) },
    entrypoint, workPath: root, repoRootPath: root, meta: { skipDownload: true },
    config: { zeroConfig: true, nodeVersion: '24.x', projectSettings: { installCommand: '', buildCommand: 'node --version' } },
    considerBuildCommand: true,
  });
  assert.equal(output.runtime, 'nodejs24.x');
  const directory = path.join(outputRoot, name);
  for (const [filename, file] of Object.entries(output.files)) {
    await downloadFile(file, path.join(directory, filename));
  }
  for (const mode of ['draft', 'published']) {
    const result = spawnSync(process.execPath, ['--no-experimental-strip-types', 'tests/fixtures/vercel-startup.mjs', path.join(directory, output.handler), name, mode], {
      cwd: root, stdio: 'inherit', env: { ...process.env, NODE_OPTIONS: '',
        SIGNUPS_WORKER_URL: 'https://hecsanchez-signups.hi-d43.workers.dev',
        SIGNUPS_SERVICE_TOKEN: 'fictional-vercel-packaging-smoke-token-only',
        SIGNUPS_NEWSLETTER_PROVIDER: 'resend', SIGNUPS_PRIVACY_VERSION: '2026-11-05-v1',
        SIGNUPS_INTEGRATION_VERIFIED: mode === 'published' ? 'true' : '',
      },
    });
    if (result.status !== 0) failures++;
  }
}
assert.equal(failures, 0, `${failures} packaged Vercel startup checks failed.`);