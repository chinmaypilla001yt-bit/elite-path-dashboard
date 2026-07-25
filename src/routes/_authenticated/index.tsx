import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Flame, Zap, Trophy, Clock, Target, Sparkles, TrendingUp, BookOpen,
  Code2, Sigma, Github, Activity, Droplets, Moon,
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, AreaChart, Area,
} from "recharts";

import { AppShell } from "@/components/ascend/AppShell";
import { StatCard } from "@/components/ascend/StatCard";
import { GlassCard } from "@/components/ascend/GlassCard";
import { RingProgress } from "@/components/ascend/RingProgress";
import { ProgressBar } from "@/components/ascend/ProgressBar";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Ascend — Mission Control" },
      { name: "description", content: "Chinmay's 4-year journey dashboard to the world's top tech companies. Track XP, streaks, deep work, and progress in one futuristic HUD." },
      { property: "og:title", content: "Ascend — Mission Control" },
      { property: "og:description", content: "A futuristic AI-powered productivity HUD for elite engineers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const weekHours = [
  { d: "Mon", h: 6.2 }, { d: "Tue", h: 7.8 }, { d: "Wed", h: 5.4 },
  { d: "Thu", h: 8.1 }, { d: "Fri", h: 6.9 }, { d: "Sat", h: 9.4 }, { d: "Sun", h: 7.2 },
];
const xpTrend = Array.from({ length: 14 }, (_, i) => ({
  d: i, xp: 200 + Math.round(Math.sin(i / 2) * 60 + i * 22 + Math.random() * 40),
}));
const skills = [
  { s: "DSA", v: 82 }, { s: "Math", v: 68 }, { s: "ML", v: 54 },
  { s: "Systems", v: 45 }, { s: "CP", v: 74 }, { s: "Research", v: 38 },
];

function Dashboard() {
  const greeting = getGreeting();
  return (
    <AppShell>
      {/* Hero */}
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
              Mission Control · Day 214
            </div>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {greeting},{" "}
              <span className="text-gradient">Chinmay</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm text-white/60">
              Today's mission: 4h deep work · 30 CP problems · 1 research paper.
              You're on a <span className="text-white">28-day streak</span>. Stay ruthless.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Pill icon={Flame} label="Streak" value="28 days" tone="gold" />
              <Pill icon={Zap} label="XP" value="12,480" tone="blue" />
              <Pill icon={Trophy} label="Level" value="12" tone="purple" />
              <Pill icon={Clock} label="Today" value="3h 42m" tone="cyan" />
              <Pill icon={Target} label="Goal" value="Google STEP" tone="emerald" />
            </div>

            <div className="mt-6 flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] p-3 text-sm">
              <Sparkles className="h-4 w-4 shrink-0 text-[oklch(0.83_0.16_85)]" />
              <p className="text-white/80">
                <span className="text-white">"</span>Discipline equals freedom. Show up, especially when you don't feel like it.<span className="text-white">"</span>
              </p>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <RingProgress value={72} label="Today" sub="4h 20m / 6h" />
          </div>
        </div>
      </motion.section>

      {/* Stats grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Clock} label="Deep Work" value="3h 42m" hint="+38m vs yesterday" accent="blue" delay={0.02} />
        <StatCard icon={Code2} label="LeetCode" value="482" hint="12 solved this week" accent="purple" delay={0.06} />
        <StatCard icon={TrendingUp} label="CF Rating" value="1687" hint="Specialist · +42" accent="cyan" delay={0.1} />
        <StatCard icon={Github} label="Commits" value="14" hint="7-day streak" accent="emerald" delay={0.14} />
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          <GlassCard glow="blue" className="p-6">
            <CardHeader eyebrow="Weekly Study" title="Deep work hours" right={<span className="font-mono text-xs text-white/60">51.0h · 7d</span>} />
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weekHours} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="hourGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.72 0.2 255)" stopOpacity={0.7} />
                      <stop offset="100%" stopColor="oklch(0.66 0.24 305)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="d" stroke="oklch(1 0 0 / 0.4)" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis stroke="oklch(1 0 0 / 0.4)" tickLine={false} axisLine={false} fontSize={11} />
                  <Tooltip
                    contentStyle={{ background: "#0b1024", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 12 }}
                    labelStyle={{ color: "white" }}
                  />
                  <Area type="monotone" dataKey="h" stroke="oklch(0.82 0.14 200)" strokeWidth={2} fill="url(#hourGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <div className="grid gap-6 md:grid-cols-2">
            <GlassCard glow="purple">
              <CardHeader eyebrow="Today's Tasks" title="Focus queue" />
              <ul className="space-y-3">
                {tasks.map((t, i) => (
                  <motion.li
                    key={t.title}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`h-2 w-2 rounded-full ${t.dot}`} />
                      <div>
                        <div className="text-sm text-white">{t.title}</div>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                          {t.tag} · {t.time}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono text-xs text-[oklch(0.83_0.16_85)]">+{t.xp} XP</span>
                  </motion.li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard glow="cyan">
              <CardHeader eyebrow="Skill Radar" title="Growth vector" />
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={skills} outerRadius="75%">
                    <PolarGrid stroke="oklch(1 0 0 / 0.1)" />
                    <PolarAngleAxis dataKey="s" stroke="oklch(1 0 0 / 0.55)" fontSize={11} />
                    <Radar
                      dataKey="v"
                      stroke="oklch(0.66 0.24 305)"
                      fill="oklch(0.66 0.24 305)"
                      fillOpacity={0.35}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>

          <GlassCard>
            <CardHeader eyebrow="XP Momentum" title="Last 14 days" right={<span className="font-mono text-xs text-white/60">+3,240 XP</span>} />
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={xpTrend} margin={{ top: 6, right: 10, left: -30, bottom: 0 }}>
                  <XAxis dataKey="d" hide />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ background: "#0b1024", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 12 }}
                  />
                  <Line
                    type="monotone" dataKey="xp"
                    stroke="oklch(0.83 0.16 85)" strokeWidth={2.5} dot={false}
                    style={{ filter: "drop-shadow(0 0 6px oklch(0.83 0.16 85 / 0.7))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <GlassCard glow="emerald">
            <CardHeader eyebrow="Weekly Goals" title="Progress" />
            <div className="space-y-4">
              <ProgressBar label="Deep work · 40h" value={78} right="31 / 40h" />
              <ProgressBar label="LeetCode · 30" value={60} right="18 / 30" accent="emerald" />
              <ProgressBar label="Math problems · 100" value={45} right="45 / 100" />
              <ProgressBar label="Research papers · 3" value={66} right="2 / 3" accent="gold" />
            </div>
          </GlassCard>

          <GlassCard glow="gold">
            <CardHeader eyebrow="Wellness" title="Body & mind" />
            <div className="grid grid-cols-2 gap-3">
              <MiniStat icon={Moon} label="Sleep" value="7h 20m" />
              <MiniStat icon={Droplets} label="Water" value="2.4L" />
              <MiniStat icon={Activity} label="Workout" value="45m" />
              <MiniStat icon={BookOpen} label="Reading" value="32m" />
            </div>
          </GlassCard>

          <GlassCard glow="purple">
            <CardHeader eyebrow="Next Boss" title="Google STEP · Apr 2027" />
            <ProgressBar label="Overall readiness" value={41} right="41%" />
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <Stat kv={["Coding", "72%"]} />
              <Stat kv={["Math", "54%"]} />
              <Stat kv={["Resume", "38%"]} />
              <Stat kv={["Behavioral", "21%"]} />
            </div>
          </GlassCard>

          <GlassCard>
            <CardHeader eyebrow="Contribution" title="30-day heatmap" />
            <Heatmap />
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}

/* ---------- helpers ---------- */

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

function MiniStat({
  icon: Icon, label, value,
}: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
      <Icon className="h-4 w-4 text-white/60" />
      <div className="mt-2 font-mono text-[10px] uppercase tracking-widest text-white/45">{label}</div>
      <div className="text-sm font-medium text-white">{value}</div>
    </div>
  );
}

function Stat({ kv }: { kv: [string, string] }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-white/5 bg-white/[0.03] px-2.5 py-1.5">
      <span className="text-white/60">{kv[0]}</span>
      <span className="font-mono text-white">{kv[1]}</span>
    </div>
  );
}

function Heatmap() {
  const days = Array.from({ length: 30 }, () => Math.random());
  return (
    <div className="grid grid-cols-10 gap-1.5">
      {days.map((v, i) => {
        const a = 0.08 + v * 0.9;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.015 }}
            className="aspect-square rounded-[4px]"
            style={{
              background: `oklch(0.72 0.2 255 / ${a})`,
              boxShadow: v > 0.7 ? "0 0 8px oklch(0.72 0.2 255 / 0.8)" : "none",
            }}
          />
        );
      })}
    </div>
  );
}

const tasks = [
  { title: "Solve 5 CF Div2 C problems", tag: "Competitive · Hard", time: "90m", xp: 120, dot: "bg-[oklch(0.66_0.24_305)]" },
  { title: "Finish Linear Algebra Ch. 7", tag: "Math · Medium", time: "60m", xp: 80, dot: "bg-[oklch(0.72_0.2_255)]" },
  { title: "Read 'Attention Is All You Need'", tag: "Research · Hard", time: "75m", xp: 100, dot: "bg-[oklch(0.82_0.14_200)]" },
  { title: "Push project: Ascend v0.2", tag: "Build · Medium", time: "45m", xp: 70, dot: "bg-[oklch(0.75_0.18_155)]" },
];
