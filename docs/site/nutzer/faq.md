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
5. **Wurde die Temperatur manuell verändert und nicht wieder zurückgestellt?** Solange die
   Temperatur eines Raumes von seiner Grundtemperatur abweicht, geht das System von einer
   bewussten manuellen Einstellung aus und heizt für kommende Termine in diesem Raum nicht
   automatisch vor — siehe [Heizungslogik](/docs/nutzer/heizungslogik).

Falls all das passt und der Raum trotzdem nicht geheizt hat, wende dich an die
[Hausverwaltung](/docs/hausverwaltung) (Zugriff auf das Log-Dashboard) oder die Betreuung des
Systems.

## Der Raum ist zu kalt / zu warm eingestellt

Die Zieltemperatur für einen Raum bzw. für einzelne Termine ist konfigurierbar — die aktuell
hinterlegten Werte stehen unter [Zieltemperaturen](/docs/nutzer/zieltemperaturen). Wer eine andere
Standardtemperatur für einen Raum oder eine abweichende Temperatur für bestimmte Termine möchte,
wendet sich an die Betreuung des Systems.

## Ich habe die Temperatur manuell geändert, jetzt heizt das System gar nicht mehr

Das ist gewolltes Verhalten: Eine manuelle Änderung wird als bewusste Entscheidung interpretiert
und blockiert das automatische Vorheizen für kommende Termine in diesem Raum, bis die Temperatur
wieder der Grundtemperatur entspricht. Am einfachsten: die Temperatur selbst wieder auf die
Grundtemperatur zurückstellen. Wird das vergessen, greift spätestens die tägliche
Sicherheitsprüfung um Mitternacht — siehe [Heizungslogik](/docs/nutzer/heizungslogik#der-naechtliche-reset).

## Wo sehe ich, was das System gerade macht?

Das ist ein Thema für die [Hausverwaltung](/docs/hausverwaltung): Dort gibt es sowohl die
Sensordaten je Raum als auch ein Log-Dashboard mit den ausgeführten Aktionen in Grafana.
