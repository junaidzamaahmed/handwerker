import type { IconName } from '@/components/ui/Icon';
import type { PriceRow } from '@/components/blocks/PriceTable';

export type Media = { src: string; alt: string };
export type Step = { title: string; body: string };
export type FaqItem = { q: string; a: string };
export type Cta = { title: string; body: string };
export type ServiceIntent = 'NOTFALL' | 'PFLICHT' | 'PROJEKT' | 'UNTERHALT';

export interface HomePage {
  slug: string;
  hero: {
    eyebrow?: string;
    h1: string;
    lead: string;
    note?: string;
    image?: Media;
  };
  usps: Array<{ title: string; body: string; icon: string }>;
  servicesLead?: string;
  process: Step[];
  stats: Array<{ value: string; label: string }>;
  projectsLead?: string;
  testimonial?: { quote: string; author: string };
  cta: Cta;
}

export interface AboutPage {
  slug: string;
  h1: string;
  lead: string;
  image?: Media;
  paragraphs: string[];
  values: string[];
  cta: Cta;
}

export interface ContactPage {
  slug: string;
  h1: string;
  lead: string;
  directions?: string;
}

export interface ServicesIndex {
  slug: string;
  lead: string;
  cta: Cta;
  serviceCtaBody?: string;
}

export interface IndexCopy {
  slug: string;
  h1: string;
  lead: string;
  cta?: Cta;
}

export interface EmergencyPage {
  slug: string;
  h1: string;
  lead: string;
  steps: Step[];
  pricing: PriceRow[];
  pricingNote: { title: string; body: string };
  cta: Cta;
}

export interface ServiceDoc {
  slug: string;
  title: string;
  h1: string;
  lead: string;
  excerpt: string;
  icon: IconName;
  intent: ServiceIntent;
  order: number;
  featured: boolean;
  hero?: Media;
  trust?: string[];
  checklist: string[];
  process?: Step[];
  faq?: FaqItem[];
  pricing?: PriceRow[];
  priceLabel?: string;
  seo?: { title: string; description: string };
  body: string;
}

export interface ProjectDoc {
  slug: string;
  title: string;
  service: string;
  ort: string;
  year: number | string;
  duration?: string;
  lead?: string;
  featured: boolean;
  cover: Media;
  badges?: string[];
  facts?: Array<{ label: string; value: string }>;
  testimonial?: { quote: string; author: string };
  beforeAfter?: { before: Media; after: Media };
  gallery?: Media[];
  body: string;
}

export interface LegalPage {
  slug: string;
  title: string;
  lead: string;
  body: string;
}

export interface TeamMember {
  slug: string;
  name: string;
  role: string;
  detail?: string;
  photo?: Media;
}

export interface JobDoc {
  slug: string;
  title: string;
  badge: string;
  workload: string;
  start: string;
  apprenticeship?: boolean;
  employmentType: string;
  datePosted: string;
  validThrough?: string;
  body: string;
}

export interface ArticleDoc {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  date: string;
  readingMinutes: number;
  author?: string;
  cover?: Media;
  body: string;
}

export interface Review {
  author: string;
  rating: number;
  text: string;
  relativeTime: string;
  source: string;
}

export interface ReviewData {
  fetchedAt: string;
  rating: number;
  total: number;
  distribution: Record<'5' | '4' | '3' | '2' | '1', number>;
  reviews: Review[];
}
