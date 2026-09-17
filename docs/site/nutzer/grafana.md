# Grafana-Dashboards

Alle Sensordaten und Aktionen des Systems werden dauerhaft in einer InfluxDB gespeichert und in
[Grafana](https://grafana.smarthome.cg-heidelsheim.de/) grafisch aufbereitet. Anmelden kann man
sich dort mit den ChurchTools-Zugangsdaten — vorausgesetzt, man ist in der ChurchTools-Gruppe
`grafana-admin` oder `hausverwaltungs-team`.

## Heizungsgruppen

Das Dashboard **„Heizungsgruppen“** (unter `General`) zeigt den Zustand der Heizgruppen über einen
wählbaren Zeitraum: aktuelle Temperatur, Zieltemperatur, Luftfeuchtigkeit und weitere Messwerte je
Raum.

Über den Auswahlfilter oberhalb der Graphen kann die **Umgebung** ("environment") gewählt werden.
Für den echten Betrieb ist das `production` — im Normalfall die einzige sinnvolle Auswahl dort.

## Test-Dashboard

Unter `General - Test` liegt ein inhaltlich identisches Dashboard, das stattdessen die
Testdaten anzeigt — also Daten aus lokalen Entwicklungsumgebungen oder aus einem
Feature-Branch-Deployment (siehe [Entwicklung](/docs/technik/entwicklung)). Diese Daten landen
nicht in der produktiven InfluxDB-Organisation und beeinflussen die echten Graphen nicht.

## Logs

Zusätzlich zu den Sensordaten protokolliert das System auch, **was** es getan hat und **warum**
(z. B. "Heizung gestartet für Raum X wegen Termin Y", "manuelle Übersteuerung erkannt"). Diese
Logs sind im **Log-Dashboard** in Grafana einsehbar und helfen bei der Fehlersuche, wenn ein Raum
nicht wie erwartet geheizt hat.
