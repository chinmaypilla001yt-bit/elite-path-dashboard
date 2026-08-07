import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Trash2, Pencil, Check, X, FileText, Plus } from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "@/components/ascend/GlassCard";
import { useResumes } from "@/hooks/use-resumes";

export const Route = createFileRoute("/career/saved")({
  head: () => ({
    meta: [
      { title: "Saved Resumes · Ascend" },
      { name: "description", content: "Manage every resume variant — rename, duplicate, or delete." },
      { property: "og:title", content: "Saved Resumes · Ascend" },
      { property: "og:description", content: "Unlimited resume variants for every company." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SavedResumes,
});

function SavedResumes() {
  const { resumes, create, rename, duplicate, remove } = useResumes();
  const [editing, setEditing] = useState<string | null>(null);
  const [title, setTitle] = useState("");

  if (resumes.length === 0) {
    return (
      <GlassCard glow="gold" className="flex flex-col items-center p-16 text-center">
        <FileText className="h-8 w-8 text-white/40" />
        <div className="mt-3 text-lg font-semibold text-white">No saved resumes</div>
        <p className="mt-2 text-sm text-white/60">Create one and it will appear here.</p>
        <button
          onClick={() => void create("General Resume").then(() => toast.success("Resume created"))}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[image:var(--gradient-cyber)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow)] hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> New resume
        </button>
      </GlassCard>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {resumes.map((r) => (
        <GlassCard key={r.id} glow="gold" className="p-5">
          {editing === r.id ? (
            <div className="flex items-center gap-2">
              <input
                value={title}
                autoFocus
                onChange={(e) => setTitle(e.target.value)}
                className="min-w-0 flex-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-sm text-white focus:outline-none"
              />
              <button onClick={() => void rename(r.id, title).then(() => setEditing(null))} className="p-1 text-white/70 hover:text-white">
                <Check className="h-4 w-4" />
              </button>
              <button onClick={() => setEditing(null)} className="p-1 text-white/70 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="text-lg font-semibold text-white">{r.title}</div>
          )}
          <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-white/45">
            {r.updatedAt ? `Updated ${new Date(r.updatedAt).toLocaleDateString()}` : "New"}
          </div>
          <div className="mt-3 text-xs text-white/60">
            {r.data.experience.length} experience · {r.data.projects.length} projects · {r.data.skills.length} skill groups
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={() => { setEditing(r.id); setTitle(r.title); }} className="rounded-md p-1.5 text-white/55 hover:bg-white/[0.06] hover:text-white" title="Rename">
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => void duplicate(r.id).then(() => toast.success("Duplicated"))} className="rounded-md p-1.5 text-white/55 hover:bg-white/[0.06] hover:text-white" title="Duplicate">
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => void remove(r.id).then(() => toast.success("Deleted"))} className="rounded-md p-1.5 text-white/55 hover:bg-white/[0.06] hover:text-red-300" title="Delete">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
