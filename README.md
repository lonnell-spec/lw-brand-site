# lw-brand-site-
# ldw.build

Personal brand site for **Lonnell Williams** — preacher, author, builder, and operator. Built for speed, designed for authority, and architected to scale.

> Live at [ldw.build](https://ldw.build)

-----

## Tech Stack

|Layer    |Tool                                 |Purpose                                          |
|---------|-------------------------------------|-------------------------------------------------|
|Hosting  |Vercel                               |Auto-deploys on `git push`                       |
|Repo     |GitHub (`lonnell-spec/lw-brand-site`)|Source of truth for all HTML/CSS/JS              |
|Backend  |Supabase (`riqdcirsmckubkdfbtoj`)    |Data layer for dynamic content and forms         |
|CMS      |Notion                               |Content management for photos and content hub    |
|DNS      |Cloudflare (DNS-only)                |A → `76.76.21.21`, CNAME → `cname.vercel-dns.com`|
|Analytics|Metricool                            |Installed on all public pages                    |
|Email    |ActiveCampaign                       |Welcome, speaking inquiry, and audit sequences   |

-----

## Site Map

|File           |URL                      |Description                                                     |
|---------------|-------------------------|----------------------------------------------------------------|
|`index.html`   |`ldw.build`              |Homepage — all major sections (~81KB)                           |
|`speaking.html`|`ldw.build/speaking.html`|Speaking bio, topics, and booking form                          |
|`books.html`   |`ldw.build/books.html`   |Full books page — all three titles                              |
|`media.html`   |`ldw.build/media.html`   |Press photos and downloadable bio                               |
|`vantage.html` |`ldw.build/vantage.html` |Executive Command Center — React 18 via Babel                   |
|`admin.html`   |`ldw.build/admin.html`   |Auth-gated admin portal hub                                     |
|`admin-*.html` |(7 subpages)             |Content, speaking, books, newsletter, analytics, media, settings|
|`llms.txt`     |`ldw.build/llms.txt`     |AI crawler optimization *(pending)*                             |

### Homepage Section Order

1. **Hero** — Headline, tagline, subscribe form
1. **About** — Bio, portrait, credentials
1. **What I Carry** — 5 role cards
1. **Speaking** — Topic previews + CTA
1. **Books** — 3 titles with status badges
1. **Consulting** — Service tiers + inquiry form
1. **Vantage Promo** — Feature preview + CTA
1. **Latest Content** — YouTube + content cards
1. **Instagram** — 6-post grid via Supabase
1. **Newsletter** — Arise & Build subscribe
1. **Footer**

-----

## Design System

### Colors

|Token         |Value    |Usage                             |
|--------------|---------|----------------------------------|
|`--obsidian`  |`#0D0D0D`|Primary dark background           |
|`--warm-black`|`#1A1714`|Secondary dark                    |
|`--copper`    |`#C17F59`|Primary accent, dividers, labels  |
|`--signal`    |`#E85D3A`|Sparingly — one use per layout max|
|`--off-white` |`#F2F0EB`|Light backgrounds, text on dark   |
|`--concrete`  |`#8A8A8A`|Secondary text                    |


> ⚠️ Never use pure white (`#FFFFFF`). Never use lowercase in Bebas Neue.

### Typography

|Role   |Font        |Notes                                |
|-------|------------|-------------------------------------|
|Display|`Bebas Neue`|ALL CAPS always, letter-spacing 2–6px|
|Body   |`DM Sans`   |Weights 300 / 400 / 700              |
|Mono   |`Space Mono`|Labels, metadata, captions only      |

-----

## Deployment

Every change follows this exact path:

```bash
# 1. Edit files locally (or download from conversation)
# 2. Drop into repo root

git add .
git commit -m "describe the change"
git push
```

Vercel auto-deploys in ~30 seconds. Hard refresh with `Cmd+Shift+R` to verify.

> ⚠️ Never edit Vercel directly. Never skip git.

-----

## Backend — Supabase

**Project ID:** `riqdcirsmckubkdfbtoj`

### Tables

|Table                   |Source                 |RLS Policy        |
|------------------------|-----------------------|------------------|
|`site_photos`           |Notion Photo Gallery DB|anon read         |
|`site_youtube`          |YouTube Data API v3    |anon read         |
|`site_instagram`        |Zapier (on new post)   |anon read + insert|
|`site_content_hub`      |Notion Content Hub DB  |anon read         |
|`newsletter_subscribers`|Site forms             |anon insert only  |
|`consulting_inquiries`  |Consulting form        |anon insert only  |
|`speaking_inquiries`    |Speaking form          |anon insert only  |

### Edge Functions

|Function             |Version|Trigger                     |Purpose                               |
|---------------------|-------|----------------------------|--------------------------------------|
|`sync-notion-content`|v20    |Cron (every 15 min) + manual|Syncs photos, content hub, YouTube API|
|`sync-instagram`     |v6     |Manual (deprecated)         |Replaced by Zapier                    |

**Manual sync:**

```
GET https://riqdcirsmckubkdfbtoj.supabase.co/functions/v1/sync-notion-content?token=ldw-sync-2026-secure
```

Expected: `{"success":true, "results":{...}, "version":20}`

-----

## Content Flow

```
YouTube API (v3)         → sync-notion-content (cron) → site_youtube       → Latest Content section
Instagram Posts          → Zapier (on post)            → site_instagram     → Instagram Grid section
Notion Photo Gallery     → sync-notion-content (cron) → site_photos        → Speaking / Media pages
Notion Content Hub       → sync-notion-content (cron) → site_content_hub   → (unused — 0 rows)
Site Forms (direct)      → Supabase                   → newsletter / consulting / speaking inquiries
```

### Notion CMS Databases

|Database     |Notion ID                             |Syncs To          |
|-------------|--------------------------------------|------------------|
|Photo Gallery|`074724b8-74a6-40e1-b48c-d7667f9addbd`|`site_photos`     |
|Content Hub  |`f69e7146-cb29-40ba-92d5-460001d8611d`|`site_content_hub`|

-----

## Admin Portal

- **Entry:** `ldw.build/admin.html`
- **Auth:** `sessionStorage` key `ldw_admin_auth` — set on login, checked on every admin page load
- **Source of truth:** Notion workspace (admin reads and writes to Notion)
- **11 pages total:** hub + content, speaking, books, newsletter, analytics, media, settings

-----

## Books

|Title                                           |Badge               |Status            |
|------------------------------------------------|--------------------|------------------|
|AENA *(Anything, Everything, or Nothing at All)*|Fall 2026 Re-release|Pre-order / notify|
|ZAG: Leading Ministry Jesus’s Way               |Coming Soon         |Notify me         |
|The Staff                                       |In Development      |In Development    |

-----

## Email Sequences (ActiveCampaign)

|Sequence        |Emails|Trigger             |
|----------------|------|--------------------|
|Welcome         |6     |New subscriber      |
|Speaking Inquiry|3     |Form submission     |
|Audit           |5     |Tag: `free-resource`|


> Personalization syntax: `%FIRSTNAME%`

-----

## Known Issues

- `site_content_hub` is empty — Notion Content Hub has 0 published rows
- ConvertKit not connected — newsletter subscribers land in Supabase but email automation is not triggered
- Vantage uses static demo data — not connected to live Planning Center, Stripe, or Asana
- No `llms.txt` file — AI crawlers not optimized
- No meta descriptions on any pages — SEO gap

-----

## Phase 2 Roadmap

1. **Activate ActiveCampaign sync** — `sync-convertkit` edge function (secrets need setting)
1. **Add `llms.txt`** — AI crawler optimization and GEO (Generative Engine Optimization)
1. **Meta descriptions** — Add to all 5 public pages
1. **Vantage live data** — Connect to Planning Center (attendance) and Stripe (giving)
1. **`/articles` page** — Substack newsletter archive hosted on-site
1. **Speaking social proof** — Add testimonials and past logos to speaking page
1. **Consulting lead magnet** — Gated resource in consulting section
1. **Podcast page** — Audio-first content hub

-----

## Local Development

No build step. This is static HTML — open any `.html` file directly in a browser, or use a local server:

```bash
npx serve .
# or
python3 -m http.server 3000
```

For Supabase work, use the [Supabase CLI](https://supabase.com/docs/guides/cli) or the dashboard directly.

-----

## Contributing

This is a personal brand site. All changes go through Lonnell Williams. Pull requests are not accepted from external contributors.

-----

*Built by Lonnell Williams · [ldw.build](https://ldw.build)*