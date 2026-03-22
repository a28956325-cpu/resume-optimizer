import { describe, it, expect } from "vitest";
import { groupIntoLines } from "../generator";
import type { TextPosition } from "../parser";

// Helper to create a mock TextPosition
function mockTextPosition(overrides: Partial<TextPosition> = {}): TextPosition {
  return {
    text: "hello",
    x: 0,
    y: 100,
    width: 50,
    height: 12,
    fontSize: 10,
    pageIndex: 0,
    pageHeight: 842,
    ...overrides,
  };
}

describe("groupIntoLines", () => {
  it("groups items on the same Y into one line", () => {
    const items: TextPosition[] = [
      mockTextPosition({ text: "Hello", x: 10, y: 100 }),
      mockTextPosition({ text: " World", x: 60, y: 100 }),
    ];
    const lines = groupIntoLines(items);
    expect(lines).toHaveLength(1);
    expect(lines[0].items).toHaveLength(2);
  });

  it("groups items within LINE_GROUPING_TOLERANCE", () => {
    const items: TextPosition[] = [
      mockTextPosition({ text: "A", x: 10, y: 100 }),
      mockTextPosition({ text: "B", x: 60, y: 99 }), // within LINE_GROUPING_TOLERANCE (2pt)
    ];
    const lines = groupIntoLines(items);
    expect(lines).toHaveLength(1);
  });

  it("separates items on different Y baselines", () => {
    const items: TextPosition[] = [
      mockTextPosition({ text: "Line1", x: 10, y: 100 }),
      mockTextPosition({ text: "Line2", x: 10, y: 120 }),
    ];
    const lines = groupIntoLines(items);
    expect(lines).toHaveLength(2);
  });

  it("sorts items left-to-right within a line", () => {
    const items: TextPosition[] = [
      mockTextPosition({ text: "World", x: 60, y: 100 }),
      mockTextPosition({ text: "Hello ", x: 10, y: 100 }),
    ];
    const lines = groupIntoLines(items);
    expect(lines[0].items[0].text).toBe("Hello ");
    expect(lines[0].items[1].text).toBe("World");
  });

  it("separates items on different pages even with same Y", () => {
    const items: TextPosition[] = [
      mockTextPosition({ text: "Page1", x: 10, y: 100, pageIndex: 0 }),
      mockTextPosition({ text: "Page2", x: 10, y: 100, pageIndex: 1 }),
    ];
    const lines = groupIntoLines(items);
    expect(lines).toHaveLength(2);
  });

  it("empty input → empty output", () => {
    expect(groupIntoLines([])).toEqual([]);
  });
});
