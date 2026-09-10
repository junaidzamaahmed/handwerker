# Service Taxonomy — 3 Verticals

Source of truth for service pages, nav, quote-form step 1, and `Service` JSON-LD.

Columns:
- **Slug (de)** — canonical route under `/leistungen/`
- **Slug (en)** — route under `/services/`
- **Intent** — `NOTFALL` (emergency, highest conversion), `PFLICHT` (legally mandated,
  recurring), `PROJEKT` (high-value planned work), `UNTERHALT` (recurring maintenance)
- **Prio** — page build order. P1 = ships in the demo, P2 = ships per client if relevant.

---

## A. Sanitär / Heizung (flagship demo)

Schema type: `Plumber` · Association: suissetec

| Leistung (de) | Slug (de) | Slug (en) | Intent | Prio |
|---|---|---|---|---|
| Rohrreinigung & Verstopfungen | `rohrreinigung` | `drain-cleaning` | NOTFALL | P1 |
| Wasserschaden & Leckortung | `wasserschaden` | `water-damage` | NOTFALL | P1 |
| 24h Notfalldienst / Pikett | `notdienst` *(own page)* | `emergency` | NOTFALL | P1 |
| Badsanierung & Badumbau | `badsanierung` | `bathroom-renovation` | PROJEKT | P1 |
| Sanitärinstallation | `sanitaerinstallation` | `plumbing-installation` | PROJEKT | P1 |
| Heizung: Service & Ersatz | `heizung` | `heating` | PROJEKT | P1 |
| Wärmepumpe | `waermepumpe` | `heat-pump` | PROJEKT | P2 |
| Boiler entkalken & Service | `boiler-service` | `water-heater-service` | UNTERHALT | P2 |
| Spenglerei & Dachrinnen | `spenglerei` | `plumbing-metalwork` | PROJEKT | P2 |
| Armaturen & Reparaturen | `reparaturen` | `repairs` | NOTFALL | P2 |

**Demand notes.** `rohrreinigung` and `wasserschaden` carry the emergency intent that
converts on a phone call within minutes — these two justify the sticky call bar and the
Notdienst page on their own. `waermepumpe` demand is driven by cantonal subsidy programmes
and fossil-heating replacement deadlines; worth a Ratgeber article per canton served.

---

## B. Elektro

Schema type: `Electrician` · Association: EIT.swiss

| Leistung (de) | Slug (de) | Slug (en) | Intent | Prio |
|---|---|---|---|---|
| Störungsbehebung & Notdienst | `stoerungsbehebung` | `fault-repair` | NOTFALL | P1 |
| Elektrokontrolle & SiNa | `elektrokontrolle` | `electrical-inspection` | PFLICHT | P1 |
| E-Ladestation / Wallbox | `ladestation` | `ev-charging` | PROJEKT | P1 |
| Elektroinstallation Neubau & Umbau | `elektroinstallation` | `electrical-installation` | PROJEKT | P1 |
| Sicherungskasten erneuern | `sicherungskasten` | `fuse-box-replacement` | PROJEKT | P1 |
| Photovoltaik & Solar | `photovoltaik` | `solar-pv` | PROJEKT | P2 |
| Smart Home & KNX | `smart-home` | `smart-home` | PROJEKT | P2 |
| Beleuchtungsplanung | `beleuchtung` | `lighting-design` | PROJEKT | P2 |
| Netzwerk & Multimedia | `netzwerk` | `network-multimedia` | PROJEKT | P2 |

**`elektrokontrolle` is the single strongest page in this vertical.** Under the Swiss
low-voltage installation ordinance (NIV), owners receive a periodic inspection notice
from their grid operator and must have the installation checked by an authorised body,
which produces a Sicherheitsnachweis (SiNa). Homeowners receive that letter, do not
understand it, and search for help immediately. High intent, fixed scope, recurring on a
known cycle. Build this page first and write a Ratgeber piece explaining the letter.

---

## C. Garten / Gartenbau

Schema type: `LandscapingBusiness` · Association: JardinSuisse

| Leistung (de) | Slug (de) | Slug (en) | Intent | Prio |
|---|---|---|---|---|
| Gartenunterhalt & Pflege | `gartenunterhalt` | `garden-maintenance` | UNTERHALT | P1 |
| Gartengestaltung & Neuanlage | `gartengestaltung` | `garden-design` | PROJEKT | P1 |
| Baumpflege & Baumfällung | `baumpflege` | `tree-care` | PROJEKT | P1 |
| Hecken schneiden | `heckenschnitt` | `hedge-trimming` | UNTERHALT | P1 |
| Rasen & Rollrasen | `rasen` | `lawn-care` | PROJEKT | P1 |
| Naturstein, Wege & Plattenbeläge | `natursteinarbeiten` | `paving-stonework` | PROJEKT | P2 |
| Bewässerungsanlagen | `bewaesserung` | `irrigation` | PROJEKT | P2 |
| Zäune & Sichtschutz | `sichtschutz` | `fencing-privacy` | PROJEKT | P2 |
| Teich & Wasseranlagen | `teichbau` | `ponds-water` | PROJEKT | P2 |
| Winterdienst | `winterdienst` | `winter-service` | UNTERHALT | P2 |

**Seasonality is the design constraint here.** Unlike the other two verticals, demand
swings hard by month. The home page needs a configurable seasonal slot
(`config.seasonal.activeCampaign`) so the same site leads with Heckenschnitt in June and
Winterdienst in October without a redeploy. `gartenunterhalt` sells recurring contracts —
that is the page to optimise for lifetime value, not volume.

---

## Cross-vertical page contract

Every `/leistungen/[service]` page uses the same block sequence, so one Figma layout
serves all 29 services:

1. H1 = the service in the customer's words, not the trade's
2. Trust strip + phone (above fold on mobile)
3. "Das machen wir" — scope, as a checklist
4. "Was es kostet" — Richtpreis range or "ab CHF X" + what drives the price
5. "So läuft es ab" — 3–4 process steps
6. Reference project (1–2, filtered by service tag)
7. Service-specific FAQ (3–5, feeds `FAQPage` schema)
8. Service area reminder + CTA band

Deviation from this sequence per service is a red flag — it means the layout is
absorbing content that belongs in config or in the Ratgeber.
