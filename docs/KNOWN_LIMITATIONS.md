# Known limitations

- This is a staged, playable prototype and not a commercial-grade simulator.
- The environment and bus are generated from simple procedural geometry; no licensed high-detail vehicle asset pack is included.
- Driving dynamics are intentionally simplified; there is no full rigid-body solver, suspension model, tire model, gear transmission, or complete collision response.
- The route system uses a time/speed progress meter, not real road graph navigation.
- Traffic follows simple repeating paths; no robust traffic AI or signal simulation.
- Passenger boarding, seats occupied by individual agents, baggage simulation, engine/road audio, rain and wet-road physics are not yet implemented.
- Daily reward relies on local device time; changing the clock or storage can bypass the limit.
- Local saves can be edited/cleared and are not authoritative.
- Real ads, billing, Premium entitlement verification, backend services, cloud save and multiplayer are not configured.
- No APK is included. Android packaging and store SDKs require separate work.
- The project has not been benchmarked across a representative matrix of Android devices; no FPS guarantee is made.
