export interface ResumeSection {
  type:
    | "header"
    | "summary"
    | "experience"
    | "education"
    | "skills"
    | "projects"
    | "certifications"
    | "other";
  title: string;
  content: string;
  bullets?: string[];
}

export interface WorkExperience {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  graduationDate: string;
}

export interface ParsedResume {
  rawText: string;
  sections: ResumeSection[];
  contactInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
  };
  workExperience: WorkExperience[];
  education: Education[];
  skills: string[];
  summary: string;
}
