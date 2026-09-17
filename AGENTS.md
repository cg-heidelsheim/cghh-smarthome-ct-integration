# AGENTS.md

## What this service does

Bridges [ChurchTools](https://heidelsheim.church.tools/) calendar room bookings to Homematic IP
heating control in a real building (community hall), with InfluxDB telemetry and an Uptime Kuma
healthcheck. See `README.md` for the product-level explanation (cron heating logic, WS monitoring,
FAQ) — this file is for working in the codebase.

**This service controls real heating hardware.** Changes to `src/homematic/homematic-api.ts`
(the only place that ever calls the real Homematic API), `src/homematic/group/group-manager.ts`,
or the cron heating-decision path (`src/churchtools/*`) need extra care: run the full test suite,
and be explicit in commit messages / PRs about any behavior change, however small.

## Tech Stack

| Layer | Tool |
|---|---|
| Language | TypeScript (strict mode), compiled via `tsc` to CommonJS — see "TypeScript notes" below |
| Runtime | Node.js 20, plain `node dist/index.js` (no framework) |
| Scheduling | `cron` (CronJob) — drives the nightly reset + heating-decision loop |
| Live updates | `ws` — a persistent WebSocket connection to the Homematic IP Access Point |
| Persistence | Flat JSON files on disk (`persistent/`, `config/`) via a hand-rolled `JsonFileDB<T>` — see "Persistence" below |
| Telemetry | InfluxDB (`@influxdata/influxdb-client`) — sensor readings and structured logs |
| Healthcheck | Uptime Kuma push monitor (`uptime.ts`) |
| Tests | Jest + ts-jest |

## Commands

```sh
npm run build              # tsc -p tsconfig.build.json -> dist/
npm start                  # builds (prestart) then runs dist/index.js
npm test                   # Jest, all tests
npm run test:coverage      # Jest with coverage (enforces the threshold in jest.config.js)
npm run lint                # ESLint
npm run lint:fix           # ESLint --fix
npm run typecheck          # tsc --noEmit
npm run knip                 # unused files/exports/dependencies
npm run dupes                # jscpd duplicate-code check
npm run check               # lint + typecheck + knip + dupes + test:coverage — run before finishing every task
```

Local dev needs a `.env` (copy `.env-sample`) and `config/room.config.json` /
`config/event-room-temperature.config.json` (not committed — see `config/*.config.json` shape
below). Set `ENVIRONMENT` to anything other than exactly `production` for a dry run: every path
that would command real hardware or ping the real Uptime Kuma checks that value first and logs
"Dry run: ..." instead.

## Code Structure

```
index.ts                the entrypoint: starts the CronJob, boots the WS listener, wires
                         SIGTERM/SIGINT to flush InfluxDB before exit
uptime.ts                Uptime Kuma push-monitor client (its own dry-run gate)
src/
  churchtools/           the ChurchTools side: event-manager.ts (the per-booking heating
                         decision), heating-scheduler.ts (pure calculation), lock-manager.ts
                         (resolves expired locks back to idle), churchtools-event-cron.ts
                         (execute()/resetEverythingIfNotLocked(), called from index.ts),
                         ct-api.ts (ChurchTools REST client), model/ (Event, Booking DTOs)
  db/                    persistence layer - json-file.db.ts (generic base) + one thin
                         subclass per entity (*.db.ts), model/ (the DTOs themselves, plus
                         RoomConfig which additionally holds the pure heating-time calc)
  homematic/              the Homematic IP side: homematic-api.ts (the only file that calls
                         the real REST API — has the dry-run gate and the retry/backoff
                         logic), homematic-event-listener.ts (the WS message
                         diff/persist/log handler for group/device/weather updates),
                         group/group-manager.ts (idle/heat-for-event decision + the actual
                         API call), group/group-manager.factory.ts, device/ + weather/ +
                         group/*-state.builder.ts (raw-WS-object -> persisted-DTO mappers),
                         ws/model/               the Homematic IP WS protocol itself: a JSON->class
                         hierarchy (device/event/group/home, each with a `fromJson` static
                         factory) plus one dispatch factory per entity type
                         (`*-factory.ts`, switches on a `type`/`pushEventType` string)
  timeseries/            InfluxDB: influx/influx-db.ts (the client singleton, `export =`),
                         data-sender.base.ts + one thin subclass per entity type
  util/                  logger.ts (the Logger class — console + InfluxDB sink),
                         event.logger.ts (EventLogger — human-facing "core" narration,
                         see "Logging conventions" below), environment-manager.ts
                         (refreshes Homematic server URLs into process.env),
                         event-filter.util.ts, homematic-influx.mapper.ts,
                         timezone.bootstrap.ts (see "Timezone" below)
  websocket-manager.ts    the raw `ws` connection: ping/reconnect intervals, dry-run-aware
                         message delay
test/                    mirrors src/ 1:1 - see docs/testing-guide.md
config/                  room.config.json, event-room-temperature.config.json — not
                         committed, provisioned per-environment (see below)
persistent/               runtime state written by the app itself (locks, device/group/
                         weather state snapshots, pending-log entries) - not committed
docs/
  architecture.md          module map and the two real data flows (cron heating-decision,
                         WS state-sync) in more detail than this file
  testing-guide.md         unit vs. characterization-test conventions, coverage expectations
```

## Naming convention (already consistent, not enforced by tooling — just know it)

| Suffix | Means |
|---|---|
| `.db.ts` | A `JsonFileDB<T>` subclass — persistence only, no business logic |
| `.factory.ts` | A static factory: `switch` on a discriminator field, dispatch to the matching class's `fromJson`/constructor |
| `.builder.ts` | A static mapper: raw Homematic WS object → persisted DTO (`fromHomematicX(...)`, `dummyState(...)`) |
| `-manager.ts` | A stateful orchestrator class with instance methods (`LockManager`, `EventManager`, `GroupManager`, `WebsocketManager`) |

## Layering (ESLint-enforced)

`src/db/model/` is the plain-data layer and must never perform its own I/O or reach into the
`churchtools/` domain — see the `no-restricted-syntax` rules in `eslint.config.js`. **Note:**
`no-restricted-imports` does *not* work for this — this codebase is CommonJS-compiled TypeScript
using real `import`/`export` syntax, but `no-restricted-imports` only inspects ES-module `import`
statements and silently never fires on a `require(...)` call; if you ever see a layering rule
added via `no-restricted-imports` here, it's not actually enforcing anything — use
`no-restricted-syntax` with an ESQuery selector on the `require(...)` call literal instead (see
the existing rule for the exact pattern).

If you need data from `churchtools/` inside a `db/model/` class, the caller fetches it and passes
it in as a parameter — see `RoomConfig.getDesiredRoomTemperatureForEvent(event, eventRoomConfigs)`
for the pattern (`EventManager` owns the `EventRoomConfigDB`, fetches once per run, threads the
result through `HeatingScheduler` → `RoomConfig` → `GroupManager`, rather than each room re-reading
the config file from disk individually).

## TypeScript notes

- **Source uses real ES `import`/`export`**, compiled under `"module": "CommonJS"` in
  `tsconfig.json`. This is a deliberate choice: `export class X {}` compiles to the exact same
  `exports.X = X` shape as hand-written CommonJS, so it's fully interoperable if you ever need to
  drop back to a `.js` file, and it avoids the "script vs module" ambiguity a file with no
  `import`/`export` at all runs into (see the next point).
- A `.ts` file with **no** `import`/`export` of its own is treated by TypeScript as a global
  *script*, not a module — its top-level `const`/`class` declarations pollute the single global
  scope shared by every other script-mode file in the program, which produces confusing
  "cannot redeclare" errors between two otherwise-unrelated files. If you ever write a `.ts` file
  that's pure side-effect (no real exports), give it a real export anyway, or this will bite you.
- **`export = X`** (not a named export) is used specifically for modules whose *entire* export
  is one value — `timezone.bootstrap.ts` (re-exports the configured `moment`), `influx-db.ts`
  (the singleton `InfluxDBManager` instance), `ct-api.ts` and `booking.ts` (their `.js`
  originals were `module.exports = ClassName`, a bare default, not `{ClassName}`). Everything
  else uses named `export class`/`export function`/`export interface`.
- **DTO/model classes use definite-assignment assertions** (`id!: string`), not optional fields
  (`id?: string`). These classes are always populated externally — via `Object.assign(new X(),
  data)` in `JsonFileDB`, or field-by-field in a `*.builder.ts` — never in a constructor. `!`
  says "this will be set, just not here," which is both accurate and avoids forcing a null-check
  at every one of the (many) places these fields get read.
- **`useUnknownInCatchVariables: false`** in `tsconfig.json`: this codebase's catch blocks,
  throughout, do `e.message` / `+ e` / `e.response?.data` directly with no narrowing — this
  predates the TypeScript migration and matches how errors are actually used everywhere.
  Narrowing every one of those to satisfy strict mode's default `unknown` catch type would be
  a lot of churn for no real safety gain here.
- **`no-explicit-any` is enforced everywhere except at genuine external-boundary points** — a
  `fromJson(json: Record<string, any>)` parsing a raw WS/API payload, or a `catch` block (see
  above). Each of those has an `eslint-disable-next-line` with a one-line reason; don't add a
  new bare `any` without the same justification.
- **jscpd's threshold is 4%, not the more typical 2%** (see `.jscpd.json`). The Homematic WS
  protocol's DTOs have 50-60 mostly-optional fields, and TypeScript requires listing each field
  twice (once as a typed class property, once in the params interface / constructor assignment)
  — jscpd's line/token clone detector flags that as duplication even though it's unavoidable,
  idiomatic TS, not copy-pasted logic. If `npm run dupes` ever fails, check whether the flagged
  match is *cross-file* (real duplication — fix it, e.g. by extracting a shared base class like
  `HMIPWSDiagnosticChannel` already does for the two ~95%-identical channel types) or *same-file*
  (a class against its own params interface — expected, not a bug).

## Persistence

`JsonFileDB<T>` (`src/db/json-file.db.ts`) is synchronous (`fs.readFileSync` /
`fse.outputFileSync`) — every "DB" call anywhere in the codebase is a blocking full-file
read-modify-write. This is a deliberate fit for the data volume here (a handful of rooms), not
an oversight — don't "fix" it into async without checking for races between the cron job and the
WS listener writing to the same JSON files concurrently, which the synchronous model currently
prevents for free.

Two lookup styles exist on purpose: `getById`/`findByAttribute` throw when nothing matches;
`tryGetById`/`tryFindByAttribute` return `null`. Use the `try*` form for anything on the live WS
path (`homematic-event-listener.ts`, `event.logger.ts`'s pending-log check) — those run
synchronously inside a WS `'message'` handler with no surrounding error handling, so a thrown
"not found" there would crash the whole listener, not just fail one update. A genuine read
failure (corrupt file) still throws even through the `try*` form; callers on the WS path catch
that specifically and fall back to a dummy state rather than letting it escape.

## Logging conventions

`Logger` (`src/util/logger.ts`) has five levels: `core`, `debug`, `info`, `warn`, `error` — all
write to the console and to InfluxDB's `logs` bucket.

**`core` is special**: a core message describes an action or state change that's directly
relevant to *what the system did to the physical building* — not internal debugging detail.
Send core messages only from `EventLogger` (`src/util/event.logger.ts`), not ad hoc from
anywhere else. The current set:
- Heating started (`EventLogger.groupUpdatePreheat`)
- Room reset to idle (`EventLogger.resolveLock`)
- Manual override detected — room blocked (`EventLogger.groupUpdatePreheatBlocked`)
- A WS-observed setTemperature change, tagged AUTO (matched a pending log) or MANU (didn't)
  (`EventLogger.wsGroupChangeCore`)

Everything else (raw sensor readings, per-channel debug snapshots, WS diagnostic chatter) is
`debug` — see the `*ToInfluxLog` methods in `event.logger.ts`, and `Logger.debug` calls
elsewhere. If you're adding a new core message, ask whether an operator watching the Grafana log
dashboard would want to see it as a top-level action; if it's more "here's what changed
internally," it's `debug`.

## Timezone

Every `moment()` call across the codebase assumes `Europe/Berlin` as the default timezone. This
is set exactly once, in `src/util/timezone.bootstrap.ts`, and every other file that needs
Berlin-local date math imports `moment` *from that file* (not from `'moment-timezone'` directly)
so the setting is guaranteed applied. `moment-timezone` is a Node-module-cache singleton, so this
works regardless of which file happens to `require`/`import` the bootstrap module first.

## Commit signing

Commits to this repo are signed (SSH, repo-local key under `.git/signing/`, configured via local
`git config gpg.format ssh` / `user.signingkey` / `commit.gpgsign`) and — per explicit repo
convention — **do not** carry a `Co-Authored-By` attribution trailer, overriding the default
Claude Code convention.

## FAQ / troubleshooting

See `README.md`'s own FAQ section for "room heating did not start"-type operator questions. For
code-level issues: `npm run check` is the single command that mirrors what CI enforces
(`Jenkinsfile`'s Quality Gates stage builds the same `builder` Docker target) — if that's green
locally, CI's gate stage will be too.
