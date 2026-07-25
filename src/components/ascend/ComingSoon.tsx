import { AppShell } from "./AppShell";
import { PageHeader } from "./PageHeader";
import { GlassCard } from "./GlassCard";
import { Sparkles } from "lucide-react";

export function ComingSoon({ title, description, eyebrow }: { title: string; description: string; eyebrow: string }) {
  return (
    <AppShell>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <GlassCard glow="purple" className="flex flex-col items-center justify-center p-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[image:var(--gradient-cyber)] shadow-[var(--shadow-glow)] animate-float">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div className="mt-5 text-xl font-semibold text-white">Module deploying soon</div>
        <p className="mt-2 max-w-md text-sm text-white/60">
          This surface is scaffolded and ready. Wire in data next — cloud, auth, real trackers.
        </p>
      </GlassCard>
    </AppShell>
  );
}
