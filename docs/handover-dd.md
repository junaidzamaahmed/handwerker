# Handover — D&D Handwerker, Muttenz

What this demo asserts, where each fact came from, and the short list D&D need to confirm
before anything goes live. `config/site.config.ts` points here.

## Verified against the public Google Business Profile

Re-checked **2026-09-11** against
`maps.google.com` CID `0xd1efa8694ced9bb9` (place `/g/11vr9b02nl`). Every row matched the
value already in `config/site.config.ts` — nothing needed correcting except one review's
relative date, which Google had aged from "6 months" to "7 months".

| Field | Google profile | In the build |
|---|---|---|
| Listing name | D&D Handwerker - Maler, Parkettleger, Trockenbauer, Innenausbau, All-rounder | `business.displayName` = `D&D Handwerker`; the trade list carries in `business.tagline` |
| Category | Handyman / Handywoman / Handyperson | `schemaType: 'GeneralContractor'` — schema.org has no Handyman type |
| Address | Pestalozzistrasse 11, 4132 Muttenz | `address` ✓ |
| Phone | 077 401 07 57 | `contact.phone` / `phoneDisplay` ✓ |
| Hours | Mon–Fri 08:00–19:00 · Sat 09:00–14:00 · Sun closed | `hours.regular` ✓ |
| Rating | 4.9 | `content/reviews.json` ✓ |
| Review count | 46 | ✓ |
| Distribution | 45 × 5★, 0 × 4★, 0 × 3★, 0 × 2★, 1 × 1★ | ✓ |
| Website | **none listed** | this demo is the pitch |
| Plus code | GJMJ+H7 Muttenz | not rendered |

## What the reviews say, by frequency

Google's own topic chips, which are a direct read on what customers hire them for. Useful
for ad copy and for deciding which service pages deserve the budget:

| Topic | Reviews mentioning it |
|---|---|
| lamps | 5 |
| shelf mounting | 3 |
| precise work | 3 |
| clean work | 3 |
| quality of work | 3 |
| efficient | 3 |
| reliability | 3 |
| apartment | 3 |
| IKEA | 2 |
| balcony | 2 |

Acted on in this build: *lamps*, *shelf mounting* and *IKEA* now appear by name in
`content/*/services/montage.mdx`; *precise / clean / reliable* drive the home-page USP
copy. **Not** acted on: *balcony* — two customers mention it but neither says what the
work was, and guessing at a service line is the one thing this demo does not do.

Every public review is in **English**. That is why `features.secondLocale` is on and
`content/en/` is a full translation rather than a fallback.

## The only things on this site that are not already true

1. **`info@dd-handwerker.ch` and `offerte@dd-handwerker.ch`** — proposals on a domain
   nobody has registered. Everything else is either from the profile or left empty.
2. **`siteUrl`** — a placeholder Vercel host.

`demoMode: true` keeps the whole site `noindex` and shows the banner saying so, so it
cannot compete with their own Google listing in search.

## What D&D need to confirm before launch

Nothing below is asserted anywhere in the build today. Each one is a field that is empty
on purpose.

- [ ] **Legal form and UID** — `legal.legalForm` is guessed as `Einzelfirma`. The
      Impressum currently prints a paragraph explaining the omission; that paragraph is
      replaced by the real Handelsregister block once they supply it.
- [ ] **Owner name** — needed for the Impressum of an Einzelfirma.
- [ ] **Domain** — then the two mailboxes above become real.
- [ ] **Credentials** (`credentials`): trade-association membership, Meisterbetrieb,
      Lehrbetrieb, liability insurance. All `false`/empty. Filling any of these switches
      on the trust badges and the JSON-LD `memberOf` — the single highest-value thing they
      can hand over.
- [ ] **Founding year** (`business.foundedYear`, omitted).
- [ ] **Hourly rate / call-out fee** — `features.priceTransparency` is off and stays off
      until there are real numbers. Inventing a Stundenansatz is a quote they would have
      to honour or retract.
- [ ] **Google Place ID** — set `integrations.googlePlaceId` and `scripts/fetch-reviews.ts`
      replaces the hand-compiled `content/reviews.json` at build time, so the rating stays
      current on its own.
- [ ] **Photo permission** — every image is from their own public profile
      (`public/media/CREDITS.md`). They should confirm they hold the rights, and ideally
      supply originals; the profile versions are downscaled.
- [ ] **Balcony work** — do they do it, and what kind? Two reviews mention it and nothing
      on the site does.

## Deliberately not claimed

No association membership, no Meisterbetrieb badge, no 24-hour Pikettdienst
(`features.notdienst: false` — they publish fixed hours), no hourly rate, no founding
year, no named staff, no team portraits, no invented projects. The four case studies in
`content/*/projects/` describe work visible in their own listing photos.
