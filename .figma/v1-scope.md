# Figma v1 Scope — LOCKED at P0.d

File: `UK0KdruELZEFxDn2vZJ73K` — "Handwerk Template — Design System"
Run ID: `hw-ds-2026-09-09`

## Decisions taken at plan-lock

**No light/dark modes.** The three Theme modes are Sanitär / Elektro / Garten. Handwerker
customers do not expect dark mode; the mode budget buys the reskin axis instead.

**Fonts: Archivo (display) + Inter (body).** Both open-source, therefore self-hostable —
non-negotiable given the no-Google-Fonts-CDN rule in the compliance module. Archivo is a
sturdy grotesque that reads as industrial rather than startup-y; Inter carries the small
sizes and German diacritics.

> **Footgun found during discovery:** Archivo spells it `SemiBold`, Inter spells it
> `Semi Bold`. A single shared `weight/semibold` token cannot serve both families. Weight
> tokens are therefore split per family (`weight/display-*` vs `weight/body-*`).

**Body base size 17px, not 16px.** Trade customers skew 45–75. Consistent with the art
direction rule in the plan.

## Token set

| Collection | Modes | Contents | Count |
|---|---|---|---|
| Primitives | Value | neutral 0–1000, sanitaer/elektro/garten 50–900, status, overlay | ~52 |
| Theme | **Sanitär / Elektro / Garten** | semantic bg, surface, text, border, cta, icon, status | ~32 |
| Spacing | Value | `spacing/*`, `size/*` (touch target, icons, containers) | ~15 |
| Radius | Value | `radius/none…full` | 6 |
| Typography | Value | families, per-family weights, `text/*` sizes | ~17 |

Key semantic token: **`color/cta/fg` is mode-aware** — white on Sanitär blue and Garten
green, but near-black on Elektro amber. Without this the amber CTA fails contrast.
`color/bg/emergency` stays red in all three modes: Notdienst is not a brand decision.

## Text styles (16)
Display/Hero(+Mobile), Heading/H1(+Mobile), H2, H3, H4, Body/Large, Body/Base,
Body/Base Strong, Body/Small, Label/Large, Label/Small, Eyebrow, Button/Base,
Phone/Display.

## Effect styles (3)
Shadow/Card, Shadow/Raised, Shadow/Sticky (upward, for the mobile call bar).

## Components — v1 (12, in dependency order)
1. Icon (base + 16-icon starter set, INSTANCE_SWAP)
2. Button — Variant(Primary/Secondary/Ghost/Emergency) × Size(Lg/Md) × State(Default/Hover/Disabled) = 24
3. Badge / Trust chip
4. Input — Type(Text/Textarea/Select) × State(Default/Focus/Error/Disabled) = 12
5. Service card
6. Stat tile
7. Review card
8. FAQ accordion item
9. Sticky call bar (mobile)
10. Notdienst alert bar
11. Cookie banner (3 equal-weight buttons)
12. Nav bar + mobile drawer

## Deferred to v1.1 (not abandoned — sequenced)
Project card w/ before-after, team card, process step, footer, breadcrumb, quote wizard
step, before/after slider, map + service-area block, then Pages 4–7 (screens, theme
variants, states, agency site).

## Gap analysis (P0.f)

- **In code, not in Figma:** everything. File was empty — 1 page, 0 collections, 0
  variables, 0 styles, 0 components.
- **In Figma, not in code:** nothing.
- **Conflicts (P0.e):** none. No competing source of truth exists yet, so
  `config/site.config.types.ts` + `docs/` are authoritative by default.
- **Reusable assets:** none. `get_libraries` returned zero subscribed libraries;
  `search_design_system` for icons, button and input returned empty across the file and
  the available community kits (Material 3, SDS, Apple UI kits). Material 3 and SDS were
  rejected on the reuse matrix anyway — incompatible token model (no vertical mode axis)
  and no Swiss-specific primitives (Notdienst bar, sticky call bar). **Verdict: build.**
