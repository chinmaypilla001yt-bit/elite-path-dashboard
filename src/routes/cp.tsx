import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/ascend/AppShell";
import { PageHeader } from "@/components/ascend/PageHeader";
import { GlassCard } from "@/components/ascend/GlassCard";
import { StatCard } from "@/components/ascend/StatCard";
import { Code2, Trophy, Zap, Target } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { EditableList } from "@/components/ascend/EditableList";
import { useLocalCollection } from "@/hooks/use-local-collection";

export const Route = createFileRoute("/cp")({
  head: () => ({
    meta: [
      { title: "Competitive Programming · Ascend" },
      { name: "description", content: "Track contests, ratings, and problems solved." },
    ],
  }),
  component: CPPage,
});

type Contest = {
  id: string;
  platform: string;
  name: string;
  date: string;
  rating: number;
  solved: number;
  notes: string;
};

function CPPage() {
  const { items } = useLocalCollection<Contest>("cp-contests");
  const sorted = [...items].sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  const chart = sorted.map((c, i) => ({ c: i + 1, r: Number(c.rating) || 0, label: c.name }));
  const latest = sorted[sorted.length - 1];
  const totalSolved = items.reduce((s, c) => s + (Number(c.solved) || 0), 0);
  const cf = items.filter((c) => c.platform === "Codeforces").sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  const cfLatest = cf[cf.length - 1];

  return (
    <AppShell>
      <PageHeader
        eyebrow="Competitive"
        title="The Arena"
        description="Log every contest. Watch your rating climb."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Trophy} label="Contests" value={items.length.toString()} hint="Logged" accent="blue" />
        <StatCard icon={Code2} label="Problems solved" value={totalSolved.toString()} hint="Across all platforms" accent="purple" />
        <StatCard icon={Zap} label="Latest rating" value={latest?.rating ? String(latest.rating) : "—"} hint={latest?.platform ?? "log a contest"} accent="cyan" />
        <StatCard icon={Target} label="CF peak" value={cfLatest?.rating ? String(Math.max(...cf.map((c) => Number(c.rating) || 0))) : "—"} hint="Codeforces" accent="emerald" />
      </div>

      {items.length > 0 && (
        <GlassCard glow="blue" className="mb-8 p-5">
          <div className="mb-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">Rating history</div>
            <div className="mt-1 text-lg font-semibold text-white">Across all logged contests</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart}>
                <CartesianGrid stroke="oklch(1 0 0 / 0.06)" vertical={false} />
                <XAxis dataKey="c" stroke="oklch(1 0 0 / 0.45)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(1 0 0 / 0.45)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#0b1024", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 12 }} />
                <Line type="monotone" dataKey="r" stroke="oklch(0.72 0.2 255)" strokeWidth={2.5} dot={{ r: 3, fill: "oklch(0.72 0.2 255)" }}
                  style={{ filter: "drop-shadow(0 0 8px oklch(0.72 0.2 255 / 0.8))" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}

      <EditableList
        embed
        storageKey="cp-contests"
        eyebrow="Log"
        title="Contests"
        description="Add each contest. Ratings feed the chart above."
        itemLabel="contest"
        glow="purple"
        fields={[
          { name: "platform", label: "Platform", type: "select", required: true, options: ["Codeforces", "LeetCode", "AtCoder", "CodeChef", "Other"] },
          { name: "name", label: "Contest name", required: true, placeholder: "Round 900" },
          { name: "date", label: "Date", type: "date" },
          { name: "rating", label: "Rating after", type: "number" },
          { name: "solved", label: "Problems solved", type: "number" },
          { name: "notes", label: "Notes", type: "textarea" },
        ]}
        renderItem={(c) => (
          <>
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/45">
              {(c.platform as string) || "contest"}{c.date ? ` · ${c.date}` : ""}
            </div>
            <div className="mt-1 text-lg font-semibold text-white">{c.name as string}</div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {c.rating ? <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-white/80">Rating {c.rating as number}</span> : null}
              {c.solved ? <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-white/80">{c.solved as number} solved</span> : null}
            </div>
            {c.notes ? <p className="mt-2 text-sm text-white/60">{c.notes as string}</p> : null}
          </>
        )}
      />
    </AppShell>
  );
}
