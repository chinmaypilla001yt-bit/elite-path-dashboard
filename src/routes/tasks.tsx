import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AppShell } from "@/components/ascend/AppShell";
import { PageHeader } from "@/components/ascend/PageHeader";
import { GlassCard } from "@/components/ascend/GlassCard";
import { useLocalCollection } from "@/hooks/use-local-collection";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks · Ascend" },
      { name: "description", content: "Prioritized task queue with XP rewards." },
    ],
  }),
  component: TasksPage,
});

type Task = {
  id: string;
  title: string;
  priority: string;
  difficulty: string;
  xp: number;
  tag: string;
  done: boolean;
};

const PRIORITIES = ["P0", "P1", "P2"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

function TasksPage() {
  const { items, add, update, remove, hydrated } = useLocalCollection<Task>("tasks");
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ title: "", priority: "P1", difficulty: "Medium", xp: "50", tag: "" });

  function save() {
    if (!draft.title.trim()) return;
    add({
      title: draft.title.trim(),
      priority: draft.priority,
      difficulty: draft.difficulty,
      xp: Number(draft.xp) || 0,
      tag: draft.tag.trim(),
      done: false,
    });
    setDraft({ title: "", priority: "P1", difficulty: "Medium", xp: "50", tag: "" });
    setShowForm(false);
  }

  const open = items.filter((t) => !t.done);
  const done = items.filter((t) => t.done);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Focus"
        title="Task Queue"
        description="Prioritize ruthlessly. Ship. Earn XP."
        actions={
          <button
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg bg-[image:var(--gradient-cyber)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> New task
          </button>
        }
      />

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mb-6">
            <GlassCard glow="purple" className="p-5">
              <div className="grid gap-3 sm:grid-cols-6">
                <input
                  className="sm:col-span-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
                  placeholder="Task title"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                />
                <input
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
                  placeholder="Tag"
                  value={draft.tag}
                  onChange={(e) => setDraft({ ...draft, tag: e.target.value })}
                />
                <select
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
                  value={draft.priority}
                  onChange={(e) => setDraft({ ...draft, priority: e.target.value })}
                >
                  {PRIORITIES.map((p) => <option key={p} value={p} className="bg-[#0b1024]">{p}</option>)}
                </select>
                <select
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
                  value={draft.difficulty}
                  onChange={(e) => setDraft({ ...draft, difficulty: e.target.value })}
                >
                  {DIFFICULTIES.map((d) => <option key={d} value={d} className="bg-[#0b1024]">{d}</option>)}
                </select>
                <input
                  type="number"
                  className="sm:col-span-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
                  placeholder="XP"
                  value={draft.xp}
                  onChange={(e) => setDraft({ ...draft, xp: e.target.value })}
                />
                <button onClick={save} className="sm:col-span-4 rounded-lg bg-[image:var(--gradient-cyber)] px-4 py-2 text-sm font-semibold text-white">
                  Save task
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {hydrated && items.length === 0 ? (
        <GlassCard glow="purple" className="flex flex-col items-center justify-center p-16 text-center">
          <div className="text-lg font-semibold text-white">No tasks yet</div>
          <p className="mt-2 text-sm text-white/60">Add your first mission above.</p>
        </GlassCard>
      ) : (
        <div className="space-y-6">
          <TaskGroup title="Open" items={open} onToggle={(id) => update(id, { done: true })} onRemove={remove} />
          {done.length > 0 && (
            <TaskGroup title="Completed" items={done} onToggle={(id) => update(id, { done: false })} onRemove={remove} muted />
          )}
        </div>
      )}
    </AppShell>
  );
}

function TaskGroup({
  title, items, onToggle, onRemove, muted,
}: {
  title: string;
  items: Task[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  muted?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">{title} · {items.length}</div>
      <div className="space-y-2">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className={`group flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] p-3 ${muted ? "opacity-60" : ""}`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggle(t.id)}
                  className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                    t.done ? "border-emerald-400/60 bg-emerald-400/20 text-emerald-300" : "border-white/20 hover:border-white/50"
                  }`}
                >
                  {t.done && <Check className="h-3 w-3" />}
                </button>
                <div>
                  <div className={`text-sm text-white ${t.done ? "line-through opacity-70" : ""}`}>{t.title}</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                    {t.priority} · {t.difficulty}{t.tag ? ` · ${t.tag}` : ""}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {t.xp ? <span className="font-mono text-xs text-[oklch(0.83_0.16_85)]">+{t.xp} XP</span> : null}
                <button
                  onClick={() => onRemove(t.id)}
                  className="rounded-md p-1.5 text-white/40 opacity-0 transition group-hover:opacity-100 hover:bg-white/[0.06] hover:text-red-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
