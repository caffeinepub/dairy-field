# Specification

## Summary
**Goal:** Fix product catalog loading so the backend `listProducts()` is reliable and deterministic, and the Products page provides clear, actionable recovery and diagnostics when loading fails.

**Planned changes:**
- Update the backend `listProducts()` implementation to never trap, return products reliably (including when empty), and return results in a deterministic order (e.g., sorted by product name).
- Improve the Products page error state to display an English, sanitized underlying error message alongside the friendly text.
- Add a Retry action to the Products page that refetches products, shows retry-in-progress, and renders the grid after a successful retry without a full refresh.
- Add lightweight frontend diagnostics to distinguish actor initialization failures from `listProducts()` call failures, including clear English messaging and prefixed console logs.

**User-visible outcome:** The Products page loads products consistently; if loading fails, users see a clear English error with details and can retry successfully without refreshing the page.
