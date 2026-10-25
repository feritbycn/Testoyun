# Game features and implementation status

## Implemented in this prototype
- Three.js 3D road scene, procedural bus, roadside trees/buildings, simple traffic cars and follow/cockpit-like/external camera modes.
- Keyboard and touch throttle/brake/steering, handbrake, engine toggle, lights, indicators and camera toggle.
- Simplified frame-time-based vehicle movement, fuel consumption, off-road damage, and speed/fuel/damage HUD.
- Fictional route selection and trip completion loop, cash/gold reward, expenses and a transaction ledger.
- Six bus definitions, buying/selecting, paint cycling, five upgrade levels and repair.
- Mission progress and one-time claim guard, local daily reward guard, local save and Turkish/English UI strings.
- Explicitly disabled real-money purchase and rewarded-ad integrations.

## Partial / simplified
- Collision is limited to a basic traffic proximity response and off-road damage; there is no full rigid-body collision solver.
- Route progress is time/speed based rather than GPS/pathfinding based. It is a prototype game loop, not an accurate route simulation.
- Traffic vehicles move along the road but do not implement full lane-changing, signal compliance or path planning.
- Engine, audio, passenger boarding animations and full weather simulation are not implemented.
- Daily reward uses device date and local storage; it can be reset or manipulated.

## Not implemented
- Real-world map data, real terminals, online accounts, multiplayer, cloud saves, server-side economy, real ad SDK, real purchase SDK, verified subscriptions, refund handling, receipt validation, Android APK build and production analytics.
