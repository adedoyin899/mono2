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
