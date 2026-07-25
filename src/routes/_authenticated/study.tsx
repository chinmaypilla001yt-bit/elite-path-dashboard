import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2, Loader2, BookOpen, Clock } from "lucide-react";
import { AppShell } from "@/components/ascend/AppShell";
import { PageHeader } from "@/components/ascend/PageHeader";
import { GlassCard } from "@/components/ascend/GlassCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/study")({
  head: () => ({ meta: [{ title: "Study Tracker · Ascend" }, { name: "description", content: "Log deep work sessions." }] }),
  component: StudyPage,
});

type Session = {
  id: string; subject: string; topic: string | null;
  duration_minutes: number; notes: string | null; session_date: string;
};

function StudyPage() {
  const qc = useQueryClient();
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState("");

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["study_sessions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("study_sessions").select("*").order("session_date", { ascending: false }).limit(50);
      if (error) throw error;
      return data as Session[];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("study_sessions").insert({
        subject, topic: topic || null, duration_minutes: duration, notes: notes || null, user_id: u.user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => { setSubject(""); setTopic(""); setNotes(""); setDuration(60); toast.success("Session logged"); qc.invalidateQueries({ queryKey: ["study_sessions"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("study_sessions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["study_sessions"] }),
  });

  const totalMin = sessions.reduce((a, b) => a + b.duration_minutes, 0);
  const hours = (totalMin / 60).toFixed(1);

  return (
    <AppShell>
      <PageHeader eyebrow="Focus" title="Study Tracker" description={`${sessions.length} sessions · ${hours}h total`} />

      <GlassCard className="mb-6 p-4" glow="cyan">
        <form onSubmit={(e) => { e.preventDefault(); if (subject.trim()) create.mutate(); }} className="grid gap-3 md:grid-cols-4">
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" required
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none" />
          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic"
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none" />
          <input type="number" min={1} value={duration} onChange={(e) => setDuration(parseInt(e.target.value) || 0)} placeholder="Minutes"
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none" />
          <button className="flex items-center justify-center gap-2 rounded-lg bg-[image:var(--gradient-cyber)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow)]">
            <Plus className="h-4 w-4" /> Log session
          </button>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)"
            className="md:col-span-4 min-h-[70px] rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none" />
        </form>
      </GlassCard>

      {isLoading ? <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-white/40" /></div>
        : sessions.length === 0 ? <GlassCard className="p-10 text-center text-sm text-white/60">No sessions logged yet.</GlassCard>
        : (
          <div className="grid gap-3">
            {sessions.map((s) => (
              <GlassCard key={s.id} className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.04]"><BookOpen className="h-4 w-4 text-white/70" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-white">{s.subject}{s.topic && <span className="text-white/50"> · {s.topic}</span>}</div>
                    {s.notes && <div className="mt-1 text-xs text-white/60">{s.notes}</div>}
                    <div className="mt-1 flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-white/45">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {s.duration_minutes}m</span>
                      <span>{s.session_date}</span>
                    </div>
                  </div>
                  <button onClick={() => del.mutate(s.id)} className="rounded-md p-1.5 text-white/40 hover:bg-white/[0.05] hover:text-red-400">
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
