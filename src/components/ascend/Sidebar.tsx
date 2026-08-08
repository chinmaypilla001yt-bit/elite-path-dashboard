import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Map, ListChecks, CalendarDays, Flame, BookOpen,
  Code2, Sigma, Brain, FolderGit2, Briefcase, FileText, Trophy,
  NotebookPen, BarChart3, Settings, Rocket, Target, LogOut, Bell, Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { useNotifications } from "@/hooks/use-notifications";
import { toast } from "sonner";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/roadmap", label: "Roadmap", icon: Map },
  { to: "/tasks", label: "Tasks", icon: ListChecks },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/habits", label: "Habits", icon: Flame },
  { to: "/study", label: "Study Tracker", icon: BookOpen },
  { to: "/cp", label: "Competitive", icon: Code2 },
  { to: "/math", label: "Mathematics", icon: Sigma },
  { to: "/ai", label: "AI & ML", icon: Brain },
  { to: "/projects", label: "Projects", icon: FolderGit2 },
  { to: "/internships", label: "Internships", icon: Briefcase },
  { to: "/career", label: "Career Hub", icon: FileText },
  { to: "/leaderboard", label: "Leaderboard", icon: Crown },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/journal", label: "Journal", icon: NotebookPen },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AscendSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, signOut } = useAuth();
  const { stats, displayName } = useProfile();
  const { unread } = useNotifications();



  async function handleSignOut() {
    try {
      await signOut();
    } catch {
      toast.error("Sign out failed");
    }
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col border-r border-white/5 bg-[#050816]/70 backdrop-blur-xl lg:flex">
      <div className="flex items-center gap-2 px-5 pt-6 pb-4">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[image:var(--gradient-cyber)] shadow-[var(--shadow-glow)]">
          <Rocket className="h-4 w-4 text-white" />
        </div>
        <div className="leading-tight">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/50">
            Mission Control
          </div>
          <div className="text-lg font-semibold tracking-tight text-gradient">Ascend</div>
        </div>
      </div>

      <nav className="mt-2 flex-1 space-y-0.5 overflow-y-auto px-2 pb-6">
        {nav.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to as never}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 transition-all",
                "hover:bg-white/[0.04] hover:text-white",
                active && "bg-white/[0.06] text-white",
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r bg-[image:var(--gradient-cyber)] shadow-[0_0_12px_oklch(0.72_0.2_255/0.9)]" />
              )}
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  active ? "text-white" : "text-white/50 group-hover:text-white/80",
                )}
              />
              <span className="truncate">{item.label}</span>
              {item.to === "/notifications" && unread > 0 && (
                <span className="ml-auto rounded-full bg-[image:var(--gradient-cyber)] px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-[var(--shadow-glow)]">
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mx-3 mb-4 rounded-xl border border-white/5 bg-white/[0.03] p-3">
        <div className="flex items-center gap-2">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
          ) : (
            <div className="h-8 w-8 shrink-0 rounded-full bg-[image:var(--gradient-cyber)]" />
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-white">{displayName}</div>
            <div className="truncate font-mono text-[10px] uppercase tracking-widest text-white/50">
              Lv {stats.level} · {stats.xp} XP
            </div>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="rounded-md p-1.5 text-white/50 transition hover:bg-white/[0.06] hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
