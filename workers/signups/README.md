# Signup service — deployed, capture disabled

This implementation follows Hec's decisions on 5 November 2026: Worker + D1 for new requests, Resend for kit delivery and future newsletter contacts, no migration of the two existing Buttondown subscribers, retention until deletion is requested, and **Worker/D1 deployment only**. The public website is not being deployed. Its existing Buttondown integration stays the default. The AI journey remains a draft, with no public navigation or accepting form.

The transactional sender is `Hec Sánchez <recursos@mail.hecsanchez.com>`, Reply-To `hi@hecsanchez.com`. The parent agent verified the Resend domain and sending capability live, with open/click tracking disabled, and created the dedicated Shipping Notes Segment and public Topic (default `opt_out`). `VERIFIED_SENDER=true` records that evidence; no live test message has been sent. No credential is in source. The parent applied the D1 migration and deployed the Worker with its five-minute schedule. All capture, privacy, rights and Contacts-verification flags remain false; the website/Vercel deployment and its provider settings are unchanged.

## Deployment evidence — 5 November 2026

The parent agent performed and reported these remote operations and checks after implementation commit `ba5d8b4c34df1389d08814985e4b23a5646714d9`:

| Item | Verified result |
| --- | --- |
| D1 migration | `0001_signups.sql` applied to `hecsanchez-signups` at **2026-11-05 17:27:43 UTC**; the remote migration ledger contains `0001`. |
| Worker | `hecsanchez-signups` deployed at `https://hecsanchez-signups.hi-d43.workers.dev`, version **`77fd52e4-a0b1-4c1a-bf59-6c13b7a880f3`**. |
| Schedule | `*/5 * * * *`. With capture disabled, signup delivery/enrollment is not run. |
| Protected secrets | `RESEND_API_KEY`, random `SIGNUPS_SERVICE_TOKEN` and distinct random `SIGNUPS_ADMIN_TOKEN` attached to the Worker; values remain private. |
| Request gate | Authenticated JSON POST `/v1/resource` from the allowed site Origin returned **503 / unavailable**. |
| Origin / CORS | Foreign Origin returned **403**; allowed OPTIONS returned **204**. |
| Admin separation | Service credential against an admin operation returned **403**; admin-authenticated empty erase body returned **400 / invalid**, without a deletion job. |
| Private D1 inspection | All nine application tables contained **0 rows**: requests, contexts, qualification, delivery/contact outboxes, provider contacts, rights jobs, operational events and rate buckets. |

These checks establish the deployment, empty schema and disabled/authenticated boundaries. They do not establish live request acceptance, recipient delivery, Contacts behavior, unsubscribe handling or completed provider erasure. No signup was accepted, email sent, Contact created/migrated, or valid erasure requested. The two historical Buttondown subscribers remain untouched. Website proxy configuration remains unset and AI publication remains draft.

## Complete form and provider inventory

| User action | ES/EN location and component | Existing behavior / consent | Prepared storage and provider |
| --- | --- | --- | --- |
| Shipping Notes signup | `/es/`, `/en/`; `HomePage` → block `SubscribeForm`, placement `home` | Email + explicit subscribe action, unsubscribe reassurance; no unrelated marketing checkbox. `/api/subscribe` creates Buttondown subscriber tagged `website`, preserving its `unactivated` / confirmation response. | Future explicit `SIGNUPS_NEWSLETTER_PROVIDER=resend` selects Worker/D1 + Resend Contacts. Purpose `shipping_notes`, affirmative request, version `shipping-notes-request-v1`, locale and controlled placement. Default remains Buttondown. |
| Shipping Notes signup | `/es/escritos/`, `/en/writing/`; `BlogIndexPage` → block form, `writing_index` | Same shared form/API and consent. | Same purpose; source is the corresponding writing index. |
| Shipping Notes signup | Every ES/EN writing post; `BlogPostPage` → floating form, `writing_post` | Same form/API, revealed at the post trigger; dismissing it is not a signup. | Same purpose and controlled source/placement. Actual arbitrary page URLs and query strings are never recorded. |
| Kit Contexto request | Draft `/es/ia/`; shared `ResourceRequest` | Email requests one resource; unchecked optional `ai-examples-v1` choice is separate from delivery. Default form is disabled. `/api/ai-resource` rejects draft access. | Purpose `kit_contexto`, server-owned resource/version/source, explicit true/false choice and privacy version. D1 acceptance precedes success; transactional Resend outbox. The optional choice records evidence only and performs no enrollment/unsubscribe operation. |
| Optional qualification | Draft `/es/ia/gracias/`; `ResourceSuccess` | Role, task ≤500 chars, optional frequency; skip allowed. Existing context/profile APIs reject draft access. | Write-only answers attached to a request by random, hashed, 30-minute action context. No identity/profile is returned; qualification never gates the ZIP. |
| Professional contact | `/es/contacto/`, `/en/contact/`; `ContactPage`, plus footer/about mailto links | External Cal.com embed and mailto only. The source still flags the booking slug for confirmation. | No first-party contact form, accepted-inquiry endpoint, or signup record. Clicks are not accepted inquiries. No webhook or booking data is collected. |
| Workshop | Hidden configuration boundary only | No signup, interest, checkout or purchase form. | No collection or provider. |

No additional first-party forms or provider paths were found in the tracked source. No English AI journey exists. The existing provider's exact Buttondown POST/tag and confirmation semantics live in `src/features/signups/buttondown.ts`; this adapter has no update, reactivation, migration, unsubscribe or AI-list operation.

## Request and delivery flow

Browser → same-origin Vercel API → Worker authenticated with a private service token → D1 atomic batch. Worker endpoints accept JSON POST only, exact production origins, no URL query, at most 4096 bytes, bounded email/profile/placement values, and server-controlled destinations. The Worker is a server-to-server service: browser code never receives its credential. Same-origin JSON plus Origin / Fetch Metadata checks and Secure/HttpOnly/SameSite=Strict context cookies provide the browser CSRF boundary. CORS reflects only the two exact HTTPS site origins and does not allow credentials.

`/v1/resource` binds a UUID key to email, resource, version, consent and its version. Changed bindings return 409. The D1 batch owns the request, outbox, hashed context and one accepted event before returning. Replays produce no duplicate request, delivery job or accepted event. The real resource catalog is fixed to:

`https://recursos.hecsanchez.com/kit-contexto/v1.1/kit-contexto-v1.1.zip`

The response contains this independent URL immediately after acceptance; the site adapter redirects to an access page that reads its private context. The public ZIP does not require a qualification answer or email delivery. The site still needs reviewed kit contents/prerequisites and approved privacy text before publishing the journey; this code does not invent those inputs or claim the asset has been inspected.

Resend email uses subject **Tu Kit Contexto** and link label **Acceder al kit**, with a plain-text requested-resource message. It never creates a marketing Contact. An atomic lease and opaque `kit:<request UUID>` idempotency key own delivery. There are at most six attempts with backoff, stopping 23 hours after acceptance to stay inside Resend's documented 24-hour email-idempotency window. A timeout retains retry ownership. `queued` / `failed` / `sent` are accurate provider states; `sent` means Resend accepted the API request, not mailbox delivery. There is no delivered-email webhook or fabricated `confirmed` event. Delivery failure leaves the web download accessible.

Anonymous counters allow 100 new requests/minute globally and five/email/hour. Email counter keys use a server-keyed HMAC; no IP/user-agent is stored. Replayed requests do not create a new acceptance. Browser retry recovery retains only a random UUID and a digest of the submitted values in this tab's session storage, with an in-memory fallback; it clears after success. Attribution remains the existing controlled campaign identifiers, never raw page/referrer/query data.

## Future newsletter path and consent preservation

`/v1/newsletter` atomically records the explicit Shipping Notes request, source/locale, consent/notice versions and a Contacts outbox. The future site response says **request received, processing signup**, rather than claiming confirmation or mailbox delivery. Its analytics event is `newsletter_request_accepted`; existing Buttondown success still uses its existing event. Private operational acceptance/profile events are deduplicated in D1, with no contact identity or task text in analytics.

Resend Contacts are global. The adapter requires separately verified Shipping Notes Segment and Topic IDs, so new-contact creation carries only that segment/topic. It never sets global `unsubscribed: false`. Every matching existing Contact is preserved without any update, including global/topic opt-outs; an existing contact is not silently enrolled in a new topic. A new request does not reactivate it. A kit-only request, with either marketing choice, never enters the Contacts outbox. There is no Broadcast sender, CRM or dashboard.

To avoid email addresses in provider URLs, discovery uses `/contacts?limit=100` with opaque pagination IDs, up to ten pages; an incomplete scan fails closed. Only the matching requested contact's opaque ID is stored. Existing unrelated contacts are not imported. A timed-out create is retried through discovery first. Owner verification must confirm create-on-existing behavior and suppression preservation under concurrent requests before `RESEND_CONTACTS_VERIFIED` can be enabled. Provider double-opt-in / unsubscribe behavior and the actual Segment/Topic settings still require verification; a Contact create is never described as a confirmation email. The two historical Buttondown subscribers remain outside this D1/Resend integration, with no migration job.

## Retention, withdrawal and erasure

There is **no age-based purge** of kit requests, profiles, newsletter evidence or provider state. `RETENTION_MODE=until_deletion` is required for capture. Only expired 30-minute contexts and temporary two-hour rate counters are age-cleaned. Retention of provider email logs/backups is governed by the actual provider capabilities and must be covered by the reviewed privacy/erasure procedure; deleting a Contact does not claim to erase historical delivered email or vendor logs.

An operator first verifies the requester's identity and scope through an approved channel. Separate `SIGNUPS_ADMIN_TOKEN` authorization is mandatory for `/v1/admin/withdraw` and `/v1/admin/erase`; the ordinary site service credential cannot use them. The token must differ from the service token. All inputs are JSON request bodies, never email-in-URL links. These are operational boundaries, not public self-service endpoints or a dashboard.

- **Withdraw:** supply `email` and purpose `shipping_notes` or `kit_contexto`. D1 preserves the original true/false evidence while marking matching consent `withdrawn`; it cancels pending Contacts jobs. Shipping Notes withdrawal durably queues an `opt_out` for its Resend Topic using the opaque Contact ID, without changing other topics/global preferences. AI-choice withdrawal records the change only because this service never enrolls that choice. Transactional kit access/delivery remain independent.
- **Erase:** supply `email`. One batch queues provider cleanup and immediately deletes matching D1 signup requests and their profiles, contexts, delivery/contact jobs and operational events by foreign-key cascade. It removes the local provider mapping. A minimal rights job temporarily retains the address/opaque provider ID to finish requested provider cleanup; a pending job blocks new acceptance for that address. Processing waits two minutes for bounded in-flight provider calls, then deletes the Resend Contact by opaque ID. A 404 is already absent; other failures retain the retry job. Successful provider cleanup deletes that job too. Already in-flight/delivered email cannot be recalled.
- **Operate/review:** use aggregate queue counts and D1's private operator tools; do not log/export full rows in a shared terminal or analytics. Rights jobs retry independently of signup/delivery switches. They remain available when capture is disabled. Verify provider completion privately before telling a requester erasure is complete. Buttondown's two historical contacts and their deletion requests still need handling in Buttondown separately.

Provider-origin unsubscribe events are not automatically mirrored into D1 by an unverified webhook. Resend's Topic/global suppression remains authoritative and this code never overwrites it on repeat signup. Verify the actual provider unsubscribe behavior, operator rights procedure and any desired authenticated webhook integration before setting `DATA_RIGHTS_VERIFIED=true`. No privacy notice, identity-verification policy or legal wording is published by this change.

## Configuration and activation dependencies

| Location | Required inputs / switches |
| --- | --- |
| Worker binding | `DB` → `hecsanchez-signups`, ID `06a39d17-614c-4c43-987d-6009414bfaee` (WNAM). Parent applied `migrations/0001_signups.sql`; migration ledger and empty tables verified remotely. |
| Worker secrets | Parent attached dedicated `RESEND_API_KEY`, random `SIGNUPS_SERVICE_TOKEN` and distinct `SIGNUPS_ADMIN_TOKEN` (each token ≥32 chars). No raw values belong in config, logs or Git. Actual recipient/Contacts operations remain untested. |
| Worker common gates | `SIGNUPS_ENABLED=true`, `PRIVACY_REVIEWED=true`, actual version identifier `PRIVACY_VERSION`, `RETENTION_MODE=until_deletion`, `DATA_RIGHTS_VERIFIED=true`. All verification must reflect real reviewed behavior. |
| Kit delivery | `RESOURCE_ENABLED=true`, verified `RESEND_FROM` / `RESEND_REPLY_TO`, attached API key with sending permission. `VERIFIED_SENDER=true` now records parent-verified domain/sending evidence, with open/click tracking disabled. Actual message delivery remains untested. |
| Qualification | Optional `QUALIFICATION_ENABLED=true` only after write-only context/rights behavior is verified. |
| Future newsletter | `NEWSLETTER_CAPTURE_ENABLED=true`, `RESEND_CONTACTS_VERIFIED=true`, API permission for Contacts/Topics. Configured Segment `bd4ec207-7fc6-4596-9ab4-8d563fb7340f` and Topic `da0eabb0-3d55-4834-bb46-a546f94d0edf` are both Shipping Notes; public Topic defaults `opt_out`, description `Artículos y notas de Hec Sánchez.` No contacts were read or migrated during their provisioning; no Buttondown credential is needed by the Worker. |
| Private site proxy | Future Vercel `SIGNUPS_WORKER_URL` (HTTPS origin only) and matching `SIGNUPS_SERVICE_TOKEN`. `SIGNUPS_NEWSLETTER_PROVIDER=resend` selects the new newsletter path; absent means historical Buttondown with `BUTTONDOWN_API_KEY`. Unknown values do not activate Resend. |
| AI publication | Keep `aiConfig.journey=draft`, kit unavailable, privacy null and delivery integration null now. Later supply accurate resource content/notice, reviewed `cloudflare-d1-resend-v1` integration and required environment; build validation refuses incomplete publication. Separate site publication authorization is required. |

The deployed service URL is recorded above for operations; it is not configured in the website proxy. Wrangler enables the Worker's own `workers.dev` endpoint, disables preview URLs and observability, and has no public-website routes. Its five-minute schedule only expires contexts/counters and retries explicitly authenticated rights jobs while capture is disabled. The verified empty database contains no work to email, enroll, import or erase. This disabled deployment does not change website behavior. Do not deploy the public website or set public AI navigation as part of Worker/D1-only authorization.

The parent completed the initial migration, protected secret attachment and Worker-only deployment. The commands below are the operational procedure for a separately authorized update; they are not outstanding setup tasks or an instruction to rotate existing secrets:

```sh
# Requires reviewed Cloudflare credentials; these commands change the remote service.
wrangler d1 migrations apply hecsanchez-signups --remote --config workers/signups/wrangler.jsonc
# Attach each dedicated secret with Wrangler's protected secret-input flow:
wrangler secret put RESEND_API_KEY --config workers/signups/wrangler.jsonc
wrangler secret put SIGNUPS_SERVICE_TOKEN --config workers/signups/wrangler.jsonc
wrangler secret put SIGNUPS_ADMIN_TOKEN --config workers/signups/wrangler.jsonc
wrangler deploy --config workers/signups/wrangler.jsonc
```

Select only the required attached Cloudflare secret references for those commands. Use the dedicated protected secrets; do not paste values into command text, Git or shared logs. Keep all capture flags false until the remaining activation checks are complete. The website proxy's `SIGNUPS_WORKER_URL` remains unset until a later, separately authorized site release.

Expected boundary behavior for future regression checks: a JSON POST to `/v1/resource` or `/v1/newsletter` with `Origin: https://hecsanchez.com` returns **503/unavailable** with private/no-store caching while collection is disabled; a foreign/missing Origin returns **403**, GET with an allowed Origin returns **405**, and allowed preflight returns **204** with exact-origin CORS. An ordinary service token against an admin operation returns **403**; a correctly admin-authenticated erase request with an empty body returns **400** without creating a job. The actual initial checks are listed in the deployment evidence above. Do not test with a real recipient or valid erase body unless that operation is explicitly intended; do not enable capture to make a health check succeed.

Activation still requires approved privacy wording/destination and its actual `PRIVACY_VERSION`, reviewed kit contents/prerequisites and independent ZIP access, real D1 acceptance/atomicity/foreign-key behavior and uncertain-request replay, a sandbox transactional delivery, actual Contacts create/concurrency/suppression behavior, and verified unsubscribe/withdrawal and completed erasure procedures. Domain/sender readiness, dedicated Segment/Topic provisioning and the initial origin/admin gates are already verified; those do not replace these remaining checks. Keep `SIGNUPS_ENABLED`, `RESOURCE_ENABLED`, `NEWSLETTER_CAPTURE_ENABLED`, `QUALIFICATION_ENABLED`, `PRIVACY_REVIEWED`, `DATA_RIGHTS_VERIFIED` and `RESEND_CONTACTS_VERIFIED` false until their dependencies are satisfied. Use owner-approved sandbox recipients and do not contact historical subscribers as a test. Public website/AI publication requires separate authorization.

## Local verification

Use the project's Node version (≥22.12; Node 22.12 tests enable experimental SQLite) and existing dependencies:

```sh
npm test
npm run check
npm run test:browser
npm run test:build
WRANGLER_SEND_METRICS=false wrangler deploy --dry-run --config workers/signups/wrangler.jsonc --outdir .context/signups-worker
git diff --check
```

Tests execute the checked-in schema and production queries with real local SQLite through a thin D1-shaped adapter; they verify transaction rollback, deduplication, payload binding, request limits, delivery ownership/failure/access, context/profile restrictions, provider uncertainty/preservation, withdrawal and erasure. They are not a substitute for remote D1 and provider verification. Browser tests mock only the API responses, exercise every ES/EN newsletter placement, and verify retry-key recovery after reload and truthful accepted wording. Existing AI draft/accessibility and Yepkey tests remain included. No new runtime dependency or provider SDK is needed.

Final local results for implementation commit `ba5d8b4` (5 November 2026): **30/30** Node/SQLite tests, **13/13** browser tests, **5/5** production artifact tests, a 49-page production build, Astro/TypeScript with **0 errors and 0 warnings** (13 existing hints), Wrangler 4.150.0 dry-run bundle (**26.87 KiB**, 7.41 KiB gzip), and `git diff --check` all passed. The parent subsequently completed the disabled Worker/D1 deployment and checks recorded above; no website deployment or live recipient operation occurred. The deployment-record follow-up changes documentation only.

## Provider references reviewed

Official Resend documentation reviewed on 5 November 2026: [Contacts](https://resend.com/docs/dashboard/contacts/introduction), [create](https://resend.com/docs/api-reference/contacts/create-contact), [list](https://resend.com/docs/api-reference/contacts/list-contacts), [update Topic preferences](https://resend.com/docs/api-reference/contacts/update-contact-topics), [delete Contact](https://resend.com/docs/api-reference/contacts/delete-contact), and [email idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys). These documents establish API contracts, not account readiness or a completed live integration test.