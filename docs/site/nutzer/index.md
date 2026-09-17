# Willkommen

Dieses System sorgt dafür, dass Räume im Gemeindehaus rechtzeitig warm sind, wenn sie über
[ChurchTools](https://heidelsheim.church.tools/) gebucht wurden — ohne dass jemand die Heizung
manuell hoch- oder runterdrehen muss.

## Kurz gesagt

- Wird ein Raum in ChurchTools für ein Event gebucht, prüft das System regelmäßig, ob rechtzeitig
  mit dem Heizen begonnen werden muss, damit der Raum zu Beginn des Termins die gewünschte
  Temperatur erreicht hat.
- Nach dem Termin (bzw. sobald die Buchung ausläuft) wird der Raum wieder auf die
  Grundtemperatur (Idle-Temperatur, meist 16 °C) zurückgestellt.
- Wird die Temperatur während eines Termins manuell am Thermostat verändert, wird das erkannt und
  respektiert — das System überschreibt keine manuelle Einstellung.

Wie genau die Berechnung funktioniert, steht unter [Heizungslogik](/docs/nutzer/heizungslogik). Wo
man den aktuellen Zustand und den Verlauf sehen kann, steht unter
[Grafana-Dashboards](/docs/nutzer/grafana). Bei Problemen hilft die [FAQ](/docs/nutzer/faq) weiter.

## Für Entwickler:innen

Die technische Dokumentation (Architektur, Komponenten, lokales Setup) liegt unter
[Für Entwickler:innen](/docs/technik).
