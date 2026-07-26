import { createFileRoute } from "@tanstack/react-router";
import { EditableList } from "@/components/ascend/EditableList";

export const Route = createFileRoute("/habits")({
  head: () => ({
    meta: [
      { title: "Habits · Ascend" },
      { name: "description", content: "Daily habits and streaks." },
    ],
  }),
  component: () => (
    <EditableList
      storageKey="habits"
      eyebrow="Consistency"
      title="Habits"
      description="Small compounding rituals."
      itemLabel="habit"
      glow="gold"
      fields={[
        { name: "name", label: "Name", required: true, placeholder: "e.g. 30m LeetCode" },
        { name: "icon", label: "Emoji", placeholder: "🔥" },
        { name: "target_per_week", label: "Target / week", type: "number", placeholder: "7" },
        { name: "notes", label: "Notes", type: "textarea" },
      ]}
      renderItem={(h) => (
        <>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{(h.icon as string) || "✨"}</span>
            <div>
              <div className="text-lg font-semibold text-white">{h.name as string}</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-white/45">
                Target: {Number(h.target_per_week) || 7}× / week
              </div>
            </div>
          </div>
          {h.notes ? <p className="mt-3 text-sm text-white/60">{h.notes as string}</p> : null}
        </>
      )}
    />
  ),
});
