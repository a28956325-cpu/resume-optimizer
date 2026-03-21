export interface ExtractedKeywords {
  technical: string[];
  soft: string[];
  industry: string[];
  verbs: string[];
  requirements: string[];
}

export interface JDAnalysis {
  jobTitle: string;
  company: string;
  keywords: ExtractedKeywords;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  summary: string;
}

export interface JDInput {
  type: "text" | "url";
  content: string;
}
