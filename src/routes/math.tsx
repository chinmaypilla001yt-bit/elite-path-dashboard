import { createFileRoute } from "@tanstack/react-router";
import { EditableList } from "@/components/ascend/EditableList";

export const Route = createFileRoute("/math")({
  head: () => ({
    meta: [
      { title: "Mathematics · Ascend" },
      { name: "description", content: "Track math topics, chapters, and problems solved." },
    ],
  }),
  component: () => (
    <EditableList
      storageKey="math"
      eyebrow="Foundations"
      title="Mathematics"
      description="Areas, chapters, and problem counts."
      itemLabel="topic"
      glow="blue"
      fields={[
        { name: "topic", label: "Topic", required: true, placeholder: "Linear Algebra" },
        { name: "area", label: "Area", placeholder: "algebra, probability, calculus…" },
        { name: "problems_solved", label: "Problems solved", type: "number" },
        { name: "progress", label: "Progress %", type: "number" },
        { name: "notes", label: "Notes", type: "textarea" },
      ]}
      renderItem={(m) => (
        <>
          <div className="font-mono text-[10px] uppercase tracking-widest text-white/45">{(m.area as string) || "topic"}</div>
          <div className="mt-1 text-lg font-semibold text-white">{m.topic as string}</div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {m.problems_solved ? <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-white/80">{m.problems_solved as number} problems</span> : null}
            {m.progress ? <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-white/80">{m.progress as number}%</span> : null}
          </div>
          {m.notes ? <p className="mt-2 text-sm text-white/60">{m.notes as string}</p> : null}
        </>
      )}
    />
  ),
});
