import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Without `test.globals: true`, @testing-library/react can't auto-detect the test
// framework's afterEach to register its own cleanup — each render() call would
// otherwise accumulate in the DOM across tests within a file. Only surfaced once a
// test file had two cases asserting on the same text (see RequireAuth.test.tsx).
afterEach(cleanup);

// jsdom doesn't implement scrollIntoView — real browsers do. Stub it so
// components that call it (e.g. OrderRoom's auto-scroll-to-latest-message)
// don't crash under test; this is a test-environment gap, not app behavior.
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

// jsdom doesn't implement IntersectionObserver — real browsers do. Framer
// Motion's whileInView (used for scroll-reveal animations, e.g. LandingPage's
// original design) needs it to mount at all; without a stub any component
// using whileInView throws under test. This is a test-environment gap, not
// app behavior — the stub reports nothing intersecting, matching jsdom's lack
// of real layout/viewport geometry.
if (typeof globalThis.IntersectionObserver === "undefined") {
  class IntersectionObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
  }
  // @ts-expect-error — minimal stub, not a full IntersectionObserver implementation
  globalThis.IntersectionObserver = IntersectionObserverStub;
}
