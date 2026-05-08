# tobi-braun.com

Personal website of Tobias Braun — built with Astro 6, Vue 3 islands, GSAP animations, and deployed as a fully static site on Cloudflare Pages.

## Stack

| Layer | Technology |
|---|---|
| Framework | Astro 6 (`output: static`) |
| Interactivity | Vue 3 (islands only) |
| Animations | GSAP 3 + ScrollTrigger |
| Styles | SCSS with a Material Design–inspired token system |
| Deployment | Cloudflare Pages |
| i18n | Cookie-based locale (`de` / `en`), no URL prefixes |

## Commands

```bash
pnpm install    # Install dependencies
pnpm dev        # Start development server at localhost:4321
pnpm build      # Production build → dist/
pnpm preview    # Preview production build via Cloudflare miniflare
```

## Project structure

```
src/
  layouts/        Base.astro — single HTML shell for all pages
  pages/          One .astro file per route
  components/
    layout/       AppHeader.vue, AppFooter.astro
    hero/         HeroParticles.vue
    blog/         ArticleCard.vue, CategoryBadge.astro, BlogListing.vue
    about/        TimelineItem.vue
    content/      Img.astro — overrides <img> inside markdown
  composables/    useLocale.ts
  utils/          locale.ts — i18n strings and types
  content/        blog/*.md — markdown articles
  styles/         SCSS design system (tokens, typography, mixins)
public/
  articles/       Article images and videos, grouped by article slug
```

## Content

Articles live in `src/content/blog/*.md` and are queried via Astro's content collections API. Each article requires `title`, `description`, `category`, `date`, `readTime`, and `lang` in its frontmatter. An optional `translationSlug` links to the translated counterpart.

## Deployment

Pushes to the main branch deploy automatically via Cloudflare Pages.

- Build command: `pnpm build`
- Output directory: `dist`
- Node version: `>=22.12.0`
