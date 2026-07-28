import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement scrollIntoView — real browsers do. Stub it so
// components that call it (e.g. OrderRoom's auto-scroll-to-latest-message)
// don't crash under test; this is a test-environment gap, not app behavior.
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
