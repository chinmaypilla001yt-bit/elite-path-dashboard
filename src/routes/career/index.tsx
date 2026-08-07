import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy, useState } from "react";
import { FileDown, FileText, Plus, Loader2, Cloud, CloudOff } from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "@/components/ascend/GlassCard";
import { useResumes } from "@/hooks/use-resumes";
import { SyncPanel } from "@/components/career/SyncPanel";
import { exportPdf, exportDocx } from "@/lib/resume-export";

const ResumeEditor = lazy(() =>
  import("@/components/career/ResumeEditor").then((m) => ({ default: m.ResumeEditor })),
);
const ClassicTemplate = lazy(() =>
  import("@/components/career/ClassicTemplate").then((m) => ({ default: m.ClassicTemplate })),
);

export const Route = createFileRoute("/career/")({
  head: () => ({
    meta: [
      { title: "Resume Builder · Career Hub · Ascend" },
      { name: "description", content: "Build ATS-friendly resumes with a live one-page preview and PDF/DOCX export." },
      { property: "og:title", content: "Resume Builder · Ascend" },
      { property: "og:description", content: "Live one-page resume editor with PDF and DOCX export." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResumeBuilderPage,
});

function Skeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-16 animate-pulse rounded-xl border border-white/5 bg-white/[0.03]" />
      ))}
    </div>
  );
}

function ResumeBuilderPage() {
  const { resumes, active, data, loading, status, create, select, edit, saveNow } = useResumes();
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    setCreating(true);
    try {
      await create(`Resume ${resumes.length + 1}`);
      toast.success("Resume created");
    } catch (e) {
      toast.error((e as Error).message || "Failed to create");
    } finally {
      setCreating(false);
    }
  }

  if (loading) return <Skeleton />;

  if (!active || !data) {
    return (
      <GlassCard glow="gold" className="flex flex-col items-center p-16 text-center">
        <FileText className="h-8 w-8 text-white/40" />
        <div className="mt-3 text-lg font-semibold text-white">No resumes yet</div>
        <p className="mt-2 max-w-md text-sm text-white/60">
          Create your first resume — then import projects, skills and achievements straight from Ascend.
        </p>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[image:var(--gradient-cyber)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow)] hover:opacity-90 disabled:opacity-60"
        >
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} New resume
        </button>
      </GlassCard>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2 print:hidden">
        <select
          value={active.id}
          onChange={(e) => select(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none"
        >
          {resumes.map((r) => (
            <option key={r.id} value={r.id} className="bg-[#0b1024]">{r.title}</option>
          ))}
        </select>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/80 hover:bg-white/[0.08] hover:text-white"
        >
          <Plus className="h-3.5 w-3.5" /> New
        </button>
        <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-white/50">
          {status === "saving" ? (
            <><Loader2 className="h-3 w-3 animate-spin" /> Saving…</>
          ) : status === "error" ? (
            <><CloudOff className="h-3 w-3 text-red-300" /> Save failed</>
          ) : (
            <><Cloud className="h-3 w-3" /> Saved</>
          )}
        </span>
        <button
          onClick={() => { saveNow(); exportPdf(); }}
          className="inline-flex items-center gap-2 rounded-lg bg-[image:var(--gradient-cyber)] px-3 py-2 text-xs font-semibold text-white shadow-[var(--shadow-glow)] hover:opacity-90"
        >
          <FileDown className="h-3.5 w-3.5" /> PDF
        </button>
        <button
          onClick={() => void exportDocx(active.title, data).then(() => toast.success("DOCX downloaded"))}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/[0.08] hover:text-white"
        >
          <FileText className="h-3.5 w-3.5" /> DOCX
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-3 print:hidden">
          <SyncPanel edit={edit} />
          <Suspense fallback={<Skeleton />}>
            <ResumeEditor data={data} edit={edit} />
          </Suspense>
        </div>
        <div className="xl:sticky xl:top-6 xl:h-fit">
          <Suspense fallback={<div className="h-[600px] animate-pulse rounded-xl bg-white/[0.04]" />}>
            <ClassicTemplate data={data} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
