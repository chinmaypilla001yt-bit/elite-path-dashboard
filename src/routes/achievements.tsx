import { createFileRoute } from "@tanstack/react-router";
import { EditableList } from "@/components/ascend/EditableList";

export const Route = createFileRoute("/achievements")({
  head: () => ({
    meta: [
      { title: "Achievements · Ascend" },
      { name: "description", content: "Trophies, wins, milestones." },
    ],
  }),
  component: () => (
    <EditableList
      storageKey="achievements"
      eyebrow="Trophy case"
      title="Achievements"
      description="Every win, big or small."
      itemLabel="achievement"
      glow="gold"
      fields={[
        { name: "title", label: "Title", required: true, placeholder: "Solved 500 LeetCode problems" },
        { name: "date", label: "Date", type: "date" },
        { name: "icon", label: "Emoji", placeholder: "🏆" },
        { name: "description", label: "Description", type: "textarea" },
      ]}
      renderItem={(a) => (
        <>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{(a.icon as string) || "🏆"}</span>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-white/45">{(a.date as string) || "achievement"}</div>
              <div className="text-lg font-semibold text-white">{a.title as string}</div>
            </div>
          </div>
          {a.description ? <p className="mt-3 text-sm text-white/60">{a.description as string}</p> : null}
        </>
      )}
    />
  ),
});
