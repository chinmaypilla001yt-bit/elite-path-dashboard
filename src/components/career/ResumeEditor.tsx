import { useState, type ReactNode } from "react";
import {
  Plus, Trash2, Copy, ChevronUp, ChevronDown, GripVertical, ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GlassCard } from "@/components/ascend/GlassCard";
import {
  uid, OPTIONAL_SECTIONS, type ResumeData, type OptionalSectionKey,
} from "@/lib/resume";

const inputCls =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none";

function Field({
  label, value, onChange, placeholder, textarea, full,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; textarea?: boolean; full?: boolean;
}) {
  return (
    <div className={full || textarea ? "sm:col-span-2" : ""}>
      <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-white/45">{label}</label>
      {textarea ? (
        <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputCls} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputCls} />
      )}
    </div>
  );
}

function Panel({ title, count, children, defaultOpen }: { title: string; count?: number; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <GlassCard glow="none" className="p-0">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-2 px-5 py-4 text-left">
        <ChevronRight className={`h-4 w-4 text-white/45 transition ${open ? "rotate-90" : ""}`} />
        <span className="text-sm font-semibold text-white">{title}</span>
        {typeof count === "number" && (
          <span className="ml-auto rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-white/60">
            {count}
          </span>
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="border-t border-white/5 px-5 py-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

function ItemShell({
  title, onDelete, onDuplicate, onUp, onDown, children,
}: {
  title: string; onDelete: () => void; onDuplicate?: () => void;
  onUp: () => void; onDown: () => void; children: ReactNode;
}) {
  return (
    <div className="mb-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
      <div className="mb-2 flex items-center gap-1">
        <GripVertical className="h-3.5 w-3.5 text-white/25" />
        <span className="min-w-0 flex-1 truncate text-xs font-medium text-white/80">{title}</span>
        <button onClick={onUp} className="rounded p-1 text-white/45 hover:text-white" title="Move up"><ChevronUp className="h-3.5 w-3.5" /></button>
        <button onClick={onDown} className="rounded p-1 text-white/45 hover:text-white" title="Move down"><ChevronDown className="h-3.5 w-3.5" /></button>
        {onDuplicate && (
          <button onClick={onDuplicate} className="rounded p-1 text-white/45 hover:text-white" title="Duplicate"><Copy className="h-3.5 w-3.5" /></button>
        )}
        <button onClick={onDelete} className="rounded p-1 text-white/45 hover:text-red-300" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function AddBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/[0.08] hover:text-white"
    >
      <Plus className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

function move<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

export function ResumeEditor({
  data, edit,
}: {
  data: ResumeData;
  edit: (fn: (prev: ResumeData) => ResumeData) => void;
}) {
  const p = data.personal;
  const setPersonal = (k: keyof typeof p, v: string) =>
    edit((d) => ({ ...d, personal: { ...d.personal, [k]: v } }));

  type ListKey = "education" | "experience" | "projects" | "skills" | "awards";
  const setList = <K extends ListKey>(key: K, fn: (arr: ResumeData[K]) => ResumeData[K]) =>
    edit((d) => ({ ...d, [key]: fn(d[key]) }) as ResumeData);

  const patch = <K extends ListKey>(key: K, id: string, obj: Record<string, unknown>) =>
    setList(key, (arr) => arr.map((it) => ((it as { id: string }).id === id ? { ...it, ...obj } : it)) as ResumeData[K]);

  const setOptional = (k: OptionalSectionKey, obj: Partial<ResumeData["optional"][OptionalSectionKey]>) =>
    edit((d) => ({ ...d, optional: { ...d.optional, [k]: { ...d.optional[k], ...obj } } }));

  return (
    <div className="space-y-3">
      <Panel title="Personal information" defaultOpen>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Full name" value={p.fullName} onChange={(v) => setPersonal("fullName", v)} placeholder="Jane Doe" />
          <Field label="Email" value={p.email} onChange={(v) => setPersonal("email", v)} placeholder="jane@email.com" />
          <Field label="Phone" value={p.phone} onChange={(v) => setPersonal("phone", v)} placeholder="+91 90000 00000" />
          <Field label="LinkedIn" value={p.linkedin} onChange={(v) => setPersonal("linkedin", v)} placeholder="linkedin.com/in/jane" />
          <Field label="GitHub" value={p.github} onChange={(v) => setPersonal("github", v)} placeholder="github.com/jane" />
          <Field label="Portfolio" value={p.portfolio} onChange={(v) => setPersonal("portfolio", v)} />
          <Field label="Website" value={p.website} onChange={(v) => setPersonal("website", v)} />
          <Field label="Address" value={p.address} onChange={(v) => setPersonal("address", v)} />
          <Field label="City" value={p.city} onChange={(v) => setPersonal("city", v)} />
          <Field label="Country" value={p.country} onChange={(v) => setPersonal("country", v)} />
        </div>
      </Panel>

      <Panel title="Education" count={data.education.length}>
        {data.education.map((e, i) => (
          <ItemShell
            key={e.id}
            title={e.university || "New education"}
            onDelete={() => setList("education", (a) => a.filter((x) => x.id !== e.id))}
            onDuplicate={() => setList("education", (a) => [...a, { ...e, id: uid() }])}
            onUp={() => setList("education", (a) => move(a, i, -1))}
            onDown={() => setList("education", (a) => move(a, i, 1))}
          >
            <Field label="University" value={e.university} onChange={(v) => patch("education", e.id, { university: v })} />
            <Field label="Location" value={e.location ?? ""} onChange={(v) => patch("education", e.id, { location: v })} />
            <Field label="Degree" value={e.degree} onChange={(v) => patch("education", e.id, { degree: v })} placeholder="B.Tech" />
            <Field label="Major" value={e.major} onChange={(v) => patch("education", e.id, { major: v })} />
            <Field label="GPA" value={e.gpa} onChange={(v) => patch("education", e.id, { gpa: v })} />
            <Field label="CGPA" value={e.cgpa} onChange={(v) => patch("education", e.id, { cgpa: v })} />
            <Field label="Start date" value={e.startDate} onChange={(v) => patch("education", e.id, { startDate: v })} placeholder="Aug 2024" />
            <Field label="End date" value={e.endDate} onChange={(v) => patch("education", e.id, { endDate: v })} placeholder="May 2028" />
            <Field label="Coursework" value={e.coursework} onChange={(v) => patch("education", e.id, { coursework: v })} textarea />
            <Field label="Activities" value={e.activities} onChange={(v) => patch("education", e.id, { activities: v })} textarea />
          </ItemShell>
        ))}
        <AddBtn
          label="Add education"
          onClick={() =>
            setList("education", (a) => [
              ...a,
              { id: uid(), university: "", degree: "", major: "", gpa: "", cgpa: "", startDate: "", endDate: "", coursework: "", activities: "", location: "" },
            ])
          }
        />
      </Panel>

      <Panel title="Experience" count={data.experience.length}>
        {data.experience.map((x, i) => (
          <ItemShell
            key={x.id}
            title={[x.role, x.company].filter(Boolean).join(" · ") || "New experience"}
            onDelete={() => setList("experience", (a) => a.filter((y) => y.id !== x.id))}
            onDuplicate={() => setList("experience", (a) => [...a, { ...x, id: uid() }])}
            onUp={() => setList("experience", (a) => move(a, i, -1))}
            onDown={() => setList("experience", (a) => move(a, i, 1))}
          >
            <Field label="Company" value={x.company} onChange={(v) => patch("experience", x.id, { company: v })} />
            <Field label="Role" value={x.role} onChange={(v) => patch("experience", x.id, { role: v })} />
            <Field label="Start date" value={x.startDate} onChange={(v) => patch("experience", x.id, { startDate: v })} />
            <Field label="End date" value={x.endDate} onChange={(v) => patch("experience", x.id, { endDate: v })} />
            <Field label="Location" value={x.location} onChange={(v) => patch("experience", x.id, { location: v })} />
            <Field label="Description" value={x.description} onChange={(v) => patch("experience", x.id, { description: v })} textarea />
            <Field
              label="Bullet points (one per line)"
              value={(x.bullets ?? []).join("\n")}
              onChange={(v) => patch("experience", x.id, { bullets: v.split("\n") })}
              textarea
            />
          </ItemShell>
        ))}
        <AddBtn
          label="Add experience"
          onClick={() =>
            setList("experience", (a) => [
              ...a,
              { id: uid(), company: "", role: "", startDate: "", endDate: "", location: "", description: "", bullets: [] },
            ])
          }
        />
      </Panel>

      <Panel title="Projects" count={data.projects.length}>
        {data.projects.map((pr, i) => (
          <ItemShell
            key={pr.id}
            title={pr.name || "New project"}
            onDelete={() => setList("projects", (a) => a.filter((y) => y.id !== pr.id))}
            onDuplicate={() => setList("projects", (a) => [...a, { ...pr, id: uid() }])}
            onUp={() => setList("projects", (a) => move(a, i, -1))}
            onDown={() => setList("projects", (a) => move(a, i, 1))}
          >
            <Field label="Name" value={pr.name} onChange={(v) => patch("projects", pr.id, { name: v })} />
            <Field label="Technologies" value={pr.technologies} onChange={(v) => patch("projects", pr.id, { technologies: v })} />
            <Field label="GitHub link" value={pr.github} onChange={(v) => patch("projects", pr.id, { github: v })} />
            <Field label="Live demo" value={pr.demo} onChange={(v) => patch("projects", pr.id, { demo: v })} />
            <Field label="Start date" value={pr.startDate} onChange={(v) => patch("projects", pr.id, { startDate: v })} />
            <Field label="End date" value={pr.endDate} onChange={(v) => patch("projects", pr.id, { endDate: v })} />
            <Field label="Description" value={pr.description} onChange={(v) => patch("projects", pr.id, { description: v })} textarea />
            <Field
              label="Bullet points (one per line)"
              value={(pr.bullets ?? []).join("\n")}
              onChange={(v) => patch("projects", pr.id, { bullets: v.split("\n") })}
              textarea
            />
          </ItemShell>
        ))}
        <AddBtn
          label="Add project"
          onClick={() =>
            setList("projects", (a) => [
              ...a,
              { id: uid(), name: "", github: "", demo: "", description: "", technologies: "", bullets: [], startDate: "", endDate: "" },
            ])
          }
        />
      </Panel>

      <Panel title="Skills" count={data.skills.length}>
        {data.skills.map((s, i) => (
          <ItemShell
            key={s.id}
            title={s.category || "New skill group"}
            onDelete={() => setList("skills", (a) => a.filter((y) => y.id !== s.id))}
            onDuplicate={() => setList("skills", (a) => [...a, { ...s, id: uid() }])}
            onUp={() => setList("skills", (a) => move(a, i, -1))}
            onDown={() => setList("skills", (a) => move(a, i, 1))}
          >
            <Field label="Category" value={s.category} onChange={(v) => patch("skills", s.id, { category: v })} placeholder="Programming Languages" />
            <Field label="Skills (comma separated)" value={s.skills} onChange={(v) => patch("skills", s.id, { skills: v })} placeholder="Python, C++, TypeScript" />
          </ItemShell>
        ))}
        <AddBtn label="Add skill group" onClick={() => setList("skills", (a) => [...a, { id: uid(), category: "", skills: "" }])} />
      </Panel>

      <Panel title="Awards" count={data.awards.length}>
        {data.awards.map((a, i) => (
          <ItemShell
            key={a.id}
            title={a.title || "New award"}
            onDelete={() => setList("awards", (arr) => arr.filter((y) => y.id !== a.id))}
            onDuplicate={() => setList("awards", (arr) => [...arr, { ...a, id: uid() }])}
            onUp={() => setList("awards", (arr) => move(arr, i, -1))}
            onDown={() => setList("awards", (arr) => move(arr, i, 1))}
          >
            <Field label="Title" value={a.title} onChange={(v) => patch("awards", a.id, { title: v })} />
            <Field label="Date" value={a.date} onChange={(v) => patch("awards", a.id, { date: v })} />
            <Field label="Detail" value={a.detail} onChange={(v) => patch("awards", a.id, { detail: v })} textarea />
          </ItemShell>
        ))}
        <AddBtn label="Add award" onClick={() => setList("awards", (a) => [...a, { id: uid(), title: "", detail: "", date: "" }])} />
      </Panel>

      <Panel title="Optional sections">
        <div className="space-y-3">
          {OPTIONAL_SECTIONS.map((s) => {
            const sec = data.optional[s.key];
            return (
              <div key={s.key} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <label className="flex items-center gap-2 text-sm text-white">
                  <input
                    type="checkbox"
                    checked={!!sec.enabled}
                    onChange={(e) => setOptional(s.key, { enabled: e.target.checked })}
                    className="h-3.5 w-3.5 accent-[oklch(0.72_0.2_255)]"
                  />
                  {s.label}
                </label>
                {sec.enabled && (
                  <div className="mt-3">
                    {sec.items.map((it, i) => (
                      <ItemShell
                        key={it.id}
                        title={it.title || `New ${s.label.toLowerCase()} item`}
                        onDelete={() => setOptional(s.key, { items: sec.items.filter((y) => y.id !== it.id) })}
                        onDuplicate={() => setOptional(s.key, { items: [...sec.items, { ...it, id: uid() }] })}
                        onUp={() => setOptional(s.key, { items: move(sec.items, i, -1) })}
                        onDown={() => setOptional(s.key, { items: move(sec.items, i, 1) })}
                      >
                        <Field
                          label="Title"
                          value={it.title}
                          onChange={(v) => setOptional(s.key, { items: sec.items.map((y) => (y.id === it.id ? { ...y, title: v } : y)) })}
                        />
                        <Field
                          label="Date"
                          value={it.date}
                          onChange={(v) => setOptional(s.key, { items: sec.items.map((y) => (y.id === it.id ? { ...y, date: v } : y)) })}
                        />
                        <Field
                          label="Detail"
                          value={it.detail}
                          textarea
                          onChange={(v) => setOptional(s.key, { items: sec.items.map((y) => (y.id === it.id ? { ...y, detail: v } : y)) })}
                        />
                      </ItemShell>
                    ))}
                    <AddBtn
                      label={`Add ${s.label.toLowerCase()} item`}
                      onClick={() => setOptional(s.key, { items: [...sec.items, { id: uid(), title: "", detail: "", date: "" }] })}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
