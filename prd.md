# PRD: hecsanchez.com Rebuild

## Overview

Personal site for Hector Sánchez — fractional CTO and technical leader. The site's single job is to convert visitors (primarily from LinkedIn and referrals) into booked discovery calls. Target audience: LatAm founders and CTOs at 5–50 person companies (primary), US startup founders (secondary).

## Tech Stack

- **Framework**: Astro (latest stable)
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript
- **Hosting**: Vercel
- **Domain**: hecsanchez.com
- **Analytics**: Vercel Analytics or Plausible
- **i18n**: @astrojs/starlight i18n or manual `[locale]` routing — Spanish default (`/es`), English (`/en`). Language toggle in nav. Detect browser locale on first visit.
- **Content**: Astro Content Collections for blog posts (MDX) and project data
- **Interactive islands**: Use `client:load` or `client:visible` only where needed (Calendly embed, mobile nav toggle). Everything else is zero-JS static HTML.

## Design Direction

- Minimalist, dark-mode-first (light mode toggle optional but not required for v1)
- No stock photos. No carousels. No animations beyond subtle transitions.
- Typography-driven — Lora (serif) for content, Inter (sans-serif) for UI. Large headings, generous whitespace, high contrast. The serif gives blog posts and long-form content an editorial, trustworthy feel.
- Monochrome palette with warm plum-black base (`#332731`) as primary background. Accent color TBD (suggestions: gold/amber `#D4A843` or muted teal `#5B9EA6` — Hec to pick). Text: off-white (`#F5F0F3` or similar warm white that complements the plum base).
- Mobile-first responsive. Must look sharp on iPhone Safari.
- Reference vibe: leerob.io, rauno.me, linusrogge.com — developer-founder aesthetic, not corporate consultant

## Sitemap & Page Specs

### 1. Home (`/`)

**Purpose**: Hook + credibility + CTA in under 10 seconds of scrolling.

**Sections (top to bottom)**:

1. **Hero**
    - Name: "Hec Sánchez"
    - Title: "Fractional CTO"
    - One-liner value prop (ES): "Ayudo a startups a escalar su ingeniería sin contratar un CTO de tiempo completo"
    - One-liner value prop (EN): "I help startups scale their engineering without a full-time CTO hire"
    - Primary CTA button: "Agendar llamada" / "Book a call" → links to `/contact`
    - Secondary link: "Cómo trabajo" / "How I work" → `/how-i-work`

2. **Social proof strip**
    - Single horizontal row of 4–6 client/company logos (grayscale, hover to color)
   - Companies: Camino Real, Pluto TV, Lala, cabify, airbus, freightliner
    - Use SVG logos where possible, PNG fallback

3. **What I do — 3 cards**
    - Card 1: "Estrategia técnica" / "Technical Strategy" — Architecture decisions, build vs buy, tech stack selection
    - Card 2: "Liderazgo de equipos" / "Engineering Leadership" — Hiring, processes, team structure, code review culture
    - Card 3: "Ejecución" / "Hands-on Execution" — I write code. I ship. I don't just advise.
    - Each card: icon (Hugeicons) + title + 1-sentence description. No links.

4. **Brief bio blurb**
    - 2–3 sentences max. Photo optional (if included, use a professional headshot, not a stock image placeholder — leave an `<Image>` component with a `/public/headshot.jpg` path).
    - "16 años construyendo software. Staff Engineer en una consultora de EEUU. He lanzado productos en fintech, healthtech e insurtech. Vivo en Puebla, México."
    - EN: "16 years building software. Staff Engineer at a US consultancy. I've shipped products across fintech, healthtech, and insurtech. Based in Puebla, Mexico."

5. **Testimonials** (2 max, not a carousel)
    - Quote, name, title, company
    - Pull from existing:
        - Tania Gomez, Product Manager @ Konfio
        - Nate Hershey, VP Engineering @ Fresh Tri

6. **Bottom CTA**
    - "¿Listo para hablar?" / "Ready to talk?"
    - Same CTA button as hero

### 2. How I Work (`/how-i-work`)

**Purpose**: Qualify leads and set expectations before the call.

**Sections**:

1. **Engagement model**
    - Format: simple text, not a pricing table
    - "8 horas al mes de trabajo técnico práctico + 2 llamadas de seguimiento"
    - "Compromiso mínimo: 3 meses"
    - "Máximo 2 clientes simultáneos — atención dedicada"
    - Pricing: Do NOT show pricing on the site. Discuss on call.

2. **Who this is for**
    - Bullet list (keep it to 4–5 items):
        - Startups de 5–50 personas sin CTO
        - Fundadores técnicos que ya no pueden hacer todo
        - Equipos con producto en producción pero sin dirección técnica clara
        - Empresas que necesitan auditar su arquitectura antes de escalar

3. **Who this is NOT for**
    - 2–3 items:
        - Proyectos que necesitan un equipo completo de desarrollo (→ refiero a mi consultora)
        - Empresas que buscan solo un consejero sin ejecución
        - Ideas sin validar que necesitan un MVP (→ puedo referirte)

4. **How a typical engagement looks** (timeline)
    - Month 1: Audit — codebase review, architecture assessment, team evaluation, roadmap
    - Month 2: Execute — implement highest-impact changes, establish processes
    - Month 3+: Sustain — ongoing leadership, hiring support, scaling decisions
    - Render as a simple vertical timeline or 3-step layout, not a Gantt chart.

5. **CTA**: "Agendar llamada" / "Book a call"

### 3. About (`/about`)

**Purpose**: Build trust and human connection.

**Content** (single page, no tabs):

- 16 years in software engineering
- Ran two software agencies (2014–2017, 2021–2025)
- Currently Staff Engineer and Head of Engineering at a US software consultancy (Nolte)
- Specializes in regulated industries: insurtech, healthtech, fintech
- Based in Puebla, Mexico — married, three kids
- Interests (one sentence): rower, guitarist, runner training for a half marathon
- LinkedIn link (prominent), GitHub link (if public), Twitter/X (optional)

**Tone**: First person, conversational, no corporate speak. Like talking to a friend who happens to be very good at engineering.

### 4. Case Studies (`/work`)

**Purpose**: Show range and execution — "I don't just advise, I build."

**Structure**: Grid of cards on the index page. Each card links to a detail page.

**Each project detail page**:
- Project name + one-line description
- **What it is**: The product and who it's for
- **What I built**: Architecture, key technical decisions, my role
- **Stack**: Tech tags at bottom (small, muted)
- Screenshot or product image if available (optional for v1, leave `<Image>` placeholder)

**Projects** (Hec to flesh out descriptions):

1. **Alilio** — AI-powered WhatsApp ecommerce platform for sales and marketing automation. Built the product end-to-end.
2. **Camino Real Booking App** — Mobile app for hotel bookings, built under Happy Software agency. Native mobile experience for a legacy hospitality brand.
3. **HeyJimmi CRM** — CRM platform for local businesses. Currently in production with paying clients on monthly retainers.
4. **Lomas News** — Community publishing platform for Lomas de Angelópolis. Built under HeyJimmi.
5. **Grace Academy** — Publishing/content platform. Built under HeyJimmi.
6. **EdTech Platform** — Teachable-style course platform. Full LMS with enrollment, content delivery, and payments.

**Note for Claude Code**: This is a portfolio page, not a case study page. Frame each project as "here's what I shipped" rather than "here's a client engagement." The tone is builder, not consultant.

### 5. Contact (`/contact`)

**Purpose**: Convert to booked call.

**Content**:
- Heading: "Hablemos" / "Let's talk"
- Subtext: "Agenda una llamada de 30 minutos. Sin compromiso, sin pitch de ventas — solo una conversación para ver si tiene sentido trabajar juntos."
- **Calendly embed** (or Cal.com) — full-width, inline, not a popup. Use `<iframe>` or their React component.
    - Placeholder URL: `https://calendly.com/hecsanchez/30min` (Hec to replace)
- Below the embed: "¿Prefieres escribirme? → hec@hecsanchez.com" with a `mailto:` link
- LinkedIn icon link

### 6. Blog (`/blog`)

**Purpose**: Build topical authority in regulated industries → drive organic traffic → convert to discovery calls.

**Index page** (`/blog`):
- Simple reverse-chronological list of posts — title, date, tag(s), 1-line excerpt
- Filter by tag (show all by default)
- Tags: `insurtech`, `healthtech`, `fintech`, `engineering-leadership`, `latam`
- No pagination needed for v1 (< 20 posts). Add when needed.

**Post detail page** (`/blog/[slug]`):
- Content authored in MDX files via Astro Content Collections (`src/content/blog/`)
- Rendered natively by Astro's MDX integration (`@astrojs/mdx`)
- Layout: single column, max-width ~680px, generous line-height
- Post metadata: title, date, tags, reading time (calculated)
- Bottom of every post: CTA banner — "¿Necesitas un CTO fraccionario?" / "Need a fractional CTO?" with link to `/contact`
- No comments, no share buttons, no related posts for v1

**Content strategy notes** (not for Claude Code, for Hec):
- Write in the language of the newsletter it maps to: English → Shipping Notes audience, Spanish → Bitácora audience
- Canonical URL is always `hecsanchez.com/blog/[slug]` — cross-post to LinkedIn and newsletters with canonical link
- Post frequency: 1–2 per month is fine. Consistency > volume.
- Example topics: "What FHIR means for Mexican healthtech startups", "How to pass a SOC 2 audit with a 5-person team", "Arquitectura para insurtech en México: lo que nadie te dice"

**RSS feed**: Generate at `/blog/rss.xml` (or `/feed.xml`) for newsletter syndication.

## Navigation

- **Desktop**: Horizontal nav, right-aligned. Links: How I Work, Work, Blog, About, Contact (as button with accent bg)
- **Mobile**: Hamburger menu, full-screen overlay
- Logo/name "Hec Sánchez" on the left, links to home
- Language toggle: small "ES | EN" toggle in nav, right side near CTA

## SEO & Meta

- Each page gets unique `<title>` and `<meta description>` in both languages
- Open Graph image: auto-generated or static OG image (dark bg, name, title)
- `robots.txt` and `sitemap.xml` via Next.js defaults
- Canonical URLs with locale prefix

## Performance Requirements

- Lighthouse score > 95 on all categories
- No client-side JavaScript by default (Astro's zero-JS architecture). Islands only for interactive components.
- Total page weight < 200KB (excluding Calendly embed)
- **Fonts**: Dual font pairing via Google Fonts (variable weights, single file each):
    - **Lora** (serif) — body text, blog posts, headings, testimonial quotes. Gives editorial authority. Great italics.
    - **Inter** (sans-serif) — nav, buttons, tags, dates, meta text, UI elements.
    - Load both as variable fonts for minimal payload. Use `@fontsource/lora` and `@fontsource/inter` (npm packages, self-hosted, no Google Fonts GDPR issues).
    - Fallback: `font-family: 'Lora', Georgia, 'Times New Roman', serif` / `'Inter', system-ui, sans-serif`

## Out of Scope (v1)

- CMS (content lives in Astro Content Collections — Hec edits MDX/MD files directly)
- Dark/light mode toggle (ship dark only)
- Contact form (Calendly handles scheduling)
- Animation libraries (Framer Motion, GSAP, etc.)
- Cookie banners (no tracking cookies in v1)

## File Structure (suggested)

```
src/
├── layouts/
│   └── BaseLayout.astro            # Global layout (head, nav, footer)
├── pages/
│   ├── es/
│   │   ├── index.astro             # Home (ES)
│   │   ├── como-trabajo.astro      # How I Work (ES)
│   │   ├── sobre-mi.astro          # About (ES)
│   │   ├── trabajo/
│   │   │   ├── index.astro         # Project index (ES)
│   │   │   └── [slug].astro        # Project detail (ES)
│   │   ├── blog/
│   │   │   ├── index.astro         # Blog index (ES)
│   │   │   └── [slug].astro        # Blog post (ES)
│   │   └── contacto.astro          # Contact (ES)
│   ├── en/
│   │   ├── index.astro             # Home (EN)
│   │   ├── how-i-work.astro
│   │   ├── about.astro
│   │   ├── work/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   ├── blog/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   └── contact.astro
│   └── index.astro                 # Root redirect (detect locale → /es or /en)
├── components/
│   ├── Nav.astro
│   ├── Footer.astro
│   ├── CTA.astro
│   ├── TestimonialCard.astro
│   ├── ProjectCard.astro
│   └── LanguageToggle.astro
├── content/
│   ├── blog/                       # MDX blog posts (Content Collections)
│   │   └── example-post.mdx
│   └── projects/                   # Project data (Content Collections)
│       ├── alilio.md
│       ├── camino-real.md
│       ├── heyjimmi-crm.md
│       ├── lomas-news.md
│       ├── grace-academy.md
│       └── edtech-platform.md
├── content.config.ts               # Content Collection schemas
├── i18n/
│   ├── es.json
│   └── en.json
├── styles/
│   └── global.css                  # Tailwind base + font imports
└── public/
    ├── logos/                       # Client logos (SVG)
    ├── headshot.jpg                 # Placeholder
    └── og-image.png
```

## Content to Provide (Hec's homework)

- [ ] Professional headshot (or decide to skip photo)
- [ ] Client logos (SVG preferred) — get permission where needed
- [ ] Calendly/Cal.com booking link
- [ ] Project descriptions and screenshots for each of the 6 projects
- [ ] Updated testimonial quotes (confirm permission to use)
- [ ] Preferred accent color
- [ ] LinkedIn URL
- [ ] Email for contact page

## Success Metrics

- Primary: Discovery calls booked per month (target: 4+)
- Secondary: Time on site > 90 seconds, bounce rate < 60%
- Tertiary: LinkedIn profile visits from site referral
