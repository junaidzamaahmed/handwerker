# Component Inventory — Figma ↔ code map

Written before `src/` exists, deliberately. This is the Code Connect map in table form:
when implementation starts, every row already has a target path, so nobody invents a
second naming scheme halfway through.

File: `UK0KdruELZEFxDn2vZJ73K`

**Rule:** a component consumes semantic tokens only. No hex, no primitive ramp values, no
per-client strings. `scripts/check-template-purity.ts` enforces this in CI.

## v1 — foundations and controls

| Figma | Node | Planned path | Props |
|---|---|---|---|
| Icon (18) | `12:2` | `src/components/ui/Icon.tsx` | `name`, `size` |
| Button | `13:77` | `src/components/ui/Button.tsx` | `variant` primary/secondary/ghost/emergency, `size` lg/md, `icon`, `disabled` |
| Badge | `16:33` | `src/components/ui/Badge.tsx` | `intent` neutral/brand/success/warning/emergency, `icon` |
| Input | `17:75` | `src/components/form/Input.tsx` | `type` text/textarea/select, `state`, `label`, `hint`, `error` |
| Card/Service | `18:3` | `src/components/cards/ServiceCard.tsx` | `title`, `body`, `price`, `showPrice`, `icon`, `href` |
| Card/Stat | `18:17` | `src/components/cards/StatCard.tsx` | `value`, `label` |
| Card/Review | `18:20` | `src/components/cards/ReviewCard.tsx` | `quote`, `author`, `source` |
| FAQ Item | `20:16` | `src/components/ui/FaqItem.tsx` | `question`, `answer`, `defaultOpen` |
| Bar/Sticky Call | `22:3` | `src/components/layout/StickyCallBar.tsx` | — reads `site.config` |
| Bar/Notdienst | `22:36` | `src/components/layout/NotdienstBar.tsx` | `state` open/closed — **computed**, never passed |
| Cookie Banner | `23:3` | `src/components/consent/CookieBanner.tsx` | — |
| Cookie Settings | `23:14` | `src/components/consent/CookieSettings.tsx` | — |
| Nav/Desktop | `25:3` | `src/components/layout/NavDesktop.tsx` | — reads nav config |
| Nav/Mobile Header | `25:19` | `src/components/layout/NavMobile.tsx` | — |
| Nav/Mobile Drawer | `25:30` | `src/components/layout/NavDrawer.tsx` | `open` |

## v1.1 — page furniture

| Figma | Node | Planned path | Props |
|---|---|---|---|
| Footer / Desktop | `54:34` | `src/components/layout/Footer.tsx` | — reads `site.config` + nav |
| Footer / Mobile | `54:55` | same component, responsive | — |
| Breadcrumb | `55:12` | `src/components/ui/Breadcrumb.tsx` | `items[]` → emits `BreadcrumbList` |
| Card/Project | `55:21` | `src/components/cards/ProjectCard.tsx` | `tag`, `title`, `meta`, `image`, `href` |
| Card/Team | `55:28` | `src/components/cards/TeamCard.tsx` | `name`, `role`, `detail`, `image` |
| Card/Article | `55:36` | `src/components/cards/ArticleCard.tsx` | `category`, `title`, `excerpt`, `meta`, `image` |
| Card/Job | `56:17` | `src/components/cards/JobCard.tsx` | `badge`, `workload`, `start`, `title`, `body` → emits `JobPosting` |
| Process Step | `56:23` | `src/components/blocks/ProcessStep.tsx` | `number`, `title`, `body` |
| Price Row | `56:29` | `src/components/blocks/PriceRow.tsx` | `label`, `note`, `value` |
| Pagination | `56:44` | `src/components/ui/Pagination.tsx` | `page`, `pageCount`, `hrefFor` |
| Alert | `57:45` | `src/components/ui/Alert.tsx` | `type` info/success/warning/error, `title`, `body` |
| Block/Einsatzgebiet | `58:51` | `src/components/blocks/ServiceArea.tsx` | — reads `serviceArea`; same array the PLZ check validates against |
| Wizard Dot | `58:69` | `src/components/form/WizardDot.tsx` | `state` done/active/todo |
| Wizard Rail | `59:52` | `src/components/form/WizardRail.tsx` | `steps[]`, `current` |
| Before/After | `59:64` | `src/components/blocks/BeforeAfter.tsx` | `before`, `after`, `alt` — slider role, arrow keys |
| Gallery/Lightbox | `59:84` | `src/components/blocks/Lightbox.tsx` | `images[]`, `index` — focus trap, Esc, restore focus |

## Screens → routes

`Screens — Sanitär` maps 1:1 onto the IA in the plan. Desktop is 1440, mobile 375.

| Screen | Route |
|---|---|
| Home | `/` |
| Leistungen | `/leistungen` |
| Leistung Detail | `/leistungen/[service]` |
| Ort × Leistung | `/leistungen/[service]/[ort]` |
| Notdienst | `/notdienst` |
| Referenzen · Referenz Detail | `/referenzen`, `/referenzen/[slug]` |
| Über uns | `/ueber-uns` |
| Offerte | `/offerte` |
| Kontakt | `/kontakt` |
| Jobs | `/jobs` |
| Ratgeber · Artikel | `/ratgeber`, `/ratgeber/[slug]` |
| Bewertungen | `/bewertungen` |
| Impressum · Datenschutz · Cookie-Einstellungen | `/impressum`, `/datenschutz`, `/cookie-einstellungen` |
| 404 | — |

## Tokens added after the first export

| Token | Why |
|---|---|
| `color/status/info-fg` · `info-bg` | The Theme collection had no info pair; the Alert component would otherwise have had to reach into Primitives. |
| `color/overlay/scrim` | Same reason, for the lightbox. |
| `color/border/control` | **The boundary of an interactive control.** `border/default` is 1.31:1 — correct for a divider, a real WCAG 1.4.11 failure on an input field. Split rather than darkened, because darkening every rule to 3:1 makes the whole design look heavy. Bound on: Input (Default), Pagination, Wizard Dot (Todo). |
| `color/icon/on-brand` | Mode-aware, mirrors `color/cta/fg`. White on the Elektro amber is 2:1. Never use `icon/inverse` on a brand fill. |
| `color/border/brand` [Elektro only] | Was `elektro/500` at 2:1 against the page — and it is the Secondary button's edge, so it is a control boundary. Now `elektro/600`, 3.94:1. |
