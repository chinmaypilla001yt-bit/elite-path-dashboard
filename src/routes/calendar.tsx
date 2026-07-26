import { createFileRoute } from "@tanstack/react-router";
import { EditableList } from "@/components/ascend/EditableList";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar · Ascend" },
      { name: "description", content: "Upcoming events, deadlines, and contests." },
    ],
  }),
  component: () => (
    <EditableList
      storageKey="calendar"
      eyebrow="Schedule"
      title="Calendar"
      description="Contests, deadlines, and appointments."
      itemLabel="event"
      glow="cyan"
      fields={[
        { name: "title", label: "Title", required: true, placeholder: "Google STEP application closes" },
        { name: "date", label: "Date", type: "date", required: true },
        { name: "time", label: "Time", placeholder: "18:30" },
        { name: "kind", label: "Kind", type: "select", options: ["Contest", "Deadline", "Interview", "Meeting", "Other"] },
        { name: "notes", label: "Notes", type: "textarea" },
      ]}
      renderItem={(e) => (
        <>
          <div className="font-mono text-[10px] uppercase tracking-widest text-white/45">
            {(e.date as string) || ""}{e.time ? ` · ${e.time}` : ""}{e.kind ? ` · ${e.kind}` : ""}
          </div>
          <div className="mt-1 text-lg font-semibold text-white">{e.title as string}</div>
          {e.notes ? <p className="mt-2 text-sm text-white/60">{e.notes as string}</p> : null}
        </>
      )}
    />
  ),
});
