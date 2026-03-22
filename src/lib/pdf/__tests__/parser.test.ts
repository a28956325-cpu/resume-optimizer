import { describe, it, expect } from "vitest";
import { reconstructTextFromPositions } from "../parser";
import type { TextPosition } from "../parser";

// Helper to create a mock TextPosition
function mockItem(overrides: Partial<TextPosition> = {}): TextPosition {
  return {
    text: "hello",
    x: 0,
    y: 100,
    width: 30,
    height: 12,
    fontSize: 10,
    pageIndex: 0,
    pageHeight: 842,
    ...overrides,
  };
}

describe("reconstructTextFromPositions", () => {
  it("returns empty string for empty input", () => {
    expect(reconstructTextFromPositions([])).toBe("");
  });

  it("returns single item text", () => {
    const items = [mockItem({ text: "Hello" })];
    expect(reconstructTextFromPositions(items)).toBe("Hello");
  });

  it("inserts a space when gap between items exceeds fontSize * 0.3", () => {
    // fontSize=10, threshold = 10 * 0.3 = 3
    // item0: x=0, width=30 → ends at x=30; item1: x=37 → gap=7 > 3
    const items = [
      mockItem({ text: "Hello", x: 0, width: 30, fontSize: 10 }),
      mockItem({ text: "World", x: 37, width: 30, fontSize: 10 }),
    ];
    expect(reconstructTextFromPositions(items)).toBe("Hello World");
  });

  it("does NOT insert a space when gap is below threshold", () => {
    // fontSize=10, threshold = 3; item0 ends at x=30, item1 at x=31 → gap=1 < 3
    const items = [
      mockItem({ text: "Hello", x: 0, width: 30, fontSize: 10 }),
      mockItem({ text: "World", x: 31, width: 30, fontSize: 10 }),
    ];
    expect(reconstructTextFromPositions(items)).toBe("HelloWorld");
  });

  it("separates items on different Y baselines with a newline", () => {
    const items = [
      mockItem({ text: "Line1", x: 10, y: 100 }),
      mockItem({ text: "Line2", x: 10, y: 88 }),
    ];
    const result = reconstructTextFromPositions(items);
    expect(result).toBe("Line1\nLine2");
  });

  it("inserts a blank line for a large Y gap (paragraph break)", () => {
    // fontSize=10, PARAGRAPH_THRESHOLD_RATIO=1.5 → threshold = 15
    // y gap = 100 - 70 = 30 > 15
    const items = [
      mockItem({ text: "Para1", x: 10, y: 100, fontSize: 10 }),
      mockItem({ text: "Para2", x: 10, y: 70, fontSize: 10 }),
    ];
    const result = reconstructTextFromPositions(items);
    expect(result).toBe("Para1\n\nPara2");
  });

  it("inserts a blank line on page break", () => {
    const items = [
      mockItem({ text: "Page1", x: 10, y: 100, pageIndex: 0 }),
      mockItem({ text: "Page2", x: 10, y: 100, pageIndex: 1 }),
    ];
    const result = reconstructTextFromPositions(items);
    expect(result).toBe("Page1\n\nPage2");
  });

  it("sorts items on the same line left-to-right regardless of input order", () => {
    const items = [
      mockItem({ text: "World", x: 60, y: 100, width: 30 }),
      mockItem({ text: "Hello", x: 0, y: 100, width: 30, fontSize: 10 }),
    ];
    // gap between "Hello"(ends at 30) and "World"(starts at 60) = 30 > 3
    const result = reconstructTextFromPositions(items);
    expect(result).toBe("Hello World");
  });

  it("sorts lines top-to-bottom (higher Y = higher on page in PDF coords)", () => {
    const items = [
      mockItem({ text: "Bottom", x: 10, y: 50 }),
      mockItem({ text: "Top", x: 10, y: 100 }),
    ];
    const result = reconstructTextFromPositions(items);
    // y gap = 100 - 50 = 50 > fontSize(10) * 1.5(threshold) = 15 → blank line
    expect(result).toBe("Top\n\nBottom");
  });

  it("groups items within LINE_TOLERANCE (2pt) as the same line", () => {
    const items = [
      mockItem({ text: "A", x: 10, y: 100, width: 30 }),
      // y=99 rounds to 100 (Math.round(99/2)*2 → Math.round(49.5)*2 = 50*2 = 100), same bucket as y=100
      mockItem({ text: "B", x: 60, y: 99, width: 30, fontSize: 10 }),
    ];
    const result = reconstructTextFromPositions(items);
    // They are on the same line; gap = 60 - (10+30) = 20 > 3 → space inserted
    expect(result).toBe("A B");
  });

  it("does NOT insert space between adjacent CJK characters", () => {
    // Even with a gap, two adjacent CJK chars should not get a space
    const items = [
      mockItem({ text: "你好", x: 0, y: 100, width: 20, fontSize: 10 }),
      mockItem({ text: "世界", x: 30, y: 100, width: 20, fontSize: 10 }),
    ];
    // gap = 30 - 20 = 10 > 3, but both sides are CJK → no space
    const result = reconstructTextFromPositions(items);
    expect(result).toBe("你好世界");
  });

  it("DOES insert space between CJK and Latin adjacent characters", () => {
    const items = [
      mockItem({ text: "Hello", x: 0, y: 100, width: 30, fontSize: 10 }),
      mockItem({ text: "世界", x: 40, y: 100, width: 20, fontSize: 10 }),
    ];
    // gap = 40 - 30 = 10 > 3; last char is 'o' (Latin) → space
    const result = reconstructTextFromPositions(items);
    expect(result).toBe("Hello 世界");
  });

  it("falls back to estimated width when item.width is 0", () => {
    // fontSize=10, text="Hi" (2 chars), estimated width = 10 * 0.5 * 2 = 10
    // item0: x=0, estimated end = 10; item1: x=20 → gap = 10 > 3 → space
    const items = [
      mockItem({ text: "Hi", x: 0, y: 100, width: 0, fontSize: 10 }),
      mockItem({ text: "There", x: 20, y: 100, width: 30, fontSize: 10 }),
    ];
    const result = reconstructTextFromPositions(items);
    expect(result).toBe("Hi There");
  });

  it("reconstructs a multi-line resume excerpt correctly", () => {
    // Simulates the actual problem: text runs from a PDF that lacks spaces
    const items = [
      mockItem({ text: "EMMA", x: 10, y: 200, width: 30, fontSize: 12 }),
      mockItem({ text: "(TZUCHUN)", x: 55, y: 200, width: 50, fontSize: 12 }),
      mockItem({ text: "CHEN", x: 120, y: 200, width: 30, fontSize: 12 }),
      mockItem({ text: "EDUCATION", x: 10, y: 170, width: 60, fontSize: 12 }),
      mockItem({ text: "UNIVERSITY", x: 85, y: 170, width: 60, fontSize: 12 }),
    ];
    const result = reconstructTextFromPositions(items);
    expect(result).toBe("EMMA (TZUCHUN) CHEN\n\nEDUCATION UNIVERSITY");
  });
});
