import { describe, expect, it } from "vitest";
import { clamp, createElement } from "../src/utils/dom";

describe("dom helpers", () => {
  it("creates elements with optional classes", () => {
    const button = createElement("button", "hello");
    expect(button.tagName).toBe("BUTTON");
    expect(button.className).toBe("hello");
  });

  it("clamps a number within bounds", () => {
    expect(clamp(10, 0, 4)).toBe(4);
    expect(clamp(2, 0, 4)).toBe(2);
  });
});
