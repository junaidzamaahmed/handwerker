import { Alert } from '@/components/ui/Alert';

/**
 * On every generated legal page, without exception. We sell a correct technical
 * implementation, not legal certainty — and saying so before the contract is signed is
 * cheaper than saying it afterwards.
 */
export function LegalDisclaimer() {
  return (
    <div className="my-8">
      <Alert type="warning" title="Vorlage, keine Rechtsberatung">
        <p>
          Dieser Text wurde aus den Angaben in <code>site.config.ts</code> erzeugt und deckt den
          Standardfall eines Schweizer Kleinbetriebs ab. Lassen Sie ihn vor der Aufschaltung von
          einer juristisch qualifizierten Person prüfen — insbesondere, wenn Sie Kundschaft im
          EU-Raum bedienen oder besonders schützenswerte Daten bearbeiten.
        </p>
      </Alert>
    </div>
  );
}
