# Zusammenspiel

Kurz zusammengefasst, wie ein Commit am Ende zu einer echten Temperaturänderung im Gebäude führt:

1. **Commit auf GitHub** löst die Jenkins-Pipeline aus.
2. **Jenkins** lädt den Code, baut ein Docker-Image (inklusive Qualitäts-Checks — Lint, Typecheck,
   Tests) und deployt den Container auf dem Server.
3. Das laufende Programm holt sich **periodisch die Buchungen aus ChurchTools** über einen
   technischen Nutzer.
4. Für jede relevante Buchung wird der **beste Heizzeitplan berechnet** (siehe
   [Heizungslogik](/docs/nutzer/heizungslogik) für die fachliche Erklärung).
5. Bei Bedarf wird eine **Anfrage an HomematicIP** geschickt, um die Zieltemperatur zu setzen.
6. Zusätzlich hält das System eine **WebSocket-Verbindung zu HomematicIP**, über die es laufend
   Updates zu Gruppen, Geräten und Wetter erhält.
7. Alle Daten — sowohl aus der Berechnung als auch aus dem WebSocket — werden dauerhaft in
   **InfluxDB** gespeichert.
8. **Grafana** greift auf InfluxDB zu und stellt die Daten als Graphen dar (siehe
   [Grafana-Dashboards](/docs/hausverwaltung/grafana)).

<div class="mermaid">
flowchart TD
    A["GitHub Commit"] --> B["Jenkins Pipeline<br/>Build + Quality Gates"]
    B --> C["Docker-Deployment<br/>auf dem Server"]
    C --> D["Cron: ChurchTools-<br/>Buchungen lesen"]
    D --> E["Heizplan berechnen"]
    E --> F["HomematicIP:<br/>Temperatur setzen"]
    C --> G["WebSocket: HomematicIP-Updates<br/>Gruppe / Gerät / Wetter"]
    F --> H["InfluxDB"]
    G --> H
    H --> I["Grafana"]
</div>

Für die genaue Modul-Architektur (welche Datei was macht) siehe das englische
[docs/architecture.md](https://github.com/cg-heidelsheim/cghh-smarthome-ct-integration/blob/master/docs/architecture.md)
im Repository.
