# RoadMaster: Bus Empire

A modular, browser-playable 3D bus-driving prototype built with TypeScript, Vite and Three.js. The project follows the uploaded “ANA PROMPT: MODERN OTOBÜS SİMÜLATÖRÜ — TAM OYUN PROJESİ” as a staged implementation: the driving core is implemented first, with transparent adapters and documentation for systems that need platform/server integration.

## Current scope

- Real Three.js 3D scene with a procedural bus, road, lane markings, roadside scenery, traffic vehicles and follow camera.
- Keyboard and touch controls: throttle, brake, steering, handbrake, lights, indicators, horn, camera toggle and engine state.
- Vehicle acceleration, braking, steering, drag, fuel use, collision bounds and damage feedback.
- Route selection and trip completion loop with fare/reward calculations.
- Garage: six configurable bus classes, purchase and selection, paint customization and basic upgrades.
- Cash/gold wallet, transaction ledger, simple company profile, missions, daily reward, settings and local save.
- Turkish/English UI text resources.
- Explicit development-only rewarded-ad and purchase adapters; no fake real-money checkout or ad completion.
- GitHub Actions build/test and GitHub Pages workflow.

## Requirements

- Node.js 20 or newer recommended.
- npm.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. Controls: `W`/`ArrowUp` throttle, `S`/`ArrowDown` brake, `A/D` or arrows steer, `Space` handbrake, `C` camera, `L` lights, `Q/E` indicators, `H` horn, `P` engine toggle. Touch controls appear on small screens.

## Verify

```bash
npm run typecheck
npm test
npm run build
```

## GitHub Pages

1. Create a new GitHub repository and upload the contents of this folder (not the parent ZIP).
2. In **Settings → Pages**, choose **GitHub Actions** as the deployment source.
3. Push to `main` or `master`; `.github/workflows/pages.yml` builds and publishes the Vite site.
4. The workflow derives Vite's base path from `GITHUB_REPOSITORY`, so repository pages URLs work without manually editing asset paths.

## Android

See [`docs/ANDROID_BUILD.md`](docs/ANDROID_BUILD.md). The current deliverable is a browser game, not an APK. Capacitor can package the web build, but Android billing and ad SDKs must be added and tested separately.

## Monetization status

The browser build intentionally does **not** pretend to show real ads or complete real purchases. Development adapters return “not configured” for real ad/billing actions. Implement the official provider SDK and, for valuable entitlements, server-side receipt validation before publishing paid products. See `docs/ADS_INTEGRATION.md` and `docs/IN_APP_PURCHASES.md`.

## Save data

The game stores non-authoritative local progress in `localStorage`. This is for a local prototype only; browser storage can be edited or cleared and is not proof of a purchase.

## Known limitations

This is a playable prototype, not a finished commercial simulator. Vehicle and environment geometry are procedural low-poly assets; the route is a compact loop rather than a real-world road network; passenger animation, full traffic laws, real weather simulation, cloud saves, accounts, multiplayer, and real ad/billing integrations are not included. Performance has not been benchmarked across a representative device matrix. Read `docs/KNOWN_LIMITATIONS.md`.

## Project structure

```text
src/
  main.ts
  styles.css
  game/       Three.js scene, vehicle physics, input, traffic
  systems/    economy, save, garage, route, missions, ad/billing adapters
  i18n/       Turkish and English strings
tests/        economy and route tests
docs/         feature, architecture, publishing, integration, test and limitation guides
.github/workflows/
```
