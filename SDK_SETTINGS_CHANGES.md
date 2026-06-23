# SDK Settings Changes

The SDK now supports optional runtime settings from the backend.

## Changed Files

- `src/lib/constants.ts`: added `RUNTIME_SETTINGS_ENDPOINT` for `GET /api/integrations/runtime-settings`.
- `src/setup/client.types.ts`: added remote settings response/options types and header filter level names.
- `src/setup/client.ts`: added `useRemoteSettings()` and `initializeAsync()`.
- `src/index.ts`: exported `RemoteRuntimeSettings` and `RemoteSettingsOptions` types.

## Behavior

- Existing synchronous initialization still works for local builder settings:

```ts
createClient()
  .defineService(service)
  .apiKey(apiKey)
  .subscribeToFetch()
  .initialize();
```

- Remote settings require async initialization so backend settings are applied before instrumentation starts:

```ts
const client = await createClient()
  .defineService(service)
  .apiKey(apiKey)
  .useRemoteSettings()
  .initializeAsync();
```

- Remote settings are fail-open by default. If the backend request fails, the SDK keeps the local builder options.
- Use `.useRemoteSettings({ required: true })` to throw when settings cannot be fetched.
- Remote communication settings control fetch/http subscription, body capture, stream body capture, body byte limit, and header filtering.
- Remote performance settings currently control `captureMetrics`; notification thresholds are enforced by the backend during log ingestion.
