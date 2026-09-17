# Für Entwickler:innen

Dieser Bereich gibt einen Überblick über die beteiligten Systeme, wie sie zusammenspielen, und wie
man lokal entwickelt. Für die produktseitige Erklärung ("wie heizt das System") siehe
[Für Nutzer:innen](/docs/nutzer).

- [Komponenten](/docs/technik/komponenten) — welche Systeme beteiligt sind und wer worauf Zugriff
  braucht
- [Zusammenspiel](/docs/technik/zusammenspiel) — wie ein Commit am Ende zu einer echten
  Temperaturänderung führt
- [Entwicklung](/docs/technik/entwicklung) — lokales Setup, HomematicIP-Token, Branching-Regeln

## Technisches Deep-Dive (Englisch, auf GitHub)

Für den harten technischen Teil (Modul-Aufbau, Code-Konventionen, Testkonventionen) liegt die
Dokumentation im Repository selbst, auf Englisch, gedacht für alle, die direkt am Code arbeiten:

- [README.md](https://github.com/cg-heidelsheim/cghh-smarthome-ct-integration/blob/master/README.md)
  — produktseitige Erklärung und Betriebs-FAQ
- [AGENTS.md](https://github.com/cg-heidelsheim/cghh-smarthome-ct-integration/blob/master/AGENTS.md)
  — Konventionen für alle, die im Code arbeiten (Menschen wie Coding-Agents)
- [docs/architecture.md](https://github.com/cg-heidelsheim/cghh-smarthome-ct-integration/blob/master/docs/architecture.md)
  — Modul-Übersicht und die beiden zentralen Datenflüsse im Detail
- [docs/testing-guide.md](https://github.com/cg-heidelsheim/cghh-smarthome-ct-integration/blob/master/docs/testing-guide.md)
  — Testkonventionen
