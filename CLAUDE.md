# CLAUDE.md

## Commands

```bash
pnpm dev        # Start development server
pnpm build      # Production build (static, outputs to dist/)
pnpm preview    # Preview production build via Cloudflare miniflare
```

## Architecture

**Astro 6 + Vue 3 islands**, deployed as a fully static site on **Cloudflare Pages**.

- `output: 'static'` — all routes are pre-rendered at build time
- Vue 3 is used only for components that require client-side reactivity or GSAP animations
- Everything else is pure Astro (zero JS shipped)

### File structure

```
src/
  layouts/        Base.astro — the single HTML shell used by all pages
  pages/          One .astro file per route; dynamic routes use getStaticPaths()
  components/
    layout/       AppHeader.vue, AppFooter.astro
    blog/         ArticleCard.vue, CategoryBadge.astro, BlogListing.vue
    about/        TimelineItem.vue
    hero/         HeroParticles.vue
    content/      Img.astro — overrides <img> inside markdown Content
  composables/    useLocale.ts — Vue composable for locale state
  utils/          locale.ts — pure TS strings and types (no Vue)
  content/        blog/*.md — markdown articles
  content.config.ts
  styles/         SCSS design system (see Styling section)
```

### Component decision rule

| Use `.astro` | Use `.vue` |
|---|---|
| Static structure, no interactivity | Needs client-side reactivity |
| Used only in `.astro` files | Used inside another Vue component |
| No GSAP | GSAP animations |

Current Vue components: `AppHeader`, `ArticleCard`, `BlogListing`, `HeroParticles`, `TimelineItem`.  
Current Astro components: `AppFooter`, `CategoryBadge`, `Img`.

Astro components **cannot** be imported into Vue components. If a component is used inside a Vue island, it must itself be `.vue`.

### Vue island directives

- `client:load` — hydrates immediately on page load (AppHeader, HeroParticles)
- `client:only="vue"` — skips SSR entirely, renders only client-side (BlogListing — needs cookie access before render)
- No directive — SSR to static HTML, no JS hydration (ArticleCard on home page, TimelineItem on about page)

GSAP on pages that don't need locale reactivity (index, about) runs in a `<script>` tag directly in the `.astro` page, not inside a Vue component.

## Content Collections

Articles live in `src/content/blog/*.md`. The collection is defined with Astro's glob loader in `src/content.config.ts`.

### Frontmatter schema

```yaml
title: string           # required
description: string     # required
category: Technical | Lifestyle | Work-Life-Balance   # required
date: YYYY-MM-DD        # required — YAML auto-parses this as Date; schema uses z.coerce.string()
readTime: "12 min"      # required
image: /articles/...    # optional, path relative to public/
featured: true          # optional, marks the article as the featured card on /blog
lang: de | en           # required, default de
translationSlug: slug   # optional, slug of the translated version of this article
```

Article slugs are derived from the filename stem (e.g. `gsap-animation-intro-en.md` → slug `gsap-animation-intro-en`). In `getStaticPaths()`, always strip the `.md` extension from `post.id`:

```ts
params: { slug: post.id.replace(/\.md$/, '') }
```

### Querying articles

```ts
import { getCollection } from 'astro:content'
const posts = await getCollection('blog')
// entries have: post.id (filename), post.data (frontmatter), post.render() / render(post)
```

### Media assets

Article images and videos live in `public/articles/<article-slug>/`. Reference them as absolute paths in frontmatter and markdown: `/articles/gsap-animation-intro/gsap-thumb.png`.

Videos embedded in markdown (`.mov`, `.mp4`) are handled by `src/components/content/Img.astro`, which overrides the default `<img>` renderer. Pass it via `<Content components={{ img: Img }} />` in `[slug].astro`.

## i18n

Cookie-based locale (`de` | `en`), no URL prefixes. Default locale is `de`.

### String lookup

- `src/utils/locale.ts` — exports `strings` (plain object, both locales), `Locale` type, `LocaleStrings` interface, and `getUi(locale)` helper. Use this in Astro frontmatter or wherever Vue is not available.
- `src/composables/useLocale.ts` — Vue composable. Reads/writes the `locale` cookie. A module-level `ref` ensures all Vue islands on the same page share one reactive locale state.

```ts
// In a Vue component
const { locale, ui, setLocale } = useLocale()
// ui is a computed: ui.value.nav.blog, ui.value.blog.heading, etc.
```

### Locale switching behaviour

Switching locale in `AppHeader` updates the module-level ref, which propagates to all other Vue islands on the page immediately. `BlogListing` re-filters its article list on each locale change (no navigation needed).

On article detail pages, a static "Read in English / Auf Deutsch lesen" banner links to `translationSlug`. There is no automatic navigation on locale change on detail pages — the user follows the banner link.

## Styling

SCSS with a Material Design–inspired token system. Warm, light background (`--surface: #fbf9f4`), forest-green primary, warm-sand secondary, terracotta tertiary.

### Loading abstracts

Vite is configured with `loadPaths: ['src/styles']`, so every SCSS style block (in `.vue` or `.astro`) can import the full abstracts without a path:

```scss
@use 'abstracts' as *;
```

This gives access to all tokens (via `:root` vars), typography placeholders, and mixins. **Always start scoped style blocks with this line.**

### Tokens

All values are CSS custom properties defined in `src/styles/abstracts/_tokens.scss` and used via `var(--name)`:

| Group | Key vars |
|---|---|
| Surfaces | `--surface`, `--surface-container-low/high`, `--surface-variant`, `--surface-dim` |
| Text | `--on-surface`, `--on-surface-variant`, `--outline`, `--outline-variant` |
| Primary (green) | `--primary`, `--primary-container`, `--on-primary`, `--primary-fixed` |
| Secondary (sand) | `--secondary`, `--secondary-container`, `--on-secondary` |
| Tertiary (terracotta) | `--tertiary`, `--tertiary-container`, `--on-tertiary` |
| Spacing | `--space-xs` (4px) `--space-sm` (8px) `--space-md` (16px) `--space-lg` (24px) `--space-xl` (40px) `--space-2xl` (80px) |
| Radii | `--radius` `--radius-lg` `--radius-xl` `--radius-2xl` `--radius-full` |
| Shadows | `--shadow-card` `--shadow-card-hover` `--shadow-image` |
| Layout | `--container-max` (1200px) `--container-pad` (24px) |

### Typography placeholders

Defined in `src/styles/abstracts/_typography.scss`. Use `@extend` inside any style block that has imported abstracts.

| Placeholder | Font | Size | Weight |
|---|---|---|---|
| `%headline-xl` | Plus Jakarta Sans | clamp(36px, 5vw, 48px) | 700 |
| `%headline-lg` | Plus Jakarta Sans | clamp(26px, 3vw, 32px) | 700 |
| `%headline-md` | Plus Jakarta Sans | 24px | 600 |
| `%body-lg` | Be Vietnam Pro | 18px | 400 |
| `%body-md` | Be Vietnam Pro | 16px | 400 |
| `%label-md` | Be Vietnam Pro | 14px | 600 |
| `%label-sm` | Be Vietnam Pro | 12px | 600, uppercase |

`%headline-sm` does **not** exist. Use `%headline-md` with a `font-size` override when a smaller heading is needed.

### Mixins

```scss
@include md { … }          // @media (min-width: 768px)
@include lg { … }          // @media (min-width: 1024px)
@include container;        // standard page-width wrapper (max 1200px, 24px side gutter)
@include pill($bg, $fg);   // pill shape for badges/tags
```

Never set a custom `max-width` on a layout element — use `@include container` or change `--container-max`.

### Gradient text utilities

Global utility classes (and `%` placeholders for `@extend`) defined in `src/styles/base/_gradients.scss`:

`.gradient-text--green`, `.gradient-text--black-brown`, `.gradient-text--black-green`, `.gradient-text--brown`, `.gradient-text--sand`, `.gradient-text--sage`, `.gradient-text--terra`

Use in templates: `<h1 class="gradient-text--green">`. Use in SCSS: `@extend %gradient-text--green`.

### Prose styles (article pages)

Scoped to `.prose` in `src/pages/blog/[slug].astro`. Targets elements rendered by Astro's `<Content />` without `:deep()` (Astro styles are not scoped the same way as Vue). Key rules:
- `p:has(video)` — adds `margin-block: var(--space-xl)` around embedded videos
- `pre` — structural only; background/foreground come from Shiki inline styles (do not set `background` or `color` on `pre`)
- Code blocks use `one-dark-pro` theme (configured in `astro.config.mjs`)

## Deployment

Targets **Cloudflare Pages** (static).

- Build command: `pnpm build`
- Output directory: `dist`
- Node version env var: `NODE_VERSION=20`

The `@astrojs/cloudflare` adapter is installed and wired up in `astro.config.mjs`. For a fully static site, the adapter is only needed for the preview server; the build output is plain HTML/CSS/JS.
