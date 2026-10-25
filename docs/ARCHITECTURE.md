# Architecture

- `src/main.ts`: app composition, UI rendering and high-level game loop.
- `src/game/World.ts`: Three.js lights, procedural road/environment and bus mesh.
- `src/game/VehicleController.ts`: simplified driving dynamics and vehicle state.
- `src/game/InputController.ts`: keyboard and pointer/touch input.
- `src/game/TrafficManager.ts`: lightweight traffic props and proximity response.
- `src/systems/EconomyManager.ts`: balance changes, idempotency IDs and transaction ledger.
- `src/systems/GarageManager.ts`: bus catalog, ownership, paint and upgrades.
- `src/systems/RouteManager.ts`: fictional routes and trip count.
- `src/systems/MissionManager.ts`: event-driven mission progress and one-time claims.
- `src/systems/SaveManager.ts`: versioned localStorage envelope.
- `src/systems/PlatformServices.ts`: deliberately unconfigured adapter boundaries.
- `src/i18n/translations.ts`: Turkish and English UI strings.

## Trust boundaries
Browser storage and client-side code are untrusted. Never use local save state as proof of a purchase. Real paid entitlements require platform receipt validation and a trusted server-side entitlement source. Rewarded ads must only grant a reward after the provider's verified completion callback, with an idempotent transaction ID.
