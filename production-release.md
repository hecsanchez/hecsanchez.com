# Production activation — 5 November 2026

Hec explicitly authorized “push everything to prod.” This follow-up prepares the public website release on top of `c297f20`; the parent coordinates the final Worker activation, Vercel environment, push and deployment. This implementation has not pushed or deployed the website.

## Website behavior

- `/es/ia/` becomes public, indexable and linked from Spanish navigation/home only when the complete verified server environment is present. `/es/ia/gracias/` remains noindex/outside the sitemap and neutral without a valid context. No English AI route/alternate is invented. Assessment and workshop remain hidden; the quotation demonstration remains explicitly fictional.
- The real Kit Contexto v1.1 ZIP is available after durable request acceptance, independently of transactional email or optional qualification. Its shared catalog describes the verified 10-page PDF guide, Excel workbook (Mi tarea, Contexto, Ejemplo, Pruebas, Impacto), prompts, three fictional PDF quotes C-101/C-102/C-103, text fallback and start file. Prerequisites are ZIP extraction, preferably a computer, Microsoft Excel, and an assistant that can attach files or accept pasted text; no programming is required. Do not upload personal/confidential data without authorization.
- `/es/privacidad/` and `/en/privacy/` describe actual purposes/providers, retention until deletion request, optional answers/AI preference, browser context/retry storage, analytics and the rights channel `hi@hecsanchez.com`. Footer and all signup/profile forms link the notice. They make no legal/compliance or invented entity claims.
- All new Shipping Notes submissions use same-origin `/api/subscribe` → Worker/D1 → Resend Contacts. Success means **request received, signup processing**; it never promises a confirmation email or completed delivery. The Buttondown adapter remains as historical code/tests, with no import or fallback in the live endpoint. The two historical subscribers remain in Buttondown and are not migrated.
- Optional AI marketing choice is evidence only and does not enroll or change other preferences. Profile is write-only and optional. No email, task text or context token enters analytics or public URLs. Accepted/profile events are deduplicated privately; success-page views are not conversions. Browser recovery retains only a per-tab UUID/digest and reuses an uncertain request key after reload.

## Exact Vercel production environment

| Variable | Required value |
| --- | --- |
| `SIGNUPS_WORKER_URL` | `https://hecsanchez-signups.hi-d43.workers.dev` |
| `SIGNUPS_SERVICE_TOKEN` | The matching Worker service secret, at least 32 characters; set privately, never in Git/log output. |
| `SIGNUPS_NEWSLETTER_PROVIDER` | `resend` |
| `SIGNUPS_PRIVACY_VERSION` | `2026-11-05-v1` |
| `SIGNUPS_INTEGRATION_VERIFIED` | `true` only after controlled live Worker/D1/provider/rights verification. |

Vercel supplies `VERCEL_ENV=production`. Astro rejects production builds with any missing/wrong input. An unconfigured local/preview environment retains the development draft; URLs/query parameters cannot publish it. These values must be available at both build and serverless runtime. No browser bundle contains provider/service credentials. Remove the old Buttondown credential from the website deployment if no other production function needs it; its historical subscribers are managed separately.

The Worker must use the same rotated `SIGNUPS_SERVICE_TOKEN` and `PRIVACY_VERSION=2026-11-05-v1`. The server proxy attaches the notice version; the new Worker rejects mismatched versions before persistence. Its shared kit catalog returns the same real contents/prerequisites as the website. Apply migration `0002_contact_locks.sql` before deploying the new Worker: a short keyed email lease serializes Contacts discovery/create across different request keys for the same address. It stores no raw email and does not change existing signup data or retention. Per-item leases prevent an old worker from overwriting a newer attempt, and an erasure requested during an in-flight withdrawal retains the stronger provider cleanup job.

## Coordinated release order

1. With the current Worker capture disabled, parent privately rotates `SIGNUPS_SERVICE_TOKEN` in the Worker first, then sets the exact matching Vercel production secret and the other production values. Leave `SIGNUPS_INTEGRATION_VERIFIED` unset/false until step 4. Keep the public website unchanged until Worker readiness is established. The separate admin token never belongs in Vercel or browser code. Future rotations should also pause capture and allow active leases to drain before changing the keyed lease secret.
2. Run `wrangler d1 migrations apply hecsanchez-signups --remote --config workers/signups/wrangler.jsonc` to apply `0002`, then deploy this commit's Worker source with the already-provisioned D1 binding, real sender/Segment/Topic IDs, and current privacy version. The checked-in Wrangler base remains capture-disabled. After verifying the corresponding privacy, sender, Contacts and rights prerequisites, the parent explicitly overrides `SIGNUPS_ENABLED`, `RESOURCE_ENABLED`, `NEWSLETTER_CAPTURE_ENABLED`, `QUALIFICATION_ENABLED`, `PRIVACY_REVIEWED`, `DATA_RIGHTS_VERIFIED` and `RESEND_CONTACTS_VERIFIED` to `true` for controlled end-to-end verification while the public website remains unchanged. Preserve `VERIFIED_SENDER=true`, `RETENTION_MODE=until_deletion` and the five-minute retry/rights schedule. No historical subscriber migration is part of this step.
3. Verify real durable request acceptance/replay/mismatch, context/profile, email-independent ZIP access, actual delivery, new newsletter Contact scope, concurrent/uncertain create and existing opt-out preservation. Check topic withdrawal and completed rights-job erasure with disposable owner-approved recipients, and clean up those test records. Provider reads can be eventually consistent, so verify convergence before declaring a failure/success. Never send a test to historical subscribers.
4. Set the Vercel integration attestation true once verified, then perform the user-authorized final push/site deployment. Parent coordinates this step; this subtask stops at the tested commit.
5. Check production ES/EN routes, privacy/hreflang/canonicals, Spanish AI nav/sitemap, noindex/neutral direct success, actual same-origin acceptance, independent download and truthful delivery/profile statuses. Check the queues/operational events privately, with no contact exports or personal-data logs.

The already-deployed disabled Worker version and migration/health evidence remain recorded in [workers/signups/README.md](./workers/signups/README.md). The base config stays disabled to make an accidental unverified deployment fail closed; enabling it is an explicit coordinated deployment override, not a website query flag.

## Evidence and remaining verification

The parent verified the public ZIP and reported SHA-256 `275ef24f5809395cf5d23d3f0b2af4ecb407d304b11e685517784aae29b8bdf7`. A direct urllib fetch in this subtask received HTTP 403; no archive was downloaded here, and the catalog uses the parent's verified inventory. The parent verified a controlled kit email to `hi@hecsanchez.com`, Resend ID `01a1acd0-46d6-7a74-b186-ffb6e268f868`, reached `last_event=delivered` with correct From, Reply-To and link. This does not cause the application to claim mailbox delivery without its own delivery webhook.

The parent also verified disposable Contact creation in the actual Shipping Notes Segment/Topic, topic opt-in then opt-out (read convergence took five seconds), deletion by opaque Contact ID and post-delete 404. Three disposable contacts were erased. No historical contact was read/migrated. Controlled end-to-end Worker/D1 rights jobs and concurrency/suppression verification remain release dependencies until the parent records those results.

## Repository verification

Final local verification passed:

- `npm test`: 35/35, including the real published Vercel → Worker → SQLite chain, both migrations, per-email concurrent creation and in-flight withdrawal upgraded to erasure, plus draft/boundary/outbox/provider/rights behavior.
- `npm run check`: no errors or warnings; 13 existing hints.
- `npm run test:browser`: 20/20 across separate draft and configured-published Astro servers. All API responses are mocked for review; accessibility checks and viewports 320/390/768/1440 pass.
- `npm run test:build`: draft 51 pages and configured production 53 pages, each with 6/6 artifact checks, using only fictional local service tokens.
- Wrangler dry-run: 30.88 KiB bundle / 8.57 KiB gzip; checked-in capture flags remain disabled. `git diff --check` passes.

Refreshed screenshots are `.context/production-review/ia-{320,390,768,1440}.png`, `gracias-access-{320,390,768,1440}.png`, `privacy-es.png` and `privacy-en.png`. These are local review fixtures, not screenshots proving live capture. The repository checks made no real provider changes or subscriber migration.