# Entwicklung & Branching

## Lokale Entwicklung

Für die lokale Entwicklung wird ein **eigenes, dediziertes Token** für die Verbindung zu
HomematicIP benötigt. Wichtig: Ein Token darf **niemals doppelt verwendet** werden — immer nur ein
System kann ein Token gleichzeitig nutzen. Wird versehentlich ein bereits verwendetes Token
eingesetzt, bricht die Verbindung sowohl bei einem selbst als auch bei der anderen Stelle, die das
Token nutzt. Deshalb gibt es mehrere Tokens.

### HomematicIP-Token erzeugen

1. Ein Python-CLI-Tool installieren: `pip3 install -U homematicip`
2. Das Skript `hmip_generate_auth_token.py` ausführen. Es fragt nach ein paar Angaben — diese
   bereithalten:
   - **AccessPointID:** `3014F711A00003DD899B37F4`
   - **Pin:** siehe Vault/Passwortverwaltung
   - **Name:** `hmip-ct-integration-local-{NAME}` (eigenen Namen einsetzen)
3. Innerhalb weniger Minuten muss dann **am Access Point im Gemeindehaus ein Knopf gedrückt**
   werden, um die Kopplung zu bestätigen — also vorher schon jemanden vor Ort informieren bzw.
   selbst rechtzeitig da sein.
4. Das erzeugte Token in die lokale `.env`-Datei eintragen.

### `.env` befüllen

Im Repository liegt eine `.env-sample` — die kopieren (`cp .env-sample .env`) und dann die eigenen
Werte eintragen:

- Das eben erzeugte HomematicIP-Token eintragen.
- Einen **eindeutigen Wert** für `ENVIRONMENT` setzen (z. B. den eigenen Namen), damit die eigenen
  Testdaten in InfluxDB/Grafana später klar von anderen unterscheidbar sind und nicht in den
  produktiven Graphen auftauchen.
- Alle mit `<CHANGEME>` markierten Felder mit den Zugangsdaten aus dem Vault befüllen — außer
  Uptime Kuma, das wird lokal nicht benötigt.

## Feature-Deployments

Jeder Branch außer `main`/`master` wird automatisch als **`feature`-Container** deployt. Wegen der
Token-Problematik (siehe oben) kann **immer nur ein einziges Feature-Deployment gleichzeitig**
existieren — der zuletzt gebaute (und deployte) Feature-Branch bleibt aktiv, bis ein anderer
Feature-Branch deployt wird. Deshalb: nicht mehrere Feature-Branches parallel aktiv verwenden, das
führt sonst zu Verwirrung.

Das Feature-Deployment hat einen eigenen, von der Produktion getrennten Satz an Volumes
(Konfiguration, persistente Daten) — Änderungen daran wirken sich nicht auf die Produktion aus.
Wird an diesen Volumes etwas geändert, das dauerhaft gebraucht wird, muss die gleiche Änderung
zusätzlich für `main`/`master` vorgenommen werden, bevor diese Version deployt wird.

## Produktion (`main`/`master`)

Alles, was auf `main` (nach einem Pull Request) landet, wird **sofort produktiv deployt**. Die
zugehörigen Volumes enthalten die echten Produktionswerte — entsprechend vorsichtig damit umgehen.
