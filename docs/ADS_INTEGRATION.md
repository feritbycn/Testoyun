# Rewarded ads integration

`RewardedAdService` intentionally returns a not-configured result and does not issue a reward. This prevents the prototype from pretending a user watched an ad.

Before production:
1. Select a supported ad network and review its current policies.
2. Integrate the official SDK in the Android wrapper/native layer.
3. Present an explicit opt-in button and explain the reward.
4. Grant rewards only from the SDK's verified completion callback.
5. Use a unique provider impression/reward ID and make server-side processing idempotent where supported.
6. Handle no-fill, timeout, cancellation and offline errors without granting rewards.
7. Define Premium behavior and privacy/consent requirements for the regions where the game is published.

The GitHub Pages build does not load real ad SDKs.
