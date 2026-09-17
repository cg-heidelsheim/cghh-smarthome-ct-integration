# Heizungslogik

## Welche Termine überhaupt heizen

Damit ein Termin in ChurchTools überhaupt eine Heizung auslöst, müssen zwei Dinge stimmen:

1. Der Termin hat eine **Raumbuchung** (nicht nur eine Ressource wie Beamer o.Ä.).
2. Die Buchung ist **bestätigt** (Status "angenommen"). Eine offene oder abgelehnte Buchung
   heizt nicht.

Vergangene Termine werden ignoriert — es zählen nur laufende oder zukünftige Termine.

## Wann das System aktiv wird

Alle paar Minuten prüft das System automatisch alle anstehenden gebuchten Termine und rechnet für
jeden betroffenen Raum durch, ob **jetzt** mit dem Heizen begonnen werden muss, damit der Raum
**pünktlich zu Beginn des Termins** die gewünschte Zieltemperatur erreicht hat.

## Wie die Zeit berechnet wird

Für jeden Raum ist hinterlegt:

- **Vorlaufzeit**: wie lange es dauert, bis die Heizkörper überhaupt anspringen und erste
  Temperaturänderungen messbar werden. Größere Räume brauchen hier tendenziell länger.
- **Minuten pro Grad**: wie viele Minuten der Raum erfahrungsgemäß braucht, um sich um ein Grad
  zu erwärmen.

Daraus ergibt sich die benötigte Zeit bis zur Zieltemperatur:

```
benötigte Zeit = Vorlaufzeit + (Grad-Differenz × Minuten pro Grad)
```

Manche Buchungen bringen in ChurchTools zusätzlich eine eigene, individuelle Vorlaufzeit mit —
die wird obendrauf gerechnet.

Ist diese benötigte Zeit **größer** als die Zeit, die bis zum Termin noch bleibt, wird jetzt mit
dem Heizen begonnen. Ist noch genug Zeit, wartet das System einfach bis zum nächsten Durchlauf und
prüft erneut — so wird nicht unnötig früh geheizt.

## Manuelle Übersteuerung wird respektiert

Wird die Temperatur eines Raumes **manuell** am Thermostat verändert (z. B. weil jemand es wärmer
oder kälter möchte als geplant), erkennt das System das: Es vergleicht die aktuell eingestellte
Temperatur mit der hinterlegten Grundtemperatur des Raumes. Weichen sie voneinander ab, nimmt das
System an, dass jemand bewusst manuell eingegriffen hat.

- **Läuft gerade ein Termin, für den das System schon geheizt hat**, wird die manuelle Änderung für
  die Dauer dieses Termins nicht angetastet. Sobald der Termin endet, setzt das System den Raum
  aber trotzdem wieder auf die Grundtemperatur zurück — die manuelle Änderung "überlebt" das Ende
  des Termins also nicht von selbst.
- **Ist gerade kein Termin aktiv** (oder hat das System für einen kommenden Termin noch nicht mit
  dem Heizen begonnen), blockiert eine manuelle Abweichung von der Grundtemperatur das automatische
  Vorheizen für alle kommenden Buchungen in diesem Raum — und zwar so lange, bis sich daran etwas
  ändert.

> [!WARNING]
> Wer die Temperatur manuell ändert, muss sie **nach Gebrauch selbst wieder auf die
> Grundtemperatur zurückstellen**. Sonst geht das System bei jeder erneuten Prüfung weiterhin von
> einer bewussten manuellen Einstellung aus und heizt für die nächsten gebuchten Termine in diesem
> Raum **nicht automatisch vor** — bis jemand die Temperatur zurückstellt oder die tägliche
> Sicherheitsprüfung greift (siehe unten).

> [!NOTE]
> Einmal am Tag, um Mitternacht, prüft das System sicherheitshalber alle Räume ohne laufenden
> Termin und setzt vergessene manuelle Änderungen automatisch auf die Grundtemperatur zurück —
> mehr dazu unter [Der nächtliche Reset](#der-naechtliche-reset).

## Was nach einem Termin passiert

Sobald eine Buchung endet, wird der Raum automatisch wieder auf die **Grundtemperatur** (Idle, in
der Regel 16 °C) zurückgestellt — unabhängig davon, ob die Temperatur währenddessen manuell
verändert wurde. Eine manuelle Änderung wirkt sich also nur auf den laufenden Termin selbst aus,
nicht auf die Zeit danach.

## Der nächtliche Reset

Einmal am Tag, **um Mitternacht (00:00 Uhr)**, prüft das System zusätzlich alle konfigurierten
Räume: Jeder Raum ohne aktiven Termin wird zur Sicherheit auf die Grundtemperatur zurückgesetzt.
Das ist das Sicherheitsnetz für Fälle, in denen z. B. eine manuelle Änderung schlicht vergessen
wurde, oder ein Termin kurzfristig verschoben oder gelöscht wurde. Diese Prüfung läuft **nur einmal
pro Tag** — nicht stündlich —, deshalb lohnt es sich, eine manuelle Änderung zeitnah selbst wieder
zurückzustellen (siehe oben).

## Individuelle Zieltemperaturen

Für einzelne Termine (anhand eines Stichworts im Termin-Namen) oder Räume kann eine abweichende
Zieltemperatur hinterlegt sein, statt der sonst üblichen Standardtemperatur. Die aktuell
hinterlegten Werte stehen unter [Zieltemperaturen](/docs/nutzer/zieltemperaturen). Wer das ändern
möchte, wendet sich an die Betreuung des Systems (siehe [Komponenten](/docs/technik/komponenten)).
