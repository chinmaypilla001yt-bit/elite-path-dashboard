import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/ascend/AppShell";
import { PageHeader } from "@/components/ascend/PageHeader";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/career")({
  head: () => ({
    meta: [
      { title: "Career Hub · Ascend" },
      { name: "description", content: "Resume builder, saved resumes, portfolio links, certifications and achievements." },
      { property: "og:title", content: "Career Hub · Ascend" },
      { property: "og:description", content: "Build ATS-ready resumes that stay in sync with your Ascend progress." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CareerLayout,
});

const tabs = [
  { to: "/career", label: "Resume Builder", exact: true },
  { to: "/career/saved", label: "Saved Resumes" },
  { to: "/career/portfolio", label: "Portfolio Links" },
  { to: "/career/certifications", label: "Certifications" },
  { to: "/career/achievements", label: "Achievements" },
  { to: "/career/jobs", label: "Job Applications" },
];

function CareerLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <AppShell>
      <PageHeader
        eyebrow="Career"
        title="Career Hub"
        description="Everything recruiters see — resumes, links, certifications, and wins — in one place."
      />
      <div className="mb-6 flex flex-wrap gap-2 print:hidden">
        {tabs.map((t) => {
          const active = t.exact ? pathname === "/career" || pathname === "/career/" : pathname.startsWith(t.to);
          return (
            <Link
              key={t.to}
              to={t.to as never}
              className={cn(
                "rounded-full border px-4 py-1.5 text-xs font-medium transition",
                active
                  ? "border-white/20 bg-white/[0.09] text-white shadow-[var(--shadow-glow)]"
                  : "border-white/10 bg-white/[0.03] text-white/65 hover:bg-white/[0.06] hover:text-white",
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
      <Outlet />
    </AppShell>
  );
}
