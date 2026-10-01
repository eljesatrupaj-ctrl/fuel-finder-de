# Premium-Tankbuch mit Kostenberechnung

## Was gebaut wird
- In den Einstellungen kommt ein neuer Bereich „Mein Tankbuch“.
- Neue Tankfüllungen lassen sich mit Datum, Kilometerstand, Litern, Kraftstoffart und Preis pro Liter speichern.
- Die App berechnet den Gesamtpreis jeder Füllung automatisch.
- Ab der zweiten Füllung berechnet sie zusätzlich gefahrene Kilometer und Durchschnittsverbrauch in l/100 km.
- Eine kompakte Übersicht zeigt Gesamtkosten, gesamte Liter und den durchschnittlichen Verbrauch.
- Jeder Eintrag kann über eine Sicherheitsabfrage gelöscht werden.

## Speicherung und Gestaltung
- Die Einträge bleiben lokal auf dem Gerät gespeichert und sind beim nächsten Öffnen wieder verfügbar.
- Das Tankbuch erhält eine helle Premium-Ansicht mit Gold- und Grünakzenten, klaren Kennzahlen und mobilfreundlichen Eingabefeldern.
- Der Bereich berücksichtigt den festen unteren GPS-/Werbebereich, damit keine Einträge oder Schaltflächen verdeckt werden.
- Die Datenschutzerklärung wird um die lokale Speicherung der Tankbucheinträge ergänzt.

## Berechnung
- Kosten = Liter × Preis pro Liter.
- Strecke = aktueller Kilometerstand − vorheriger Kilometerstand.
- Verbrauch = Liter der aktuellen Füllung ÷ Strecke × 100.
- Bei fehlendem vorherigem Eintrag oder unplausibler Kilometerdifferenz wird noch kein Verbrauch angezeigt.
