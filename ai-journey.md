# IA para negocios — implementation brief

Source of truth: Hec's Website Build Requirements v1.0 (4 November 2026). This brief supersedes conflicting AI scope/design in `prd.md`; the existing professional site remains intact. The original brief authorized local implementation only; the later Worker/D1 authorization and deployment are recorded below. Public website publishing remains unauthorized.

**5 November follow-up:** [Worker/D1 signup implementation](./workers/signups/README.md) now provides durable persistence, transactional Resend delivery and future newsletter Contacts under Hec's later decisions. That document supersedes this brief's earlier provider-selection, no-asset-URL and adapter-not-implemented notes. The parent deployed the Worker and migrated D1 with protected secrets; capture/privacy/data-rights/Contacts gates remain off and AI stays draft. The supplied resource URL is the v1.1 R2 ZIP; contents/prerequisites, privacy and live acceptance/provider/rights verification remain activation dependencies. No public website deployment or migration of the two historical Buttondown subscribers occurred. Records are retained until deletion is requested, with no age purge.

## Inspection and decisions

- Clean `main` at start; no user changes or applicable AGENTS files found.
- Astro 6 static output, manual Spanish/English routes, Tailwind 4, MDX content collections, Vercel serverless API. Reuse cream/burgundy tokens, Caslon headings, Inter body, portrait, and shared layout.
- Buttondown `/api/subscribe` handles the existing newsletter only. It does not establish durable, idempotent resource requests, transactional delivery, separate AI consent, or qualification. Do not reuse it as fake kit acceptance or modify existing preferences.
- Plausible is present; AI measurement uses explicit sanitized URLs/properties. No persistent attribution storage is introduced; first/latest touch use current document memory only.
- Contact has an email link and an explicitly unconfirmed Cal.com slug. No verified receiving endpoint or privacy policy exists in the repository. Assessment stays hidden. Professional contact remains untouched.
- No real kit or approved client demonstration exists. AI stays draft, kit unavailable, demonstration illustrative, workshop hidden. Development may render draft routes; production builds omit them entirely (normal 404). No query parameter unlocks drafts.
- No test, typecheck, or lint scripts existed. `npm ci` and the unchanged baseline production build passed (49 pages). No user changes overlapped this work.

## P0 backlog

1. Done: typed capability configuration, fail-closed build validation and publication-aware entries/sitemap.
2. Done: `/es/ia/`, `/es/ia/gracias/`, exact fictional quotation, shared inline unavailable form, neutral success route and existing visual identity.
3. Done as boundary: server request/context/profile interfaces and validation; live requests reject while no real provider is registered. Fictional config and browser event sink exist only in tests. Durable integration remains a publication dependency.
4. Done: bounded campaign parsing, precise sanitized analytics, metadata/social preview, focus/reflow/reduced-motion handling.
5. Done: focused checks, production regression, browser/axe review at 320/390/768/1440, screenshots and a throttled mobile lab.

## Publication dependencies

- Final Kit Contexto asset, version, accurate contents, formats and prerequisites; a tested stable download/hosted URL.
- Durable request system with idempotency and preference preservation; transactional delivery, verified sender/reply destination, and delivery test. Existing Buttondown capability must be evaluated before choosing an adapter. Do not add a new vendor by default.
- Owner-approved appropriate privacy destination covering actual data use and optional AI consent.
- Verified assessment receiving mechanism. A mailto click or booking link does not prove an accepted inquiry.
- Optional qualification requires an expiring, action-scoped server context and private persistence before enabling.
- Workshop remains only a configuration boundary; P1 is not selected.

## Completion evidence

Implemented and reviewed as a safe draft, **not a launchable free funnel**. No deployment, production publishing, email delivery, kit creation, waitlist or new provider was performed.

### Current capability states

| Capability | State and actual behavior |
| --- | --- |
| AI journey | `draft`; routes and Spanish entries render in Astro development only. Production output omits both routes and entries. |
| Kit | `unavailable`; labelled disabled form receives no data. No real file or download is claimed. |
| Demonstration | `illustrative`; exact COT-DEMO-001 fixture, visible fictional label in hero and full example; freight, validity and final total remain null/unknown. |
| Assessment | `hidden`; ordinary existing contact links remain. Read-only browser review loaded the Cal.com event, but accepted inquiries were not verified, and the source still flags the slug for confirmation. |
| Workshop | `hidden`; no page, interest collection, checkout, teaser or pricing. P1 states are typed boundaries and deliberately fail validation until separately implemented. |
| Request/delivery/profile provider | Unconfigured (`null`); all three real API handlers reject draft requests with 404 and `Cache-Control: private, no-store`. No acceptance or delivery is simulated. |
| Qualification | UI and API boundary prepared; hidden without validated context and a real provider. Never a condition of resource access. |
| Analytics | Off in development and AI draft. Existing Plausible is reused for production with sanitized locations and referrers. |

### Routes and principal files

- `src/pages/es/ia/[...page].astro`: `/es/ia/` and `/es/ia/gracias/` through conditional static paths. Unknown/P1 paths have the normal 404. No public query parameter reveals drafts. No `/en/ia` route or alternate is advertised.
- `src/components/ai/`: reduced header, landing copy, exact fictional example, one shared resource form, neutral access page and gated optional qualification. Published copy is conditional on a real available asset; default CTAs say **Ver el Kit Contexto** rather than promising an unavailable download.
- `src/features/ai/config.ts`: editable typed capabilities and readiness validation; `provider.ts` defines the private integration contract and explicitly registers no adapter; `server.ts` validates bounded inputs, server-controlled resource/version/source, consent, same-origin requests, profile fields and idempotency fingerprints.
- `api/ai-resource.ts`, `api/ai-context.ts`, `api/ai-profile.ts`: Vercel boundaries. A future provider must establish durable ownership before acceptance and validate the opaque action context. Context is carried in a Secure/HttpOnly/SameSite=Strict cookie scoped to `/api/`, with a 30 minute browser lifetime; the provider must independently enforce purpose/expiry. No personal identity or prior profile is returned.
- `campaign.ts`, `analytics.ts`, `SiteAnalytics.astro`: controlled attribution, event meanings and Plausible location/referrer sanitization. Automatic form, outbound and download capture is disabled; explicit existing site events continue working.
- `Nav.astro`, `HomePage.astro`: Spanish entries visible in development or after publication; existing professional hero, service CTAs, projects, writing, newsletter and language routing are retained.
- `BaseLayout.astro`, `src/styles/ai.css`: shared tokens, metadata, safe AI canonical, no nonexistent language alternates, focus handling, mobile field list/desktop table, contrast adjustments scoped to the AI footer and key controls at least 44px high. Fonts are preloaded only for AI pages.
- `astro.config.ts`: existing config converted from `.mjs` to import typed readiness rules; sitemap excludes all draft AI pages and always excludes success/P1 pages.
- `public/og/ia.svg` and `ia.png`: simple section title/identity card using existing colors and serif treatment (no prior social template existed beyond the portrait). PNG is the social URL; SVG is the editable source. No new portrait or generated decorative image.
- `tests/`, `playwright.config.ts`: focused Node, production-artifact and browser/accessibility checks. Test fixtures are not imported by production code.

### Review commands and preview

Use Node >=22.12 and the existing package manager:

```sh
npm ci
npx playwright install chromium
npm test
npm run check
npm run test:browser
npm run test:build
npm run dev
```

Open `/es/ia/` and `/es/ia/gracias/` on the local Astro development server (normally port 4321). `npm run preview` serves the production build, which correctly omits draft AI pages. Astro development does not execute Vercel API functions; default draft behavior does not call them.

The optional private workspace service could not establish its sandbox runtime, so no attached browser preview is available. This is a review-tool limitation; the local development workflow and browser tests work. No public preview or deployment was created.

### Acceptance mapping and verification (4 November 2026)

| Requirement group | Check and result |
| --- | --- |
| Baseline and existing site | Baseline build passed: 49 pages. Final build passed: 49 pages. Three production tests preserve ES/EN home, projects, writing, services, contact, feeds and newsletter markup; draft routes/nav/sitemap remain absent. Nine existing routes also returned 200 in browser review. Existing newsletter API and preferences code are unchanged; live subscription/booking operations were not sent. |
| Safe configuration and API | Ten Node tests passed: publication dependencies, unavailable handlers, method/data boundaries, input size, email/plus suffix, consent types, server-owned destinations, payload-bound fingerprints, profile field restrictions, campaign replacement, sanitization and absent fictional values. No production adapter is available to verify real persistence or deliveries. |
| Responsive/accessibility | Eight browser tests passed, including widths 320/390/768/1440, no page overflow, visible fictional labels, real portrait loading, correct canonical/noindex/alternates, anchor focus, keyboard activation, skip link, reduced motion, neutral direct access, and no draft API or Plausible traffic. Axe WCAG 2 A/AA, 2.1 AA and 2.2 AA tags found zero violations across the AI header/content/footer at all four widths. |
| Event meaning | Browser-only published-click sink verifies controlled `kit_cta_click`, unknown creative for `bio`, and exclusion of personal/unexpected query values. Clicking or loading the success route never emits accepted-request/profile/purchase events. |
| Types and code hygiene | `npm run check` passed: Astro diagnostics and TypeScript, zero errors/warnings (13 existing content/contact hints). `git diff --check` passed. No lint configuration existed; no formatter/linter was invented for this release. |
| Performance lab | Chromium 156, Astro dev preview, cold browser cache, 390×844 CSS px, 4× CPU slowdown, 150ms latency, 1.6Mbps down / 750Kbps up. Initial LCP 2028ms and CLS 0.1139568; after existing font preloads and stable stacked mobile actions, final LCP 2016ms and CLS 0.0470212. No failed resource hosts. Dev resource transfer about 1.41MB includes Vite tooling; this is not a production-size measurement, field INP result or Core Web Vitals certification. |
| Visual review | Reviewed final desktop and mobile page, fictional output, unavailable form, neutral success and social image. Screenshots exist at all four widths. |

Manual review covers readable labels, heading hierarchy, native email/checkbox controls, visible keyboard focus, mobile reflow, retained fictional labels and the distinction between a neutral route and a real acceptance. Cross-browser screen-reader testing and real-device 200%/400% zoom are not claimed. The 320px browser check verifies equivalent narrow reflow; test supported assistive technologies before publication.

Screenshots (gitignored local files): `.context/screenshots/ia-{320,390,768,1440}.png`, `form-unavailable-{320,390,768,1440}.png`, and `gracias-{320,390,768,1440}.png`. Mobile lab data and shift sources are in `.context/mobile-lab.json`. Accepted/download/error delivery screenshots are deliberately absent because no real acceptance or asset exists.

### Attribution and measurement definitions

Allowed identifiers are `utm_source=tiktok|instagram`, `utm_medium=organic_social`, `utm_campaign=ia_30_dias`, and `utm_content=bio|w0[1-5]_d0[1-7]_[ab]`, with maximum 100 characters per value. Unknown fields, personal data, `utm_term`, click IDs and arbitrary referrers are discarded. A valid source is required for a coherent campaign. A bio link retains `bio` and has unknown creative. Referrers are reduced to allowlisted TikTok/Instagram origins; all other referrers are omitted. The sanitizer applies to automatic pageviews and custom event locations as well as custom properties, including professional pages reached from this flow.

First/latest snapshots are held in current document memory only; there is no cookie/localStorage/sessionStorage tracking, cross-device identity or fingerprinting. First valid campaign survives subsequent direct/anchor navigation within the document. Each explicit valid campaign replaces latest as a whole without inheriting an older creative. Both snapshots are attached to the request command for private provider persistence. Page reloads and separate documents start a new attribution scope; do not infer creative across them. A longer consent-compatible retention window is a separate publication/measurement decision, not silently introduced by this implementation.

| Event | Exact meaning and current readiness |
| --- | --- |
| `ai_landing_view` | Eligible production view of a published landing page; never draft or success views. Includes locale, environment and bounded latest campaign. |
| `kit_cta_click` | Activation of header/hero/closing resource CTA; includes placement and configured resource ID. Not acceptance or resource use. |
| `kit_access_click` | Activation of an actual provider-returned, server-controlled asset link; resource/version, download/hosted kind and web placement. Requires real access. No fabricated email click measurement. |
| `kit_request_accepted` | Must be recorded once in the durable provider log only after ownership of the real resource request. Not implemented by a page view or client timer. Requires the adapter. |
| `lead_profile_saved` | Must be recorded once after private request-attached answers persist. No task text in analytics. Requires the adapter. |
| `assessment_cta_click` | Only the professional-help link click when assessment is verified/enabled. Not a booked call or accepted inquiry. |
| `assessment_inquiry_accepted` | Only verified contact acceptance; no current source emits it. |
| Workshop events | Not implemented or emitted. No P1 operations exist. |

Use Plausible's existing custom event goals/exports for eligible views and clicks. Use the eventual provider's deduplicated UTC request log for accepted requests, unique contacts, deliberate repeat requests, profiles and delivery state. Report access clicks as clicks, profile role share among completed profiles, and profile response rate among accepted requests. Review task text privately. Do not divide all-traffic operational counts by analytics-only visits as a universal conversion rate. Report coherent date windows/cohorts, use America/Mexico_City for presentation, and never infer budget, authority, completed use or audience validation from downloads. No custom dashboard was added, and no live campaign counts exist yet.

### Configuration and enabling instructions

There are no AI environment flags that bypass publication rules. `BUTTONDOWN_API_KEY` remains the existing server-only Shipping Notes subscription credential and is not used for kit requests. No new provider key, sender or recipient was invented. `AI_REVIEW_URL` optionally points browser tests at an already running local review server; `CI` controls Playwright server reuse. Secret values are not included in source or this document.

1. Supply and review the real kit. Set `kit` to `available` in `config.ts` with its stable identifier/version/HTTPS URL, actual access kind, formats, contents and prerequisites. The URL must work independently of qualification or signup sessions, including email on another device. Adapt landing FAQ/delivery wording to real requirements. A future replacement increments the version and updates the same server-owned configuration, with prior promised access preserved by the provider.
2. Implement/register `ResourceProvider` using the existing operational system only after evaluating its actual capabilities. No provider has been selected or proven suitable. It must atomically bind idempotency keys to email/resource/version/consent, reject mismatches, preserve all existing opt-outs/subscriptions, rate limit, separate transactional delivery from explicit AI marketing enrollment, deduplicate enrollment and accepted events, own retries, and expose accurate queued/failed/confirmed states. Use a verified existing sender/reply destination. Required email subject is **Tu Kit Contexto** and link label **Acceder al kit**; use the brief's requested-resource body, updated to the actual asset.
3. Supply an appropriate owner-approved privacy page and set `privacyHref`. Confirm actual provider data uses and consent/confirmation behavior before live capture. No legal policy or entity details have been fabricated.
4. Complete provider integration verification with fictional sandbox recipients: persistence, intentional repeats versus retried uncertain submissions, double clicks, reload recovery, key mismatch, existing subscribers, unsubscribed contacts, explicit consent and confirmation, delivery failure after persistence, independent durable resource access, expired/forged context, and write-only qualification. The current browser key is held only in the mounted form; integration must resolve uncertain requests across reloads before publication. The interface and boundary tests do not prove those provider guarantees.
5. After those checks pass, set `deliveryIntegration` with the real identifier/tested sender status, register the adapter and set `journey: 'published'`. Build validation refuses publication without these inputs. Repeat the focused checks and obtain separate authorization for production publishing. The generated landing becomes indexable and gains nav/home/sitemap entries; success remains noindex and outside sitemap.
6. For assessment, verify the actual existing contact receiving mechanism and its topic/context support, then set `assessment` to `inquiry` with the existing Spanish destination. Extend the actual form minimally if a topic is needed; do not claim accepted inquiry events from mailto/booking clicks.
7. Update copy in `AiLanding.astro`, resource descriptions in `config.ts`, and fictional data in `example.ts`. A verified real demonstration also requires approved source/output, scope and permissions; its rendering must be implemented before changing demonstration state. Regenerate PNG from the editable SVG if changing the social card. Keep the Typekit preload URL aligned with the existing kit's regular font if its configuration changes.
8. Keep workshop `hidden`. Enabling it requires explicit P1 selection, actual confirmed terms/content/fulfillment, separate interest consent or verified hosted checkout and purchase handling, implementation and tests. Flipping the type alone intentionally fails the build.

### Remaining limitations

The visual draft, request/component boundaries, safe rejection, attribution sanitization, metadata and publication omission are implemented and verified in preview/build tests. The active live form, durable persistence/idempotency, consent preference preservation in a provider, email delivery, real download, accepted success state and request-attached qualification are not production-ready or end-to-end verified. These require the concrete inputs and integration work above. Assessment acceptance and P1 remain unavailable. No work has been represented as a launchable kit funnel.

Verification tooling adds Astro check, TypeScript, Playwright and axe as development dependencies. An explicit Vite 7 development peer aligns Tailwind's supported Vite 5–8 range with Astro's Vite 7 and removes the pre-existing split Vite 8/7 type incompatibility; final build and type checks pass with a single Vite 7.3.7. The original locked dependencies reported 33 audit findings on baseline install; the aligned tree reports 32. Dependency-wide audit remediation is outside this contained feature and was not performed.