import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Map, ListChecks, CalendarDays, Flame, BookOpen,
  Code2, Sigma, Brain, FolderGit2, Briefcase, FileText, Trophy,
  NotebookPen, BarChart3, Settings, Rocket, Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  { to: "/resume", label: "Resume", icon: FileText },
  { to: "/achievements", label: "Achievements", icon: Trophy },
  { to: "/journal", label: "Journal", icon: NotebookPen },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AscendSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

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
            </Link>
          );
        })}
      </nav>

      <div className="mx-3 mb-4 rounded-xl border border-white/5 bg-white/[0.03] p-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 shrink-0 rounded-full bg-[image:var(--gradient-cyber)]" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-white">Ascending</div>
            <div className="truncate font-mono text-[10px] uppercase tracking-widest text-white/50">
              Local mode
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
