import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Flame, Zap, Trophy, Clock, Target, Sparkles, Plus, CalendarDays } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip,
  CartesianGrid, defs as _defs,
} from "recharts";
import { AppShell } from "@/components/ascend/AppShell";
import { StatCard } from "@/components/ascend/StatCard";
import { GlassCard } from "@/components/ascend/GlassCard";
import { RingProgress } from "@/components/ascend/RingProgress";
import { ProgressBar } from "@/components/ascend/ProgressBar";
import { useLocalCollection } from "@/hooks/use-local-collection";
import { useProfile } from "@/hooks/use-profile";
import { Code2, ListChecks, BookOpen } from "lucide-react";
import { CountdownLabel, daysUntil } from "./calendar";

// silence unused
void _defs;

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

type Task = { id: string; title: string; xp?: number; done?: boolean; tag?: string; estimatedMinutes?: number; completedAt?: number };
type Study = { id: string; subject: string; minutes?: number; date?: string; _createdAt?: number };
type Goal = { id: string; title: string; progress?: number };
type Event = { id: string; title: string; date: string; time?: string; category?: string };

function Dashboard() {
  const { profile, stats } = useProfile();
  const { items: tasks } = useLocalCollection<Task>("tasks");
  const { items: study } = useLocalCollection<Study>("study");
  const { items: goals } = useLocalCollection<Goal>("goals");
  const { items: events } = useLocalCollection<Event>("calendar");

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const completedTasks = tasks.filter((t) => t.done).length;
  const totalMinutes = study.reduce((s, x) => s + (Number(x.minutes) || 0), 0);
  const hours = (totalMinutes / 60).toFixed(1);
  const upcomingTasks = tasks.filter((t) => !t.done).slice(0, 5);

  // Weekly buckets (last 7 days including today)
  const weekly = useMemo(() => buildWeekly(tasks, study), [tasks, study]);

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return [...events]
      .filter((e) => e.date && daysUntil(e.date) >= 0)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 4);
  }, [events]);

  const displayName =
    profile?.name?.trim() ||
    profile?.displayName ||
    profile?.email?.split("@")[0] ||
    "friend";

  const greeting = getGreeting(now.getHours());

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
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.28em] text-white/60">
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                {now.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
              </span>
              <span className="text-white/40">·</span>
              <span className="text-white/80">
                {now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            </div>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {greeting}, <span className="text-gradient">{displayName}</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm text-white/60">
              Every task you finish, every minute you focus, every milestone you hit — it all compounds here.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Pill icon={Zap} label="XP" value={stats.xp.toString()} tone="blue" />
              <Pill icon={Trophy} label="Level" value={stats.level.toString()} tone="purple" />
              <Pill icon={Flame} label="Tasks done" value={completedTasks.toString()} tone="gold" />
              <Pill icon={Clock} label="Study" value={`${hours}h`} tone="cyan" />
              <Pill icon={Target} label="Goals" value={goals.length.toString()} tone="emerald" />
            </div>

            {/* XP → Level progress */}
            <div className="mt-6 max-w-xl">
              <div className="mb-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-white/50">
                <span>Level {stats.level} → {stats.level + 1}</span>
                <span>{stats.into} / {stats.span} XP · {stats.remaining} to go</span>
              </div>
              <ProgressBar value={stats.progress} accent="cyber" />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Link to="/tasks" className="inline-flex items-center gap-2 rounded-lg bg-[image:var(--gradient-cyber)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition hover:opacity-90">
                <Plus className="h-4 w-4" /> Add a task
              </Link>
              <Link to="/study" className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/80 transition hover:bg-white/[0.06] hover:text-white">
                <Sparkles className="h-4 w-4" /> Start a timer
              </Link>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <RingProgress
              value={stats.progress}
              label={`Level ${stats.level}`}
              sub={`${stats.remaining} XP to lv ${stats.level + 1}`}
            />
          </div>
        </div>
      </motion.section>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ListChecks} label="Open tasks" value={(tasks.length - completedTasks).toString()} hint={`${tasks.length} total`} accent="blue" delay={0.02} />
        <StatCard icon={BookOpen} label="Study time" value={`${hours}h`} hint={`${study.length} sessions`} accent="purple" delay={0.06} />
        <StatCard icon={Target} label="Active goals" value={goals.length.toString()} hint="Set your ambitions" accent="cyan" delay={0.1} />
        <StatCard icon={Code2} label="XP earned" value={stats.xp.toString()} hint={`Level ${stats.level}`} accent="emerald" delay={0.14} />
      </div>

      {/* Analytics */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Tasks completed" eyebrow="Last 7 days" color="blue">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekly}>
              <defs>
                <linearGradient id="taskBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.72 0.2 255)" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="oklch(0.66 0.24 305)" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="oklch(1 0 0 / 0.06)" vertical={false} />
              <XAxis dataKey="label" stroke="oklch(1 0 0 / 0.45)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(1 0 0 / 0.45)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTip />} cursor={{ fill: "oklch(1 0 0 / 0.04)" }} />
              <Bar dataKey="tasks" fill="url(#taskBar)" radius={[6, 6, 0, 0]} animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Productive hours" eyebrow="Last 7 days" color="cyan">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weekly}>
              <defs>
                <linearGradient id="hoursArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.82 0.14 200)" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="oklch(0.72 0.2 255)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="oklch(1 0 0 / 0.06)" vertical={false} />
              <XAxis dataKey="label" stroke="oklch(1 0 0 / 0.45)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(1 0 0 / 0.45)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="hours" stroke="oklch(0.82 0.14 200)" strokeWidth={2.5} fill="url(#hoursArea)" animationDuration={800} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Weekly XP earned" eyebrow="Last 7 days" color="gold">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weekly}>
              <defs>
                <linearGradient id="xpArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.83 0.16 85)" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="oklch(0.7 0.19 45)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="oklch(1 0 0 / 0.06)" vertical={false} />
              <XAxis dataKey="label" stroke="oklch(1 0 0 / 0.45)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(1 0 0 / 0.45)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="xp" stroke="oklch(0.83 0.16 85)" strokeWidth={2.5} fill="url(#xpArea)" animationDuration={800} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Daily study hours" eyebrow="Last 7 days" color="emerald">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekly}>
              <defs>
                <linearGradient id="studyBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.75 0.18 155)" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="oklch(0.82 0.14 200)" stopOpacity={0.5} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="oklch(1 0 0 / 0.06)" vertical={false} />
              <XAxis dataKey="label" stroke="oklch(1 0 0 / 0.45)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(1 0 0 / 0.45)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTip />} cursor={{ fill: "oklch(1 0 0 / 0.04)" }} />
              <Bar dataKey="hours" fill="url(#studyBar)" radius={[6, 6, 0, 0]} animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <GlassCard glow="purple">
            <CardHeader eyebrow="Focus queue" title="Next up" right={<Link to="/tasks" className="font-mono text-[10px] uppercase tracking-widest text-white/50 hover:text-white">Open →</Link>} />
            {upcomingTasks.length === 0 ? (
              <EmptyRow to="/tasks" cta="Add your first task" />
            ) : (
              <ul className="space-y-3">
                {upcomingTasks.map((t, i) => (
                  <motion.li
                    key={t.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] p-3"
                  >
                    <div>
                      <div className="text-sm text-white">{t.title}</div>
                      <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                        {t.estimatedMinutes ? `${t.estimatedMinutes}m` : ""}{t.tag ? ` · ${t.tag}` : ""}
                      </div>
                    </div>
                    {t.xp ? <span className="font-mono text-xs text-[oklch(0.83_0.16_85)]">+{t.xp} XP</span> : null}
                  </motion.li>
                ))}
              </ul>
            )}
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard glow="cyan">
            <CardHeader
              eyebrow="Upcoming"
              title="Events"
              right={<Link to="/calendar" className="font-mono text-[10px] uppercase tracking-widest text-white/50 hover:text-white">Open →</Link>}
            />
            {upcomingEvents.length === 0 ? (
              <EmptyRow to="/calendar" cta="Add an event" />
            ) : (
              <ul className="space-y-2">
                {upcomingEvents.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-2 rounded-md border border-white/5 bg-white/[0.03] px-3 py-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm text-white">{e.title}</div>
                      <div className="font-mono text-[10px] uppercase tracking-widest text-white/45">
                        <CalendarDays className="mr-1 inline-block h-3 w-3" />
                        {e.date}
                      </div>
                    </div>
                    <CountdownLabel date={e.date} />
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>

          <GlassCard glow="emerald">
            <CardHeader eyebrow="Goals" title="Progress" right={<Link to="/goals" className="font-mono text-[10px] uppercase tracking-widest text-white/50 hover:text-white">Open →</Link>} />
            {goals.length === 0 ? (
              <EmptyRow to="/goals" cta="Set a goal" />
            ) : (
              <div className="space-y-4">
                {goals.slice(0, 4).map((g) => (
                  <ProgressBar key={g.id} label={g.title} value={Number(g.progress) || 0} right={`${Number(g.progress) || 0}%`} accent="emerald" />
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}

function ChartCard({
  title, eyebrow, color, children,
}: {
  title: string;
  eyebrow: string;
  color: "blue" | "cyan" | "gold" | "emerald";
  children: React.ReactNode;
}) {
  return (
    <GlassCard glow={color} className="p-5">
      <div className="mb-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">{eyebrow}</div>
        <div className="mt-1 text-lg font-semibold text-white">{title}</div>
      </div>
      <div className="h-56">{children}</div>
    </GlassCard>
  );
}

function ChartTip(props: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (!props.active || !props.payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-[#0b1024]/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
      <div className="font-mono text-[10px] uppercase tracking-widest text-white/50">{props.label}</div>
      {props.payload.map((p) => (
        <div key={p.name} className="mt-1 flex items-center gap-2 text-white">
          <span className="capitalize text-white/60">{p.name}</span>
          <span className="font-mono">{Number(p.value).toFixed(p.name === "hours" ? 1 : 0)}</span>
        </div>
      ))}
    </div>
  );
}

function buildWeekly(tasks: Task[], study: Study[]) {
  const days: { key: string; label: string; date: Date }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ key, label: d.toLocaleDateString(undefined, { weekday: "short" }), date: d });
  }

  return days.map((d) => {
    const dayTasks = tasks.filter((t) => t.done && t.completedAt && sameDay(new Date(t.completedAt), d.date));
    const dayStudy = study.filter((s) => s.date === d.key);
    const tasksCount = dayTasks.length;
    const xp = dayTasks.reduce((acc, t) => acc + (Number(t.xp) || 0), 0);
    const productiveMin =
      dayStudy.reduce((s, x) => s + (Number(x.minutes) || 0), 0) +
      dayTasks.reduce((s, t) => s + (Number(t.estimatedMinutes) || 0), 0);
    return {
      label: d.label,
      tasks: tasksCount,
      xp,
      hours: Number((productiveMin / 60).toFixed(1)),
    };
  });
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getGreeting(h: number) {
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
