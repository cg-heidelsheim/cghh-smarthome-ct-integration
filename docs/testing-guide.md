# Testing guide

## Layout

Tests live under `test/`, mirroring `src/` path-for-path: `src/churchtools/lock-manager.ts` →
`test/churchtools/lock-manager.test.js`. Test files are plain `.js` (not `.ts`) — Jest runs them
directly, no compilation needed, and nothing about a test's own logic benefits from static typing
the way the source under test does.

`jest-logger-mock.js` (wired via `jest.config.js`'s `setupFilesAfterEnv`) globally mocks
`src/util/logger.ts`'s `Logger` in every test, so you never need to mock it yourself unless
you're specifically asserting on a log call.

## Characterization tests

A meaningful fraction of this suite is *characterization* tests: tests written to pin down what
the code **actually does today**, including known bugs, before refactoring it — not tests of
"correct" behavior in the abstract. You'll see this pattern throughout:

```js
it('KNOWN BUG: ...', () => { ... });          // documents current (buggy) behavior
it('FIXED (was: KNOWN BUG): ...', () => { ... }); // same test, after the fix landed
```

When you fix a bug found this way: keep both the old characterization (renamed to `FIXED (was:
...)`, asserting the *new* correct behavior) and add the fix's own regression coverage in the
same PR. Don't just delete the old test — the "was" framing is what tells the next person this
was a deliberate, verified behavior change, not an accidental one.

## What to mock vs. use for real

- **Mock**: anything that does real I/O — `*.db.ts` classes (via their constructor-injected
  instances, or `jest.mock('../../src/db/whatever.db')`), `axios`/`ws`/the InfluxDB client,
  `Logger` (already global).
- **Don't mock**: pure model classes and the WS protocol layer (`db/model/*`,
  `homematic/ws/model/**`) — these are cheap, deterministic, and testing them for real is exactly
  what catches field-mapping bugs like the one described in `docs/architecture.md`. See
  `test/homematic/homematic-event-listener.test.js` for the pattern: it mocks the DB/builder/
  data-sender layer but constructs *real* `HMIPWSGroupChangedEvent`/`HMIPWSHeatingGroup`/etc.
  instances, so the `instanceof` dispatch inside the code under test behaves exactly as it would
  against a real WS payload.

## Safety-critical paths get extra scrutiny

Two things get tested more thoroughly than typical: the dry-run gate
(`HomematicApi.setTemperatureForGroup`'s `process.env.ENVIRONMENT !== 'production'` check — see
`test/homematic/homematic-api.test.js`'s `it.each` covering every non-`'production'` value
including `undefined`) and the retry/backoff logic in `HomematicApi.callRest` (fake-timer-driven,
asserting the exact delay sequence and that failures actually propagate to the caller). If you
touch either, add to that coverage rather than assuming the existing tests are enough — a
regression here means either a dev run heats a real room, or the cron job silently stops
retrying/reporting a failed heating command.

## Coverage

`npm run test:coverage` enforces the threshold in `jest.config.js` (currently 85/75/80/85 for
statements/branches/functions/lines). This is the same command CI's Quality Gates stage runs
(as `test:ci:coverage`, with `--maxWorkers=1 --detectOpenHandles` for CI stability — same
threshold, same `collectCoverageFrom`).

Raising the threshold is a deliberate, tracked step (bump it when coverage has genuinely
improved and you want to lock that in) — never lower it to make a failing build pass. If a
specific file is hard to cover meaningfully (e.g. `index.ts`'s top-level wiring, or `logger.ts`
which is mocked in every other test so its *real* implementation is inherently only exercised by
its own dedicated test), that's fine; the threshold is a global floor, not a per-file mandate.

## Running things

```sh
npm test                    # everything
npx jest test/churchtools/  # one directory
npx jest lock-manager        # by filename substring
npm run test:coverage       # with the coverage gate
```
