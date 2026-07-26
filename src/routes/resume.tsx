import { createFileRoute } from "@tanstack/react-router";
import { EditableList } from "@/components/ascend/EditableList";

export const Route = createFileRoute("/resume")({
  head: () => ({
    meta: [
      { title: "Resume · Ascend" },
      { name: "description", content: "Skills, experience, achievements — one entry at a time." },
    ],
  }),
  component: () => (
    <EditableList
      storageKey="resume"
      eyebrow="Profile"
      title="Resume"
      description="Add each bullet: skill, experience, education, or award."
      itemLabel="entry"
      glow="gold"
      fields={[
        { name: "kind", label: "Kind", type: "select", required: true, options: ["Experience", "Education", "Skill", "Award", "Certification"] },
        { name: "title", label: "Title", required: true, placeholder: "Software Engineer Intern" },
        { name: "org", label: "Organization", placeholder: "Google" },
        { name: "period", label: "Period", placeholder: "May 2027 – Aug 2027" },
        { name: "description", label: "Description", type: "textarea" },
      ]}
      renderItem={(r) => (
        <>
          <div className="font-mono text-[10px] uppercase tracking-widest text-white/45">
            {(r.kind as string) || "entry"}{r.period ? ` · ${r.period}` : ""}
          </div>
          <div className="mt-1 text-lg font-semibold text-white">{r.title as string}</div>
          {r.org ? <div className="text-sm text-white/70">{r.org as string}</div> : null}
          {r.description ? <p className="mt-2 whitespace-pre-wrap text-sm text-white/60">{r.description as string}</p> : null}
        </>
      )}
    />
  ),
});
