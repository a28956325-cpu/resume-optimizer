export type ChangeType =
  | "verb_replacement"
  | "keyword_integration"
  | "phrase_adjustment"
  | "reordering";

export interface OptimizationChange {
  original: string;
  optimized: string;
  reason: string;
  type: ChangeType;
  section?: string;
}

export interface OptimizationResult {
  id?: string;
  originalResume: string;
  optimizedResume: string;
  changes: OptimizationChange[];
  keywordsMatched: string[];
  keywordsMissing: string[];
  matchScoreBefore: number;
  matchScoreAfter: number;
  jobTitle?: string;
  company?: string;
  summary: string;
}

export interface OptimizationRequest {
  resumeText: string;
  jobDescription: string;
  jobTitle?: string;
  company?: string;
}

export interface DiffLine {
  type: "added" | "removed" | "unchanged";
  content: string;
  lineNumber?: number;
}
