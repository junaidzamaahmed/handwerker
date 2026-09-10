import { NextResponse } from 'next/server';
import { quoteSchema, checkServiceArea } from '@/lib/forms/quote-schema';
import { rateLimit } from '@/lib/forms/rate-limit';
import { sendMail } from '@/lib/forms/mail';
import { siteConfig } from '@/lib/config';

export const runtime = 'nodejs';
/** Never cached, never prerendered — it is a mutation. */
export const dynamic = 'force-dynamic';

const MIN_ELAPSED_MS = 3000;

function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  return fwd?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
}

/**
 * The owner reads this on a phone, in a van, with one hand. Everything that decides
 * whether to call back is in the first four lines, and the number is a tap-to-call link.
 */
function ownerEmail(input: {
  service: string; postalCode: string; city?: string; urgency: string;
  name: string; phone?: string; email?: string; message?: string; gemeinde?: string;
}) {
  const urgencyLabel: Record<string, string> = {
    emergency: 'NOTFALL — sofort',
    thisWeek: 'Diese Woche',
    flexible: 'Zeitlich flexibel',
  };
  const place = [input.postalCode, input.gemeinde ?? input.city].filter(Boolean).join(' ');
  const lines = [
    `${urgencyLabel[input.urgency] ?? input.urgency}`,
    `${input.service}`,
    `${place}`,
    input.phone ? `Tel: ${input.phone}` : '',
    input.email ? `E-Mail: ${input.email}` : '',
    '',
    `Name: ${input.name}`,
    input.message ? `\n${input.message}` : '',
  ].filter(Boolean);

  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const html = `
<div style="font-family:system-ui,sans-serif;font-size:17px;line-height:1.5">
  <p style="font-size:20px;font-weight:700;margin:0 0 4px">${esc(urgencyLabel[input.urgency] ?? input.urgency)}</p>
  <p style="font-size:20px;margin:0 0 4px">${esc(input.service)}</p>
  <p style="margin:0 0 12px">${esc(place)}</p>
  ${input.phone ? `<p style="margin:0 0 8px"><a href="tel:${esc(input.phone)}" style="font-size:22px;font-weight:700">${esc(input.phone)}</a></p>` : ''}
  ${input.email ? `<p style="margin:0 0 12px"><a href="mailto:${esc(input.email)}">${esc(input.email)}</a></p>` : ''}
  <p style="margin:0 0 4px"><strong>${esc(input.name)}</strong></p>
  ${input.message ? `<p style="white-space:pre-wrap;margin:12px 0 0">${esc(input.message)}</p>` : ''}
</div>`.trim();

  return { text: lines.join('\n'), html };
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limited = rateLimit(ip);
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, reason: 'rate-limited' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSeconds ?? 3600) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: 'bad-json' }, { status: 400 });
  }

  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        reason: 'validation',
        issues: parsed.error.issues.map((i) => ({ path: i.path.join('.'), code: i.message })),
      },
      { status: 422 },
    );
  }
  const input = parsed.data;

  // Two silent bot checks instead of reCAPTCHA. reCAPTCHA would be a US data transfer to
  // disclose in the privacy policy, for a form that sees a few dozen submissions a month.
  // Both failures return 200 so a bot cannot tell it was caught.
  if (input.website && input.website.length > 0) {
    return NextResponse.json({ ok: true, accepted: false });
  }
  if (typeof input.elapsedMs === 'number' && input.elapsedMs < MIN_ELAPSED_MS) {
    return NextResponse.json({ ok: true, accepted: false });
  }

  const area = checkServiceArea(input.postalCode);
  if (!area.inArea) {
    // Not an error. The visitor gets a referral rather than a dead end, and we do not
    // waste the owner's time with a job they cannot drive to.
    return NextResponse.json({ ok: true, accepted: false, reason: 'out-of-area' }, { status: 200 });
  }

  const { text, html } = ownerEmail({ ...input, gemeinde: area.gemeinde });
  const sent = await sendMail({
    to: siteConfig.contact.quoteInbox,
    replyTo: input.email || undefined,
    subject: `Offertanfrage · ${input.service} · ${input.postalCode} ${area.gemeinde ?? ''}`.trim(),
    text,
    html,
    attachments: (input.photos ?? []).map((p, i) => ({
      filename: p.name || `foto-${i + 1}.jpg`,
      contentType: p.type,
      base64: p.data,
    })),
  });

  if (!sent.ok) {
    // The submission is NOT silently dropped. The client keeps the form state and shows
    // the phone number, which is the path that still works when mail is down.
    console.error('[quote] mail failed:', sent.error);
    return NextResponse.json({ ok: false, reason: 'mail-failed' }, { status: 502 });
  }

  // leadRetention: 'none' — nothing is written to a database here, and that is exactly
  // what the privacy policy tells the visitor. Adding storage means changing both.
  return NextResponse.json({ ok: true, accepted: true });
}
