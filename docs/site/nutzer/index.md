# Willkommen

Dieses System sorgt dafür, dass Räume im Gemeindehaus rechtzeitig warm sind, wenn sie über
[ChurchTools](https://heidelsheim.church.tools/) gebucht wurden — ohne dass jemand die Heizung
manuell hoch- oder runterdrehen muss.

> [!KONTAKT]
> Fragen, Probleme oder ein Raum fehlt in der Konfiguration? Sebastian Momann,
> [info@sebamomann.de](mailto:info@sebamomann.de) — oder wende dich jederzeit an das
> Hausverwaltungs-Team.

## Kurz gesagt

- Wird ein Raum in ChurchTools für ein Event gebucht, prüft das System regelmäßig, ob rechtzeitig
  mit dem Heizen begonnen werden muss, damit der Raum zu Beginn des Termins die gewünschte
  Temperatur erreicht hat.
- Nach dem Termin (bzw. sobald die Buchung endet) wird der Raum wieder auf die Grundtemperatur
  (Idle-Temperatur, meist 16 °C) zurückgestellt.
- Wird die Temperatur während eines laufenden Termins manuell am Thermostat verändert, wird das
  für die Dauer des Termins respektiert — danach setzt das System den Raum trotzdem wieder auf die
  Grundtemperatur zurück. **Wichtig:** Für zukünftige Termine in diesem Raum muss die manuelle
  Änderung selbst wieder rückgängig gemacht werden, siehe [Heizungslogik](/docs/nutzer/heizungslogik).

Wie genau die Berechnung funktioniert und was bei einer manuellen Änderung zu beachten ist, steht
unter [Heizungslogik](/docs/nutzer/heizungslogik). Welche Temperatur für welchen Raum bzw. welchen
Termin gilt, steht unter [Zieltemperaturen](/docs/nutzer/zieltemperaturen). Bei Problemen hilft die
[FAQ](/docs/nutzer/faq) weiter.

## Für Entwickler:innen und die Hausverwaltung

Die technische Dokumentation (Architektur, Komponenten, lokales Setup) liegt unter
[Für Entwickler:innen](/docs/technik). Grafana-Dashboards und weitere Betriebs-Themen liegen unter
[Für die Hausverwaltung](/docs/hausverwaltung).
