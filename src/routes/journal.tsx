import { createFileRoute } from "@tanstack/react-router";
import { EditableList } from "@/components/ascend/EditableList";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "Journal · Ascend" },
      { name: "description", content: "Daily reflections, mood, and energy." },
    ],
  }),
  component: () => (
    <EditableList
      storageKey="journal"
      eyebrow="Reflection"
      title="Journal"
      description="Write daily. Even one sentence."
      itemLabel="entry"
      glow="cyan"
      fields={[
        { name: "title", label: "Title", placeholder: "One line summary" },
        { name: "entry_date", label: "Date", type: "date" },
        { name: "category", label: "Category", type: "category" },
        { name: "mood", label: "Mood", type: "select", options: ["🚀 Great", "😊 Good", "😐 Okay", "😔 Low", "😤 Frustrated"] },
        { name: "energy", label: "Energy /10", type: "number" },
        { name: "content", label: "Entry", type: "textarea", required: true, placeholder: "What happened today?" },
      ]}
      renderItem={(j) => (
        <>
          <div className="font-mono text-[10px] uppercase tracking-widest text-white/45">
            {(j.entry_date as string) || "today"}{j.mood ? ` · ${j.mood}` : ""}{j.energy ? ` · energy ${j.energy}/10` : ""}
          </div>
          {j.title ? <div className="mt-1 text-lg font-semibold text-white">{j.title as string}</div> : null}
          <p className="mt-2 whitespace-pre-wrap text-sm text-white/70">{j.content as string}</p>
        </>
      )}
    />
  ),
});
