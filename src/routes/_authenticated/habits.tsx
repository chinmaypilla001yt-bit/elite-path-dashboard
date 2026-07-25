import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Flame, Plus, Trash2, Loader2, Check } from "lucide-react";
import { AppShell } from "@/components/ascend/AppShell";
import { PageHeader } from "@/components/ascend/PageHeader";
import { GlassCard } from "@/components/ascend/GlassCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/habits")({
  head: () => ({ meta: [{ title: "Habits · Ascend" }, { name: "description", content: "Streaks and daily discipline" }] }),
  component: HabitsPage,
});

type Habit = { id: string; name: string; icon: string | null; target_per_week: number };
type Log = { id: string; habit_id: string; log_date: string };

function todayISO() { return new Date().toISOString().slice(0, 10); }

function HabitsPage() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [target, setTarget] = useState(7);

  const habitsQ = useQuery({
    queryKey: ["habits"],
    queryFn: async () => {
      const { data, error } = await supabase.from("habits").select("*").order("created_at");
      if (error) throw error;
      return data as Habit[];
    },
  });

  const logsQ = useQuery({
    queryKey: ["habit_logs"],
    queryFn: async () => {
      const since = new Date(); since.setDate(since.getDate() - 30);
      const { data, error } = await supabase.from("habit_logs").select("*").gte("log_date", since.toISOString().slice(0, 10));
      if (error) throw error;
      return data as Log[];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("habits").insert({ name, target_per_week: target, user_id: u.user!.id });
      if (error) throw error;
    },
    onSuccess: () => { setName(""); toast.success("Habit added"); qc.invalidateQueries({ queryKey: ["habits"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: async (habitId: string) => {
      const today = todayISO();
      const existing = (logsQ.data ?? []).find((l) => l.habit_id === habitId && l.log_date === today);
      if (existing) {
        const { error } = await supabase.from("habit_logs").delete().eq("id", existing.id);
        if (error) throw error;
      } else {
        const { data: u } = await supabase.auth.getUser();
        const { error } = await supabase.from("habit_logs").insert({ habit_id: habitId, user_id: u.user!.id, log_date: today });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habit_logs"] }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("habits").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habits"] }),
  });

  const habits = habitsQ.data ?? [];
  const logs = logsQ.data ?? [];
  const today = todayISO();

  return (
    <AppShell>
      <PageHeader eyebrow="Discipline" title="Habits" description="Build streaks with a single click a day." />

      <GlassCard className="mb-6 p-4">
        <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) create.mutate(); }} className="grid gap-3 md:grid-cols-[1fr_140px_auto]">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New habit (e.g. Meditate)" required
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none" />
          <input type="number" min={1} max={7} value={target} onChange={(e) => setTarget(parseInt(e.target.value) || 7)}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none" placeholder="Target/week" />
          <button className="flex items-center gap-2 rounded-lg bg-[image:var(--gradient-cyber)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow)]">
            <Plus className="h-4 w-4" /> Add
          </button>
        </form>
      </GlassCard>

      {habitsQ.isLoading ? <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-white/40" /></div>
        : habits.length === 0 ? <GlassCard className="p-10 text-center text-sm text-white/60">No habits yet.</GlassCard>
        : (
          <div className="grid gap-4">
            {habits.map((h) => {
              const doneToday = logs.some((l) => l.habit_id === h.id && l.log_date === today);
              const thisWeek = logs.filter((l) => {
                const d = new Date(l.log_date); const now = new Date();
                const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
                return l.habit_id === h.id && diff < 7;
              }).length;
              return (
                <GlassCard key={h.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <button onClick={() => toggle.mutate(h.id)}
                      className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${doneToday ? "border-[oklch(0.75_0.18_155/0.5)] bg-[oklch(0.75_0.18_155/0.2)] text-[oklch(0.85_0.16_155)]" : "border-white/10 bg-white/[0.03] text-white/40"}`}>
                      {doneToday ? <Check className="h-5 w-5" /> : <Flame className="h-5 w-5" />}
                    </button>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{h.name}</div>
                      <div className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-white/45">
                        {thisWeek}/{h.target_per_week} this week
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: 14 }).map((_, i) => {
                        const d = new Date(); d.setDate(d.getDate() - (13 - i));
                        const iso = d.toISOString().slice(0, 10);
                        const on = logs.some((l) => l.habit_id === h.id && l.log_date === iso);
                        return <div key={i} className="h-6 w-2.5 rounded-sm" style={{ background: on ? "oklch(0.75 0.18 155 / 0.9)" : "oklch(1 0 0 / 0.08)" }} />;
                      })}
                    </div>
                    <button onClick={() => del.mutate(h.id)} className="rounded-md p-1.5 text-white/40 hover:bg-white/[0.05] hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
    </AppShell>
  );
}
