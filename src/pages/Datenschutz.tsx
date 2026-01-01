import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Datenschutz() {
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <header className="flex-shrink-0 container py-6">
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück
        </Link>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="container py-8 px-4 pb-16 max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight mb-8">
          Datenschutzerklärung
        </h1>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-base font-medium text-foreground mb-2">
              1. Verantwortlicher
            </h2>
            <p>
              Verantwortlich für die Datenverarbeitung auf dieser Website ist der
              Betreiber der NutriMind App. Kontaktdaten können auf Anfrage
              bereitgestellt werden.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-foreground mb-2">
              2. Erhebung und Speicherung personenbezogener Daten
            </h2>
            <p>
              Bei der Nutzung unserer App werden folgende Daten erhoben und
              gespeichert:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>E-Mail-Adresse (für die Registrierung und Anmeldung)</li>
              <li>Profilinformationen (Alter, Geschlecht, Größe, Gewicht)</li>
              <li>Ernährungsdaten und Mahlzeitenanalysen</li>
              <li>Nutzungsdaten zur Verbesserung der App</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-medium text-foreground mb-2">
              3. Zweck der Datenverarbeitung
            </h2>
            <p>Ihre Daten werden verwendet für:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Die Bereitstellung und Verbesserung unserer Dienste</li>
              <li>Personalisierte Ernährungsempfehlungen</li>
              <li>Die Verwaltung Ihres Benutzerkontos</li>
              <li>Kommunikation bezüglich Ihres Kontos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-medium text-foreground mb-2">
              4. Rechtsgrundlage
            </h2>
            <p>
              Die Verarbeitung Ihrer Daten erfolgt auf Grundlage von Art. 6 Abs. 1
              lit. a DSGVO (Einwilligung), Art. 6 Abs. 1 lit. b DSGVO
              (Vertragserfüllung) und Art. 6 Abs. 1 lit. f DSGVO (berechtigte
              Interessen).
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-foreground mb-2">
              5. Datensicherheit
            </h2>
            <p>
              Wir setzen technische und organisatorische Sicherheitsmaßnahmen ein,
              um Ihre Daten gegen Manipulation, Verlust, Zerstörung oder Zugriff
              unberechtigter Personen zu schützen. Unsere Sicherheitsmaßnahmen
              werden entsprechend der technologischen Entwicklung fortlaufend
              verbessert.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-foreground mb-2">
              6. Ihre Rechte
            </h2>
            <p>Sie haben das Recht auf:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Auskunft über Ihre gespeicherten Daten</li>
              <li>Berichtigung unrichtiger Daten</li>
              <li>Löschung Ihrer Daten</li>
              <li>Einschränkung der Verarbeitung</li>
              <li>Datenübertragbarkeit</li>
              <li>Widerspruch gegen die Verarbeitung</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-medium text-foreground mb-2">
              7. Löschung von Daten
            </h2>
            <p>
              Sie können Ihr Konto und alle damit verbundenen Daten jederzeit in
              den Einstellungen der App löschen. Nach der Löschung werden Ihre
              Daten unwiderruflich entfernt.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-foreground mb-2">
              8. Änderungen dieser Datenschutzerklärung
            </h2>
            <p>
              Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie
              an geänderte Rechtslagen oder bei Änderungen des Dienstes anzupassen.
            </p>
          </section>

          <p className="pt-4 text-xs">Stand: Januar 2026</p>
        </div>
        </div>
      </main>
    </div>
  );
}
