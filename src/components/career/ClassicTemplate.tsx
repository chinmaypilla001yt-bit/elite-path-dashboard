import { contactLine, dateRange, splitLines, type ResumeData } from "@/lib/resume";
import { OPTIONAL_SECTIONS } from "@/lib/resume";

/** Classic ATS one-page template. Data-in / markup-out — add more templates alongside it. */
export function ClassicTemplate({ data }: { data: ResumeData }) {
  const p = data.personal;
  return (
    <div
      id="resume-paper"
      className="resume-paper mx-auto w-full bg-white text-[#111] shadow-2xl"
      style={{
        maxWidth: "8.5in",
        minHeight: "11in",
        padding: "0.5in 0.55in",
        fontFamily: '"Times New Roman", Times, Georgia, serif',
        fontSize: "10.5pt",
        lineHeight: 1.28,
      }}
    >
      <header className="text-center">
        <h1 style={{ fontSize: "22pt", letterSpacing: "0.02em" }} className="font-normal uppercase tracking-wide">
          {p.fullName || "Your Name"}
        </h1>
        <div style={{ fontSize: "9.5pt" }} className="mt-1 text-[#222]">
          {contactLine(p) || "phone | email | linkedin | github"}
        </div>
        {p.address ? (
          <div style={{ fontSize: "9.5pt" }} className="text-[#333]">{p.address}</div>
        ) : null}
      </header>

      <Section title="Education" show={data.education.length > 0}>
        {data.education.map((e) => (
          <div key={e.id} className="mb-2">
            <Row left={e.university || "University"} right={e.location ?? ""} bold />
            <Row
              left={[e.degree, e.major].filter(Boolean).join(", ")}
              right={dateRange(e.startDate, e.endDate)}
              italic
            />
            {(e.gpa || e.cgpa) && (
              <div style={{ fontSize: "10pt" }}>
                {e.gpa ? `GPA: ${e.gpa}` : ""}{e.gpa && e.cgpa ? " · " : ""}{e.cgpa ? `CGPA: ${e.cgpa}` : ""}
              </div>
            )}
            {e.coursework ? <Detail label="Coursework" value={e.coursework} /> : null}
            {e.activities ? <Detail label="Activities" value={e.activities} /> : null}
          </div>
        ))}
      </Section>

      <Section title="Experience" show={data.experience.length > 0}>
        {data.experience.map((x) => (
          <div key={x.id} className="mb-2">
            <Row left={x.role || "Role"} right={dateRange(x.startDate, x.endDate)} bold />
            <Row left={x.company} right={x.location} italic />
            {x.description ? <p style={{ fontSize: "10pt" }}>{x.description}</p> : null}
            <Bullets items={x.bullets} />
          </div>
        ))}
      </Section>

      <Section title="Projects" show={data.projects.length > 0}>
        {data.projects.map((pr) => (
          <div key={pr.id} className="mb-2">
            <Row
              left={`${pr.name || "Project"}${pr.technologies ? ` | ${pr.technologies}` : ""}`}
              right={dateRange(pr.startDate, pr.endDate)}
              bold
            />
            {(pr.github || pr.demo) && (
              <div style={{ fontSize: "9.5pt" }} className="italic text-[#333]">
                {[pr.github, pr.demo].filter(Boolean).join("  |  ")}
              </div>
            )}
            {pr.description ? <p style={{ fontSize: "10pt" }}>{pr.description}</p> : null}
            <Bullets items={pr.bullets} />
          </div>
        ))}
      </Section>

      <Section title="Technical Skills" show={data.skills.length > 0}>
        {data.skills.map((s) => (
          <div key={s.id} style={{ fontSize: "10pt" }}>
            <span className="font-bold">{s.category}: </span>
            <span>{s.skills}</span>
          </div>
        ))}
      </Section>

      <Section title="Awards" show={data.awards.length > 0}>
        {data.awards.map((a) => (
          <div key={a.id}>
            <Row left={a.title} right={a.date} bold />
            {a.detail ? <p style={{ fontSize: "10pt" }}>{a.detail}</p> : null}
          </div>
        ))}
      </Section>

      {OPTIONAL_SECTIONS.map((s) => {
        const sec = data.optional[s.key];
        if (!sec?.enabled || sec.items.length === 0) return null;
        return (
          <Section key={s.key} title={s.label} show>
            {sec.items.map((it) => (
              <div key={it.id}>
                <Row left={it.title} right={it.date} bold />
                {it.detail ? <p style={{ fontSize: "10pt" }}>{it.detail}</p> : null}
              </div>
            ))}
          </Section>
        );
      })}
    </div>
  );
}

function Section({ title, show, children }: { title: string; show: boolean; children: React.ReactNode }) {
  if (!show) return null;
  return (
    <section className="mt-3">
      <h2
        style={{ fontSize: "11.5pt", letterSpacing: "0.06em", borderBottom: "1px solid #111" }}
        className="mb-1 pb-[2px] font-bold uppercase"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ left, right, bold, italic }: { left?: string; right?: string; bold?: boolean; italic?: boolean }) {
  if (!left && !right) return null;
  return (
    <div className="flex items-baseline justify-between gap-3" style={{ fontSize: "10.5pt" }}>
      <span className={`${bold ? "font-bold" : ""} ${italic ? "italic" : ""}`}>{left}</span>
      <span className={`shrink-0 ${italic ? "italic" : ""}`} style={{ fontSize: "10pt" }}>{right}</span>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ fontSize: "10pt" }}>
      <span className="italic">{label}: </span>
      {value}
    </div>
  );
}

function Bullets({ items }: { items?: string[] }) {
  const lines = (items ?? []).flatMap((b) => splitLines(b));
  if (lines.length === 0) return null;
  return (
    <ul className="ml-4 list-disc" style={{ fontSize: "10pt" }}>
      {lines.map((l, i) => (
        <li key={i} className="mb-[1px]">{l}</li>
      ))}
    </ul>
  );
}

export const TEMPLATES: Record<string, (p: { data: ResumeData }) => React.ReactElement> = {
  classic: ClassicTemplate,
};
