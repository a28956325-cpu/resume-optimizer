export const JD_ANALYSIS_PROMPT = `You are an expert HR analyst and ATS specialist. Analyze the following job description and extract structured information.

Job Description:
{jobDescription}

Extract and return a JSON object with this exact structure:
{{
  "jobTitle": "string - the job title",
  "company": "string - company name if mentioned, else empty string",
  "keywords": {{
    "technical": ["array of technical skills, tools, technologies"],
    "soft": ["array of soft skills"],
    "industry": ["array of industry-specific terms"],
    "verbs": ["array of action verbs used"],
    "requirements": ["array of key requirements"]
  }},
  "requiredSkills": ["must-have skills"],
  "preferredSkills": ["nice-to-have skills"],
  "responsibilities": ["key responsibilities, max 10"],
  "summary": "2-3 sentence summary of the role"
}}

Return ONLY the JSON object, no markdown, no explanation.`;
