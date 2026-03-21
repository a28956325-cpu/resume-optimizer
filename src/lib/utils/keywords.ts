export function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "shall", "can", "need", "dare", "ought",
    "used", "we", "you", "they", "he", "she", "it", "i", "our", "your",
    "their", "this", "that", "these", "those", "not", "no", "nor", "so",
    "yet", "both", "either", "neither", "each", "every", "all", "any",
    "few", "more", "most", "other", "some", "such", "than", "too", "very",
    "just", "about", "above", "after", "also", "as", "before", "between",
    "during", "into", "through", "under", "while",
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s\-+#.]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  const frequency: Record<string, number> = {};
  for (const word of words) {
    frequency[word] = (frequency[word] ?? 0) + 1;
  }

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([word]) => word);
}

export function calculateMatchScore(
  resumeText: string,
  keywords: string[]
): number {
  if (keywords.length === 0) return 0;
  const lowerResume = resumeText.toLowerCase();
  const matched = keywords.filter((kw) =>
    lowerResume.includes(kw.toLowerCase())
  );
  return Math.round((matched.length / keywords.length) * 100);
}

export function findMatchedKeywords(
  resumeText: string,
  keywords: string[]
): string[] {
  const lowerResume = resumeText.toLowerCase();
  return keywords.filter((kw) => lowerResume.includes(kw.toLowerCase()));
}

export function findMissingKeywords(
  resumeText: string,
  keywords: string[]
): string[] {
  const lowerResume = resumeText.toLowerCase();
  return keywords.filter((kw) => !lowerResume.includes(kw.toLowerCase()));
}
