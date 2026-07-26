import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/ascend/AppShell";
import { PageHeader } from "@/components/ascend/PageHeader";
import { StatCard } from "@/components/ascend/StatCard";
import { GlassCard } from "@/components/ascend/GlassCard";
import { useLocalCollection } from "@/hooks/use-local-collection";
import { ListChecks, BookOpen, Target, Trophy, Code2, Flame } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics · Ascend" },
      { name: "description", content: "Overview of everything you've logged." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const tasks = useLocalCollection<{ id: string; done?: boolean; xp?: number }>("tasks").items;
  const study = useLocalCollection<{ id: string; minutes?: number }>("study").items;
  const goals = useLocalCollection<{ id: string }>("goals").items;
  const habits = useLocalCollection<{ id: string }>("habits").items;
  const cp = useLocalCollection<{ id: string; solved?: number }>("cp-contests").items;
  const achievements = useLocalCollection<{ id: string }>("achievements").items;

  const doneTasks = tasks.filter((t) => t.done).length;
  const totalMin = study.reduce((s, x) => s + (Number(x.minutes) || 0), 0);
  const xp = tasks.filter((t) => t.done).reduce((s, t) => s + (Number(t.xp) || 0), 0);
  const solved = cp.reduce((s, c) => s + (Number(c.solved) || 0), 0);

  return (
    <AppShell>
      <PageHeader eyebrow="Overview" title="Analytics" description="What you've built, tracked, and shipped." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={ListChecks} label="Tasks completed" value={doneTasks.toString()} hint={`${tasks.length} total`} accent="blue" />
        <StatCard icon={BookOpen} label="Study minutes" value={totalMin.toString()} hint={`${(totalMin / 60).toFixed(1)}h`} accent="purple" />
        <StatCard icon={Target} label="Goals" value={goals.length.toString()} hint="active" accent="emerald" />
        <StatCard icon={Flame} label="Habits" value={habits.length.toString()} hint="tracked" accent="gold" />
        <StatCard icon={Code2} label="CP problems" value={solved.toString()} hint={`${cp.length} contests`} accent="cyan" />
        <StatCard icon={Trophy} label="Achievements" value={achievements.length.toString()} hint="wins" accent="gold" />
      </div>
      <GlassCard className="mt-8 p-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">Total XP</div>
        <div className="mt-2 text-4xl font-semibold text-gradient">{xp}</div>
        <p className="mt-2 text-sm text-white/60">Earned from completing tasks. Keep shipping.</p>
      </GlassCard>
    </AppShell>
  );
}
