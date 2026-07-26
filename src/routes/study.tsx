import { createFileRoute } from "@tanstack/react-router";
import { EditableList } from "@/components/ascend/EditableList";

export const Route = createFileRoute("/study")({
  head: () => ({
    meta: [
      { title: "Study Tracker · Ascend" },
      { name: "description", content: "Log deep-work sessions by subject." },
    ],
  }),
  component: () => (
    <EditableList
      storageKey="study"
      eyebrow="Deep work"
      title="Study Tracker"
      description="Log every session. Hours compound."
      itemLabel="session"
      glow="blue"
      fields={[
        { name: "subject", label: "Subject", required: true, placeholder: "e.g. Linear Algebra" },
        { name: "topic", label: "Topic", placeholder: "Ch. 7 eigenvalues" },
        { name: "minutes", label: "Minutes", type: "number", required: true, placeholder: "60" },
        { name: "date", label: "Date", type: "date" },
        { name: "notes", label: "Notes", type: "textarea" },
      ]}
      renderItem={(s) => (
        <>
          <div className="font-mono text-[10px] uppercase tracking-widest text-white/45">
            {(s.date as string) || "today"} · {Number(s.minutes) || 0} min
          </div>
          <div className="mt-1 text-lg font-semibold text-white">{s.subject as string}</div>
          {s.topic ? <div className="text-sm text-white/70">{s.topic as string}</div> : null}
          {s.notes ? <p className="mt-2 text-sm text-white/60">{s.notes as string}</p> : null}
        </>
      )}
    />
  ),
});
