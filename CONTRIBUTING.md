# Contributing

1. Create a feature branch.
2. Keep game logic in `src/game/` or `src/systems/`, not in UI event handlers.
3. Add tests for economy, reward idempotency, route completion and save migrations.
4. Run `npm run typecheck`, `npm test` and `npm run build`.
5. Do not commit credentials, store receipts, private player data or licensed assets without permission.
6. Describe untested behavior honestly in the pull request.
