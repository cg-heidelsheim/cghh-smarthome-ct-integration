# Häufige Fragen

## Der Raum wurde nicht geheizt — warum?

Der Reihe nach durchgehen:

1. **Gibt es überhaupt eine Raumbuchung** für den Termin in ChurchTools, nicht nur den Termin
   selbst?
2. **Ist die Buchung bestätigt** ("angenommen")? Eine offene oder abgelehnte Buchung löst kein
   Heizen aus.
3. **Ist der gebuchte Raum im System bekannt?** Nicht jeder in ChurchTools existierende Raum ist
   auch im Heizungssystem hinterlegt (z. B. die Küche wird bewusst ignoriert). Wurde ein neuer
   Raum angelegt, muss er dem System erst bekannt gemacht werden — siehe
   [Komponenten](/docs/technik/komponenten).
4. **War genug Zeit zum Vorheizen?** Bei sehr kurzfristig angelegten oder verschobenen Terminen
   reicht die verbleibende Zeit unter Umständen nicht mehr aus, um die Zieltemperatur pünktlich zu
   erreichen — siehe [Heizungslogik](/docs/nutzer/heizungslogik).
5. **Wurde die Temperatur manuell verändert?** Eine manuelle Änderung am Thermostat wird als
   bewusste Entscheidung respektiert und nicht automatisch überschrieben.

Falls all das passt und der Raum trotzdem nicht geheizt hat, im
[Log-Dashboard](/docs/nutzer/grafana) nachsehen oder die Betreuung des Systems kontaktieren.

## Der Raum ist zu kalt / zu warm eingestellt

Die Zieltemperatur für einen Raum bzw. für einzelne Termine ist konfigurierbar. Wer eine andere
Standardtemperatur für einen Raum oder eine abweichende Temperatur für bestimmte Termine möchte,
wendet sich an die Betreuung des Systems.

## Ich habe die Temperatur manuell geändert, jetzt heizt das System gar nicht mehr

Das ist gewolltes Verhalten: Eine manuelle Änderung wird als bewusste Entscheidung interpretiert
und nicht automatisch rückgängig gemacht. Spätestens beim nächsten planmäßigen Reset (stündlich,
sofern der Raum gerade keine aktive Buchung hat) wird der Raum wieder auf die Grundtemperatur
zurückgesetzt.

## Wo sehe ich, was das System gerade macht?

Siehe [Grafana-Dashboards](/docs/nutzer/grafana) — dort gibt es sowohl die Sensordaten je Raum als
auch ein Log-Dashboard mit den ausgeführten Aktionen.
