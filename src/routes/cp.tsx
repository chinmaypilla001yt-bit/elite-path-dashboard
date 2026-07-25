import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/ascend/AppShell";
import { PageHeader } from "@/components/ascend/PageHeader";
import { GlassCard } from "@/components/ascend/GlassCard";
import { StatCard } from "@/components/ascend/StatCard";
import { ProgressBar } from "@/components/ascend/ProgressBar";
import { Code2, Trophy, Zap, Target } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/cp")({
  head: () => ({
    meta: [
      { title: "Competitive Programming · Ascend" },
      { name: "description", content: "LeetCode, Codeforces, CodeChef, AtCoder stats and progression." },
    ],
  }),
  component: CPPage,
});

const rating = Array.from({ length: 20 }, (_, i) => ({
  c: i + 1, r: 1200 + Math.round(i * 25 + Math.sin(i / 2) * 60 + Math.random() * 30),
}));

function CPPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Competitive"
        title="The Arena"
        description="Rating trajectory, problem breakdown, contest performance."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Code2} label="LeetCode" value="482" hint="Easy 220 · Med 210 · Hard 52" accent="purple" />
        <StatCard icon={Trophy} label="CF Rating" value="1687" hint="Specialist · peak 1712" accent="blue" />
        <StatCard icon={Zap} label="Contests" value="43" hint="Last 90 days" accent="cyan" />
        <StatCard icon={Target} label="Accuracy" value="71%" hint="Div2 avg" accent="emerald" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard glow="blue" className="lg:col-span-2">
          <div className="mb-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">Codeforces</div>
            <div className="mt-1 text-lg font-semibold text-white">Rating history</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rating}>
                <CartesianGrid stroke="oklch(1 0 0 / 0.06)" vertical={false} />
                <XAxis dataKey="c" stroke="oklch(1 0 0 / 0.45)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[1100, "auto"]} stroke="oklch(1 0 0 / 0.45)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#0b1024", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 12 }} />
                <Line type="monotone" dataKey="r" stroke="oklch(0.72 0.2 255)" strokeWidth={2.5} dot={{ r: 3, fill: "oklch(0.72 0.2 255)" }}
                  style={{ filter: "drop-shadow(0 0 8px oklch(0.72 0.2 255 / 0.8))" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard glow="purple">
          <div className="mb-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">Difficulty breakdown</div>
            <div className="mt-1 text-lg font-semibold text-white">LeetCode split</div>
          </div>
          <div className="space-y-4">
            <ProgressBar label="Easy" value={92} right="220 / 240" accent="emerald" />
            <ProgressBar label="Medium" value={65} right="210 / 320" accent="cyber" />
            <ProgressBar label="Hard" value={28} right="52 / 180" accent="gold" />
          </div>
          <div className="mt-6 grid grid-cols-4 gap-2 text-center">
            {["LC", "CF", "CC", "AC"].map((p) => (
              <div key={p} className="rounded-lg border border-white/10 bg-white/[0.03] p-2">
                <div className="font-mono text-[10px] uppercase tracking-widest text-white/50">{p}</div>
                <div className="mt-1 text-sm font-semibold text-white">{p === "LC" ? "482" : p === "CF" ? "312" : p === "CC" ? "88" : "44"}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}
