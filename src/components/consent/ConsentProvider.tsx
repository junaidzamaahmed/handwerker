'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { defaultChoice, readConsent, writeConsent } from '@/lib/consent/store';
import type { ConsentCategory, ConsentChoice } from '@/lib/consent/types';

interface ConsentContextValue {
  /** null until the browser has been read — do not load anything while it is null. */
  choice: ConsentChoice | null;
  ready: boolean;
  needsDecision: boolean;
  settingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  acceptAll: () => void;
  rejectAll: () => void;
  save: (categories: Record<ConsentCategory, boolean>) => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [choice, setChoice] = useState<ConsentChoice | null>(null);
  const [ready, setReady] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Read on mount, never during render. Server-rendered HTML must be identical for every
  // visitor or the page cannot be statically cached — and a consent banner that flashes
  // because the server guessed wrong is worse than one that appears a frame late.
  useEffect(() => {
    setChoice(readConsent());
    setReady(true);
  }, []);

  const commit = useCallback((next: ConsentChoice) => {
    writeConsent(next);
    setChoice(next);
    setSettingsOpen(false);
  }, []);

  const value = useMemo<ConsentContextValue>(
    () => ({
      choice,
      ready,
      needsDecision: ready && choice === null,
      settingsOpen,
      openSettings: () => setSettingsOpen(true),
      closeSettings: () => setSettingsOpen(false),
      acceptAll: () => commit(defaultChoice(true)),
      rejectAll: () => commit(defaultChoice(false)),
      save: (categories) =>
        commit({ ...defaultChoice(false), categories: { ...categories, notwendig: true } }),
    }),
    [choice, ready, settingsOpen, commit],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error('useConsent must be used inside <ConsentProvider>');
  return ctx;
}

/** The one gate every optional third party must pass through. */
export function useCategoryGranted(category: ConsentCategory): boolean {
  const { choice } = useConsent();
  return choice?.categories[category] === true;
}
