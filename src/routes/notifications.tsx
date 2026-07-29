import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { Bell, BellOff, Check, CheckCheck, Trash2, X } from "lucide-react";
import { AppShell } from "@/components/ascend/AppShell";
import { PageHeader } from "@/components/ascend/PageHeader";
import { GlassCard } from "@/components/ascend/GlassCard";
import { useNotifications } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications · Ascend" },
      { name: "description", content: "Your reminders, alerts, and streak nudges in one place." },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { items, unread, markRead, markAllRead, remove, clearAll, permission, requestPermission } =
    useNotifications();

  return (
    <AppShell>
      <PageHeader
        eyebrow="Alerts"
        title="Notification Center"
        description={`${unread} unread · ${items.length} total`}
        actions={
          <div className="flex flex-wrap gap-2">
            {permission !== "granted" && (
              <button
                onClick={() => void requestPermission()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/80 hover:bg-white/[0.06] hover:text-white"
              >
                <Bell className="h-3.5 w-3.5" /> Enable browser alerts
              </button>
            )}
            <button
              onClick={() => void markAllRead()}
              disabled={unread === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/80 hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </button>
            <button
              onClick={() => void clearAll()}
              disabled={items.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-200 hover:bg-red-500/20 disabled:opacity-40"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear all
            </button>
          </div>
        }
      />

      {permission === "denied" && (
        <GlassCard className="mb-4 p-4">
          <div className="flex items-center gap-2 text-sm text-white/70">
            <BellOff className="h-4 w-4" /> Browser notifications are blocked. Enable them in site
            settings — Ascend will still show alerts in this page.
          </div>
        </GlassCard>
      )}

      {items.length === 0 ? (
        <GlassCard glow="blue" className="flex flex-col items-center justify-center p-16 text-center">
          <Bell className="h-6 w-6 text-white/40" />
          <div className="mt-3 text-sm text-white/60">You're all caught up.</div>
        </GlassCard>
      ) : (
        <GlassCard glow="blue" className="p-0 overflow-hidden">
          <ul className="divide-y divide-white/5">
            <AnimatePresence initial={false}>
              {items.map((n) => (
                <motion.li
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 sm:px-5",
                    !n.read && "bg-white/[0.03]",
                  )}
                >
                  <div className="mt-0.5 text-lg">{n.icon ?? "🔔"}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-sm font-medium text-white">{n.title}</div>
                      {!n.read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.72_0.2_255)] shadow-[0_0_8px_oklch(0.72_0.2_255)]" />
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-white/60">{n.message}</div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-white/40">
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {!n.read && (
                      <button
                        onClick={() => void markRead(n.id)}
                        title="Mark read"
                        className="rounded-md p-1.5 text-white/50 hover:bg-white/[0.06] hover:text-white"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => void remove(n.id)}
                      title="Delete"
                      className="rounded-md p-1.5 text-white/50 hover:bg-red-500/20 hover:text-red-200"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </GlassCard>
      )}
    </AppShell>
  );
}
