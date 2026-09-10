import type { SiteConfig } from './site.config.types';

/**
 * DEMO — D&D Handwerker, Muttenz BL
 *
 * This is an UNSOLICITED PITCH DEMO for a real business. Rules that follow from that:
 *
 *  - `demoMode: true` -> noindex + demo bar. Non-negotiable: this site must never compete
 *    with their own Google Business Profile in search results.
 *  - Every factual field below comes from their public Google Business Profile (name,
 *    address, phone, opening hours, rating, review text) or is left empty.
 *  - Nothing is invented. No association membership, no Meisterbetrieb badge, no hourly
 *    rate, no founding year, no named owner, no UID — none of that is public, so none of
 *    it is asserted here. docs/handover-dd.md lists what they need to confirm.
 *  - The email addresses are PROPOSALS on a domain nobody has registered yet. They are
 *    the only thing on this site that is not already true, and the demo bar says so.
 */
export const siteConfig: SiteConfig = {
  siteUrl: 'https://dd-handwerker-demo.vercel.app',
  demoMode: true,
  theme: 'maler',
  themeColor: '#ffffff',

  business: {
    legalName: 'D&D Handwerker',
    displayName: 'D&D Handwerker',
    vertical: 'maler',
    // Their Google category is "Handyman", for which schema.org has no type.
    // GeneralContractor is the closest LocalBusiness subtype for an allrounder doing
    // painting, flooring, drywall and interior fit-out.
    schemaType: 'GeneralContractor',
    // foundedYear and owner deliberately omitted — neither is public.
    tagline: {
      de: 'Maler, Parkett und Innenausbau in Muttenz und Basel',
      en: 'Painting, flooring and interior work in Basel',
      fr: '',
      it: '',
    },
  },

  legal: {
    // Not rendered: content/de/legal/impressum.mdx omits the Handelsregister block,
    // because the entry, the UID and the legal form are not public.
    legalForm: 'Einzelfirma',
    crossBorderDACH: false,
  },

  contact: {
    phone: '+41774010757',
    phoneDisplay: '077 401 07 57',
    // The number on their profile is a mobile and the reviews say they answer it.
    // WhatsApp on the same number — for this customer base that is the primary channel.
    whatsapp: '41774010757',
    email: 'info@dd-handwerker.ch',
    quoteInbox: 'offerte@dd-handwerker.ch',
  },

  address: {
    street: 'Pestalozzistrasse 11',
    postalCode: '4132',
    city: 'Muttenz',
    canton: 'BL',
    country: 'CH',
    geo: { lat: 47.5339165, lng: 7.6306463 },
  },

  hours: {
    // Exactly as published on their Google profile.
    regular: [
      { days: [1, 2, 3, 4, 5], opens: '08:00', closes: '19:00' },
      { days: [6], opens: '09:00', closes: '14:00' },
    ],
    emergency: {
      available: false,
      label: {
        de: 'Kein 24-Stunden-Pikettdienst — wir arbeiten Mo–Fr 8–19 Uhr und Sa 9–14 Uhr',
        en: 'No 24-hour call-out — we work Mon–Fri 8am–7pm and Sat 9am–2pm',
        fr: '',
        it: '',
      },
    },
  },

  /**
   * Basel city plus the Baselland communes within a short drive of Muttenz. Kept tight
   * on purpose: an inflated list produces unqualified leads and thin location pages.
   */
  serviceArea: {
    cantons: ['BS', 'BL'],
    gemeinden: [
      { name: 'Muttenz', plz: ['4132'], seoPage: true },
      { name: 'Basel', plz: ['4051', '4052', '4053', '4054', '4055', '4056', '4057', '4058', '4059'], seoPage: true },
      { name: 'Birsfelden', plz: ['4127'], seoPage: true },
      { name: 'Pratteln', plz: ['4133'], seoPage: true },
      { name: 'Münchenstein', plz: ['4142'], seoPage: true },
      { name: 'Reinach', plz: ['4153'], seoPage: true },
      { name: 'Allschwil', plz: ['4123'], seoPage: true },
      { name: 'Riehen', plz: ['4125'], seoPage: true },
      { name: 'Arlesheim', plz: ['4144'], seoPage: false },
      { name: 'Binningen', plz: ['4102'], seoPage: false },
      { name: 'Bottmingen', plz: ['4103'], seoPage: false },
      { name: 'Liestal', plz: ['4410'], seoPage: false },
    ],
    radiusKm: 15,
    outOfAreaMessage: {
      de: 'Ihre Postleitzahl liegt ausserhalb unseres Einsatzgebiets. Rufen Sie trotzdem an — wenn wir nicht kommen können, kennen wir meist jemanden in Ihrer Nähe.',
      en: 'Your postcode is outside our service area. Call anyway — if we cannot come, we usually know someone who can.',
      fr: '',
      it: '',
    },
  },

  /**
   * Empty on purpose. No trade-association membership, Meisterbetrieb title, insurance
   * or certification is documented anywhere public, so none is claimed. If D&D hold any
   * of these, filling this in turns on the trust badges and the JSON-LD `memberOf` — it
   * is the single highest-value thing they could hand us.
   */
  credentials: {
    associations: [],
    meisterbetrieb: false,
    lehrbetrieb: false,
  },

  pricing: {
    currency: 'CHF',
    freeQuote: true,
    // No rates published anywhere. `features.priceTransparency` stays off until they
    // give us real numbers — inventing a Stundenansatz for someone else's business is
    // not a demo, it is a misquote they would have to honour or correct.
  },

  privacy: {
    controller: { name: 'D&D Handwerker', email: 'info@dd-handwerker.ch' },
    processors: [
      {
        name: 'Vercel Inc.',
        purpose: {
          de: 'Hosting und Auslieferung der Website',
          en: 'Website hosting and delivery',
          fr: '',
          it: '',
        },
        country: 'US',
        privacyUrl: 'https://vercel.com/legal/privacy-policy',
        category: 'notwendig',
        hosts: [],
      },
      {
        name: 'Mailjet SAS',
        purpose: {
          de: 'Versand Ihrer Anfrage per E-Mail',
          en: 'Delivering your enquiry by email',
          fr: '',
          it: '',
        },
        country: 'FR',
        privacyUrl: 'https://www.mailjet.com/legal/privacy-policy/',
        category: 'notwendig',
        hosts: ['api.mailjet.com'],
      },
    ],
    policyVersion: '2026-09-10',
    leadRetention: 'none',
  },

  features: {
    notdienst: false, // they publish fixed hours, not a 24h Pikett
    jobs: false,
    blog: false,
    reviews: true, // 4.9 from 46 real reviews — their single strongest asset
    secondLocale: true, // see the i18n note below: this is the whole point for this client
    photoUpload: true, // "send a photo of the shelf" fits this trade exactly
    beforeAfterSlider: true,
    priceTransparency: false,
    seasonalCampaign: false,
    analytics: 'none',
    map: 'static',
  },

  integrations: {
    // googlePlaceId intentionally unset: content/reviews.json was compiled by hand from
    // their public profile rather than through the Places API. Set it and
    // scripts/fetch-reviews.ts takes over at build time.
    mailProvider: 'mailjet-eu',
  },

  /**
   * German first, English a first-class citizen rather than an afterthought.
   * Every public Google review of this business is written in English — this is a Basel
   * expat customer base, and content/en/ is fully translated, not a fallback.
   */
  i18n: { defaultLocale: 'de', locales: ['de', 'en'] },
};
