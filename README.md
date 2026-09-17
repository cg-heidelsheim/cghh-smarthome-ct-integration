# ChurchTools Integration for Homematic IP

Bridges [ChurchTools](https://heidelsheim.church.tools/) calendar room bookings to Homematic IP
heating control in the Gemeindehaus, with InfluxDB telemetry and an Uptime Kuma healthcheck.

## Documentation

- **Using the system, or part of the Hausverwaltung team?** The running container hosts a
  German-language documentation site at `/docs` (production: the server's port `34242`). It
  explains how and when rooms get heated, lists the current target temperatures per room/event
  live from the actual config, and covers the Grafana dashboards for the Hausverwaltung team.
- **Working in this codebase (as a contributor or an agent)?** Start with
  [`AGENTS.md`](AGENTS.md) (tech stack, commands, conventions) and
  [`docs/architecture.md`](docs/architecture.md) (module map, the two real data flows in detail).
  Testing conventions: [`docs/testing-guide.md`](docs/testing-guide.md).

The documentation site's own source lives at [`docs/site/`](docs/site/), rendered by
[`src/docs-site/`](src/docs-site/) — see `AGENTS.md` if you're changing either.
