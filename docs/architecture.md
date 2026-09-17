# Architecture

Start here for orientation; see `AGENTS.md` for conventions and `README.md` for the product-level
explanation and FAQ. This doc covers the module map and the two real data flows in more detail.

## Module map

```
index.ts
  ├─ starts a CronJob (src/churchtools/churchtools-event-cron.ts's execute/
  │  resetEverythingIfNotLocked)
  ├─ starts the WS listener (src/homematic/homematic-event-listener.ts)
  └─ on SIGTERM/SIGINT: stops the cron, flushes InfluxDB, exits

src/churchtools/          "what should happen" - reads ChurchTools bookings, decides whether
                          to heat a room, resolves expired locks back to idle
      ↓ constructs/calls
src/homematic/             "make it happen" - talks to the real Homematic IP API, and
                          separately listens to its WS stream for live state updates
      ↓ persists via
src/db/                    flat-JSON persistence (locks, room config, device/group/weather
                          state snapshots)
      ↓ uses
src/util/, src/timeseries/  logging (console + InfluxDB), timezone bootstrap, InfluxDB client
```

`churchtools/` depends on `homematic/` (event-manager.ts calls into `GroupManagerFactory`,
`GroupStateBuilder`) — not the other way around. `db/model/` must never depend on
`churchtools/` or perform its own I/O (see AGENTS.md's "Layering").

## Flow 1: cron-driven heating decision

Runs on the schedule in `CRON_DEFINITION` (`.env`), driven by `index.ts`'s CronJob.

```
index.ts (CronJob tick)
  → churchtools-event-cron.ts: execute()
      → LockManager.manageLocks()
          for each lock in LockDB.getAll():
            if not expired: skip
            else: GroupManagerFactory.createGroupManager(lock.id).setToIdle(lock.eventName)
                  → HomematicApi.setTemperatureForGroup(...)   [dry-run gated]
                  LockDB.deleteById(lock.id)
      → EventManager.handleEvents()
          events = ChurchToolsApiClient.getEvents()            [ChurchTools REST]
          eventRoomConfigs = EventRoomConfigDB.getAll()         [fetched once, threaded through]
          for each event in filterCurrentAndUpcomingEvents(events):
            for each booking in event.bookings:
              roomConfig = RoomConfigDB.findByCTId(booking.resourceId)
              if ignored resource (Küche) / not accepted (statusId != '2') / room locked: skip
              groupState = GroupStateDB.tryGetById(roomConfig.homematicId) ?? dummy
              { shouldStartHeating, minutesToReachTemp, ... } =
                  HeatingScheduler.calculateHeatingSchedule(roomConfig, event, groupState,
                                                             booking, eventRoomConfigs)
              if shouldStartHeating:
                GroupManagerFactory.createGroupManager(groupState.id).heatForEvent(event, ...)
                  → HomematicApi.setTemperatureForGroup(...)   [dry-run gated]
                LockDB.save(new Lock for this room)
```

`HeatingScheduler.calculateHeatingSchedule` is pure: `requiredTime = spinUpTime + buffer +
(degreeDifference * minutesPerDegree)`; heating starts once `requiredTime` is less than the time
remaining until the event begins. See `RoomConfig.getMinutesNeededToReachTemperatureForEvent` in
`src/db/model/room-config.ts` for the actual calculation, and
`RoomConfig.getDesiredRoomTemperatureForEvent` for how `event-room-temperature.config.json`
overrides the default target temperature for specific events (case-insensitive substring match
on the event name).

At `HH:00`, `execute()` is preceded by up to 3 attempts of `resetEverythingIfNotLocked`: for
every configured room with no active lock, reset to `desiredTemperatureIdle`. Retries (refreshing
`HOMEMATIC_API_URL`/`HOMEMATIC_WS_URL` via `EnvironmentManager.updateServerVariables()` between
attempts) exist because those URLs can change and need re-resolving from the Homematic Lookup
endpoint — not related to the room-locked check.

## Flow 2: WS-driven state sync

A persistent WebSocket connection to the Homematic AP (`WebsocketManager`, wired up by
`homematic-event-listener.ts`) delivers live push events. Every message goes through the same
shape: **diff against the last-known state → write to InfluxDB if changed → persist the new
state → log**.

```
WebsocketManager 'message' event
  → homematic-event-listener.ts: callback(data)
      wsMessage = HMIPWSMessage.fromJson(JSON.parse(data))
      for each event in wsMessage.events:
        if GROUP_CHANGED and group is HMIPWSHeatingGroup:
          current = GroupStateDB.tryGetById(group.id) ?? GroupStateBuilder.dummyState(group.id)
          updated = GroupStateBuilder.fromHomematicGroup(group)
          updated.lock = current.lock          # carried forward, not itself the lock system
          if current.equalsValueAttributes(updated): done
          else: GroupDataSender.sendData(updated) → InfluxDB
                GroupStateDB.save(updated)
                EventLogger.wsGroupChange(current, updated)    # "core" + debug log lines

        if DEVICE_CHANGED and device is HMIPWSHeatingThermostatDevice:
          current = DeviceStateDB.tryGetById(device.id) ?? DeviceStateBuilder.dummyState(...)
          updated = DeviceStateBuilder.fromHomematicDevice(device)
          for each channel in updated.channels:                # usually just one
            if unchanged vs current: skip this channel
            else: DeviceDataSender.sendData(...) → InfluxDB
                  EventLogger.wsDeviceUpdateDebug(...)
          DeviceStateDB.save(updated)                           # unconditional - always
                                                                  # saves, even if no channel changed

        if HOME_CHANGED and event.home is present:
          home = HMIPWSHome.fromJson(event.home)
          key = home.location.city.split(',')[0]                # e.g. "Bruchsal, Germany" -> "Bruchsal"
          current = WeatherStateDB.tryGetById(key) ?? WeatherStateBuilder.dummyState()
          updated = WeatherStateBuilder.fromHomematicHome(home)
          if unchanged: done
          else: WeatherDataSender.sendData(...) → InfluxDB
                WeatherStateDB.save(updated)
                EventLogger.weatherUpdateDebug(...)
```

A missing DB entry (first time an entity is seen) is the normal, silent case. A genuine DB read
failure (corrupt file) is logged but *still* falls back to a dummy state rather than throwing —
this whole callback runs synchronously inside the WS `'message'` handler with no surrounding
error handling, so letting an I/O error escape here would crash the entire live listener, not
just one update.

### The `HMIPWSDiagnosticChannel` field-loss bug (context for anyone touching `ws/model/`)

Two of the four functional-channel classes (`HMIPWSDeviceOperationLockChannel`,
`HMIPWSAccessControllerWiredChannel`) share ~55 diagnostic fields and are now a shared base
class, `HMIPWSDiagnosticChannel`. Before that consolidation, 3 of the 4 channel `fromJson`
implementations independently forgot to map `label`/`groups`/`supportedOptionalFeatures` from
the raw payload — a silent, only-noticed-by-writing-a-test bug. If you add a fifth channel type,
write a `fromJson` round-trip test for it (see `test/homematic/ws/model/device/channel/`) rather
than trusting a copy-pasted `fromJson` got every field.
