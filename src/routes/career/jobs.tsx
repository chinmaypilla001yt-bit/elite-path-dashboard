import { createFileRoute } from "@tanstack/react-router";
import { EditableList } from "@/components/ascend/EditableList";

export const Route = createFileRoute("/career/jobs")({
  head: () => ({
    meta: [
      { title: "Job Applications · Career Hub · Ascend" },
      { name: "description", content: "Track every application, stage, and outcome." },
      { property: "og:title", content: "Job Applications · Ascend" },
      { property: "og:description", content: "Track every application, stage, and outcome." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <EditableList
      embed
      storageKey="job-applications"
      eyebrow="Career"
      title="Job Applications"
      description="Track every application, stage, and outcome."
      itemLabel="application"
      glow="purple"
      fields={[
        { name: "title", label: "Role", required: true, placeholder: "SWE Intern" },
        { name: "org", label: "Company", required: true, placeholder: "Google" },
        { name: "status", label: "Status", type: "select", options: ["Wishlist", "Applied", "OA", "Interview", "Offer", "Rejected"] },
        { name: "period", label: "Applied on", type: "date" },
        { name: "url", label: "Posting URL" },
        { name: "description", label: "Notes", type: "textarea" },
      ]}
      renderItem={(r) => (
        <>
          <div className="font-mono text-[10px] uppercase tracking-widest text-white/45">
            {(r.status as string) || "application"}
          </div>
          <div className="mt-1 text-lg font-semibold text-white">{r.title as string}</div>
          {r.org ? <div className="text-sm text-white/70">{r.org as string}</div> : null}
          {r.url ? (
            <a href={r.url as string} target="_blank" rel="noreferrer" className="mt-1 block truncate text-xs text-[oklch(0.82_0.14_200)] underline">
              {r.url as string}
            </a>
          ) : null}
          {r.description ? <p className="mt-2 whitespace-pre-wrap text-sm text-white/60">{r.description as string}</p> : null}
        </>
      )}
    />
  ),
});
