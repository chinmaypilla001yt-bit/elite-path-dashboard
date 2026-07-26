import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/ascend/AppShell";
import { PageHeader } from "@/components/ascend/PageHeader";
import { GlassCard } from "@/components/ascend/GlassCard";
import { useLocalState, clearAllAscendData } from "@/hooks/use-local-collection";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · Ascend" },
      { name: "description", content: "Your name, preferences, and data controls." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [name, setName] = useLocalState<string>("profile:name", "");

  function reset() {
    if (!confirm("Delete ALL local data? This cannot be undone.")) return;
    clearAllAscendData();
    toast.success("All data cleared");
  }

  return (
    <AppShell>
      <PageHeader eyebrow="Preferences" title="Settings" description="This app stores everything locally in your browser." />

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard glow="blue" className="p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">Profile</div>
          <div className="mt-1 text-lg font-semibold text-white">Your name</div>
          <p className="mt-2 text-sm text-white/60">Shown in the greeting on your dashboard.</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Chinmay"
            className="mt-4 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
          />
        </GlassCard>

        <GlassCard glow="gold" className="p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">Danger zone</div>
          <div className="mt-1 flex items-center gap-2 text-lg font-semibold text-white">
            <AlertTriangle className="h-4 w-4 text-[oklch(0.83_0.16_85)]" /> Reset all data
          </div>
          <p className="mt-2 text-sm text-white/60">
            Erases every task, habit, goal, journal entry, roadmap year, and everything else you've saved locally.
          </p>
          <button
            onClick={reset}
            className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/20"
          >
            Delete everything
          </button>
        </GlassCard>
      </div>
    </AppShell>
  );
}
