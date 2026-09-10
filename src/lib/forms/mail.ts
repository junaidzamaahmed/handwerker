import { siteConfig } from '@/lib/config';

export interface Attachment {
  filename: string;
  contentType: string;
  /** base64, no data: prefix. */
  base64: string;
}

export interface Mail {
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
  attachments?: Attachment[];
}

/**
 * The provider is swapped per client through `integrations.mailProvider`. Credentials come
 * from the environment, never from config — `site.config.ts` is committed to a client repo.
 */
export async function sendMail(mail: Mail): Promise<{ ok: boolean; error?: string }> {
  const provider = siteConfig.integrations.mailProvider;

  if (provider === 'mailjet-eu') {
    const key = process.env.MAILJET_API_KEY;
    const secret = process.env.MAILJET_SECRET_KEY;
    const from = process.env.MAIL_FROM;
    if (!key || !secret || !from) return { ok: false, error: 'mail-not-configured' };

    const res = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}`,
      },
      body: JSON.stringify({
        Messages: [
          {
            From: { Email: from, Name: siteConfig.business.displayName },
            To: [{ Email: mail.to }],
            ...(mail.replyTo ? { ReplyTo: { Email: mail.replyTo } } : {}),
            Subject: mail.subject,
            TextPart: mail.text,
            HTMLPart: mail.html,
            ...(mail.attachments?.length
              ? {
                  Attachments: mail.attachments.map((a) => ({
                    ContentType: a.contentType,
                    Filename: a.filename,
                    Base64Content: a.base64,
                  })),
                }
              : {}),
          },
        ],
      }),
    });
    if (!res.ok) return { ok: false, error: `mailjet-${res.status}` };
    return { ok: true };
  }

  if (provider === 'postmark-eu') {
    const token = process.env.POSTMARK_TOKEN;
    const from = process.env.MAIL_FROM;
    if (!token || !from) return { ok: false, error: 'mail-not-configured' };
    const res = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Postmark-Server-Token': token,
      },
      body: JSON.stringify({
        From: from,
        To: mail.to,
        ReplyTo: mail.replyTo,
        Subject: mail.subject,
        TextBody: mail.text,
        HtmlBody: mail.html,
        MessageStream: 'outbound',
        ...(mail.attachments?.length
          ? {
              Attachments: mail.attachments.map((a) => ({
                Name: a.filename,
                Content: a.base64,
                ContentType: a.contentType,
              })),
            }
          : {}),
      }),
    });
    if (!res.ok) return { ok: false, error: `postmark-${res.status}` };
    return { ok: true };
  }

  return { ok: false, error: 'unsupported-provider' };
}
