# Migration Log — `src/features/*` → Route-Colocated Layout

**Date:** 2026-08-16
**Branch:** `refactor/structure`
**Followed:** `migration-guide.md` (the plan) · **Result:** `src/features/` removed, `tsc --noEmit` clean, `npm run build` clean (all 9 routes generated)

This is the record of what actually happened. For _why_ each feature landed where it did, see the plan table below or `migration-guide.md`. For the reasoning behind the deviations from `code-structuring.md`, see `code-structuring1.md`.

---

## 1. The plan we followed

Classification was based on how many routes actually import each feature — checked by searching the project (Ctrl/Cmd+Shift+F) for `features/<name>` scoped to `src/app` and counting how many distinct route files came up. Rule: single route → colocate into that route's own `_components/`. Homepage only → `components/home/<name>/` (the homepage has no route segment folder to colocate into). Two or more routes → shared `components/<name>/`.

| Feature        | Used by                              | `components/` target        | `data/` target       | `types.ts` target       |
| -------------- | ------------------------------------ | --------------------------- | -------------------- | ----------------------- |
| `about`        | `/about` only                        | `app/about/_components/`    | `data/about/`        | `types/about.ts`        |
| `services`     | `/services` only                     | `app/services/_components/` | `data/services/`     | `types/services.ts`     |
| `hero`         | `/` only                             | `components/home/hero/`     | `data/hero/`         | `types/hero.ts`         |
| `blogs`        | `/` only                             | `components/home/blogs/`    | `data/blogs/`        | `types/blogs.ts`        |
| `diseases`     | `/` only                             | `components/home/diseases/` | `data/diseases/`     | `types/diseases.ts`     |
| `auth`         | `/login`, `/register`                | `components/auth/`          | `data/auth/`         | `types/auth.ts`         |
| `cta`          | `/`, `/services`                     | `components/cta/`           | `data/cta/`          | `types/cta.ts`          |
| `physicians`   | `/`, `/physicians/[slug]`            | `components/physicians/`    | `data/physicians/`   | `types/physicians.ts`   |
| `products`     | `/`, `/products`                     | `components/products/`      | `data/products/`     | `types/products.ts`     |
| `testimonials` | `/`, `/about`                        | `components/testimonials/`  | `data/testimonials/` | `types/testimonials.ts` |
| `story`        | already migrated before this session | _(done — see §4)_           | _(done)_             | _(done, inlined)_       |

---

## 2. What we did

All of this was done by hand in VS Code's Explorer panel — cutting each folder and pasting it at its new location, one feature at a time, then cleaning up imports through the editor.

### Moved directories (cut in Explorer, paste at destination)

- **Route-private** (single route): `features/about/components` → `app/about/_components`, `features/services/components` → `app/services/_components`
- **Home-only**: `features/hero/components` → `components/home/hero`, `features/blogs/components` → `components/home/blogs`, `features/diseases/components` → `components/home/diseases`
- **Shared** (2+ routes): `features/{auth,cta,physicians,products,testimonials}/components` → `components/{auth,cta,physicians,products,testimonials}`
- **Data**: every `features/<name>/data` → `data/<name>` (kept as a subfolder per feature, not flattened)
- **Types**: every `features/<name>/types.ts` → `types/<name>.ts` (flattened to one file per domain — dragged the file itself, not a folder, and renamed it on the way)
- **Bonus fix**: `components/layout/{Navbar,Footer}.tsx` → `components/navigation/{Navbar,Footer}.tsx` — these were misfiled. `layout/` is meant for things like Container/SectionLabel/Breadcrumb; `navigation/` already existed (empty) and is where Header/Footer belong.
- `src/features/` right-clicked and deleted once every subfolder underneath it was empty

For every folder move, VS Code prompted _"Update relative imports for the moved files?"_ — accepted that each time, so any file that imported something else via a relative path (`../../foo`) inside the same feature got fixed automatically as part of the move.

### Fixed the `@/` alias imports (per feature, via Find & Replace)

VS Code's relative-import auto-fix only handles relative paths — it doesn't know about the `@/` alias, so those needed a manual pass. For each feature, opened the global search panel (Search icon in the sidebar), searched for the old alias path, and used "Replace All" scoped to `src/`:

- `@/features/<name>/data/...` → `@/data/<name>/...`
- `@/features/<name>/types` → `@/types/<name>`
- `@/features/<name>/components/...` → `@/components/<name>/...` (shared) or `@/components/home/<name>/...` (home-only)
- `@/components/layout/Navbar` / `Footer` → `@/components/navigation/Navbar` / `Footer`

Went feature by feature rather than one big replace, so each pass could be eyeballed in the search results panel before hitting Replace All.

### Manual fixes (things a find-and-replace couldn't safely catch)

- **`src/app/about/page.tsx`** and **`src/app/services/page.tsx`**: opened each file and manually rewrote its component imports from `@/features/<name>/components/...` to relative `./_components/...`, since `_components/` folders are meant to be imported relatively, not via the `@/` alias — a blanket find-and-replace would've wrongly touched other files that legitimately still use the alias.
- **`src/components/products/ProductCard.tsx`**: had a relative import (`../../../components/ui/button`) written for its _old_ location under `features/products/components/`. VS Code's auto-fix only adjusts imports _inside_ the moved folder relative to files that moved with it — it doesn't know about pre-existing relative imports pointing _out_ to something that didn't move. After the move, the path needed one fewer `../`. Spotted this because TypeScript underlined it red in the editor, and fixed it to `../ui/button` by hand.

### Verified

- Searched the whole project for `@/features/` — zero results left.
- Ran `tsc --noEmit` in the terminal → clean, no red squiggles anywhere either.
- Ran `npm run build` → clean, all 9 routes generated (`/`, `/about`, `/knowledge`, `/login`, `/physicians/[slug]`, `/products`, `/register`, `/services`).

### Left untouched

- `features/story` was already migrated before this session started — left as-is (see §4).
- Nothing outside `src/features/*` and the two `Navbar`/`Footer` files moved.
- Nothing was committed. Everything's in the working tree — review in the Source Control panel (or `git status` / `git diff`) and commit when ready.

---

## 3. Where things live now

### `src/app/` — routes only

```
app/
├── about/
│   ├── page.tsx
│   └── _components/         # private to /about: AboutHero, CoreValues, Leadership, OurFramework
├── services/
│   ├── page.tsx
│   └── _components/         # private to /services: ServicesHero, JourneySteps,
│                             #   ConsultationSpotlight, ServiceStats
├── knowledge/
├── login/
├── products/
├── register/
├── physicians/[slug]/
├── layout.tsx
└── page.tsx                 # homepage
```

`_components/` folders are imported **relatively** (`./_components/AboutHero`), never via `@/` — that's the signal that a component is private to one route.

### `src/components/` — reusable across routes

```
components/
├── ui/                 # primitives: button, badge, card, checkbox, sheet, tabs, ... (unchanged)
├── navigation/          # Navbar, Footer (moved here from layout/ this migration)
│                         # layout/ is now gone — Navbar/Footer were its only contents.
│                         # Re-create it if you add Container/SectionLabel/Breadcrumb-type components.
├── seo/                 # (unchanged)
├── analytics/           # (unchanged)
├── examples/            # (unchanged, unrelated to this migration)
├── home/                 # homepage-only sections
│   ├── hero/             # Hero, DoshaOrbit
│   ├── blogs/            # BlogCard, BlogsCarousel
│   └── diseases/         # DiseaseCard, DiseasesCarousel, DiseasesSection
├── auth/                  # AuthCard, AuthShowcase, AuthTabs, PasswordInput, SignInForm,
│                           #   SignUpForm, SocialAuthButtons — used by /login and /register
├── cta/                   # CtaBanner — used by / and /services
├── physicians/            # PhysicianCard, PhysiciansGrid, PhysicianProfileView —
│                           #   used by / and /physicians/[slug]
├── products/              # ProductCard, ProductCarousel, ProductDetailDrawer, ProductFilters,
│                           #   ProductGrid, ProductsHero, ShopView — used by / and /products
├── testimonials/          # TestimonialCard, TestimonialsGrid — used by / and /about
└── our-story.tsx           # single-file component (pre-existing from before this migration)
```

**Rule of thumb:** used by exactly one route → that route's `_components/`. Used only on the homepage → `components/home/<name>/`. Used by 2+ routes → `components/<name>/`.

### `src/data/` — static content, grouped by domain

```
data/
├── about/           # coreValues.ts, framework.ts, hero.ts, leadership.ts, testimonialsSection.ts
├── auth/            # content.ts
├── blogs/           # blog.ts, categories.ts, section.ts
├── cta/             # content.ts
├── diseases/        # diseases.ts, section.ts
├── hero/            # content.ts, doshas.ts
├── physicians/      # physicians.ts, profiles.ts, section.ts, treatmentApproach.ts
├── products/        # content.ts, filters.ts, products.ts, section.ts
├── services/        # consultation.ts, coreService.ts, cta.ts, hero.ts, journey.ts, stats.ts
├── testimonials/    # section.ts, testimonials.ts
└── our-story.ts      # single file (pre-existing) — type inlined at top, not in src/types/
```

Kept as one subfolder per domain rather than flattened to `data/<name>.ts` — there are roughly 35 files across 10 domains, and flattening would hurt discoverability for no real benefit.

### `src/types/` — shared types, one file per domain

```
types/
├── about.ts
├── auth.ts
├── blogs.ts
├── cta.ts
├── diseases.ts
├── hero.ts
├── physicians.ts
├── products.ts
├── services.ts
├── testimonials.ts
├── api.ts     # (pre-existing, unrelated)
└── user.ts    # (pre-existing, unrelated)
```

Each `types/<name>.ts` was moved wholesale from `features/<name>/types.ts` rather than split and inlined per-file — most export types consumed by multiple data files and components in that domain, so a clean 1:1 split wasn't mechanical. `our-story.ts` in `src/data/` is the one exception, where the type stayed inlined because nothing else consumes it.

---

## 4. Reference — how `story` was already migrated

Before this session, `story` had already been moved to the "pure" pattern this migration mostly approximates: `features/story/components/OurStory.tsx` + `features/story/data/content.ts` (with its own `types.ts`) → `components/our-story.tsx` + `data/our-story.ts`, with the type inlined at the top of the data file. No entry in `src/types/`, since nothing else consumes that type. Nothing further needed here.

---

## 5. Import patterns, at a glance

| Importing...                    | From...                                        | Example                                                                                   |
| ------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------- |
| A shared UI primitive           | `@/components/ui/...`                          | `import { Button } from "@/components/ui/button"`                                         |
| A shared, multi-route component | `@/components/<name>/...`                      | `import { CtaBanner } from "@/components/cta/CtaBanner"`                                  |
| A homepage-only component       | `@/components/home/<name>/...`                 | `import Hero from "@/components/home/hero/Hero"`                                          |
| A route-private component       | relative `./_components/...`                   | `import AboutHero from "./_components/AboutHero"` (only from that route's own `page.tsx`) |
| Static data                     | `@/data/<name>/...`                            | `import { physicians } from "@/data/physicians/physicians"`                               |
| A shared type                   | `@/types/<name>`                               | `import type { Physician } from "@/types/physicians"`                                     |
| Navbar / Footer                 | `@/components/navigation/Navbar`, `.../Footer` | `import Navbar from "@/components/navigation/Navbar"`                                     |

**To double-check any of this later:** open the global search panel (Ctrl/Cmd+Shift+F), search for `from "@/components/physicians` (or whichever folder), and the results panel lists every route pulling from it — the same technique used to classify features in the first place.

---
