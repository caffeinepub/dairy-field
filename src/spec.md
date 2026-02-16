# Specification

## Summary
**Goal:** Ensure the Products catalog loads reliably even if admin access-control initialization fails, and improve error diagnostics/retry UX.

**Planned changes:**
- Update frontend actor creation/usage flow so failures in `_initializeAccessControlWithSecret` do not block public product queries like `listProducts()`, while still enforcing admin-only access for admin features.
- Improve Products page error handling to show an English error title/description, include `sanitizeError(error)` output, and provide a Retry action that refetches without a full page reload and shows a clear retrying/loading state.
- Add clearer console diagnostics distinguishing actor-initialization failures vs. `listProducts()` execution failures.
- Verify and, if necessary, minimally adjust backend `listProducts()` to remain publicly callable and avoid sporadic traps during sorting/serialization, returning a stable array when products exist.

**User-visible outcome:** Users (anonymous or signed in) can open the Products page and see the product list reliably; if loading fails, they see a clear English error with safe details and can retry successfully without reloading the page.
