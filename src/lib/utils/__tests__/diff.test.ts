import { describe, it, expect } from "vitest";
import { computeDiff } from "../diff";

describe("computeDiff", () => {
  it("identical text → all lines unchanged", () => {
    const text = "line1\nline2\nline3";
    const result = computeDiff(text, text);
    expect(result.every(l => l.type === "unchanged")).toBe(true);
    expect(result).toHaveLength(3);
  });

  it("added lines are marked as type=added", () => {
    const result = computeDiff("a\nb", "a\nb\nc");
    const added = result.filter(l => l.type === "added");
    expect(added).toHaveLength(1);
    expect(added[0].content).toBe("c");
  });

  it("removed lines are marked as type=removed", () => {
    const result = computeDiff("a\nb\nc", "a\nc");
    const removed = result.filter(l => l.type === "removed");
    expect(removed).toHaveLength(1);
    expect(removed[0].content).toBe("b");
  });

  it("mixed add+remove scenario", () => {
    const result = computeDiff("a\nb\nc", "a\nX\nc");
    const removed = result.filter(l => l.type === "removed");
    const added = result.filter(l => l.type === "added");
    expect(removed.length).toBeGreaterThanOrEqual(1);
    expect(added.length).toBeGreaterThanOrEqual(1);
  });

  it("empty original → all added", () => {
    const result = computeDiff("", "new line");
    const added = result.filter(l => l.type === "added");
    expect(added.length).toBeGreaterThanOrEqual(1);
  });

  it("empty optimized → all removed", () => {
    const result = computeDiff("old line", "");
    const removed = result.filter(l => l.type === "removed");
    expect(removed.length).toBeGreaterThanOrEqual(1);
  });
});
