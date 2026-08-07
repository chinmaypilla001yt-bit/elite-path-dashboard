import { createFileRoute } from "@tanstack/react-router";
import { EditableList } from "@/components/ascend/EditableList";

export const Route = createFileRoute("/career/achievements")({
  head: () => ({
    meta: [
      { title: "Achievements · Career Hub · Ascend" },
      { name: "description", content: "Awards, wins, and milestones ready to drop into a resume." },
      { property: "og:title", content: "Achievements · Ascend" },
      { property: "og:description", content: "Awards, wins, and milestones from your Ascend journey." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <EditableList
      embed
      storageKey="achievements"
      eyebrow="Career"
      title="Achievements"
      description="Awards, wins, and milestones ready to drop into a resume."
      itemLabel="achievement"
      glow="gold"
      fields={[
        { name: "title", label: "Achievement", required: true, placeholder: "ICPC Regionalist" },
        { name: "date", label: "Date", type: "date" },
        { name: "category", label: "Category", type: "category" },
        { name: "description", label: "Details", type: "textarea" },
      ]}
      renderItem={(a) => (
        <>
          <div className="font-mono text-[10px] uppercase tracking-widest text-white/45">
            {(a.category as string) || "achievement"}{a.date ? ` · ${a.date}` : ""}
          </div>
          <div className="mt-1 text-lg font-semibold text-white">{a.title as string}</div>
          {a.description ? <p className="mt-2 whitespace-pre-wrap text-sm text-white/60">{a.description as string}</p> : null}
        </>
      )}
    />
  ),
});
