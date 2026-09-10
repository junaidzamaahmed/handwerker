# Design Completion Checklist — gate before `src/` exists

Internal working reference. **Code implementation does not start until every box in
Stages A–G is ticked.** Rationale: the whole business model rests on the template being
reskinnable in hours. Every gap left in Figma becomes a decision made ad hoc in code,
and ad-hoc decisions in code are exactly what breaks the disjoint-file-set property in
`docs/reuse-and-client-delivery.md`.

File: `UK0KdruELZEFxDn2vZJ73K` · Run: `hw-ds-2026-09-09`

ALL STAGES COMPLETE — 2026-09-10. Audits: contrast 126/126 pass, 0 collapsed frames,
0 empty image slots. Open items are listed at the bottom under "Carried forward".

Status key: `[ ]` todo · `[~]` in progress · `[x]` done+verified · `[-]` deliberately cut

---

## Stage A — v1.1 components (blocking: screens instance these)

Everything below is used by two or more screens. Anything used by exactly one screen is
built inline on that screen instead — a component with one instance is overhead.

- [x] A1  Footer (4-column desktop + stacked mobile; NAP block, legal links, claim)
- [x] A2  Breadcrumb (`BreadcrumbList` schema shape: home › parent › current)
- [x] A3  Card/Project — reference tile w/ image, service tag, Ort, duration
- [x] A4  Card/Team — photo, name, function, qualification line
- [x] A5  Process Step — numbered, used by Home, Leistung, Offerte, Notdienst
- [x] A6  Before/After slider — Referenz detail (and Maler/Dach verticals later)
- [x] A7  Map + Einsatzgebiet block — static map, PLZ/Gemeinde list (no Maps embed)
- [x] A8  Wizard Step — progress rail + step frame, 4 states (todo/active/done/error)
- [x] A9  Card/Article — Ratgeber teaser
- [x] A10 Card/Job — role, workload, Lehrstelle badge (`JobPosting` fields)
- [x] A11 Price Row — Leistung "Was es kostet" + agency Preise table
- [x] A12 Gallery / Lightbox — Referenz detail
- [x] A13 Alert / Inline Message — info / success / warning / error (States page)
- [x] A14 Prose block — legal pages, long-form Ratgeber body (h2/h3/p/ul/table rhythm)
- [x] A15 Pagination — Referenzen + Ratgeber index

**Gate A:** every component hugs to its real height (`h > 20` check), every colour is a
bound variable, every text uses a named text style, `description` set on each COMPONENT.

---

## Stage B — Screens · Sanitär · Desktop 1440 (the flagship)

Two exist. Fourteen do not. Route list is `plan §2`; page contract for service pages is
`docs/service-taxonomy.md` §Cross-vertical page contract (8 blocks, no deviation).

- [x] B1  Home
- [x] B2  Leistungen (index)
- [x] B3  Leistung Detail — Rohrreinigung (the pattern for all 29)
- [x] B4  Ort × Leistung — Rohrreinigung Seuzach (thin-content guardrail visible)
- [x] B5  Notdienst
- [x] B6  Referenzen (index)
- [x] B7  Referenz Detail — Badumbau Seuzach
- [x] B8  Über uns
- [x] B9  Offerte (wizard, step 1 + step 4 photo + success)
- [x] B10 Kontakt
- [x] B11 Jobs
- [x] B12 Ratgeber (index)
- [x] B13 Ratgeber Artikel
- [x] B14 Bewertungen
- [x] B15 Impressum
- [x] B16 Datenschutz
- [x] B17 Cookie-Einstellungen
- [x] B18 404

---

## Stage C — Screens · Sanitär · Mobile 375

Not every desktop screen needs a mobile twin drawn: the template's layout rules are
established once and then repeat. Draw mobile where the layout genuinely *changes shape*
or where the screen is a conversion path.

- [x] C1  Home
- [x] C2  Notdienst — highest-intent mobile screen in the whole site
- [x] C3  Leistung Detail
- [x] C4  Offerte wizard (step 1, step 4, success)
- [x] C5  Kontakt
- [x] C6  Referenzen index (grid → single column w/ 4:3 crops)
- [-] C7  Legal pages mobile — single-column prose, no layout decision to make
- [-] C8  Ratgeber/Jobs/Bewertungen mobile — same stack rules as C6

---

## Stage D — Theme variants (the reskin proof)

- [x] D1  Home / Desktop — Elektro
- [x] D2  Home / Desktop — Garten
- [x] D3  Home / Mobile — Elektro
- [x] D4  Home / Mobile — Garten
- [x] D5  Leistung Detail — Elektro (`elektrokontrolle`/SiNa — strongest page in vertical)
- [x] D6  Leistung Detail — Garten (`heckenschnitt`, seasonal slot active)
- [x] D7  Notdienst — Elektro (proves `features.notdienst` ON in a 2nd vertical)
- [-] D8  Notdienst — Garten — **deliberately absent.** `features.notdienst = false`.
          Its absence is the feature working. Documented on the Cover, not drawn.

---

## Stage E — States page

Every one of these is a real screen a customer hits. Skipping them is how "we'll figure
it out in code" becomes three different error styles in one codebase.

- [x] E1  Form validation — inline errors, error summary, focus order annotated
- [x] E2  Offerte: PLZ outside service area (polite redirect, not a dead end)
- [x] E3  Offerte: submitting / success / send-failed
- [x] E4  Empty states — no reviews yet, no reference projects yet, no open jobs
- [x] E5  Loading — image skeletons, static-map skeleton
- [x] E6  Cookie banner + settings modal, all three paths
- [x] E7  Notdienst bar: open vs closed (computed from `openingHours`)
- [x] E8  Offline / 500

---

## Stage F — Agency site (the thing that sells the above)

- [x] F1  Home — problem, proof, three demos side by side
- [x] F2  Leistungen / Was Sie bekommen
- [x] F3  Demo-Galerie — the three verticals, phone-frame presentation
- [x] F4  Preise — three packages + care plan (numbers left as `CHF ___`, see note)
- [x] F5  Kontakt / Erstgespräch

> **Note on prices:** the Preise page ships with placeholder amounts. I do not have
> reliable current CHF benchmarks for the Swiss SMB web market and will not invent them
> — plan §10 says the same. Layout is designed to hold 3–4 digits + "ab".

---

## Stage G — Handoff gate (all of these, before any code)

- [x] G1  Height audit — zero auto-layout frames under 20px across every page
- [x] G2  Contrast re-audit across all 3 modes incl. every new component (target 0 fails)
- [x] G3  Token export refreshed → `config/tokens.base.css` + `config/verticals/*.css`
- [x] G4  Every screen's copy written to `content/de/` (not living only in Figma)
- [x] G5  Responsive annotations — breakpoint behaviour per block, written on the canvas
- [x] G6  Focus-order + keyboard annotations on nav, wizard, gallery, cookie modal
- [x] G7  Schema note per screen — which JSON-LD type each page emits
- [x] G8  Photography audit — every image slot filled, licence recorded in CREDITS.md
- [x] G9  Cover page updated: page map, what's deliberately absent and why
- [x] G10 `docs/figma-build-notes.md` current
- [x] G11 Component inventory → `docs/component-inventory.md` (Figma name ↔ planned
          `src/components/` path ↔ props). This is the Code Connect map, written early.

---

## Deliberately out of scope for v1 design

Recorded so they read as decisions, not oversights.

- Light/dark mode — 3 mode slots spent on the reskin axis (`.figma/v1-scope.md`)
- FR/IT screens — layout is language-agnostic; DE is the longest-string worst case
- Ratgeber article variety — one article layout serves all
- Blog/CMS admin UI — Decap/Sveltia ship their own
- Animation/motion spec — deferred to implementation; `prefers-reduced-motion` honoured


---

## Carried forward into implementation (not design gaps)

- **Prices on the agency Preise page.** Layout holds them; the numbers need calibrating
  against the Swiss SMB market. Inventing them would be worse than the gap.
- **Agency name.** "Handwerk Web" is a working title, labelled as such in the nav.
- **Real client photography.** Priority order in `public/media/CREDITS.md`. The team
  portraits are first and the Über uns screen carries a visible demo disclosure until
  they are replaced.
- **Hedge-cutting close season (Garten FAQ).** The screen asks the question without
  asserting a date — the rule is cantonal and I will not invent a range on a page that
  sells expertise.
- **Code Connect.** Deferred until `src/` exists; the map is already written in
  `docs/component-inventory.md`, so it is a transcription job, not a design decision.
