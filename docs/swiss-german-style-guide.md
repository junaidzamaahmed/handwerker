# de-CH Style Guide

Enforced where possible by `scripts/lint-de-ch.ts`. Swiss clients notice these, and
getting them wrong is the clearest possible signal that a site was built for Germany and
resold.

## Hard rules (lint errors)

| Rule | Wrong | Right |
|---|---|---|
| **No ß, ever** | Straße, Größe, außerhalb | Strasse, Grösse, ausserhalb |
| Thousands separator | 1.250 / 1,250 | 1'250 |
| Currency | 1250 € / EUR | CHF 1'250.00 |
| Decimal, non-currency | 4.9 von 5 | 4,9 von 5 |
| Date | 2026-09-09 in prose | 09.09.2026 |
| Phone, domestic | +41 52 123 45 67 in body text | 052 123 45 67 |
| Phone, `tel:` href | 052 123 45 67 | +41521234567 |

Note the split between the two decimal rows: Swiss **currency** takes a point, Swiss
**prose** takes a comma. `Intl.NumberFormat('de-CH')` only knows the currency
convention and will render a rating as `4.9`, so ratings are formatted from
`common.decimalSeparator` in the message catalogue instead — see `formatRating` in
`src/lib/config.ts`.

## Vocabulary — Swiss over standard German

| Use | Not | Note |
|---|---|---|
| Offerte | Angebot | The single most recognisable one. A Swiss customer asks for an *Offerte*. |
| Stundenansatz | Stundensatz | |
| Pikettdienst / Notfalldienst | Bereitschaftsdienst | |
| Liegenschaft | Immobilie | Especially with Verwaltungen. |
| Lernende | Auszubildende / Azubis | *Azubi* is a giveaway. |
| Mitarbeitende | Mitarbeiter | Also neutral, which is the current norm. |
| innert | innerhalb (of time) | "innert 60 Minuten" |
| parkieren | parken | |
| Velo | Fahrrad | Rarely needed in these trades. |
| Postleitzahl / PLZ | Postleitzahl | Same word; the form label is just "PLZ". |
| Grüezi | Hallo | Only in informal contexts — usually too casual for a site. |
| Estrich | Dachboden | Attic. Comes up in roofing and water damage. |
| Sanitär | Klempner | ***Klempner* is German. A Swiss plumber is a Sanitärinstallateur or Spengler.** |

## Tone

- **`Sie` throughout.** No exceptions in these verticals.
- Concrete over abstract: "innert 60 Minuten vor Ort" beats "schnelle Reaktionszeiten".
- State prices and timeframes wherever honest. Competitors hide them; that's the opening.
- No superlatives that can't be evidenced. "Der beste Sanitär der Region" reads as noise
  and, if provable-false, is a UWG problem.
- Short sentences. The reader is often stressed, on a phone, standing in water.
- Never claim a certification, membership, or rating the client doesn't hold.

## Typography

- Guillemets «so» are the Swiss convention for quotations; „so“ is German. Curly
  apostrophes in *1'250* should be the typographic ’ in body copy.
- German compounds are long — *Sicherheitsnachweis*, *Liegenschaftsverwaltung*. Test
  every heading and button at its longest string; enable hyphenation (`hyphens: auto`
  with `lang="de-CH"`) on narrow columns.
- Reserve ~30% more width than the English equivalent for any label.

## Translation policy

EN is a genuine second locale, not a mirror: shorter sentences, and slugs translated
(`/leistungen/rohrreinigung` ↔ `/services/drain-cleaning`). FR/IT stay scaffolded and
empty until a client pays for them — **machine-translated French shown to a Romandie
prospect does more damage than having no French at all.**
