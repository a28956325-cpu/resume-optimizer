import { describe, it, expect } from "vitest";
import { extractKeywords, calculateMatchScore, findMatchedKeywords, findMissingKeywords } from "../keywords";

describe("extractKeywords", () => {
  it("extracts frequent words, ignoring stop words", () => {
    const kw = extractKeywords("React React React is the best framework");
    expect(kw[0]).toBe("react");
    expect(kw).not.toContain("is");
    expect(kw).not.toContain("the");
  });

  it("filters words shorter than 3 chars", () => {
    const kw = extractKeywords("Go is ok but AI is better");
    expect(kw).not.toContain("go");
    expect(kw).not.toContain("is");
    expect(kw).not.toContain("ok");
  });

  it("returns max 50 keywords", () => {
    const longText = Array.from({ length: 200 }, (_, i) => `keyword${i}`).join(" ");
    const kw = extractKeywords(longText);
    expect(kw.length).toBeLessThanOrEqual(50);
  });

  it("empty input → empty array", () => {
    expect(extractKeywords("")).toEqual([]);
  });
});

describe("calculateMatchScore", () => {
  it("all keywords matched → 100", () => {
    expect(calculateMatchScore("react typescript node", ["react", "typescript", "node"])).toBe(100);
  });

  it("no keywords matched → 0", () => {
    expect(calculateMatchScore("python django", ["react", "typescript"])).toBe(0);
  });

  it("empty keywords → 0", () => {
    expect(calculateMatchScore("anything", [])).toBe(0);
  });

  it("partial match → correct percentage", () => {
    const score = calculateMatchScore("react is great", ["react", "typescript"]);
    expect(score).toBe(50);
  });
});

describe("findMatchedKeywords", () => {
  it("returns only matched keywords", () => {
    const matched = findMatchedKeywords("I know react and node", ["react", "node", "python"]);
    expect(matched).toEqual(["react", "node"]);
  });

  it("case insensitive matching", () => {
    const matched = findMatchedKeywords("REACT TypeScript", ["react", "typescript"]);
    expect(matched).toEqual(["react", "typescript"]);
  });
});

describe("findMissingKeywords", () => {
  it("returns only missing keywords", () => {
    const missing = findMissingKeywords("I know react", ["react", "node", "python"]);
    expect(missing).toEqual(["node", "python"]);
  });
});
