# Yepkey.io portfolio update

Requested by Hec: replace the current Zaplink portfolio presence with Yepkey.io and use real screenshots. Implemented on top of `c33e1e7985995d0edfa417936a89f206c069feda`; the AI journey remains draft and unchanged. No deployment or push is authorized.

## Evidence and editorial decisions

- `https://yepkey.io/` returned 200 on 5 November 2026. Its current heading is “Auth made simple. Powered by WhatsApp.” It presents passwordless WhatsApp sign-in using a one-time code, a Next.js example, documentation and public console links.
- `/home/hecsanchez/ventures/zaplink/web/src/components/HeroSection.tsx` matches the live Yepkey page. `AuthPreview.tsx` confirms Acme, its phone number, code and signed-in state are hard-coded illustrative content. Screenshots are explicitly captioned as the public site and its fictional example. They do not establish a real authentication result or customer outcome.
- The existing portfolio entry and Hec's dated articles already say he built this product and its earlier integrations. The owner explicitly requested the current-name replacement. The local core README, application directories and package manifest substantiate the historical NestJS/Prisma/PostgreSQL/Redis/BullMQ/React/Vite/Nx implementation. The page frames that architecture as the implementation he built, rather than claiming a newly verified production deployment.
- Current homepage/project/service/about/meta labels use Yepkey.io/Yepkey. Dated articles introduce “Yepkey (then called Zaplink)” / “Yepkey (entonces llamado Zaplink)” at the first mention and use Yepkey for subsequent references, with current destination links. The explicit former-name note preserves the historical context and the original dates remain intact.
- No new conversion, adoption, performance, security guarantee, customer relationship, price or SDK availability claim was added. In particular, the live Next.js example is described as an example on the site; package publication and actual authentication are not asserted as verified.

## Screenshots and processing

Source URL for both selected captures: **https://yepkey.io/**, no query strings, no login, no form submission. Chromium/Playwright, device scale factor 1 and reduced motion enabled to settle the site's illustrative animation. The hero section was captured directly, including its existing navigation. No private console, customer data, browser chrome, cookie banner, composite or invented screen is included. Incidental Google Analytics requests were blocked during capture.

| Asset | Source viewport | Capture time (UTC) | Actual output | Processing |
| --- | --- | --- | --- | --- |
| `public/projects/yepkey/hero.webp` | 1440 × 1000 CSS px | 2026-11-05T16:22:47.881Z | 1440 × 1000; 111,106 bytes | Public homepage hero-only PNG capture → WebP quality 82, effort 6; no added/changed UI. |
| `public/projects/yepkey/mobile.webp` | 390 × 844 CSS px | 2026-11-05T16:22:49.337Z | 390 × 1488; 49,688 bytes | Full mobile hero section (extends below viewport) → WebP quality 82, effort 6; no added/changed UI. |

Raw captures and machine-readable source metadata are gitignored in `.context/yepkey-source/`, with the capture script at `.context/yepkey-capture.mjs`. The selected raw inputs are `desktop-hero.png` and `mobile-hero.png`; other viewport/illustration captures are review-only. The existing `ProjectFigure`/`ProjectCard` dimension reader resolves these WebP files, reserves their intrinsic space, loads lower images lazily and caps portrait height. Both locales have accurate alt text and dated captions. The hero also supplies card previews and the project social image. Legacy `public/projects/zaplink/hero.jpg` has been replaced with the same current desktop capture (JPEG quality 85) so the old image URL also serves Yepkey branding. It has no current page references.

## Routes and files

- Current: `/es/proyectos/yepkey/`, `/en/projects/yepkey/`, shared project ID `yepkey` and external URL `https://yepkey.io/`.
- Legacy: `/es/proyectos/zaplink` and `/en/projects/zaplink`, including slash requests, permanently redirect to the corresponding current route. Astro supplies 301s in development and redirect HTML for static hosts; Vercel `permanent: true` configures real 308s for any separately authorized deployment. Only the current routes enter the sitemap. Old project-index `#zaplink` fragments remain valid invisible aliases.
- Main edits: `src/data/projects.ts`, ES/EN dictionaries, six dated blog posts, project route social alternatives, project-index anchor alias, Astro/Vercel redirects, `public/projects/README.md` and the two selected assets.
- Focused checks: browser project/image/redirect tests in `tests/browser/yepkey.spec.ts`; production artifact and redirect checks extend `tests/production.test.ts`.

## Verification

- `npm test`: 10/10 Node tests passed.
- `npm run check`: Astro reported 0 errors and 0 warnings (13 existing hints); TypeScript passed.
- `npm run test:browser`: 11/11 browser tests passed, including the existing AI draft checks. Both project locales were reviewed at 320, 390, 768 and 1440 CSS pixels, with loaded images, no horizontal overflow, correct metadata, historical links and permanent legacy redirects.
- `npm run test:build`: production build succeeded and 4/4 production artifact tests passed, including image output, canonical URLs, sitemap exclusions and redirect configuration.
- `git diff --check`: passed.

Final portfolio review screenshots are gitignored at `.context/yepkey-review/es-{320,390,768,1440}.png` and `.context/yepkey-review/en-{320,390,768,1440}.png`. Desktop and mobile captures were visually inspected.

A case-insensitive scan of all tracked text leaves the former name only in the six dated articles' explicit historical notes (including two descriptions), invisible route/fragment compatibility identifiers, their tests, and migration/source documentation. A second scan of 53 generated HTML/XML files, including feeds and embedded metadata, classified all occurrences as historical notes (18) or compatibility references (12), with no unclassified occurrences. The legacy image filename remains compatible and its pixels now show Yepkey.

Local review: `npm run dev`, then the current ES/EN project routes. No external preview, account operation, deployment, DNS change, secret use or live authentication test is part of this change. A successful screenshot capture verifies the public presentation only.