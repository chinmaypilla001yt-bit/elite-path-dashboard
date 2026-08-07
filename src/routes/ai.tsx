import { createFileRoute } from "@tanstack/react-router";
import { EditableList } from "@/components/ascend/EditableList";

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: "AI & ML · Ascend" },
      { name: "description", content: "Track ML courses, papers, and models built." },
    ],
  }),
  component: () => (
    <EditableList
      storageKey="ai"
      eyebrow="Research"
      title="AI & ML"
      description="Courses, papers read, models trained."
      itemLabel="item"
      glow="purple"
      fields={[
        { name: "title", label: "Title", required: true, placeholder: "Attention Is All You Need" },
        { name: "kind", label: "Kind", type: "select", options: ["Paper", "Course", "Model", "Notebook", "Project"] },
        { name: "category", label: "Category", type: "category" },
        { name: "status", label: "Status", type: "select", options: ["Queued", "In progress", "Done"] },
        { name: "link", label: "Link", placeholder: "https://…" },
        { name: "notes", label: "Notes", type: "textarea" },
      ]}
      renderItem={(a) => (
        <>
          <div className="font-mono text-[10px] uppercase tracking-widest text-white/45">
            {(a.kind as string) || "item"}{a.status ? ` · ${a.status}` : ""}
          </div>
          <div className="mt-1 text-lg font-semibold text-white">{a.title as string}</div>
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
