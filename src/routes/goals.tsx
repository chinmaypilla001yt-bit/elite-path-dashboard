import { createFileRoute } from "@tanstack/react-router";
import { EditableList } from "@/components/ascend/EditableList";
import { ProgressBar } from "@/components/ascend/ProgressBar";

export const Route = createFileRoute("/goals")({
  head: () => ({
    meta: [
      { title: "Goals · Ascend" },
      { name: "description", content: "Long-term ambitions and progress." },
    ],
  }),
  component: () => (
    <EditableList
      storageKey="goals"
      eyebrow="Ambition"
      title="Goals"
      description="Big targets. Track the % you're through."
      itemLabel="goal"
      glow="emerald"
      fields={[
        { name: "title", label: "Title", required: true, placeholder: "e.g. Land Google STEP internship" },
        { name: "category", label: "Category", placeholder: "career, learning, health…" },
        { name: "target_date", label: "Target date", type: "date" },
        { name: "progress", label: "Progress %", type: "number", placeholder: "0-100" },
        { name: "description", label: "Notes", type: "textarea" },
      ]}
      renderItem={(g) => (
        <>
          <div className="font-mono text-[10px] uppercase tracking-widest text-white/45">
            {(g.category as string) || "goal"}{g.target_date ? ` · by ${g.target_date}` : ""}
          </div>
          <div className="mt-1 text-lg font-semibold text-white">{g.title as string}</div>
          {g.description ? <p className="mt-2 text-sm text-white/60">{g.description as string}</p> : null}
          <div className="mt-4">
            <ProgressBar label="Progress" value={Number(g.progress) || 0} right={`${Number(g.progress) || 0}%`} accent="emerald" />
          </div>
        </>
      )}
    />
  ),
});
