import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { CheckCircle2, Circle, Flame } from "lucide-react";
import { AppShell } from "@/components/ascend/AppShell";
import { PageHeader } from "@/components/ascend/PageHeader";
import { GlassCard } from "@/components/ascend/GlassCard";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks · Ascend" },
      { name: "description", content: "Daily missions, XP rewards, and deep work queue." },
    ],
  }),
  component: TasksPage,
});

type Task = {
  id: string; title: string; tag: string; priority: "P0" | "P1" | "P2";
  difficulty: "Easy" | "Medium" | "Hard" | "Elite"; time: string; xp: number; done: boolean;
};

const seed: Task[] = [
  { id: "1", title: "Codeforces Round · Solve A–D", tag: "Competitive", priority: "P0", difficulty: "Hard", time: "2h", xp: 220, done: false },
  { id: "2", title: "Read 'Attention Is All You Need'", tag: "Research", priority: "P0", difficulty: "Hard", time: "75m", xp: 140, done: false },
  { id: "3", title: "Linear Algebra · Eigenvectors set", tag: "Math", priority: "P1", difficulty: "Medium", time: "60m", xp: 90, done: true },
  { id: "4", title: "Ship Ascend v0.2 landing", tag: "Build", priority: "P1", difficulty: "Medium", time: "90m", xp: 120, done: false },
  { id: "5", title: "Journal · daily reflection", tag: "Habit", priority: "P2", difficulty: "Easy", time: "10m", xp: 20, done: true },
  { id: "6", title: "Mock interview · systems", tag: "Interview", priority: "P0", difficulty: "Elite", time: "45m", xp: 260, done: false },
];

function TasksPage() {
  const [items, setItems] = useState(seed);
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
            <span className="text-xs text-white/80">28-day streak</span>
          </div>
        }
      />

      <div className="grid gap-4">
        {items.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <GlassCard className="p-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setItems((s) => s.map((x) => x.id === t.id ? { ...x, done: !x.done } : x))}
                  className="shrink-0"
                >
                  {t.done ? (
                    <CheckCircle2 className="h-6 w-6 text-[oklch(0.75_0.18_155)] drop-shadow-[0_0_8px_oklch(0.75_0.18_155/0.7)]" />
                  ) : (
                    <Circle className="h-6 w-6 text-white/30" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <div className={cn("text-sm font-medium text-white", t.done && "text-white/50 line-through")}>
                    {t.title}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/45">
                    <span>{t.tag}</span> · <span>{t.time}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={cn(
                    "rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest",
                    t.priority === "P0" && "border-[oklch(0.66_0.24_305/0.5)] bg-[oklch(0.66_0.24_305/0.15)] text-[oklch(0.85_0.15_305)]",
                    t.priority === "P1" && "border-[oklch(0.72_0.2_255/0.5)] bg-[oklch(0.72_0.2_255/0.12)] text-[oklch(0.85_0.15_255)]",
                    t.priority === "P2" && "border-white/10 bg-white/[0.03] text-white/60",
                  )}>{t.priority}</span>
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-white/60">
                    {t.difficulty}
                  </span>
                  <span className="rounded-full border border-[oklch(0.83_0.16_85/0.4)] bg-[oklch(0.83_0.16_85/0.1)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-[oklch(0.9_0.14_85)]">
                    +{t.xp} XP
                  </span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </AppShell>
  );
}
