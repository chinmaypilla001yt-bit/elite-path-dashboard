import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Circle, Flame, Plus, Trash2, Loader2 } from "lucide-react";
import { AppShell } from "@/components/ascend/AppShell";
import { PageHeader } from "@/components/ascend/PageHeader";
import { GlassCard } from "@/components/ascend/GlassCard";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({ meta: [{ title: "Tasks · Ascend" }, { name: "description", content: "Daily missions, XP, and deep work queue." }] }),
  component: TasksPage,
});

type Task = {
  id: string; title: string; tag: string | null;
  priority: "P0" | "P1" | "P2"; difficulty: "Easy" | "Medium" | "Hard" | "Elite";
  time_estimate: string | null; xp: number; done: boolean;
};

function TasksPage() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("P1");
  const [difficulty, setDifficulty] = useState<Task["difficulty"]>("Medium");
  const [xp, setXp] = useState(50);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Task[];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase.from("tasks").insert({
        title, tag: tag || null, priority, difficulty, xp, user_id: userData.user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Task added");
      setTitle(""); setTag("");
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: async (t: Task) => {
      const { error } = await supabase.from("tasks").update({ done: !t.done }).eq("id", t.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const done = items.filter((i) => i.done).length;
  const totalXp = items.filter((i) => i.done).reduce((a, b) => a + b.xp, 0);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Today"
        title="Mission queue"
        description={`${done}/${items.length} missions completed · +${totalXp} XP earned`}
        actions={
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
            <Flame className="h-4 w-4 text-[oklch(0.83_0.16_85)]" />
            <span className="text-xs text-white/80">Live sync</span>
          </div>
        }
      />

      <GlassCard className="mb-6 p-4" glow="blue">
        <form onSubmit={(e) => { e.preventDefault(); if (title.trim()) create.mutate(); }} className="grid gap-3 md:grid-cols-[1fr_140px_120px_120px_120px_auto]">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New mission…" required
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none" />
          <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Tag"
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none" />
          <select value={priority} onChange={(e) => setPriority(e.target.value as Task["priority"])}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none">
            <option value="P0">P0</option><option value="P1">P1</option><option value="P2">P2</option>
          </select>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Task["difficulty"])}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none">
            <option>Easy</option><option>Medium</option><option>Hard</option><option>Elite</option>
          </select>
          <input type="number" value={xp} onChange={(e) => setXp(parseInt(e.target.value) || 0)} min={0}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none" />
          <button type="submit" disabled={create.isPending}
            className="flex items-center gap-2 rounded-lg bg-[image:var(--gradient-cyber)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow)] disabled:opacity-50">
            {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add
          </button>
        </form>
      </GlassCard>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/50" /></div>
      ) : items.length === 0 ? (
        <GlassCard className="p-10 text-center text-sm text-white/60">No missions yet. Add your first above.</GlassCard>
      ) : (
        <div className="grid gap-3">
          {items.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <GlassCard className="p-4">
                <div className="flex items-center gap-4">
                  <button onClick={() => toggle.mutate(t)} className="shrink-0">
                    {t.done
                      ? <CheckCircle2 className="h-6 w-6 text-[oklch(0.75_0.18_155)] drop-shadow-[0_0_8px_oklch(0.75_0.18_155/0.7)]" />
                      : <Circle className="h-6 w-6 text-white/30" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className={cn("text-sm font-medium text-white", t.done && "text-white/50 line-through")}>{t.title}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/45">
                      {t.tag && <span>{t.tag}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest",
                      t.priority === "P0" && "border-[oklch(0.66_0.24_305/0.5)] bg-[oklch(0.66_0.24_305/0.15)] text-[oklch(0.85_0.15_305)]",
                      t.priority === "P1" && "border-[oklch(0.72_0.2_255/0.5)] bg-[oklch(0.72_0.2_255/0.12)] text-[oklch(0.85_0.15_255)]",
                      t.priority === "P2" && "border-white/10 bg-white/[0.03] text-white/60",
                    )}>{t.priority}</span>
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-white/60">{t.difficulty}</span>
                    <span className="rounded-full border border-[oklch(0.83_0.16_85/0.4)] bg-[oklch(0.83_0.16_85/0.1)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-[oklch(0.9_0.14_85)]">+{t.xp} XP</span>
                    <button onClick={() => del.mutate(t.id)} className="rounded-md p-1.5 text-white/40 hover:bg-white/[0.05] hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
