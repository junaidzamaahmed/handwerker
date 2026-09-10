import type { SiteConfig } from './site.config.types';

/**
 * FLAGSHIP DEMO — Sanitär Muster AG, Winterthur ZH
 *
 * Fictional business. Do not swap in a real prospect's name, address or logo without
 * written permission, and never present invented reviews or association memberships as
 * genuine. `demoMode: true` adds noindex + the demo bar.
 */
export const siteConfig: SiteConfig = {
  siteUrl: 'https://sanitaer.demo.example.ch',
  demoMode: true,
  theme: 'sanitaer',
  themeColor: '#ffffff',

  business: {
    legalName: 'Sanitär Muster AG',
    displayName: 'Sanitär Muster',
    vertical: 'sanitaer',
    schemaType: 'Plumber',
    foundedYear: 1998,
    owner: { name: 'Markus Muster', role: 'Inhaber, eidg. dipl. Sanitärinstallateur', photo: '/team/inhaber.jpg' },
    tagline: {
      de: 'Ihr Sanitär- und Heizungspartner in Winterthur',
      en: 'Your plumbing and heating partner in Winterthur',
      fr: '', it: '',
    },
  },

  legal: {
    legalForm: 'AG',
    uid: 'CHE-123.456.789',
    mwstNumber: 'CHE-123.456.789 MWST',
    handelsregister: { office: 'Handelsregisteramt des Kantons Zürich', entryDate: '1998-04-16' },
    crossBorderDACH: false,
  },

  contact: {
    phone: '+41521234567',
    phoneDisplay: '052 123 45 67',
    emergencyPhone: '+41521234500',
    emergencyPhoneDisplay: '052 123 45 00',
    whatsapp: '41791234567',
    email: 'info@sanitaer-muster.ch',
    quoteInbox: 'offerte@sanitaer-muster.ch',
  },

  address: {
    street: 'Industriestrasse 14',
    postalCode: '8400',
    city: 'Winterthur',
    canton: 'ZH',
    country: 'CH',
    geo: { lat: 47.4998, lng: 8.7241 },
  },

  hours: {
    regular: [
      { days: [1, 2, 3, 4], opens: '07:00', closes: '17:00' },
      { days: [5], opens: '07:00', closes: '16:00' },
    ],
    closures: [
      { from: '2026-12-24', to: '2027-01-02', reason: { de: 'Betriebsferien', en: 'Company holidays', fr: '', it: '' } },
    ],
    emergency: {
      available: true,
      label: { de: '24 Stunden, 365 Tage im Jahr', en: '24 hours, 365 days a year', fr: '', it: '' },
      surchargeNote: {
        de: 'Ausserhalb der Bürozeiten gilt ein Zuschlag von 50 %. Wir nennen Ihnen den Preis, bevor wir losfahren.',
        en: 'A 50% surcharge applies outside office hours. We quote you before we set off.',
        fr: '', it: '',
      },
    },
  },

  serviceArea: {
    cantons: ['ZH', 'TG'],
    gemeinden: [
      { name: 'Winterthur', plz: ['8400', '8404', '8405', '8406', '8408'], seoPage: true },
      { name: 'Wiesendangen', plz: ['8542'], seoPage: true },
      { name: 'Elgg', plz: ['8353'], seoPage: true },
      { name: 'Seuzach', plz: ['8472'], seoPage: true },
      { name: 'Pfungen', plz: ['8422'], seoPage: false },
      { name: 'Frauenfeld', plz: ['8500'], seoPage: true },
    ],
    radiusKm: 25,
    outOfAreaMessage: {
      de: 'Ihre Postleitzahl liegt ausserhalb unseres Einsatzgebiets. Rufen Sie uns trotzdem an — wir empfehlen Ihnen gerne einen Betrieb in Ihrer Nähe.',
      en: 'Your postcode is outside our service area. Call us anyway — we are happy to recommend someone local.',
      fr: '', it: '',
    },
  },

  credentials: {
    associations: [{ id: 'suissetec', memberSince: 1999 }],
    meisterbetrieb: true,
    lehrbetrieb: true,
    liabilityInsurance: { insurer: 'Beispiel Versicherung AG', coverageCHF: 5_000_000 },
    certifications: [{ name: 'Brandschutz-Fachperson VKF', issuer: 'VKF' }],
  },

  pricing: {
    currency: 'CHF',
    hourlyRateFrom: 110,
    calloutFeeFrom: 90,
    emergencySurchargePercent: 50,
    freeQuote: true,
    richtpreise: {
      rohrreinigung: { from: 190, unit: 'pauschal' },
      'boiler-service': { from: 280, unit: 'pauschal' },
      badsanierung: { from: 12_000, unit: 'pauschal' },
    },
  },

  /**
   * Deliberately short. The default build makes almost no third-party requests — that is
   * the compliance pitch, and it is verifiable in the network tab during a sales call.
   */
  privacy: {
    controller: { name: 'Sanitär Muster AG', email: 'datenschutz@sanitaer-muster.ch' },
    processors: [
      {
        name: 'Vercel Inc.',
        purpose: { de: 'Hosting und Auslieferung der Website', en: 'Website hosting and delivery', fr: '', it: '' },
        country: 'US',
        privacyUrl: 'https://vercel.com/legal/privacy-policy',
        category: 'notwendig',
        hosts: [],
      },
      {
        name: 'Mailjet SAS',
        purpose: { de: 'Versand Ihrer Offertanfrage per E-Mail', en: 'Delivering your quote request by email', fr: '', it: '' },
        country: 'FR',
        privacyUrl: 'https://www.mailjet.com/legal/privacy-policy/',
        category: 'notwendig',
        hosts: ['api.mailjet.com'],
      },
      {
        name: 'Plausible Analytics',
        purpose: { de: 'Anonyme Reichweitenmessung ohne Cookies', en: 'Cookieless, anonymous traffic measurement', fr: '', it: '' },
        country: 'DE',
        privacyUrl: 'https://plausible.io/privacy',
        category: 'statistik',
        storageKeys: [],
        hosts: ['plausible.io'],
      },
    ],
    policyVersion: '2026-09-01',
    leadRetention: 'none',
  },

  features: {
    notdienst: true,
    jobs: true,
    blog: true,
    reviews: true,
    secondLocale: true,
    photoUpload: true,
    beforeAfterSlider: true,
    priceTransparency: true,
    seasonalCampaign: false,
    analytics: 'plausible',
    map: 'static',
  },

  integrations: {
    mailProvider: 'mailjet-eu',
    social: { facebook: 'https://facebook.com/example', instagram: 'https://instagram.com/example' },
  },

  i18n: { defaultLocale: 'de', locales: ['de', 'en'] },
};
