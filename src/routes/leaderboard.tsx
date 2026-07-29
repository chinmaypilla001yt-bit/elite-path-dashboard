import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Medal, Search, Clock, Zap, Users, Sparkles } from "lucide-react";
import { AppShell } from "@/components/ascend/AppShell";
import { PageHeader } from "@/components/ascend/PageHeader";
import { GlassCard } from "@/components/ascend/GlassCard";
import { ProgressBar } from "@/components/ascend/ProgressBar";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { xpStats, xpForLevel } from "@/lib/xp";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard · Ascend" },
      { name: "description", content: "Global XP and study leaderboards across all Ascend users." },
      { property: "og:title", content: "Ascend Leaderboard" },
      { property: "og:description", content: "See who's climbing fastest toward elite tech offers." },
    ],
  }),
  component: LeaderboardPage,
});

type UserRow = {
  uid: string;
  displayName?: string | null;
  name?: string | null;
  email?: string | null;
  photoURL?: string | null;
  xp?: number;
  totalStudyHours?: number;
  weeklyStudyHours?: number;
  monthlyStudyHours?: number;
  streak?: number;
};

type Tab = "xp" | "study";
type Timeframe = "all" | "month" | "week";
type Scope = "global" | "friends" | "college";

function LeaderboardPage() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<User | null>(auth.currentUser);
  const [tab, setTab] = useState<Tab>("xp");
  const [timeframe, setTimeframe] = useState<Timeframe>("all");
  const [scope, setScope] = useState<Scope>("global");
  const [q, setQ] = useState("");

  useEffect(() => onAuthStateChanged(auth, setMe), []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const arr: UserRow[] = [];
      snap.forEach((d) => arr.push({ ...(d.data() as UserRow), uid: d.id }));
      setRows(arr);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const sorted = useMemo(() => {
    const filtered = rows.filter((r) => {
      if (!q.trim()) return true;
      const term = q.toLowerCase();
      return (
        (r.name || "").toLowerCase().includes(term) ||
        (r.displayName || "").toLowerCase().includes(term) ||
        (r.email || "").toLowerCase().includes(term)
      );
    });
    const key: (r: UserRow) => number =
      tab === "xp"
        ? (r) => Number(r.xp) || 0
        : timeframe === "week"
          ? (r) => Number(r.weeklyStudyHours) || 0
          : timeframe === "month"
            ? (r) => Number(r.monthlyStudyHours) || 0
            : (r) => Number(r.totalStudyHours) || 0;
    return [...filtered].sort((a, b) => key(b) - key(a));
  }, [rows, q, tab, timeframe]);

  const myRow = sorted.find((r) => r.uid === me?.uid);
  const myIndex = myRow ? sorted.indexOf(myRow) : -1;
  const nextUp = myIndex > 0 ? sorted[myIndex - 1] : null;
  const myStats = xpStats(Number(myRow?.xp) || 0);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Global"
        title="Leaderboard"
        description="Compete with every Ascend user. Rankings update in real time."
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <GlassCard glow="gold" className="p-5">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/50">
            <Trophy className="h-3.5 w-3.5" /> Your rank
          </div>
          <div className="mt-2 text-3xl font-semibold text-white">
            {myIndex >= 0 ? `#${myIndex + 1}` : "—"}
          </div>
          <div className="mt-1 text-xs text-white/50">
            of {sorted.length} {tab === "xp" ? "by XP" : `by ${timeframe} study`}
          </div>
        </GlassCard>
        <GlassCard glow="blue" className="p-5">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/50">
            <Zap className="h-3.5 w-3.5" /> Progress to next rank
          </div>
          {nextUp ? (
            <>
              <div className="mt-2 text-sm text-white">
                Catch <span className="font-semibold">{displayNameOf(nextUp)}</span>
              </div>
              <div className="mt-2 text-xs text-white/50">
                {tab === "xp"
                  ? `${(Number(nextUp.xp) || 0) - (Number(myRow?.xp) || 0)} XP to go`
                  : `${((Number(currentStudy(nextUp, timeframe)) || 0) - (Number(currentStudy(myRow, timeframe)) || 0)).toFixed(1)}h to go`}
              </div>
              <div className="mt-3">
                <ProgressBar
                  value={
                    tab === "xp"
                      ? Math.min(100, ((Number(myRow?.xp) || 0) / (Number(nextUp.xp) || 1)) * 100)
                      : Math.min(
                          100,
                          ((Number(currentStudy(myRow, timeframe)) || 0) /
                            (Number(currentStudy(nextUp, timeframe)) || 1)) * 100,
                        )
                  }
                />
              </div>
            </>
          ) : (
            <div className="mt-2 text-sm text-white/60">
              {myIndex === 0 ? "You're #1 — keep climbing." : "Start logging to enter the ranks."}
            </div>
          )}
        </GlassCard>
        <GlassCard glow="purple" className="p-5">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/50">
            <Sparkles className="h-3.5 w-3.5" /> Your level
          </div>
          <div className="mt-2 text-3xl font-semibold text-white">Lv {myStats.level}</div>
          <div className="mt-3"><ProgressBar value={myStats.progress} /></div>
          <div className="mt-1 text-xs text-white/50">
            {myStats.remaining} XP to Lv {myStats.level + 1}
          </div>
        </GlassCard>
      </div>

      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg border border-white/10 bg-white/[0.03] p-1">
          <TabBtn active={tab === "xp"} onClick={() => setTab("xp")}>
            <Zap className="h-3.5 w-3.5" /> XP
          </TabBtn>
          <TabBtn active={tab === "study"} onClick={() => setTab("study")}>
            <Clock className="h-3.5 w-3.5" /> Study
          </TabBtn>
        </div>

        {tab === "study" && (
          <div className="inline-flex rounded-lg border border-white/10 bg-white/[0.03] p-1">
            {(["all", "month", "week"] as const).map((t) => (
              <TabBtn key={t} active={timeframe === t} onClick={() => setTimeframe(t)}>
                {t === "all" ? "All time" : t === "month" ? "This month" : "This week"}
              </TabBtn>
            ))}
          </div>
        )}

        <div className="inline-flex rounded-lg border border-white/10 bg-white/[0.03] p-1">
          {(["global", "friends", "college"] as const).map((s) => (
            <TabBtn
              key={s}
              active={scope === s}
              onClick={() => setScope(s)}
              title={s !== "global" ? "Coming soon" : undefined}
            >
              <Users className="h-3.5 w-3.5" />
              {s[0].toUpperCase() + s.slice(1)}
            </TabBtn>
          ))}
        </div>

        <div className="ml-auto relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search users…"
            className="w-56 rounded-lg border border-white/10 bg-white/[0.03] py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
          />
        </div>
      </div>

      {scope !== "global" && (
        <GlassCard className="mb-4 p-4">
          <div className="text-sm text-white/70">
            {scope === "friends" ? "Friends" : "College"} leaderboards are coming soon. Showing global for now.
          </div>
        </GlassCard>
      )}

      <GlassCard glow="blue" className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-white/50">Loading rankings…</div>
        ) : sorted.length === 0 ? (
          <div className="p-10 text-center text-sm text-white/50">No users yet.</div>
        ) : (
          <ul className="divide-y divide-white/5">
            <AnimatePresence initial={false}>
              {sorted.map((r, i) => {
                const rank = i + 1;
                const isMe = r.uid === me?.uid;
                const xp = Number(r.xp) || 0;
                const lv = xpStats(xp).level;
                const value =
                  tab === "xp"
                    ? `${xp.toLocaleString()} XP`
                    : `${(Number(currentStudy(r, timeframe)) || 0).toFixed(1)}h`;
                return (
                  <motion.li
                    key={r.uid}
                    layout
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3 sm:px-5",
                      isMe && "bg-[image:linear-gradient(90deg,oklch(0.72_0.2_255/0.14),transparent_70%)] ring-1 ring-inset ring-white/10",
                    )}
                  >
                    <RankBadge rank={rank} />
                    <Avatar user={r} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="truncate text-sm font-medium text-white">
                          {displayNameOf(r)}
                        </div>
                        {isMe && (
                          <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-white/70">
                            You
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-white/45">
                        Lv {lv}
                        {tab === "study" && r.weeklyStudyHours != null && (
                          <> · {r.weeklyStudyHours.toFixed(1)}h this week</>
                        )}
                        {tab === "xp" && r.streak != null && r.streak > 0 && (
                          <> · 🔥 {r.streak}-day streak</>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-sm font-semibold text-white">
                      {value}
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </GlassCard>
    </AppShell>
  );
}

function currentStudy(r: UserRow | undefined, t: Timeframe) {
  if (!r) return 0;
  if (t === "week") return r.weeklyStudyHours ?? 0;
  if (t === "month") return r.monthlyStudyHours ?? 0;
  return r.totalStudyHours ?? 0;
}

function displayNameOf(r: UserRow) {
  return r.name?.trim() || r.displayName || r.email?.split("@")[0] || "Ascending";
}

function TabBtn({
  active,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      {...rest}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition",
        active ? "bg-white/10 text-white" : "text-white/60 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <motion.div
        animate={{ y: [0, -2, 0], rotate: [0, -3, 3, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_20%,oklch(0.93_0.16_85),oklch(0.7_0.18_60))] text-lg shadow-[0_0_18px_oklch(0.83_0.16_85/0.6)]"
        title="Gold — Rank #1"
      >
        <Trophy className="h-4 w-4 text-white" />
      </motion.div>
    );
  if (rank === 2)
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_20%,oklch(0.9_0.02_260),oklch(0.68_0.02_260))] shadow-[0_0_12px_oklch(0.8_0.02_260/0.5)]">
        <Medal className="h-4 w-4 text-white" />
      </div>
    );
  if (rank === 3)
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_20%,oklch(0.75_0.14_50),oklch(0.55_0.12_45))] shadow-[0_0_12px_oklch(0.65_0.14_50/0.5)]">
        <Medal className="h-4 w-4 text-white" />
      </div>
    );
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] font-mono text-xs text-white/60">
      {rank}
    </div>
  );
}

function Avatar({ user }: { user: UserRow }) {
  if (user.photoURL) {
    return <img src={user.photoURL} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />;
  }
  return <div className="h-9 w-9 shrink-0 rounded-full bg-[image:var(--gradient-cyber)]" />;
}

// silence unused import warning in some bundlers
void xpForLevel;
