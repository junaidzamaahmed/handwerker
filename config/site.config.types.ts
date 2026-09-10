/**
 * The entire per-client surface, part 1 of 3.
 *
 * Delivering a new client site = edit `site.config.ts`, `theme.css`, `content/`.
 * Nothing in `src/` should ever need touching. If a client job forces a `src/` edit,
 * that is a signal to promote the thing into this file.
 */

export type Locale = 'de' | 'en' | 'fr' | 'it';
export type Vertical = 'sanitaer' | 'elektro' | 'garten' | 'dach' | 'maler';
export type Canton =
  | 'AG' | 'AI' | 'AR' | 'BE' | 'BL' | 'BS' | 'FR' | 'GE' | 'GL' | 'GR'
  | 'JU' | 'LU' | 'NE' | 'NW' | 'OW' | 'SG' | 'SH' | 'SO' | 'SZ' | 'TG'
  | 'TI' | 'UR' | 'VD' | 'VS' | 'ZG' | 'ZH';

/** schema.org LocalBusiness subtype. Drives JSON-LD `@type`. */
export type BusinessSchemaType =
  | 'Plumber' | 'Electrician' | 'RoofingContractor'
  | 'HousePainter' | 'LandscapingBusiness' | 'GeneralContractor';

// ---------------------------------------------------------------------------
// Identity & legal
// ---------------------------------------------------------------------------

export interface BusinessIdentity {
  /** Registered legal name, exactly as in the Handelsregister. Used in Impressum + JSON-LD. */
  legalName: string;
  /** What customers call them. Used in nav, titles, copy. */
  displayName: string;
  vertical: Vertical;
  schemaType: BusinessSchemaType;
  /** Omit when it is not publicly documented. Drives JSON-LD `foundingDate`, which is a
   *  factual claim — an invented year is worse than an absent one. */
  foundedYear?: number;
  /** Shown on Über uns and in the quote-confirmation email. Builds trust — use it where
   *  the client is happy to be named. Optional: plenty of two-person firms are not. */
  owner?: { name: string; role: string; photo?: string };
  /** One line, under ~60 chars. Appears under the logo and in OG tags. */
  tagline: Record<Locale, string>;
}

/**
 * Swiss Impressum requirements (UWG Art. 3(1)(s) — identity and contact must be clear
 * and directly reachable). `uid` and `handelsregister` are not universally mandatory for
 * sole traders but including them measurably increases trust; leave undefined if absent.
 * Clients also serving DE/AT need the stricter DDG §5 variant — set `crossBorderDACH`.
 */
export interface LegalEntity {
  legalForm: 'Einzelfirma' | 'GmbH' | 'AG' | 'Kollektivgesellschaft';
  /** Format: CHE-123.456.789 */
  uid?: string;
  /** Format: CHE-123.456.789 MWST */
  mwstNumber?: string;
  handelsregister?: { office: string; entryDate: string };
  /** Adds the extra DDG §5 fields (Aufsichtsbehörde, Kammer, Berufsbezeichnung). */
  crossBorderDACH: boolean;
}

// ---------------------------------------------------------------------------
// Contact & location — the NAP single source of truth
// ---------------------------------------------------------------------------

/**
 * NAP consistency is the classic local-SEO leak. These values are rendered verbatim in
 * the footer, Impressum, contact page and JSON-LD. Never retype an address in content.
 */
export interface ContactDetails {
  /** E.164, for `tel:` hrefs. e.g. '+41441234567' */
  phone: string;
  /** Swiss display format. e.g. '044 123 45 67' */
  phoneDisplay: string;
  /** Separate 24h line if the client runs a Pikettdienst on a different number. */
  emergencyPhone?: string;
  emergencyPhoneDisplay?: string;
  mobile?: string;
  /** E.164 without '+', for wa.me links. Omit to hide the WhatsApp CTA. */
  whatsapp?: string;
  email: string;
  /** Where quote requests are delivered. Often different from the public address. */
  quoteInbox: string;
}

export interface Address {
  street: string;
  postalCode: string;
  city: string;
  canton: Canton;
  country: 'CH' | 'DE' | 'AT' | 'LI';
  /** Required for LocalBusiness `geo` and the static map. */
  geo: { lat: number; lng: number };
}

export interface OpeningHours {
  /** Day indices 1=Mon … 7=Sun. Powers the live "jetzt geöffnet" state. */
  regular: Array<{ days: number[]; opens: string; closes: string }>;
  /** e.g. Betriebsferien. ISO dates. */
  closures?: Array<{ from: string; to: string; reason: Record<Locale, string> }>;
  emergency: {
    available: boolean;
    /** Shown verbatim on the Notdienst page. e.g. '24 Stunden, 365 Tage' */
    label: Record<Locale, string>;
    /** Surcharge disclosure. Being upfront here reduces angry calls. */
    surchargeNote?: Record<Locale, string>;
  };
}

/**
 * Doubles as lead qualification (quote form step 2 rejects out-of-area PLZ) and as the
 * source for `areaServed` in JSON-LD. Only list Gemeinden the client will actually
 * drive to — an inflated list produces bad leads and thin location pages.
 */
export interface ServiceArea {
  cantons: Canton[];
  gemeinden: Array<{ name: string; plz: string[]; /** generate a location page? */ seoPage: boolean }>;
  radiusKm?: number;
  outOfAreaMessage: Record<Locale, string>;
}

// ---------------------------------------------------------------------------
// Trust — the highest-converting block on the site
// ---------------------------------------------------------------------------

export interface Credentials {
  /** Only real memberships. Never render an association logo the client cannot prove. */
  associations: Array<{
    id: 'suissetec' | 'eit-swiss' | 'jardinsuisse' | 'smgv' | 'gebaeudehuelle-schweiz';
    memberSince?: number;
  }>;
  meisterbetrieb: boolean;
  /** Ausbildungsbetrieb badge. Meaningful in CH and pairs with the Jobs page. */
  lehrbetrieb: boolean;
  liabilityInsurance?: { insurer: string; coverageCHF: number };
  certifications?: Array<{ name: string; issuer: string; validUntil?: string }>;
}

export interface Pricing {
  currency: 'CHF';
  /** Swiss term is "Stundenansatz", not "Stundensatz". Shown as "ab CHF X/Std." */
  hourlyRateFrom?: number;
  /** Anfahrtspauschale. Publishing it filters out price-shoppers before they call. */
  calloutFeeFrom?: number;
  emergencySurchargePercent?: number;
  freeQuote: boolean;
  /** Per-service "ab" prices, keyed by service slug. Drives the "Was es kostet" block. */
  richtpreise?: Record<string, { from: number; unit: 'pauschal' | 'std' | 'm2' | 'lfm' }>;
}

// ---------------------------------------------------------------------------
// Compliance — generates the privacy policy; do not let this drift from reality
// ---------------------------------------------------------------------------

/**
 * Every third party that can receive personal data. This array generates the
 * Datenschutzerklärung processor table AND the cookie-banner category list, so the two
 * cannot contradict each other — banner/policy inconsistency is a top FDPIC finding.
 * Adding any script to the site without adding it here should fail the build.
 */
export interface Processor {
  name: string;
  purpose: Record<Locale, string>;
  /** ISO country of processing. Anything outside CH/EU needs a transfer disclosure. */
  country: string;
  privacyUrl: string;
  category: 'notwendig' | 'funktional' | 'statistik' | 'marketing';
  /** Cookie/localStorage keys this processor sets, for the settings modal detail view. */
  storageKeys?: string[];
  /**
   * Hostnames this processor is contacted on. `scripts/check-template-purity.ts` fails
   * the build when `src/` references a host that appears in no processor entry — which is
   * what stops a script being added to the site without also being added to the privacy
   * policy and the cookie banner.
   */
  hosts?: string[];
}

export interface PrivacyConfig {
  /** Who answers data-subject requests. Usually the client, occasionally you. */
  controller: { name: string; email: string };
  /** Required if the client targets the EU and has no EU establishment (GDPR Art. 27). */
  euRepresentative?: { name: string; address: string; email: string };
  processors: Processor[];
  /** Bump when the policy text or processor list changes; invalidates stored consent. */
  policyVersion: string;
  /** How long quote-request data is kept. 'none' = passed straight to email, not stored. */
  leadRetention: 'none' | '30d' | '90d' | '12m';
}

// ---------------------------------------------------------------------------
// Feature flags — how you price tiers without maintaining tiers
// ---------------------------------------------------------------------------

export interface Features {
  notdienst: boolean;
  jobs: boolean;
  blog: boolean;
  reviews: boolean;
  secondLocale: boolean;
  photoUpload: boolean;
  beforeAfterSlider: boolean;
  priceTransparency: boolean;
  /** Garten only: swaps the home hero campaign by month. */
  seasonalCampaign: boolean;
  analytics: 'none' | 'plausible' | 'umami' | 'ga4';
  /** 'static' needs no consent. 'maps' requires a click-to-load placeholder. */
  map: 'static' | 'maplibre' | 'google-embed';
}

export interface Integrations {
  /** Reviews are fetched at BUILD time into a cached JSON file — no runtime call, no consent. */
  googlePlaceId?: string;
  /** Full origin of the analytics endpoint, e.g. 'https://plausible.io'. Must also appear
   *  in `privacy.processors[].hosts` or the build fails. */
  analyticsHost?: string;
  /** GA4 measurement ID (G-XXXXXXX). Only read when `features.analytics === 'ga4'`. */
  analyticsMeasurementId?: string;
  mailProvider: 'mailjet-eu' | 'postmark-eu' | 'smtp';
  social?: Partial<Record<'facebook' | 'instagram' | 'linkedin' | 'youtube', string>>;
}

// ---------------------------------------------------------------------------

export interface SiteConfig {
  business: BusinessIdentity;
  legal: LegalEntity;
  contact: ContactDetails;
  address: Address;
  hours: OpeningHours;
  serviceArea: ServiceArea;
  credentials: Credentials;
  pricing: Pricing;
  privacy: PrivacyConfig;
  features: Features;
  integrations: Integrations;
  i18n: { defaultLocale: Locale; locales: Locale[] };
  /** Which theme preset in `config/verticals/` to load. */
  theme: Vertical;
  /**
   * Browser chrome colour (`<meta name="theme-color">`). Must match `--color-bg-page`
   * in the active vertical preset — it lives here rather than in `src/` because a
   * hard-coded colour in template code is the first crack in a conflict-free merge.
   */
  themeColor: string;
  /** Demo instances set this: adds noindex, the demo bar, and the agency CTA. */
  demoMode: boolean;
  siteUrl: string;
}
