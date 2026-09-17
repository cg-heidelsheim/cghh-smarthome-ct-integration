# Heizungslogik

## Welche Termine überhaupt heizen

Damit ein Termin in ChurchTools überhaupt eine Heizung auslöst, müssen zwei Dinge stimmen:

1. Der Termin hat eine **Raumbuchung** (nicht nur eine Ressource wie Beamer o.Ä.).
2. Die Buchung ist **bestätigt** (Status "angenommen"). Eine offene oder abgelehnte Buchung
   heizt nicht.

Vergangene Termine werden ignoriert — es zählen nur laufende oder zukünftige Termine.

## Wann das System aktiv wird

Alle paar Minuten (aktuell konfiguriert über `CRON_DEFINITION`) prüft das System alle anstehenden
gebuchten Termine und rechnet für jeden betroffenen Raum durch, ob **jetzt** mit dem Heizen
begonnen werden muss, damit der Raum **pünktlich zu Beginn des Termins** die gewünschte
Zieltemperatur erreicht hat.

## Wie die Zeit berechnet wird

Für jeden Raum ist hinterlegt:

- **Spinup-Zeit**: wie lange es dauert, bis die Heizkörper überhaupt anspringen und erste
  Temperaturänderungen messbar werden (inkl. eines kleinen Sicherheitspuffers). Größere Räume
  brauchen hier tendenziell länger.
- **Minuten pro Grad**: wie viele Minuten der Raum erfahrungsgemäß braucht, um sich um ein Grad
  zu erwärmen.

Daraus ergibt sich die benötigte Zeit bis zur Zieltemperatur:

```
benötigte Zeit = Spinup-Zeit + Sicherheitspuffer + (Grad-Differenz × Minuten pro Grad)
```

Ist diese benötigte Zeit **größer** als die Zeit, die bis zum Termin noch bleibt, wird jetzt mit
dem Heizen begonnen. Ist noch genug Zeit, wartet das System einfach bis zum nächsten Durchlauf und
prüft erneut — so wird nicht unnötig früh geheizt.

## Manuelle Übersteuerung wird respektiert

Wurde die Temperatur eines Raumes **manuell** am Thermostat verändert (z. B. weil jemand es
wärmer oder kälter möchte als geplant), erkennt das System das und greift **nicht** ein. Die
automatische Heizung wird für diesen Durchlauf übersprungen und beim nächsten Mal erneut geprüft.

## Was nach einem Termin passiert

Sobald eine Buchung ausläuft, wird der Raum wieder auf die **Grundtemperatur** (Idle, in der Regel
16 °C) zurückgestellt — außer der Raum wurde zwischenzeitlich manuell verändert, dann bleibt diese
manuelle Einstellung zunächst bestehen und wird beim nächsten planmäßigen Reset (siehe unten)
berücksichtigt.

## Der nächtliche Reset

Einmal pro Stunde (zur vollen Stunde) prüft das System zusätzlich **alle** konfigurierten Räume:
Jeder Raum ohne aktiven Termin und ohne aktive "Sperre" (d. h. es läuft gerade kein automatisch
gestarteter Heizvorgang) wird zur Sicherheit auf die Grundtemperatur zurückgesetzt. Das fängt Fälle
ab, in denen z. B. ein Termin kurzfristig verschoben oder gelöscht wurde.

## Individuelle Zieltemperaturen

Für einzelne Termine (z. B. anhand des Termin-Namens) kann eine abweichende Zieltemperatur
hinterlegt werden, statt der für den Raum üblichen Standardtemperatur. Wer das ändern möchte,
wendet sich an die Betreuung des Systems (siehe [Komponenten](/docs/technik/komponenten)).
