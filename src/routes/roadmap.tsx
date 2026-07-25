import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Rocket, Sparkles, Cpu, Trophy } from "lucide-react";
import { AppShell } from "@/components/ascend/AppShell";
import { PageHeader } from "@/components/ascend/PageHeader";
import { GlassCard } from "@/components/ascend/GlassCard";
import { ProgressBar } from "@/components/ascend/ProgressBar";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Roadmap · Ascend" },
      { name: "description", content: "The 4-year timeline from fundamentals to elite offers." },
      { property: "og:title", content: "Ascend · 4-Year Roadmap" },
      { property: "og:description", content: "Year-by-year plan to reach Google, Jane Street, Meta, and beyond." },
    ],
  }),
  component: RoadmapPage,
});

const years = [
  {
    year: "Year 1", tag: "Foundations", icon: Rocket, accent: "blue" as const,
    progress: 68,
    items: ["DSA Mastery", "C++ & Python", "Git · Linux", "Competitive Programming", "Math Foundations", "Portfolio v1", "LinkedIn", "Google STEP Prep"],
  },
  {
    year: "Year 2", tag: "Depth", icon: Sparkles, accent: "purple" as const,
    progress: 22,
    items: ["Machine Learning", "Deep Learning", "Backend + Cloud", "Open Source", "Research", "Hackathons"],
  },
  {
    year: "Year 3", tag: "Quant + Systems", icon: Cpu, accent: "cyan" as const,
    progress: 4,
    items: ["Probability & Stats", "Linear Algebra", "Optimization", "System Design", "Jane Street / Google Internship"],
  },
  {
    year: "Year 4", tag: "Offer Season", icon: Trophy, accent: "gold" as const,
    progress: 0,
    items: ["Interview Prep", "Research Portfolio", "Public Speaking", "Leadership", "Full-time Offers"],
  },
];

function RoadmapPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Timeline"
        title="The 4-Year Ascent"
        description="From fundamentals to elite offers. Every quarter, a level up."
      />

      <div className="relative">
        {/* spine */}
        <div className="pointer-events-none absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-[oklch(0.72_0.2_255)] via-[oklch(0.66_0.24_305)] to-[oklch(0.83_0.16_85)] md:left-1/2" />

        <div className="space-y-8">
          {years.map((y, i) => {
            const Icon = y.icon;
            const left = i % 2 === 0;
            return (
              <motion.div
                key={y.year}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5 }}
                className="relative grid gap-4 md:grid-cols-2"
              >
                <div className={left ? "md:pr-10" : "md:col-start-2 md:pl-10"}>
                  <GlassCard glow={y.accent} className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[image:var(--gradient-cyber)]">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/50">{y.tag}</div>
                        <div className="text-xl font-semibold text-white">{y.year}</div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <ProgressBar value={y.progress} label="Completion" right={`${y.progress}%`} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {y.items.map((it) => (
                        <span key={it} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/75">
                          {it}
                        </span>
                      ))}
                    </div>
                  </GlassCard>
                </div>

                {/* node */}
                <div className="absolute left-4 top-6 -translate-x-1/2 md:left-1/2">
                  <div className="h-3 w-3 rounded-full bg-white shadow-[0_0_12px_oklch(0.72_0.2_255)]" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
