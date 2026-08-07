export type ResumeLink = { label: string; url: string };

export type Personal = {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  portfolio: string;
  website: string;
  address: string;
  city: string;
  country: string;
};

export type Education = {
  id: string;
  university: string;
  degree: string;
  major: string;
  gpa: string;
  cgpa: string;
  startDate: string;
  endDate: string;
  coursework: string;
  activities: string;
  location?: string;
};

export type Experience = {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  bullets: string[];
};

export type Project = {
  id: string;
  name: string;
  github: string;
  demo: string;
  description: string;
  technologies: string;
  bullets: string[];
  startDate: string;
  endDate: string;
};

export type SkillGroup = { id: string; category: string; skills: string };
export type SimpleEntry = { id: string; title: string; detail: string; date: string };

export type OptionalSectionKey =
  | "certifications"
  | "research"
  | "publications"
  | "leadership"
  | "volunteering"
  | "languages"
  | "interests"
  | "achievements";

export const OPTIONAL_SECTIONS: { key: OptionalSectionKey; label: string }[] = [
  { key: "certifications", label: "Certifications" },
  { key: "research", label: "Research" },
  { key: "publications", label: "Publications" },
  { key: "leadership", label: "Leadership" },
  { key: "volunteering", label: "Volunteering" },
  { key: "languages", label: "Languages" },
  { key: "interests", label: "Interests" },
  { key: "achievements", label: "Achievements" },
];

export type ResumeData = {
  personal: Personal;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: SkillGroup[];
  awards: SimpleEntry[];
  optional: Record<OptionalSectionKey, { enabled: boolean; items: SimpleEntry[] }>;
  template: string;
};

export type ResumeDoc = {
  id: string;
  title: string;
  data: ResumeData;
  createdAt: number;
  updatedAt: number;
};

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function emptyOptional(): ResumeData["optional"] {
  return OPTIONAL_SECTIONS.reduce(
    (acc, s) => ({ ...acc, [s.key]: { enabled: false, items: [] } }),
    {} as ResumeData["optional"],
  );
}

export function emptyResume(name = "", email = ""): ResumeData {
  return {
    personal: {
      fullName: name,
      email,
      phone: "",
      linkedin: "",
      github: "",
      portfolio: "",
      website: "",
      address: "",
      city: "",
      country: "",
    },
    education: [],
    experience: [],
    projects: [],
    skills: [],
    awards: [],
    optional: emptyOptional(),
    template: "classic",
  };
}

/** Normalizes anything read from Firestore into a complete ResumeData. */
export function normalizeResume(input: Partial<ResumeData> | undefined): ResumeData {
  const base = emptyResume();
  const opt = { ...base.optional, ...(input?.optional ?? {}) } as ResumeData["optional"];
  for (const s of OPTIONAL_SECTIONS) {
    opt[s.key] = { enabled: !!opt[s.key]?.enabled, items: opt[s.key]?.items ?? [] };
  }
  return {
    personal: { ...base.personal, ...(input?.personal ?? {}) },
    education: input?.education ?? [],
    experience: (input?.experience ?? []).map((e) => ({ ...e, bullets: e.bullets ?? [] })),
    projects: (input?.projects ?? []).map((p) => ({ ...p, bullets: p.bullets ?? [] })),
    skills: input?.skills ?? [],
    awards: input?.awards ?? [],
    optional: opt,
    template: input?.template ?? "classic",
  };
}

export function dateRange(a?: string, b?: string) {
  const parts = [a, b].filter(Boolean);
  return parts.join(" – ");
}

export function splitLines(s?: string) {
  return (s ?? "")
    .split("\n")
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

export function contactLine(p: Personal) {
  return [p.phone, p.email, p.linkedin, p.github, p.portfolio || p.website, [p.city, p.country].filter(Boolean).join(", ")]
    .filter(Boolean)
    .join("  |  ");
}
