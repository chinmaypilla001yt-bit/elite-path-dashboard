import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Flame, Zap, Trophy, Clock, Target, Sparkles, Plus } from "lucide-react";
import { AppShell } from "@/components/ascend/AppShell";
import { StatCard } from "@/components/ascend/StatCard";
import { GlassCard } from "@/components/ascend/GlassCard";
import { RingProgress } from "@/components/ascend/RingProgress";
import { ProgressBar } from "@/components/ascend/ProgressBar";
import { useLocalCollection, useLocalState } from "@/hooks/use-local-collection";
import { Code2, ListChecks, BookOpen } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ascend — Mission Control" },
      { name: "description", content: "Your personal 4-year journey dashboard. Track XP, streaks, deep work, and progress toward elite tech offers." },
      { property: "og:title", content: "Ascend — Mission Control" },
      { property: "og:description", content: "A futuristic productivity HUD for aspiring elite engineers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

type Task = { id: string; title: string; xp?: number; done?: boolean; tag?: string };
type Study = { id: string; subject: string; minutes?: number; date?: string };
type Goal = { id: string; title: string; progress?: number };

function Dashboard() {
  const [name] = useLocalState<string>("profile:name", "");
  const { items: tasks } = useLocalCollection<Task>("tasks");
  const { items: study } = useLocalCollection<Study>("study");
  const { items: goals } = useLocalCollection<Goal>("goals");

  const completedTasks = tasks.filter((t) => t.done).length;
  const xp = tasks.filter((t) => t.done).reduce((s, t) => s + (Number(t.xp) || 0), 0);
  const level = Math.max(1, Math.floor(xp / 1000) + 1);
  const totalMinutes = study.reduce((s, x) => s + (Number(x.minutes) || 0), 0);
  const hours = (totalMinutes / 60).toFixed(1);

  const upcoming = tasks.filter((t) => !t.done).slice(0, 5);
  const greeting = getGreeting();
  const displayName = name?.trim() || "friend";

  return (
    <AppShell>
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-strong relative mb-8 overflow-hidden p-6 sm:p-10"
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[image:var(--gradient-cyber)] opacity-30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[image:var(--gradient-emerald)] opacity-20 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-white/50">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Mission Control · Day 1
            </div>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {greeting}, <span className="text-gradient">{displayName}</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm text-white/60">
              Your journey starts empty. Add tasks, log study time, set goals — everything you track here fuels the HUD.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Pill icon={Zap} label="XP" value={xp.toString()} tone="blue" />
              <Pill icon={Trophy} label="Level" value={level.toString()} tone="purple" />
              <Pill icon={Flame} label="Tasks done" value={completedTasks.toString()} tone="gold" />
              <Pill icon={Clock} label="Study" value={`${hours}h`} tone="cyan" />
              <Pill icon={Target} label="Goals" value={goals.length.toString()} tone="emerald" />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Link to="/tasks" className="inline-flex items-center gap-2 rounded-lg bg-[image:var(--gradient-cyber)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition hover:opacity-90">
                <Plus className="h-4 w-4" /> Add a task
              </Link>
              <Link to="/roadmap" className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/80 transition hover:bg-white/[0.06] hover:text-white">
                <Sparkles className="h-4 w-4" /> Build your roadmap
              </Link>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <RingProgress
              value={tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100)}
              label="Tasks"
              sub={`${completedTasks} / ${tasks.length}`}
            />
          </div>
        </div>
      </motion.section>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ListChecks} label="Open tasks" value={(tasks.length - completedTasks).toString()} hint={`${tasks.length} total`} accent="blue" delay={0.02} />
        <StatCard icon={BookOpen} label="Study time" value={`${hours}h`} hint={`${study.length} sessions`} accent="purple" delay={0.06} />
        <StatCard icon={Target} label="Active goals" value={goals.length.toString()} hint="Set your ambitions" accent="cyan" delay={0.1} />
        <StatCard icon={Code2} label="XP earned" value={xp.toString()} hint={`Level ${level}`} accent="emerald" delay={0.14} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <GlassCard glow="purple">
            <CardHeader eyebrow="Focus queue" title="Next up" right={<Link to="/tasks" className="font-mono text-[10px] uppercase tracking-widest text-white/50 hover:text-white">Open →</Link>} />
            {upcoming.length === 0 ? (
              <EmptyRow to="/tasks" cta="Add your first task" />
            ) : (
              <ul className="space-y-3">
                {upcoming.map((t, i) => (
                  <motion.li
                    key={t.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] p-3"
                  >
                    <div>
                      <div className="text-sm text-white">{t.title}</div>
                      {t.tag && (
                        <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">{t.tag}</div>
                      )}
                    </div>
                    {t.xp ? <span className="font-mono text-xs text-[oklch(0.83_0.16_85)]">+{t.xp} XP</span> : null}
                  </motion.li>
                ))}
              </ul>
            )}
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard glow="emerald">
            <CardHeader eyebrow="Goals" title="Progress" right={<Link to="/goals" className="font-mono text-[10px] uppercase tracking-widest text-white/50 hover:text-white">Open →</Link>} />
            {goals.length === 0 ? (
              <EmptyRow to="/goals" cta="Set a goal" />
            ) : (
              <div className="space-y-4">
                {goals.slice(0, 4).map((g) => (
                  <ProgressBar key={g.id} label={g.title} value={Number(g.progress) || 0} right={`${Number(g.progress) || 0}%`} />
                ))}
              </div>
            )}
          </GlassCard>

          <GlassCard glow="gold">
            <CardHeader eyebrow="Study log" title="Recent sessions" right={<Link to="/study" className="font-mono text-[10px] uppercase tracking-widest text-white/50 hover:text-white">Open →</Link>} />
            {study.length === 0 ? (
              <EmptyRow to="/study" cta="Log a session" />
            ) : (
              <ul className="space-y-2 text-sm">
                {study.slice(0, 4).map((s) => (
                  <li key={s.id} className="flex items-center justify-between rounded-md border border-white/5 bg-white/[0.03] px-3 py-2">
                    <span className="text-white/85">{s.subject}</span>
                    <span className="font-mono text-white/60">{s.minutes ?? 0}m</span>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return "Late night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}

function CardHeader({ eyebrow, title, right }: { eyebrow: string; title: string; right?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">{eyebrow}</div>
        <div className="mt-1 text-lg font-semibold text-white">{title}</div>
      </div>
      {right}
    </div>
  );
}

function EmptyRow({ to, cta }: { to: string; cta: string }) {
  return (
    <Link to={to as never} className="flex items-center justify-center rounded-lg border border-dashed border-white/10 bg-white/[0.02] px-4 py-6 text-sm text-white/60 transition hover:border-white/20 hover:text-white">
      <Plus className="mr-2 h-4 w-4" /> {cta}
    </Link>
  );
}

function Pill({
  icon: Icon, label, value, tone,
}: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; tone: "gold" | "blue" | "purple" | "cyan" | "emerald" }) {
  const map: Record<string, string> = {
    gold: "text-[oklch(0.83_0.16_85)]",
    blue: "text-[oklch(0.78_0.16_255)]",
    purple: "text-[oklch(0.75_0.2_305)]",
    cyan: "text-[oklch(0.85_0.13_200)]",
    emerald: "text-[oklch(0.8_0.16_155)]",
  };
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-2 pr-3">
      <Icon className={`h-3.5 w-3.5 ${map[tone]}`} />
      <span className="font-mono text-[10px] uppercase tracking-widest text-white/45">{label}</span>
      <span className="text-xs font-medium text-white">{value}</span>
    </div>
  );
}
