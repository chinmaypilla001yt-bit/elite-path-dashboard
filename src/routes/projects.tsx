import { createFileRoute } from "@tanstack/react-router";
import { EditableList } from "@/components/ascend/EditableList";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects · Ascend" },
      { name: "description", content: "Portfolio of everything you've built." },
    ],
  }),
  component: () => (
    <EditableList
      storageKey="projects"
      eyebrow="Craft"
      title="Projects"
      description="Ship things. Show the world."
      itemLabel="project"
      glow="emerald"
      fields={[
        { name: "name", label: "Name", required: true, placeholder: "Ascend Dashboard" },
        { name: "stack", label: "Stack", placeholder: "React, TypeScript, …" },
        { name: "status", label: "Status", type: "select", options: ["Idea", "Building", "Shipped", "Archived"] },
        { name: "category", label: "Category", type: "category" },
        { name: "repo", label: "Repo / URL", placeholder: "https://github.com/…" },
        { name: "description", label: "Description", type: "textarea" },
      ]}
      renderItem={(p) => (
        <>
          <div className="font-mono text-[10px] uppercase tracking-widest text-white/45">
            {(p.status as string) || "project"}{p.stack ? ` · ${p.stack}` : ""}
          </div>
          <div className="mt-1 text-lg font-semibold text-white">{p.name as string}</div>
          {p.repo ? (
            <a href={p.repo as string} target="_blank" rel="noreferrer" className="mt-1 block text-xs text-[oklch(0.85_0.13_200)] hover:underline">
              {p.repo as string}
            </a>
          ) : null}
          {p.description ? <p className="mt-2 text-sm text-white/60">{p.description as string}</p> : null}
        </>
      )}
    />
  ),
});
