import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Rocket, Sparkles, Cpu, Trophy, Plus, Pencil, Trash2, X, Check, Milestone } from "lucide-react";
import { AppShell } from "@/components/ascend/AppShell";
import { PageHeader } from "@/components/ascend/PageHeader";
import { GlassCard } from "@/components/ascend/GlassCard";
import { ProgressBar } from "@/components/ascend/ProgressBar";
import { useLocalCollection } from "@/hooks/use-local-collection";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Roadmap · Ascend" },
      { name: "description", content: "Your custom multi-year plan. Add years, topics, and milestones." },
      { property: "og:title", content: "Ascend · Roadmap" },
      { property: "og:description", content: "Plan the ascent year by year." },
    ],
  }),
  component: RoadmapPage,
});

type Year = {
  id: string;
  year: string;
  tag: string;
  accent: "blue" | "purple" | "cyan" | "gold" | "emerald";
  topics: { id: string; label: string; done: boolean }[];
};

const ICONS = [Rocket, Sparkles, Cpu, Trophy];
const ACCENTS: Year["accent"][] = ["blue", "purple", "cyan", "gold", "emerald"];

function RoadmapPage() {
  const { items, add, update, remove, hydrated } = useLocalCollection<Year>("roadmap");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ year: "", tag: "", accent: "blue" as Year["accent"] });
  const [topicDraft, setTopicDraft] = useState<Record<string, string>>({});

  function openNew() {
    setEditingId(null);
    setDraft({ year: "", tag: "", accent: "blue" });
    setShowForm(true);
  }
  function openEdit(y: Year) {
    setEditingId(y.id);
    setDraft({ year: y.year, tag: y.tag, accent: y.accent });
    setShowForm(true);
  }
  function saveYear() {
    if (!draft.year.trim()) return;
    if (editingId) {
      update(editingId, { year: draft.year, tag: draft.tag, accent: draft.accent });
    } else {
      add({ year: draft.year, tag: draft.tag, accent: draft.accent, topics: [] });
    }
    setShowForm(false);
    setEditingId(null);
  }
  function addTopic(y: Year) {
    const val = (topicDraft[y.id] || "").trim();
    if (!val) return;
    update(y.id, { topics: [...y.topics, { id: crypto.randomUUID(), label: val, done: false }] });
    setTopicDraft((d) => ({ ...d, [y.id]: "" }));
  }
  function toggleTopic(y: Year, tid: string) {
    update(y.id, { topics: y.topics.map((t) => (t.id === tid ? { ...t, done: !t.done } : t)) });
  }
  function removeTopic(y: Year, tid: string) {
    update(y.id, { topics: y.topics.filter((t) => t.id !== tid) });
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Timeline"
        title="Your Roadmap"
        description="Add your years, chapters, and milestones. Check things off as you conquer them."
        actions={
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 rounded-lg bg-[image:var(--gradient-cyber)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Add year
          </button>
        }
      />

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mb-6">
            <GlassCard glow="purple" className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/50">
                  {editingId ? "Edit year" : "New year"}
                </div>
                <button onClick={() => setShowForm(false)} className="rounded-md p-1 text-white/50 hover:bg-white/[0.06] hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
                  placeholder="Year 1"
                  value={draft.year}
                  onChange={(e) => setDraft({ ...draft, year: e.target.value })}
                />
                <input
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
                  placeholder="Chapter tag (e.g. Foundations)"
                  value={draft.tag}
                  onChange={(e) => setDraft({ ...draft, tag: e.target.value })}
                />
                <select
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
                  value={draft.accent}
                  onChange={(e) => setDraft({ ...draft, accent: e.target.value as Year["accent"] })}
                >
                  {ACCENTS.map((a) => <option key={a} value={a} className="bg-[#0b1024]">{a}</option>)}
                </select>
              </div>
              <div className="mt-4 flex justify-end">
                <button onClick={saveYear} className="inline-flex items-center gap-2 rounded-lg bg-[image:var(--gradient-cyber)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow)]">
                  <Check className="h-4 w-4" /> Save
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {hydrated && items.length === 0 ? (
        <GlassCard glow="purple" className="flex flex-col items-center justify-center p-16 text-center">
          <Milestone className="h-8 w-8 text-white/60" />
          <div className="mt-4 text-lg font-semibold text-white">Your ascent is unwritten</div>
          <p className="mt-2 max-w-md text-sm text-white/60">
            Add your first year to start mapping the journey. Each year holds its own milestones.
          </p>
        </GlassCard>
      ) : (
        <div className="relative">
          <div className="pointer-events-none absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-[oklch(0.72_0.2_255)] via-[oklch(0.66_0.24_305)] to-[oklch(0.83_0.16_85)] md:left-1/2" />
          <div className="space-y-8">
            {items.map((y, i) => {
              const Icon = ICONS[i % ICONS.length];
              const left = i % 2 === 0;
              const done = y.topics.filter((t) => t.done).length;
              const progress = y.topics.length === 0 ? 0 : Math.round((done / y.topics.length) * 100);
              return (
                <motion.div
                  key={y.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5 }}
                  className="relative grid gap-4 md:grid-cols-2"
                >
                  <div className={left ? "md:pr-10" : "md:col-start-2 md:pl-10"}>
                    <GlassCard glow={y.accent} className="group p-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[image:var(--gradient-cyber)]">
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/50">{y.tag || "chapter"}</div>
                          <div className="text-xl font-semibold text-white">{y.year}</div>
                        </div>
                        <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                          <button onClick={() => openEdit(y)} className="rounded-md p-1.5 text-white/50 hover:bg-white/[0.06] hover:text-white">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => remove(y.id)} className="rounded-md p-1.5 text-white/50 hover:bg-white/[0.06] hover:text-red-300">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-4">
                        <ProgressBar value={progress} label="Completion" right={`${done} / ${y.topics.length || 0}`} />
                      </div>

                      <div className="mt-4 space-y-1.5">
                        <AnimatePresence>
                          {y.topics.map((t) => (
                            <motion.div
                              key={t.id}
                              layout
                              initial={{ opacity: 0, x: -4 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0 }}
                              className="group/topic flex items-center gap-2 rounded-md border border-white/5 bg-white/[0.03] px-2.5 py-1.5"
                            >
                              <button
                                onClick={() => toggleTopic(y, t.id)}
                                className={`flex h-4 w-4 items-center justify-center rounded border ${
                                  t.done ? "border-emerald-400/60 bg-emerald-400/20 text-emerald-300" : "border-white/20 hover:border-white/50"
                                }`}
                              >
                                {t.done && <Check className="h-2.5 w-2.5" />}
                              </button>
                              <span className={`flex-1 text-xs ${t.done ? "text-white/50 line-through" : "text-white/85"}`}>{t.label}</span>
                              <button
                                onClick={() => removeTopic(y, t.id)}
                                className="opacity-0 transition group-hover/topic:opacity-100 text-white/40 hover:text-red-300"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <input
                          value={topicDraft[y.id] || ""}
                          onChange={(e) => setTopicDraft((d) => ({ ...d, [y.id]: e.target.value }))}
                          onKeyDown={(e) => e.key === "Enter" && addTopic(y)}
                          placeholder="Add a topic or milestone…"
                          className="flex-1 rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
                        />
                        <button
                          onClick={() => addTopic(y)}
                          className="rounded-md border border-white/10 bg-white/[0.03] px-2 text-white/70 hover:bg-white/[0.06] hover:text-white"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </GlassCard>
                  </div>

                  <div className="absolute left-4 top-6 -translate-x-1/2 md:left-1/2">
                    <div className="h-3 w-3 rounded-full bg-white shadow-[0_0_12px_oklch(0.72_0.2_255)]" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </AppShell>
  );
}
