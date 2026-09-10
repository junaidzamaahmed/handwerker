import { z } from 'zod';
import { siteConfig, servicedPostalCodes } from '@/lib/config';

export const URGENCY = ['emergency', 'thisWeek', 'flexible'] as const;
export type Urgency = (typeof URGENCY)[number];

export const MAX_PHOTOS = 5;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
/** Total across all attachments. Mail providers reject well before this; stay under. */
export const MAX_TOTAL_BYTES = 15 * 1024 * 1024;

/**
 * Photos ride along as base64 in the JSON body and are attached to the notification
 * email. Chosen over presigned object storage for v1 because it stores nothing: the
 * privacy policy can say "your data goes straight to the tradesman" and be literally
 * true. Revisit if clients start sending video.
 */
export const photoSchema = z.object({
  name: z.string().max(200),
  type: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  /** base64, no data: prefix. */
  data: z.string().max(Math.ceil(MAX_PHOTO_BYTES * 1.4)),
});

const swissPostalCode = z
  .string()
  .trim()
  .regex(/^[1-9]\d{3}$/, 'postalCodeInvalid');

/**
 * Shared by the client (for inline validation) and the route handler (which never trusts
 * the client). The PLZ gate is the interesting one: it turns a dead lead into a polite
 * referral instead of a job the business cannot drive to.
 */
export const quoteSchema = z
  .object({
    service: z.string().trim().min(1, 'required').max(80),
    postalCode: swissPostalCode,
    city: z.string().trim().max(80).optional().or(z.literal('')),
    urgency: z.enum(URGENCY),
    name: z.string().trim().min(1, 'required').max(120),
    phone: z.string().trim().max(40).optional().or(z.literal('')),
    email: z.string().trim().email('emailInvalid').max(160).optional().or(z.literal('')),
    message: z.string().trim().max(4000).optional().or(z.literal('')),
    photos: z.array(photoSchema).max(MAX_PHOTOS).optional(),
    /**
     * Honeypot. Real people never see this field, so anything in it is a bot.
     *
     * Note it accepts ANY string. A `.max(0)` here would make zod reject the request with
     * a 422 naming `website`, which tells the bot precisely what tripped it — the exact
     * opposite of the point. The route checks it after validation and answers 200 as if
     * nothing happened.
     */
    website: z.string().max(500).optional(),
    /** Milliseconds the form was on screen. A submission under 3s was not typed. */
    elapsedMs: z.number().int().nonnegative().optional(),
    consent: z.literal(true),
  })
  .refine((v) => (v.phone && v.phone.length >= 6) || (v.email && v.email.length >= 5), {
    message: 'contactRequired',
    path: ['phone'],
  })
  .refine(
    (v) => (v.photos ?? []).reduce((sum, p) => sum + p.data.length * 0.75, 0) <= MAX_TOTAL_BYTES,
    { message: 'fileTooLarge', path: ['photos'] },
  );

export type QuoteInput = z.infer<typeof quoteSchema>;

export interface AreaCheck {
  inArea: boolean;
  gemeinde?: string;
}

export function checkServiceArea(postalCode: string): AreaCheck {
  const match = siteConfig.serviceArea.gemeinden.find((g) => g.plz.includes(postalCode));
  return match ? { inArea: true, gemeinde: match.name } : { inArea: servicedPostalCodes().size === 0 };
}
