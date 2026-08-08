import { createFileRoute } from "@tanstack/react-router";
import { EditableList } from "@/components/ascend/EditableList";

export const Route = createFileRoute("/internships")({
  head: () => ({
    meta: [
      { title: "Internships · Ascend" },
      { name: "description", content: "Application pipeline: applied, OA, interview, offer." },
    ],
  }),
  component: () => (
    <EditableList
      storageKey="internships"
      eyebrow="Pipeline"
      title="Internships"
      description="Track every application."
      itemLabel="application"
      glow="cyan"
      fields={[
        { name: "company", label: "Company", required: true, placeholder: "Google" },
        { name: "role", label: "Role", placeholder: "STEP Intern" },
        { name: "category", label: "Category", type: "category" },
        { name: "status", label: "Status", type: "select", required: true, options: ["Interested", "Applied", "OA", "Interview", "Offer", "Rejected"] },
        { name: "applied_at", label: "Applied on", type: "date" },
        { name: "link", label: "Job link", placeholder: "https://…" },
        { name: "notes", label: "Notes", type: "textarea" },
      ]}
      renderItem={(a) => (
        <>
          <div className="font-mono text-[10px] uppercase tracking-widest text-white/45">
            {(a.status as string) || "status"}{a.applied_at ? ` · ${a.applied_at}` : ""}
          </div>
          <div className="mt-1 text-lg font-semibold text-white">{a.company as string}</div>
          {a.role ? <div className="text-sm text-white/70">{a.role as string}</div> : null}
          {a.link ? (
            <a href={a.link as string} target="_blank" rel="noreferrer" className="mt-1 block text-xs text-[oklch(0.85_0.13_200)] hover:underline">
              {a.link as string}
            </a>
          ) : null}
          {a.notes ? <p className="mt-2 text-sm text-white/60">{a.notes as string}</p> : null}
        </>
      )}
    />
  ),
});
