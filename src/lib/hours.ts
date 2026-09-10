import { siteConfig } from './config';
import type { OpeningHours } from '@config/site.config.types';

export interface OpenState {
  open: boolean;
  /** 'HH:MM' the business next opens, when currently closed and reopening this week. */
  opensAt?: string;
  /** Set when today falls inside a configured closure (Betriebsferien). */
  closureReasonKey?: number;
}

const toMinutes = (hhmm: string): number => {
  const [h = '0', m = '0'] = hhmm.split(':');
  return Number(h) * 60 + Number(m);
};

/**
 * Pure so it can be unit-tested and so the client and the server can agree given the same
 * `now`. Everything about this is Europe/Zurich: a visitor in another timezone still wants
 * to know whether the workshop in Winterthur is answering the phone.
 */
export function computeOpenState(hours: OpeningHours, now: Date): OpenState {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Zurich',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const weekdayMap: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
  const day = weekdayMap[get('weekday')] ?? 1;
  const minutes = Number(get('hour')) * 60 + Number(get('minute'));
  const isoDate = `${get('year')}-${get('month')}-${get('day')}`;

  const closureIndex = hours.closures?.findIndex((c) => isoDate >= c.from && isoDate <= c.to) ?? -1;
  if (closureIndex >= 0) return { open: false, closureReasonKey: closureIndex };

  const todays = hours.regular.filter((slot) => slot.days.includes(day));
  for (const slot of todays) {
    if (minutes >= toMinutes(slot.opens) && minutes < toMinutes(slot.closes)) return { open: true };
  }
  const laterToday = todays
    .map((s) => s.opens)
    .filter((o) => toMinutes(o) > minutes)
    .sort()[0];
  if (laterToday) return { open: false, opensAt: laterToday };

  for (let offset = 1; offset <= 7; offset++) {
    const next = ((day - 1 + offset) % 7) + 1;
    const slot = hours.regular.find((s) => s.days.includes(next));
    if (slot) return { open: false, opensAt: slot.opens };
  }
  return { open: false };
}

export const isOpenNow = (now: Date = new Date()): OpenState =>
  computeOpenState(siteConfig.hours, now);

/** True when a 24h Pikettdienst answers regardless of office hours. */
export const hasEmergencyLine = (): boolean =>
  siteConfig.features.notdienst && siteConfig.hours.emergency.available;

/** The number a customer should ring right now: Pikett out of hours, office in hours. */
export function activePhone(state: OpenState) {
  const { contact } = siteConfig;
  if (!state.open && hasEmergencyLine() && contact.emergencyPhone) {
    return { href: contact.emergencyPhone, display: contact.emergencyPhoneDisplay ?? contact.phoneDisplay };
  }
  return { href: contact.phone, display: contact.phoneDisplay };
}
