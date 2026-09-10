'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Field, inputClass, inputErrorClass } from './Field';
import { Alert } from '@/components/ui/Alert';
import { Icon } from '@/components/ui/Icon';
import { MAX_PHOTOS, MAX_PHOTO_BYTES, URGENCY, type Urgency } from '@/lib/forms/quote-schema';

interface ServiceOption { slug: string; title: string; icon: string }
type Status = 'editing' | 'submitting' | 'success' | 'out-of-area' | 'error';

const STEP_KEYS = ['what', 'where', 'when', 'photos', 'contact'] as const;

export function QuoteWizard({
  services,
  phoneHref,
  phoneDisplay,
  privacyHref,
  photoUpload,
}: {
  services: ServiceOption[];
  phoneHref: string;
  phoneDisplay: string;
  privacyHref: string;
  photoUpload: boolean;
}) {
  const t = useTranslations('quote');
  const tc = useTranslations('common');
  const steps = useMemo(() => STEP_KEYS.filter((s) => photoUpload || s !== 'photos'), [photoUpload]);

  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<Status>('editing');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState({
    service: '', postalCode: '', city: '', urgency: '' as Urgency | '',
    name: '', phone: '', email: '', message: '', website: '',
  });
  const [photos, setPhotos] = useState<Array<{ name: string; type: string; data: string }>>([]);
  const [moveFocus, setMoveFocus] = useState(false);
  const startedAt = useRef(Date.now());
  const headingRef = useRef<HTMLHeadingElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const set = (k: keyof typeof values, v: string) => setValues((s) => ({ ...s, [k]: v }));
  const current = steps[step]!;

  const goto = (next: number) => {
    setStep(next);
    setErrors({});
    setMoveFocus(true);
  };

  /**
   * Focus the step heading, not the first input — otherwise a screen reader announces the
   * field label and the visitor never hears the question.
   *
   * This has to be an effect keyed on `step`, not a requestAnimationFrame inside the click
   * handler: React had not committed the new step by the time the frame ran, so focus
   * landed on the *previous* heading and, in the built app, on nothing at all.
   */
  useEffect(() => {
    if (!moveFocus) return;
    headingRef.current?.focus();
    setMoveFocus(false);
  }, [step, moveFocus]);

  function validateStep(): boolean {
    const next: Record<string, string> = {};
    if (current === 'what' && !values.service) next.service = t('validation.required');
    if (current === 'where') {
      if (!/^[1-9]\d{3}$/.test(values.postalCode)) next.postalCode = t('validation.postalCodeInvalid');
    }
    if (current === 'when' && !values.urgency) next.urgency = t('validation.required');
    if (current === 'contact') {
      if (!values.name.trim()) next.name = t('validation.required');
      if (!values.phone.trim() && !values.email.trim()) next.phone = t('validation.phoneRequired');
      if (values.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email))
        next.email = t('validation.emailInvalid');
    }
    setErrors(next);
    if (Object.keys(next).length > 0) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return false;
    }
    return true;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateStep()) return;
    setStatus('submitting');
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          photos,
          consent: true,
          elapsedMs: Date.now() - startedAt.current,
        }),
      });
      const json = (await res.json()) as { ok: boolean; accepted?: boolean; reason?: string };
      if (json.ok && json.reason === 'out-of-area') setStatus('out-of-area');
      else if (json.ok) setStatus('success');
      else setStatus('error');
    } catch {
      setStatus('error');
    }
  }

  async function onFiles(list: FileList | null) {
    if (!list) return;
    const picked = Array.from(list).slice(0, MAX_PHOTOS - photos.length);
    const encoded = await Promise.all(
      picked
        .filter((f) => f.size <= MAX_PHOTO_BYTES && /^image\/(jpeg|png|webp)$/.test(f.type))
        .map(
          (f) =>
            new Promise<{ name: string; type: string; data: string }>((resolve) => {
              const reader = new FileReader();
              reader.onload = () =>
                resolve({ name: f.name, type: f.type, data: String(reader.result).split(',')[1] ?? '' });
              reader.readAsDataURL(f);
            }),
        ),
    );
    setPhotos((p) => [...p, ...encoded].slice(0, MAX_PHOTOS));
  }

  if (status === 'success') {
    return (
      <Alert type="success" title={t('success.title')} live>
        <p>{t('success.body', { phone: phoneDisplay })}</p>
      </Alert>
    );
  }
  if (status === 'out-of-area') {
    return (
      <div className="space-y-4">
        <Alert type="warning" title={t('outOfArea.title', { postalCode: values.postalCode })} live>
          <p>{t('privacyNote')}</p>
        </Alert>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a href={`tel:${phoneHref}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-control bg-cta px-5 py-3 font-semibold text-on-cta">
            <Icon name="phone" size={20} />
            {tc('callNow', { phone: phoneDisplay })}
          </a>
          <button
            type="button"
            onClick={() => { setStatus('editing'); goto(steps.indexOf('where')); }}
            className="inline-flex min-h-12 items-center justify-center rounded-control border border-line px-5 py-3 font-semibold text-ink"
          >
            {t('outOfArea.correct')}
          </button>
        </div>
      </div>
    );
  }

  const errorList = Object.entries(errors);

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {/* Progress. On mobile this is a label plus a bar — five dotted steps at 375px are
          unreadable and were cut in the design for that reason. */}
      <div>
        <p className="flex flex-wrap items-baseline gap-x-2 font-medium text-ink">
          {t('stepOf', { current: step + 1, total: steps.length })}
          <span className="text-sm font-normal text-ink-muted">· {t(`steps.${current}`)}</span>
        </p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-pill bg-sunken">
          <div
            className="h-full rounded-pill bg-cta transition-[width]"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {errorList.length > 0 && (
        <div ref={summaryRef} tabIndex={-1}>
          <Alert type="error" title={t('validation.summaryTitle', { count: errorList.length })} live>
            <ul className="list-disc pl-5">
              {errorList.map(([field, msg]) => (
                <li key={field}>
                  <a href={`#q-${field}`} className="underline">{msg}</a>
                </li>
              ))}
            </ul>
          </Alert>
        </div>
      )}

      <div className="rounded-card border border-line bg-surface p-6">
        <h2 ref={headingRef} tabIndex={-1} className="font-display text-2xl font-bold text-ink focus:outline-none">
          {t(`headings.${current}`)}
        </h2>

        <div className="mt-5 space-y-5">
          {current === 'what' && (
            <fieldset>
              <legend className="sr-only">{t('fields.service')}</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {services.map((s) => (
                  <label
                    key={s.slug}
                    className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-control border px-4 py-3 ${
                      values.service === s.title ? 'border-line-brand bg-brand-soft' : 'border-line-control'
                    }`}
                  >
                    <input
                      type="radio"
                      name="service"
                      value={s.title}
                      checked={values.service === s.title}
                      onChange={(e) => set('service', e.target.value)}
                      className="accent-[var(--color-cta-bg)]"
                    />
                    <span className="text-ink">{s.title}</span>
                  </label>
                ))}
              </div>
              {errors.service && <p id="q-service" className="mt-2 text-sm font-medium text-danger">{errors.service}</p>}
            </fieldset>
          )}

          {current === 'where' && (
            <>
              <Field id="q-postalCode" label={t('fields.postalCode')} hint={t('hints.postalCode')} error={errors.postalCode}>
                <input
                  id="q-postalCode"
                  name="postalCode"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={4}
                  value={values.postalCode}
                  onChange={(e) => set('postalCode', e.target.value.replace(/\D/g, ''))}
                  className={errors.postalCode ? inputErrorClass : inputClass}
                />
              </Field>
              <Field id="q-city" label={t('fields.city')} optional={t('hints.optional')}>
                <input id="q-city" name="city" autoComplete="address-level2" value={values.city} onChange={(e) => set('city', e.target.value)} className={inputClass} />
              </Field>
            </>
          )}

          {current === 'when' && (
            <fieldset>
              <legend className="sr-only">{t('fields.urgency')}</legend>
              <div className="grid gap-2">
                {URGENCY.map((u) => (
                  <label
                    key={u}
                    className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-control border px-4 py-3 ${
                      values.urgency === u ? 'border-line-brand bg-brand-soft' : 'border-line-control'
                    }`}
                  >
                    <input type="radio" name="urgency" value={u} checked={values.urgency === u} onChange={(e) => set('urgency', e.target.value)} className="accent-[var(--color-cta-bg)]" />
                    <span className="text-ink">{t(`urgency.${u}`)}</span>
                  </label>
                ))}
              </div>
              {errors.urgency && <p id="q-urgency" className="mt-2 text-sm font-medium text-danger">{errors.urgency}</p>}
            </fieldset>
          )}

          {current === 'photos' && (
            <Field id="q-photos" label={t('fields.photos')} hint={t('hints.photos', { max: MAX_PHOTOS })} optional={t('hints.optional')}>
              <input
                id="q-photos"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(e) => onFiles(e.target.files)}
                className="block w-full text-ink file:mr-4 file:min-h-12 file:rounded-control file:border-0 file:bg-brand-soft file:px-4 file:py-3 file:font-semibold file:text-ink-brand"
              />
              {photos.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm text-ink-soft">
                  {photos.map((p, i) => (
                    <li key={`${p.name}-${i}`} className="flex items-center justify-between gap-3">
                      <span className="truncate">{p.name}</span>
                      <button type="button" onClick={() => setPhotos((list) => list.filter((_, j) => j !== i))} className="text-ink-link underline">
                        {tc('close')}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Field>
          )}

          {current === 'contact' && (
            <>
              <Field id="q-name" label={t('fields.name')} error={errors.name}>
                <input id="q-name" name="name" autoComplete="name" value={values.name} onChange={(e) => set('name', e.target.value)} className={errors.name ? inputErrorClass : inputClass} />
              </Field>
              <Field id="q-phone" label={t('fields.phone')} hint={t('hints.phone')} error={errors.phone}>
                <input id="q-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" value={values.phone} onChange={(e) => set('phone', e.target.value)} className={errors.phone ? inputErrorClass : inputClass} />
              </Field>
              <Field id="q-email" label={t('fields.email')} error={errors.email}>
                <input id="q-email" name="email" type="email" autoComplete="email" value={values.email} onChange={(e) => set('email', e.target.value)} className={errors.email ? inputErrorClass : inputClass} />
              </Field>
              <Field id="q-message" label={t('fields.message')} optional={t('hints.optional')}>
                <textarea id="q-message" name="message" rows={4} value={values.message} onChange={(e) => set('message', e.target.value)} className={`${inputClass} min-h-28`} />
              </Field>

              {/* Honeypot. Hidden from sight AND from assistive tech, never autofilled. */}
              <div aria-hidden className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
                <label htmlFor="q-website">Website</label>
                <input id="q-website" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => set('website', e.target.value)} />
              </div>

              <p className="text-sm text-ink-muted">
                {t('privacyNote')}{' '}
                <a href={privacyHref} className="underline">{t('privacyLink')}</a>
              </p>
            </>
          )}
        </div>

        {status === 'error' && (
          <div className="mt-5">
            <Alert type="error" title={t('error.title')} live>
              <p>{t('error.body', { phone: phoneDisplay })}</p>
            </Alert>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => validateStep() && goto(step + 1)}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-control bg-cta px-5 py-3 font-semibold text-on-cta hover:bg-cta-hover"
            >
              {tc('next')}
              <Icon name="arrow-right" size={18} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-control bg-cta px-5 py-3 font-semibold text-on-cta hover:bg-cta-hover disabled:opacity-60"
            >
              {status === 'submitting' ? t('submitting') : t('submit')}
            </button>
          )}
          {step > 0 && (
            <button
              type="button"
              onClick={() => goto(step - 1)}
              className="inline-flex min-h-12 items-center justify-center rounded-control border border-line px-5 py-3 font-semibold text-ink"
            >
              {tc('back')}
            </button>
          )}
        </div>
        {status === 'submitting' && <p className="mt-3 text-sm text-ink-muted">{t('submittingNote')}</p>}
      </div>

      {/* An escape hatch on every step. Plenty of people start the form and then decide to
          call — that is a won job, not an abandoned funnel. */}
      <p className="text-center">
        <a href={`tel:${phoneHref}`} className="inline-flex items-center gap-2 font-semibold text-ink-link">
          <Icon name="phone" size={18} />
          {t('escapeHatch', { phone: phoneDisplay })}
        </a>
      </p>
    </form>
  );
}
