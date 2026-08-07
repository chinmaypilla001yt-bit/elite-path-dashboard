import { useMemo, useState } from "react";
import { RefreshCw, Check } from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "@/components/ascend/GlassCard";
import { useLocalCollection } from "@/hooks/use-local-collection";
import { useCategories } from "@/hooks/use-categories";
import { useProfile } from "@/hooks/use-profile";
import { uid, type ResumeData } from "@/lib/resume";

type Row = { id: string } & Record<string, unknown>;

/** Pulls existing Ascend data into the active resume — opt-in, never forced. */
export function SyncPanel({ edit }: { edit: (fn: (prev: ResumeData) => ResumeData) => void }) {
  const { items: projects } = useLocalCollection<Row>("projects");
  const { items: achievements } = useLocalCollection<Row>("achievements");
  const { items: resumeEntries } = useLocalCollection<Row>("resume");
  const { categories } = useCategories();
  const { profile, user, displayName } = useProfile();

  const certs = useMemo(
    () => resumeEntries.filter((r) => String(r.kind ?? "").toLowerCase() === "certification"),
    [resumeEntries],
  );
  const studyHours = Number((profile as unknown as { totalStudyHours?: number } | null)?.totalStudyHours ?? 0);

  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const toggle = (k: string) => setPicked((p) => ({ ...p, [k]: !p[k] }));

  function apply() {
    let count = 0;
    edit((d) => {
      const next: ResumeData = { ...d };

      if (picked["profile"]) {
        next.personal = {
          ...next.personal,
          fullName: displayName || next.personal.fullName,
          email: user?.email || next.personal.email,
        };
        count++;
      }

      const pickedProjects = projects.filter((p) => picked[`p:${p.id}`]);
      if (pickedProjects.length) {
        next.projects = [
          ...next.projects,
          ...pickedProjects.map((p) => ({
            id: uid(),
            name: String(p.name ?? p.title ?? ""),
            github: String(p.repo ?? p.github ?? ""),
            demo: String(p.link ?? p.demo ?? ""),
            description: String(p.description ?? ""),
            technologies: String(p.stack ?? p.technologies ?? ""),
            bullets: [],
            startDate: "",
            endDate: "",
          })),
        ];
        count += pickedProjects.length;
      }

      const pickedSkills = categories.filter((c) => picked[`s:${c.id}`]);
      if (pickedSkills.length) {
        next.skills = [...next.skills, ...pickedSkills.map((c) => ({ id: uid(), category: c.title, skills: "" }))];
        count += pickedSkills.length;
      }

      const pickedAch = achievements.filter((a) => picked[`a:${a.id}`]);
      const includeStudy = picked["study"] && studyHours > 0;
      if (pickedAch.length || includeStudy) {
        const items = [
          ...pickedAch.map((a) => ({
            id: uid(),
            title: String(a.title ?? a.name ?? ""),
            detail: String(a.description ?? ""),
            date: String(a.date ?? ""),
          })),
          ...(includeStudy
            ? [{ id: uid(), title: `${studyHours.toFixed(0)}+ hours of tracked deep work`, detail: "Logged via Ascend study tracker", date: "" }]
            : []),
        ];
        next.optional = {
          ...next.optional,
          achievements: { enabled: true, items: [...next.optional.achievements.items, ...items] },
        };
        count += items.length;
      }

      const pickedCerts = certs.filter((c) => picked[`c:${c.id}`]);
      if (pickedCerts.length) {
        next.optional = {
          ...next.optional,
          certifications: {
            enabled: true,
            items: [
              ...next.optional.certifications.items,
              ...pickedCerts.map((c) => ({
                id: uid(),
                title: String(c.title ?? ""),
                detail: String(c.org ?? c.description ?? ""),
                date: String(c.period ?? ""),
              })),
            ],
          },
        };
        count += pickedCerts.length;
      }

      return next;
    });
    setPicked({});
    toast.success(count ? `Imported ${count} item${count === 1 ? "" : "s"}` : "Nothing selected");
  }

  const group = (label: string, entries: { key: string; text: string }[]) =>
    entries.length ? (
      <div className="mb-3">
        <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-white/45">{label}</div>
        <div className="flex flex-wrap gap-2">
          {entries.map((e) => (
            <button
              key={e.key}
              onClick={() => toggle(e.key)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                picked[e.key]
                  ? "border-white/25 bg-white/[0.12] text-white"
                  : "border-white/10 bg-white/[0.03] text-white/65 hover:text-white"
              }`}
            >
              {picked[e.key] && <Check className="mr-1 inline h-3 w-3" />}
              {e.text || "Untitled"}
            </button>
          ))}
        </div>
      </div>
    ) : null;

  const anything =
    projects.length || categories.length || achievements.length || certs.length || studyHours > 0;

  return (
    <GlassCard glow="cyan" className="p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">Smart auto sync</div>
          <div className="mt-1 text-sm font-semibold text-white">Import from Ascend</div>
        </div>
        <button
          onClick={apply}
          className="inline-flex items-center gap-2 rounded-lg bg-[image:var(--gradient-cyber)] px-3 py-1.5 text-xs font-semibold text-white shadow-[var(--shadow-glow)] hover:opacity-90"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Import selected
        </button>
      </div>

      {!anything ? (
        <p className="text-xs text-white/55">
          Add projects, categories, certifications, or achievements elsewhere in Ascend and they'll show up here to import.
        </p>
      ) : (
        <>
          {group("Profile", [{ key: "profile", text: `${displayName} · ${user?.email ?? ""}` }])}
          {group("Projects", projects.map((p) => ({ key: `p:${p.id}`, text: String(p.name ?? p.title ?? "") })))}
          {group("Skill categories", categories.map((c) => ({ key: `s:${c.id}`, text: c.title })))}
          {group("Certifications", certs.map((c) => ({ key: `c:${c.id}`, text: String(c.title ?? "") })))}
          {group("Achievements", [
            ...achievements.map((a) => ({ key: `a:${a.id}`, text: String(a.title ?? a.name ?? "") })),
            ...(studyHours > 0 ? [{ key: "study", text: `${studyHours.toFixed(0)} study hours` }] : []),
          ])}
        </>
      )}
    </GlassCard>
  );
}
