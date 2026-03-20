import type { DiffLine } from "@/types/optimization";

export function computeDiff(original: string, optimized: string): DiffLine[] {
  const originalLines = original.split("\n");
  const optimizedLines = optimized.split("\n");

  const result: DiffLine[] = [];

  const lcs = computeLCS(originalLines, optimizedLines);
  let i = 0;
  let j = 0;
  let k = 0;

  while (i < originalLines.length || j < optimizedLines.length) {
    if (
      k < lcs.length &&
      i < originalLines.length &&
      j < optimizedLines.length &&
      originalLines[i] === lcs[k] &&
      optimizedLines[j] === lcs[k]
    ) {
      result.push({ type: "unchanged", content: originalLines[i] });
      i++;
      j++;
      k++;
    } else if (
      j < optimizedLines.length &&
      (k >= lcs.length || optimizedLines[j] !== lcs[k])
    ) {
      result.push({ type: "added", content: optimizedLines[j] });
      j++;
    } else if (
      i < originalLines.length &&
      (k >= lcs.length || originalLines[i] !== lcs[k])
    ) {
      result.push({ type: "removed", content: originalLines[i] });
      i++;
    } else {
      break;
    }
  }

  return result;
}

function computeLCS(a: string[], b: string[]): string[] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const lcs: string[] = [];
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      lcs.unshift(a[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return lcs;
}
