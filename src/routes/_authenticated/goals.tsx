import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2, Loader2, Target } from "lucide-react";
import { AppShell } from "@/components/ascend/AppShell";
import { PageHeader } from "@/components/ascend/PageHeader";
import { GlassCard } from "@/components/ascend/GlassCard";
import { ProgressBar } from "@/components/ascend/ProgressBar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/goals")({
  head: () => ({ meta: [{ title: "Goals · Ascend" }, { name: "description", content: "Long-term missions and progress." }] }),
  component: GoalsPage,
});

type Goal = {
  id: string; title: string; description: string | null; category: string | null;
  target_date: string | null; progress: number; status: "active" | "completed" | "paused" | "archived";
};

function GoalsPage() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("goals").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Goal[];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("goals").insert({
        title, category: category || null, description: description || null,
        target_date: targetDate || null, user_id: u.user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => { setTitle(""); setCategory(""); setDescription(""); setTargetDate(""); toast.success("Goal added"); qc.invalidateQueries({ queryKey: ["goals"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateProgress = useMutation({
    mutationFn: async ({ id, progress }: { id: string; progress: number }) => {
      const status = progress >= 100 ? "completed" : "active";
      const { error } = await supabase.from("goals").update({ progress, status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("goals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });

  return (
    <AppShell>
      <PageHeader eyebrow="Long-term" title="Goals" description="What you're building toward." />

      <GlassCard className="mb-6 p-4" glow="emerald">
        <form onSubmit={(e) => { e.preventDefault(); if (title.trim()) create.mutate(); }} className="grid gap-3 md:grid-cols-[2fr_1fr_1fr_auto]">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Goal title (e.g. Google STEP internship)" required
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none" />
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category"
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none" />
          <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none" />
          <button className="flex items-center gap-2 rounded-lg bg-[image:var(--gradient-cyber)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow)]">
            <Plus className="h-4 w-4" /> Add
          </button>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)"
            className="md:col-span-4 min-h-[60px] rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none" />
        </form>
      </GlassCard>

      {isLoading ? <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-white/40" /></div>
        : goals.length === 0 ? <GlassCard className="p-10 text-center text-sm text-white/60">No goals yet.</GlassCard>
        : (
          <div className="grid gap-4">
            {goals.map((g) => (
              <GlassCard key={g.id} className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.04]"><Target className="h-4 w-4 text-white/70" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-semibold text-white">{g.title}</div>
                      {g.category && <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] text-white/70">{g.category}</span>}
                      {g.target_date && <span className="font-mono text-[10px] uppercase tracking-widest text-white/45">by {g.target_date}</span>}
                      {g.status === "completed" && <span className="rounded-full border border-[oklch(0.75_0.18_155/0.4)] bg-[oklch(0.75_0.18_155/0.15)] px-2 py-0.5 text-[10px] text-[oklch(0.85_0.16_155)]">Completed</span>}
                    </div>
                    {g.description && <p className="mt-1 text-xs text-white/60">{g.description}</p>}
                    <div className="mt-3">
                      <ProgressBar label="Progress" value={g.progress} right={`${g.progress}%`} />
                      <input type="range" min={0} max={100} value={g.progress}
                        onChange={(e) => updateProgress.mutate({ id: g.id, progress: parseInt(e.target.value) })}
                        className="mt-2 w-full accent-[oklch(0.72_0.2_255)]" />
                    </div>
                  </div>
                  <button onClick={() => del.mutate(g.id)} className="rounded-md p-1.5 text-white/40 hover:bg-white/[0.05] hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
    </AppShell>
  );
}
