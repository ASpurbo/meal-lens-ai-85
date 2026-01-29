import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Impressum() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <header className="flex-shrink-0 container py-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück
        </button>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="container py-8 px-4 pb-16 max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight mb-8">
          Impressum
        </h1>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-base font-medium text-foreground mb-2">
              Angaben gemäß § 5 TMG
            </h2>
            <p>
              NutriMind<br />
              [Ihre Adresse]<br />
              [PLZ Ort]<br />
              Deutschland
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-foreground mb-2">
              Kontakt
            </h2>
            <p>
              E-Mail: [Ihre E-Mail-Adresse]
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-foreground mb-2">
              Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
            </h2>
            <p>
              [Ihr Name]<br />
              [Ihre Adresse]<br />
              [PLZ Ort]
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-foreground mb-2">
              Haftungsausschluss
            </h2>
            <h3 className="text-sm font-medium text-foreground mt-4 mb-1">
              Haftung für Inhalte
            </h3>
            <p>
              Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. 
              Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte 
              können wir jedoch keine Gewähr übernehmen.
            </p>

            <h3 className="text-sm font-medium text-foreground mt-4 mb-1">
              Haftung für Links
            </h3>
            <p>
              Unser Angebot enthält Links zu externen Webseiten Dritter, auf 
              deren Inhalte wir keinen Einfluss haben. Deshalb können wir für 
              diese fremden Inhalte auch keine Gewähr übernehmen.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-foreground mb-2">
              Urheberrecht
            </h2>
            <p>
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf 
              diesen Seiten unterliegen dem deutschen Urheberrecht. Die 
              Vervielfältigung, Bearbeitung, Verbreitung und jede Art der 
              Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen 
              der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </section>

          <p className="pt-4 text-xs">Stand: Januar 2026</p>
        </div>
        </div>
      </main>
    </div>
  );
}
