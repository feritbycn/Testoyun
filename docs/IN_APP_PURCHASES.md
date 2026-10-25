# In-app purchases

No real purchase flow is configured. `PurchaseService.purchase()` always returns a clear failure and does not grant items.

Production requirements:
- Define product IDs and prices in the platform store, not hardcoded UI prices.
- Use Google Play Billing for Play distribution and follow the current platform requirements.
- Validate purchase tokens/receipts with a trusted backend before granting high-value entitlements.
- Process purchases idempotently, handle pending/cancelled/refunded/expired states, and support restore where applicable.
- Keep consumables, permanent entitlements and subscriptions distinct.
- Never trust a localStorage flag as proof of ownership.
- Test using the store's license-test flow before release.
