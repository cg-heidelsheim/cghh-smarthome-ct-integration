# Komponenten

Damit das System läuft, spielen mehrere unabhängige Systeme zusammen. Jedes davon hat eigene
Zugriffs- und Berechtigungsmechanismen.

| System | Wofür |
|---|---|
| GitHub | Quellcode, Pull Requests |
| Jenkins | Build & Deployment |
| InfluxDB | Zentrale Datenbank für Logs und Gerätezustände |
| Grafana | Visualisierung der Daten aus InfluxDB |
| ChurchTools | Kalender/Raumbuchungen, Login für Grafana |
| HomematicIP | Steuerung und Zustand der Heizungen |
| Server | Hostet alle Komponenten außer ChurchTools |

## GitHub

Der Code liegt in der
[CGHH-GitHub-Organisation](https://github.com/cg-heidelsheim/cghh-smarthome-ct-integration).
Zugriff auf das Repository kann bei Bedarf vergeben werden. Das Projekt läuft mit Node.js und wird
über ein Dockerfile in ein Container-Image gepackt — das übernimmt Jenkins.

## Jenkins

Für [Jenkins](https://jenkins.dankoe.de/job/cghh-smarthome-ct-integration/) wird ein eigener
Account benötigt. Damit erhält man Zugriff auf die Build-Pipelines der einzelnen Branches. Die
Pipeline selbst sollte nicht direkt in Jenkins angepasst werden — die eigentlichen
Pipeline-Anweisungen liegen im Repository (`Jenkinsfile`) und werden von dort geladen.

## InfluxDB

Für [InfluxDB](https://influx.smarthome.cg-heidelsheim.de/) wird in der Regel kein eigener Account
vergeben. Es ist die zentrale Datenbank für sämtliche Logs und Gerätezustände und benötigt von
niemandem eine manuelle Anpassung. Zusätzliche Buckets können bei Bedarf von den
Administrator:innen angelegt werden.

## Grafana

Für [Grafana](https://grafana.smarthome.cg-heidelsheim.de/) können die ChurchTools-Zugangsdaten
verwendet werden. Voraussetzung dafür ist die Mitgliedschaft in der ChurchTools-Gruppe
`grafana-admin` oder `hausverwaltungs-team`.

## ChurchTools

Zugriff auf die relevanten Kalender/Ressourcen in ChurchTools erfolgt über einen eigenen
technischen Nutzer, mit dem das System die Raumbuchungen ausliest. Fragen zu ChurchTools-Zugängen
gehen an die Verwaltung.

## HomematicIP

Das System, über das die Zieltemperatur gesetzt wird und aus dem der aktuelle Gerätezustand
kommt. Der Zugriff erfolgt über Access-Tokens, siehe
[Entwicklung](/docs/technik/entwicklung#homematicip-token-erzeugen) für die Erzeugung eines
eigenen Tokens für die lokale Entwicklung.

## Server

Der Server, auf dem alle Komponenten außer ChurchTools laufen, ist ein vServer. Ein direkter
Zugriff auf den Server ist für die normale Entwicklung nicht nötig — der Container wird über das
`Jenkinsfile` automatisch auf diesem Server deployt, inklusive der nötigen Konfiguration.
Konfigurationsdateien und weitere Volumes liegen ebenfalls auf dem Server und werden, wie im
`Jenkinsfile` festgelegt, in den Container eingebunden.
