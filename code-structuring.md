# Code Structure Handbook — Next.js App Router Marketing Site

A short, example-first guide to organizing a Next.js App Router project so a novice developer can add pages, sections, and components without guessing where things go.

## The Big Picture

```text
src/
├── app/                     # Routes (App Router). ONE folder = ONE URL.
│   ├── layout.tsx           # Root layout: fonts, header, footer, global SEO
│   ├── page.tsx             # Homepage
│   ├── globals.css          # Design tokens & global styles
│   ├── sitemap.ts           # /sitemap.xml
│   ├── robots.ts            # /robots.txt
│   ├── about/
│   │   ├── page.tsx         # /about
│   │   ├── metadata.ts      # /about SEO
│   │   └── _components/     # Components used ONLY by /about
│   │       ├── hero-section.tsx
│   │       └── feature-list-section.tsx
│   ├── blog/
│   │   ├── _components/     # Shared by all blog pages
│   │   └── my-post-slug/
│   │       ├── page.tsx
│   │       ├── metadata.ts
│   │       └── _components/
│   │           └── post-content.tsx
│   └── destination/
│       └── city-name/
│           └── page.tsx
├── components/              # Reusable across any page
│   ├── ui/                  # Primitives (button, accordion, badge…)
│   ├── layout/              # Layout helpers (Container, SectionLabel, Breadcrumb)
│   ├── navigation/          # Header, Footer
│   ├── seo/                 # Structured data (JSON-LD) components
│   ├── analytics/           # Trackers (GA, etc.)
│   ├── home/                # Homepage-only sections
│   ├── cta-section.tsx      # A shared page section
│   └── services-section.tsx
├── assets/
│   ├── icons/               # Inline SVG icons as React components
│   │   └── index.tsx        # ← import icons from here
│   └── css/                 # Extra CSS (e.g. carousel overrides)
├── data/                    # Static content: faq.ts, testimonials.ts, …
└── lib/                     # Utilities & config
    ├── utils.ts             # cn() class-combining helper
    └── config.ts            # Site URLs, env vars
```

## Rules

### 1. `app/` holds routing only, `components/` holds reuse

A file inside `app/` IS a route. Components that could be used on more than one page live in `src/components/`. Components used by a single page live in that page's `_components/` folder.

```tsx
// app/about/page.tsx — assemble sections, keep JSX lean
import { HeroSection } from "./_components/hero-section"; // private to /about
import { ServicesSection } from "@/components/services-section"; // shared
import { CtaSection } from "@/components/cta-section"; // shared

export default function AboutPage() {
  return (
    <>
      <HeroSection />
      <ServicesSection
        tagText="Our Services"
        heading={
          <>
            Smart travel for <span className="italic">every journey</span>
          </>
        }
        className="bg-white"
      />
      <CtaSection heading={<>Ready to start?</>} />
    </>
  );
}
```

- Pages stay Server Components by default (no `'use client'`).
- A page file is a "table of contents": it composes sections and wires content, nothing more.

### 2. `_components/` = components private to a route

The underscore tells Next "this folder is NOT a route". Co-locate sections next to the page they belong to.

```text
app/faq/
├── page.tsx
├── metadata.ts
└── _components/
    ├── faq-hero.tsx
    └── faq-list.tsx
```

Use `_components/` when a section is page-specific. Promote it to `src/components/<section>.tsx` the moment a second page needs it.

### 3. Component naming conventions

- Files are kebab-case: `hero-section.tsx`, `cta-section.tsx`.
- Exports are PascalCase named exports: `export function HeroSection()`.
- One main component per file.

### 4. Colocate static data

Arrays of cards, FAQ lists, nav links, etc. live in `src/data/` as typed TS, not scattered inside JSX.

```ts
// src/data/faq.ts
export type FaqItem = { question: string; answer: string };

export const faqCategories: { title: string; items: FaqItem[] }[] = [
  { title: "Booking & Pricing", items: [{ question: "…", answer: "…" }] },
];
```

```tsx
// app/faq/page.tsx — import and pass it down
import { faqCategories } from "@/data/faq";

export default function FaqPage() {
  return <FaqList categories={faqCategories} />;
}
```

### 5. Icons are React components, not files

Wrap each SVG as a component that accepts `className`. Use `currentColor` for fills/strokes so Tailwind's `text-*` color utilities work.

```tsx
// assets/icons/index.tsx
export function CarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className}>
      <path stroke="currentColor" d="…" />
    </svg>
  );
}
```

```tsx
import { CarIcon, LocationIcon } from "@/assets/icons";

const items = [
  { icon: CarIcon, title: "Vehicles" },
  { icon: LocationIcon, title: "Destinations" },
];

{
  items.map((item) => {
    const Icon = item.icon;
    return <Icon className="size-8 text-primary-600" />; // sized & colored via Tailwind
  });
}
```

### 6. Styling: design tokens, not hardcoded values

Define a palette as CSS variables in `globals.css` (e.g. `--primary-600`, `--success-500`) and register them with Tailwind via `@theme inline` so they become utilities like `text-primary-600`.

```tsx
// Good — theme token with a scale step
<h1 className="font-bold text-primary-700">Heading</h1>

// Bad — hardcoded value
<h1 style={{ color: '#1a37a7' }}>Heading</h1>
```

Layout conventions:

- Wrap sections in a shared `<Container>` for consistent max-width/padding.
- Use the `cn()` helper (`src/lib/utils.ts`, built on `clsx` + `tailwind-merge`) for conditional classes:

```tsx
<Link className={cn(buttonVariants({ variant: "default" }), "h-[50px] px-6")}>
  Get Started
</Link>
```

### 7. Client components stay at the leaves

Anything with state or interactivity gets `'use client'` at the top and should be the smallest, deepest component possible. Pages and wrappers stay server components.

```tsx
// components/ui/accordion.tsx
'use client'  // ← only this file becomes a client component

export function Accordion() {
  const [open, setOpen] = useState(false)
  return …
}
```

Interactive things: accordions, carousels, dropdowns, mobile menus.

### 8. SEO is split into files

- `app/<route>/metadata.ts` — per-page metadata (title, description, OG, canonical).

```ts
// app/about/metadata.ts
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about the platform and why customers trust us.",
  alternates: { canonical: "/about" },
};
```

- `components/seo/` — structured data (JSON-LD) rendered as small components: `Organization`, `FAQPage`, `BlogPosting`, `Breadcrumb`, etc.
- `app/sitemap.ts` and `app/robots.ts` — automatically expose `/sitemap.xml` and `/robots.txt`.
- Put site URLs in `src/lib/config.ts`, reading env vars with sensible fallbacks:

```ts
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.example.com";
export const appUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://app.example.com";
```

### 9. Import with `@/` alias

Map `@/*` → `src/*` in `tsconfig.json` so you never write deep relative paths.

```tsx
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { faqCategories } from "@/data/faq";
```

Use relative imports only for the route's own `_components/` folder: `./_components/hero-section`.

### 10. Shadcn ui components lives in `components/ui`

Low-level building blocks (button, accordion, badge…) live in `src/components/ui/`. Expose variants with `cva` so callers pick a style without restyling internals:

```tsx
import { buttonVariants } from "@/components/ui/button";
<Link
  href="/signup"
  className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
>
  Sign Up
</Link>;
```

## Recipe: adding a new page

1. Create `app/my-page/page.tsx` and `app/my-page/metadata.ts`.
2. Add page-specific sections under `app/my-page/_components/`.
3. Reuse shared sections from `src/components/` where possible.
4. Put new static content in `src/data/`; new SVGs go in `src/assets/icons/index.tsx`.
5. Add the route to `app/sitemap.ts`.
6. Only add `'use client'` to the smallest interactive leaf.

## Checklist

- [ ] Page file is composition only (no giant JSX, no logic)
- [ ] Sections live in `_components/` (route-private) or `components/` (shared)
- [ ] Server component by default; `'use client'` only where state/interactivity exists
- [ ] Static data imported from `src/data/`
- [ ] Icons imported from `@/assets/icons`
- [ ] Colors/spacing via theme tokens + `cn()`, not hardcoded values
- [ ] `metadata.ts` present for every route; route listed in `sitemap.ts`
- [ ] All cross-folder imports use `@/`
