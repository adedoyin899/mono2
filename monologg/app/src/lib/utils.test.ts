import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn()", () => {
  it("joins plain class strings", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("drops falsy values", () => {
    expect(cn("a", false, undefined, null, "b")).toBe("a b");
  });

  it("resolves conflicting Tailwind classes to the last one (tailwind-merge)", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
