import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, Square, Plus, Trash2, RotateCcw, Bell } from "lucide-react";
import { AppShell } from "@/components/ascend/AppShell";
import { PageHeader } from "@/components/ascend/PageHeader";
import { GlassCard } from "@/components/ascend/GlassCard";
import { useLocalCollection } from "@/hooks/use-local-collection";
import { toast } from "sonner";
import { CategorySelect } from "@/components/ascend/CategorySelect";

export const Route = createFileRoute("/study")({
  head: () => ({
    meta: [
      { title: "Study Timer · Ascend" },
      { name: "description", content: "Multiple concurrent countdown timers. Completed sessions auto-log." },
    ],
  }),
  component: StudyPage,
});

type TimerStatus = "idle" | "running" | "paused" | "completed";

type Timer = {
  id: string;
  subject: string;
  plannedMinutes: number;
  elapsedMs: number;
  lastStartAt: number; // 0 when not running
  status: TimerStatus;
};

type Session = {
  id: string;
  subject: string;
  minutes: number;
  date: string;
  notes?: string;
};

function StudyPage() {
  const timers = useLocalCollection<Timer>("study-timers");
  const sessions = useLocalCollection<Session>("study");
  const [now, setNow] = useState(Date.now());
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ subject: "", plannedMinutes: 25 });

  // Tick every second while any timer is running
  useEffect(() => {
    const hasRunning = timers.items.some((t) => t.status === "running");
    if (!hasRunning) return;
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [timers.items]);

  // Ask for notification permission once
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "default") {
      // Non-blocking; ignore result
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // Auto-complete when any timer hits zero
  useEffect(() => {
    for (const t of timers.items) {
      if (t.status !== "running") continue;
      const remaining = remainingMs(t, now);
      if (remaining <= 0) {
        const actualMinutes = Math.max(1, Math.round(t.plannedMinutes));
        // Prevent double-completion race: mark completed & log session
        timers.update(t.id, {
          status: "completed",
          elapsedMs: t.plannedMinutes * 60_000,
          lastStartAt: 0,
        } as Partial<Timer>);
        sessions.add({
          subject: t.subject,
          minutes: actualMinutes,
          date: new Date().toISOString().slice(0, 10),
        } as Omit<Session, "id">);
        toast.success(`Session complete · ${t.subject}`, { description: `+${actualMinutes} min logged` });
        try {
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Ascend · Study session complete", {
              body: `${t.subject} — ${actualMinutes} min`,
            });
          }
        } catch {}
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now]);

  function newTimer() {
    if (!draft.subject.trim()) return;
    timers.add({
      subject: draft.subject.trim(),
      plannedMinutes: Math.max(1, Number(draft.plannedMinutes) || 25),
      elapsedMs: 0,
      lastStartAt: 0,
      status: "idle",
    } as Omit<Timer, "id">);
    setDraft({ subject: "", plannedMinutes: 25 });
    setShowForm(false);
  }

  function start(t: Timer) {
    timers.update(t.id, { status: "running", lastStartAt: Date.now() } as Partial<Timer>);
  }
  function pause(t: Timer) {
    if (t.status !== "running") return;
    const add = Date.now() - t.lastStartAt;
    timers.update(t.id, {
      status: "paused",
      elapsedMs: (t.elapsedMs || 0) + add,
      lastStartAt: 0,
    } as Partial<Timer>);
  }
  function resume(t: Timer) {
    timers.update(t.id, { status: "running", lastStartAt: Date.now() } as Partial<Timer>);
  }
  function stop(t: Timer) {
    const runningAdd = t.status === "running" ? Date.now() - t.lastStartAt : 0;
    const totalMs = (t.elapsedMs || 0) + runningAdd;
    const minutes = Math.max(0, Math.round(totalMs / 60_000));
    if (minutes > 0) {
      sessions.add({
        subject: t.subject,
        minutes,
        date: new Date().toISOString().slice(0, 10),
      } as Omit<Session, "id">);
      toast.success(`Stopped · ${t.subject}`, { description: `+${minutes} min logged` });
    }
    timers.remove(t.id);
  }
  function reset(t: Timer) {
    timers.update(t.id, { status: "idle", elapsedMs: 0, lastStartAt: 0 } as Partial<Timer>);
  }

  const totalToday = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return sessions.items.filter((s) => s.date === today).reduce((s, x) => s + (Number(x.minutes) || 0), 0);
  }, [sessions.items]);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Deep work"
        title="Study Timer"
        description="Create multiple countdown timers. Each runs independently. Completions auto-log."
        actions={
          <button
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg bg-[image:var(--gradient-cyber)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> New timer
          </button>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <StatPill label="Today" value={`${totalToday}m`} />
        <StatPill label="Active" value={timers.items.filter((t) => t.status === "running").length.toString()} />
        <StatPill label="Sessions" value={sessions.items.length.toString()} />
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mb-6">
            <GlassCard glow="blue" className="p-5">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                <CategorySelect
                  placeholder="Subject / category…"
                  value={draft.subject}
                  onChange={(v) => setDraft({ ...draft, subject: v })}
                />
                <input
                  type="number"
                  min={1}
                  className="w-32 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
                  placeholder="Minutes"
                  value={draft.plannedMinutes}
                  onChange={(e) => setDraft({ ...draft, plannedMinutes: Number(e.target.value) })}
                />
                <button
                  onClick={newTimer}
                  className="rounded-lg bg-[image:var(--gradient-cyber)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow)]"
                >
                  Create
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {timers.hydrated && timers.items.length === 0 ? (
        <GlassCard glow="blue" className="flex flex-col items-center justify-center p-16 text-center">
          <Bell className="h-8 w-8 text-white/60" />
          <div className="mt-4 text-lg font-semibold text-white">No timers running</div>
          <p className="mt-2 max-w-md text-sm text-white/60">
            Create a timer above. When it hits zero, we'll notify you and log the session automatically.
          </p>
        </GlassCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {timers.items.map((t) => (
              <TimerCard
                key={t.id}
                timer={t}
                now={now}
                onStart={() => start(t)}
                onPause={() => pause(t)}
                onResume={() => resume(t)}
                onStop={() => stop(t)}
                onReset={() => reset(t)}
                onDelete={() => timers.remove(t.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {sessions.items.length > 0 && (
        <div className="mt-10">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
            Recent sessions · {sessions.items.length}
          </div>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {sessions.items.slice(0, 12).map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] p-3">
                <div>
                  <div className="text-sm text-white">{s.subject}</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">{s.date}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-white/70">{s.minutes}m</span>
                  <button onClick={() => sessions.remove(s.id)} className="rounded-md p-1 text-white/40 hover:text-red-300">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}

function TimerCard({
  timer, now, onStart, onPause, onResume, onStop, onReset, onDelete,
}: {
  timer: Timer;
  now: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset: () => void;
  onDelete: () => void;
}) {
  const remaining = remainingMs(timer, now);
  const total = timer.plannedMinutes * 60_000;
  const progress = total === 0 ? 0 : Math.min(100, Math.max(0, ((total - remaining) / total) * 100));
  const glow: "blue" | "purple" | "emerald" =
    timer.status === "running" ? "blue" : timer.status === "completed" ? "emerald" : "purple";

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}>
      <GlassCard glow={glow} className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
              {statusLabel(timer.status)}
            </div>
            <div className="mt-1 text-lg font-semibold text-white">{timer.subject}</div>
          </div>
          <button
            onClick={onDelete}
            className="rounded-md p-1.5 text-white/40 hover:bg-white/[0.06] hover:text-red-300"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-5 flex items-baseline gap-2 font-mono">
          <span className="text-5xl font-semibold tracking-tight text-white">{fmtCountdown(remaining)}</span>
          <span className="text-xs text-white/50">/ {timer.plannedMinutes}m</span>
        </div>

        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
          <motion.div
            className="h-full bg-[image:var(--gradient-cyber)] shadow-[0_0_16px_oklch(0.72_0.2_255/0.6)]"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {timer.status === "idle" && (
            <ActionBtn icon={Play} label="Start" onClick={onStart} primary />
          )}
          {timer.status === "running" && (
            <>
              <ActionBtn icon={Pause} label="Pause" onClick={onPause} />
              <ActionBtn icon={Square} label="Stop" onClick={onStop} />
            </>
          )}
          {timer.status === "paused" && (
            <>
              <ActionBtn icon={Play} label="Resume" onClick={onResume} primary />
              <ActionBtn icon={Square} label="Stop" onClick={onStop} />
              <ActionBtn icon={RotateCcw} label="Reset" onClick={onReset} />
            </>
          )}
          {timer.status === "completed" && (
            <ActionBtn icon={RotateCcw} label="Reset" onClick={onReset} primary />
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}

function ActionBtn({
  icon: Icon, label, onClick, primary,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
        primary
          ? "bg-[image:var(--gradient-cyber)] text-white shadow-[var(--shadow-glow)] hover:opacity-90"
          : "border border-white/10 bg-white/[0.03] text-white/80 hover:bg-white/[0.06] hover:text-white"
      }`}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-3 pr-4">
      <span className="font-mono text-[10px] uppercase tracking-widest text-white/45">{label}</span>
      <span className="text-xs font-semibold text-white">{value}</span>
    </div>
  );
}

function remainingMs(t: Timer, now: number): number {
  const running = t.status === "running";
  const runningAdd = running ? Math.max(0, now - t.lastStartAt) : 0;
  const elapsed = (t.elapsedMs || 0) + runningAdd;
  return Math.max(0, t.plannedMinutes * 60_000 - elapsed);
}

function fmtCountdown(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(r)}` : `${pad(m)}:${pad(r)}`;
}

function statusLabel(s: TimerStatus) {
  return s === "idle" ? "Ready" : s === "running" ? "Running" : s === "paused" ? "Paused" : "Complete";
}
