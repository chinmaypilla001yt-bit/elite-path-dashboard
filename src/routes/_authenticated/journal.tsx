import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2, Loader2, NotebookPen } from "lucide-react";
import { AppShell } from "@/components/ascend/AppShell";
import { PageHeader } from "@/components/ascend/PageHeader";
import { GlassCard } from "@/components/ascend/GlassCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/journal")({
  head: () => ({ meta: [{ title: "Journal · Ascend" }, { name: "description", content: "Daily reflection, mood, energy." }] }),
  component: JournalPage,
});

type Entry = {
  id: string; title: string | null; content: string;
  mood: string | null; energy: number | null; entry_date: string;
};

const moods = ["🔥 Fired up", "😌 Calm", "😤 Grinding", "🧠 Focused", "😴 Tired", "🌊 Flow"];

function JournalPage() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState(moods[0]);
  const [energy, setEnergy] = useState(7);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["journal_entries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("journal_entries").select("*").order("entry_date", { ascending: false }).limit(50);
      if (error) throw error;
      return data as Entry[];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("journal_entries").insert({
        title: title || null, content, mood, energy, user_id: u.user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => { setTitle(""); setContent(""); toast.success("Entry saved"); qc.invalidateQueries({ queryKey: ["journal_entries"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("journal_entries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["journal_entries"] }),
  });

  return (
    <AppShell>
      <PageHeader eyebrow="Reflection" title="Journal" description="Capture the day. Move on stronger." />

      <GlassCard className="mb-6 p-5" glow="purple">
        <form onSubmit={(e) => { e.preventDefault(); if (content.trim()) create.mutate(); }} className="space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (optional)"
            className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none" />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} required placeholder="What happened today? Wins, losses, lessons…"
            className="min-h-[140px] w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none" />
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <select value={mood} onChange={(e) => setMood(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none">
              {moods.map((m) => <option key={m}>{m}</option>)}
            </select>
            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white">
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/45">Energy</span>
              <input type="range" min={1} max={10} value={energy} onChange={(e) => setEnergy(parseInt(e.target.value))} className="flex-1" />
              <span className="w-6 text-right font-mono">{energy}</span>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-[image:var(--gradient-cyber)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow)]">
              <Plus className="h-4 w-4" /> Save entry
            </button>
          </div>
        </form>
      </GlassCard>

      {isLoading ? <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-white/40" /></div>
        : entries.length === 0 ? <GlassCard className="p-10 text-center text-sm text-white/60">No entries yet.</GlassCard>
        : (
          <div className="grid gap-4">
            {entries.map((e) => (
              <GlassCard key={e.id} className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.04]"><NotebookPen className="h-4 w-4 text-white/70" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold text-white">{e.title || e.entry_date}</div>
                      {e.mood && <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] text-white/70">{e.mood}</span>}
                      {e.energy != null && <span className="font-mono text-[10px] uppercase tracking-widest text-white/45">energy {e.energy}/10</span>}
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-white/75">{e.content}</p>
                    <div className="mt-2 font-mono text-[10px] uppercase tracking-widest text-white/40">{e.entry_date}</div>
                  </div>
                  <button onClick={() => del.mutate(e.id)} className="rounded-md p-1.5 text-white/40 hover:bg-white/[0.05] hover:text-red-400">
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
