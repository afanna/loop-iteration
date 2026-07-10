# A2UI Render

A HarmonyOS (ArkUI, stage mode) demo app that drives the
[`@arkui-genius/genui`](https://ohpm.openharmony.cn/#/cn/detail/@arkui-genius%2Fgenui)
SDK to render [A2UI](https://a2ui.dev) v0.9 surface descriptions and snapshot
them as PNGs.

The app is a **batch screenshot harness**: on launch it scans
`entry/src/main/resources/rawfile/a2ui_cases/` for A2UI case files
(`.json` / `.jsonl`), feeds each one into a fresh `SurfaceController`, waits
for the surface to settle, then captures the window via `window.snapshot()`
and writes a PNG to the app's private files directory.

## Features

- Renders A2UI v0.9 messages (`createSurface`, `updateComponents`,
  `updateDataModel`) using the published `Catalog.extended()` component set.
- Headless batch mode: drop new case files into `rawfile/a2ui_cases/`, relaunch
  the app, and screenshots are produced for every case in alphabetical order.
- Live progress UI: status, current case, output path, and a per-case
  success/error list.
- A2UI actions are received via `SurfaceController.registerActionReceiver` and
  logged to the console.

## How it works

1. `EntryAbility` loads `pages/Index`.
2. `Index.ets` builds a `SurfaceController` with `Catalog.extended()` and
   registers an `ActionReceiver` that just logs the action string.
3. For each file in `rawfile/a2ui_cases/`:
   - parse the JSON / JSONL into a sequence of A2UI message strings;
   - tear down any prior controller, create a new one;
   - call `controller.onReceive(message)` for each message with a small
     inter-message delay so the surface can settle;
   - wait `RENDER_STABLE_DELAY_MS` (1 s), then `window.snapshot()` the main
     window and pack the `PixelMap` to PNG.
4. Screenshots land in `<filesDir>/a2ui-render-shots/`.

Two formats are supported per case file:

- **JSON array** &mdash; e.g. `[ {...}, {...}, {...} ]`. The whole array is
  parsed in one shot and each element is fed in order.
- **JSONL** &mdash; one A2UI message per line. Each line must be a valid JSON
  document; the line text is sent verbatim to `onReceive`.

See `entry/src/main/resources/rawfile/a2ui_cases/Case-600-30-pet-feeder-020.card.dsl.jsonl`
for an end-to-end example that renders a 140x140 low-power battery card.

## Project structure

```
a2uiRender/
  AGENTS.md                       Agent / contributor guide for this repo
  AppScope/                       App-wide config (bundle name, icon, strings)
  entry/                          The only Hvigor module
    src/main/ets/
      entryability/EntryAbility.ets   Loads pages/Index
      pages/Index.ets                 Batch renderer + screenshot UI
    src/main/resources/rawfile/
      sample.jsonl                Standalone A2UI sample (not used by Index)
      a2ui_cases/                 Case files picked up by the batch runner
    src/main/module.json5         Module manifest
    src/test/                     Local hypium unit tests
    src/ohosTest/                 Instrumented hypium tests
  oh-package.json5                Pinned deps (@arkui-genius/genui, hypium)
  build-profile.json5             Hvigor build profile (strict mode on)
  code-linter.json5               Lint config
```

## Prerequisites

- DevEco Studio (5.x or newer) with the HarmonyOS SDK installed.
- HarmonyOS **6.1.1(24)** target / **6.1.0(23)** compatible.
- A running emulator or device (API 24, phone).
- Node toolchain is **not** required. Dependencies are managed by `ohpm`.

## Build, install, run

From the repo root:

```bash
# Install dependencies (regenerates oh_modules/)
ohpm install

# Build the default HAP
hvigorw clean all
hvigorw --mode module -p product=default assembleHap --analyze=normal --parallel --incremental --daemon

# Run on a connected device or running emulator (from DevEco or CLI)
# Then open the app — it auto-renders every case in rawfile/a2ui_cases/.
```

For day-to-day iteration in DevEco Studio: open this folder, let it sync, then
**Run > Run 'entry'** with an emulator running. Screenshots are pulled from
`<filesDir>/a2ui-render-shots/` (use DevEco's Device File Browser to navigate
to `data/data/com.example.a2ui/files/a2ui-render-shots/`).

## Adding a new A2UI case

1. Drop a new `.json` or `.jsonl` file into
   `entry/src/main/resources/rawfile/a2ui_cases/`.
2. The file name becomes the output file name (extension stripped, non-
   alphanumeric characters replaced with `_`).
3. Rebuild & relaunch. The new case is picked up automatically and rendered
   alongside the existing ones in alphabetical order.

Use `Case-600-30-pet-feeder-020.card.dsl.jsonl` as a minimal reference.

## Tests

```bash
# Local ArkTS unit tests
hvigorw test -p module=entry@default -p coverage=false

# Run a single test file
hvigorw test -p module=entry@default -p coverage=false --test-file=List.test
```

The bundled tests are stock hypium smoke tests (`assertContain('abc','b')`).
Extend them as functionality grows.

## Lint

```bash
hvigorw lint -p module=entry@default
```

`code-linter.json5` enables `@performance/recommended`,
`@typescript-eslint/recommended`, and the `@security/no-unsafe-*` rules.

## Output format

Each rendered case produces a PNG at
`<context.filesDir>/a2ui-render-shots/<sanitized-name>.png`, named after the
source file. The status banner in the UI reports the success count, e.g.
`Done: 1/1 screenshots saved`.

## Notes

- `pkg_outer/A2UIRender/` is a vendored copy of the SDK source tree kept for
  reference only. **The app depends on the published `@arkui-genius/genui`
  package, not on this folder.** Editing files there has no effect on the
  running app.
- `local.properties` is auto-generated by DevEco and is in `.gitignore`. Do
  not commit it.
- The HarmonyOS build runs in strict mode (`caseSensitiveCheck: true`,
  `useNormalizedOHMUrl: true`); keep new file paths case-correct and import
  modules via the `@arkui-genius/genui` OHM URL, not via `oh_modules/`.
- `entry/build-profile.json5` keeps `obfuscation.enable: false` for the
  `release` build. Don't enable it without a reviewed `obfuscation-rules.txt`.
