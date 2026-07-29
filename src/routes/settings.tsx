import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/ascend/AppShell";
import { PageHeader } from "@/components/ascend/PageHeader";
import { GlassCard } from "@/components/ascend/GlassCard";
import { useLocalState, clearAllAscendData } from "@/hooks/use-local-collection";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { useNotifications, type NotifSettings } from "@/hooks/use-notifications";
import { AlertTriangle, LogOut, Check, Loader2, X, Bell, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

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
  const [savedName, setSavedName, hydrated] = useLocalState<string>("profile:name", "");
  const { user, signOut } = useAuth();
  const { stats } = useProfile();
  const [busy, setBusy] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (hydrated) setDraftName(savedName);
  }, [hydrated, savedName]);

  const dirty = draftName !== savedName;

  async function handleSave() {
    if (!dirty) return;
    setSaving(true);
    try {
      await setSavedName(draftName);
      toast.success("Profile saved");
    } catch (e) {
      toast.error((e as Error).message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setDraftName(savedName);
  }

  async function reset() {
    if (!confirm("Delete ALL your Ascend data? This cannot be undone.")) return;
    setBusy(true);
    try {
      await clearAllAscendData();
      toast.success("All data cleared");
    } catch (e) {
      toast.error((e as Error).message || "Failed to clear");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <PageHeader eyebrow="Preferences" title="Settings" description="Signed in — data syncs securely to Firebase." />

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard glow="blue" className="p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">Profile</div>
          <div className="mt-1 text-lg font-semibold text-white">Display name</div>
          <p className="mt-2 text-sm text-white/60">Shown in the greeting on your dashboard.</p>
          <input
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            placeholder={user?.displayName || "Chinmay"}
            className="mt-4 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
          />

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={handleCancel}
              disabled={!dirty || saving}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/70 hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
            >
              <X className="h-3.5 w-3.5" /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!dirty || saving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[image:var(--gradient-cyber)] px-4 py-1.5 text-xs font-semibold text-white shadow-[var(--shadow-glow)] transition hover:opacity-90 disabled:opacity-40"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              {saving ? "Saving…" : "Save"}
            </button>
          </div>

          <div className="mt-5 rounded-lg border border-white/5 bg-white/[0.03] p-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/45">Account</div>
            <div className="mt-1 text-sm text-white">{user?.email}</div>
            <div className="mt-2 flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-white/50">
              <span>Level {stats.level}</span>
              <span>·</span>
              <span>{stats.xp} XP</span>
            </div>
            <button
              onClick={() => signOut()}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/80 hover:bg-white/[0.06] hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </GlassCard>

        <GlassCard glow="gold" className="p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">Danger zone</div>
          <div className="mt-1 flex items-center gap-2 text-lg font-semibold text-white">
            <AlertTriangle className="h-4 w-4 text-[oklch(0.83_0.16_85)]" /> Reset all data
          </div>
          <p className="mt-2 text-sm text-white/60">
            Erases every task, habit, goal, journal entry, roadmap year, calendar event, study session, and XP total for your account.
          </p>
          <button
            onClick={reset}
            disabled={busy}
            className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/20 disabled:opacity-50"
          >
            {busy ? "Deleting…" : "Delete everything"}
          </button>
        </GlassCard>
      </div>

      <div className="mt-6">
        <NotificationSettingsCard />
      </div>
    </AppShell>
  );
}

function NotificationSettingsCard() {
  const { settings, updateSettings, permission, requestPermission } = useNotifications();
  const [newTime, setNewTime] = useState("");

  const toggle = (key: keyof NotifSettings) => (e: React.ChangeEvent<HTMLInputElement>) => {
    void updateSettings({ [key]: e.target.checked } as Partial<NotifSettings>);
  };

  async function addTime() {
    const t = newTime.trim();
    if (!/^\d{2}:\d{2}$/.test(t)) {
      toast.error("Use HH:MM (24-hour)");
      return;
    }
    if (settings.reminderTimes.includes(t)) return;
    await updateSettings({ reminderTimes: [...settings.reminderTimes, t].sort() });
    setNewTime("");
  }
  async function removeTime(t: string) {
    await updateSettings({ reminderTimes: settings.reminderTimes.filter((x) => x !== t) });
  }

  const items: { key: keyof NotifSettings; label: string; desc: string }[] = [
    { key: "enabled", label: "Enable notifications", desc: "Master switch for all alerts." },
    { key: "daily", label: "Daily reminder", desc: "Nudges at your configured times." },
    { key: "task", label: "Task reminders", desc: "Pending, high-priority, and overdue." },
    { key: "study", label: "Study reminders", desc: "Session start & completion." },
    { key: "calendar", label: "Calendar events", desc: "Alert before upcoming events." },
    { key: "xp", label: "XP milestones", desc: "Progress toward the next level." },
    { key: "streak", label: "Streak alerts", desc: "Warn when your streak is at risk." },
  ];

  return (
    <GlassCard glow="purple" className="p-6">
      <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">Notifications</div>
      <div className="mt-1 flex items-center gap-2 text-lg font-semibold text-white">
        <Bell className="h-4 w-4" /> Reminders & alerts
      </div>
      <p className="mt-2 text-sm text-white/60">
        Configure what Ascend nudges you about. Changes save automatically.
      </p>

      <div className="mt-4 rounded-lg border border-white/5 bg-white/[0.03] p-3">
        <div className="flex items-center justify-between text-sm">
          <div>
            <div className="text-white">Browser permission</div>
            <div className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-white/45">
              {permission}
            </div>
          </div>
          {permission !== "granted" && permission !== "unsupported" && (
            <button
              onClick={() => void requestPermission()}
              className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/80 hover:bg-white/[0.06] hover:text-white"
            >
              Request
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {items.map((it) => (
          <label
            key={it.key}
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3 hover:bg-white/[0.04]"
          >
            <input
              type="checkbox"
              checked={Boolean(settings[it.key])}
              onChange={toggle(it.key)}
              className="mt-0.5 h-4 w-4 accent-[oklch(0.72_0.2_255)]"
            />
            <div className="min-w-0">
              <div className="text-sm text-white">{it.label}</div>
              <div className="mt-0.5 text-xs text-white/50">{it.desc}</div>
            </div>
          </label>
        ))}
      </div>

      <div className="mt-5">
        <div className="font-mono text-[10px] uppercase tracking-widest text-white/45">
          Daily reminder times
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {settings.reminderTimes.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/80"
            >
              {t}
              <button
                onClick={() => void removeTime(t)}
                className="rounded-full p-0.5 text-white/50 hover:text-red-300"
                title="Remove"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </span>
          ))}
          <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2 py-1">
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-24 bg-transparent text-xs text-white outline-none [color-scheme:dark]"
            />
            <button
              onClick={addTime}
              className="rounded-full p-1 text-white/70 hover:bg-white/[0.06] hover:text-white"
              title="Add time"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
