# Project screenshots

Drop screenshots here and they appear on the matching project page
automatically — no code change needed. A file that isn't here yet is simply
skipped, so the page renders text-only until you add it.

Expected filenames come from `src/data/projects.ts` (`hero.image` and each
section's `image`). Current slots:

| File | Where it shows |
|---|---|
| `beni/hero.jpg` | Beni — full width, below the intro |
| `beni/dashboard.png` | Beni — "What the owner sees" section |
| `estateflow/hero.png` | Estateflow — full width, below the intro |
| `estateflow/pipeline.png` | Estateflow — pipeline and SLA section |
| `estateflow/reports.png` | Estateflow — reporting section |
| `estateflow/mobile.png` | Estateflow — mobile app (portrait is fine) |
| `hubspot-lead-routing/hero.png` | Lead routing — full width, below the intro |
| `hubspot-lead-routing/schedule.png` | Lead routing — schedules section |
| `hubspot-lead-routing/settings.png` | Lead routing — pools and settings section |
| `the-woods-crm/hero.png` | The Woods — full width, below the intro |
| `the-woods-crm/inbox.png` | The Woods — shared WhatsApp inbox section |
| `the-woods-crm/proposal.png` | The Woods — proposal builder section |
| `the-woods-crm/inventory.png` | The Woods — inventory and purchasing section |
| `zaplink/hero.jpg` | Zaplink — full width, below the intro |
| `zaplink/console.png` | Zaplink — console section |

PNG, JPEG, WebP and GIF all work. Intrinsic dimensions are read from the file
header at build time and written into the `<img>` tag, so images reserve their
space and don't shift the layout. Portrait images get a height cap and centre
rather than stretching across the column.

**These pages are public.** Check each screenshot for client names, contact
details, real deal values, and anything else that shouldn't leave the customer's
account before committing it.
