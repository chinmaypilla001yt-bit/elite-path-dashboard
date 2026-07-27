import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, ChevronLeft, ChevronRight, X, Check, Pencil, Trash2, Clock } from "lucide-react";
import { AppShell } from "@/components/ascend/AppShell";
import { PageHeader } from "@/components/ascend/PageHeader";
import { GlassCard } from "@/components/ascend/GlassCard";
import { useLocalCollection } from "@/hooks/use-local-collection";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar · Ascend" },
      { name: "description", content: "Monthly calendar with events, categories, priorities, and countdowns." },
    ],
  }),
  component: CalendarPage,
});

type Event = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  category?: string;
  priority?: string;
  description?: string;
};

const CATEGORIES = ["Contest", "Deadline", "Interview", "Meeting", "Personal", "Other"];
const PRIORITIES = ["Low", "Medium", "High"];

function CalendarPage() {
  const { items, add, update, remove } = useLocalCollection<Event>("calendar");
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Omit<Event, "id">>({
    title: "", date: "", time: "", category: "", priority: "", description: "",
  });
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const today = fmtDate(now);
  const monthGrid = useMemo(() => buildMonthGrid(cursor.y, cursor.m), [cursor]);
  const eventsByDate = useMemo(() => {
    const m = new Map<string, Event[]>();
    for (const e of items) {
      if (!e.date) continue;
      const list = m.get(e.date) ?? [];
      list.push(e);
      m.set(e.date, list);
    }
    return m;
  }, [items]);

  const dayEvents = selectedDate ? (eventsByDate.get(selectedDate) ?? []) : [];

  function openNew(date?: string) {
    setEditingId(null);
    setDraft({ title: "", date: date ?? today, time: "", category: "", priority: "", description: "" });
    setShowForm(true);
  }
  function openEdit(ev: Event) {
    setEditingId(ev.id);
    setDraft({
      title: ev.title, date: ev.date, time: ev.time ?? "", category: ev.category ?? "",
      priority: ev.priority ?? "", description: ev.description ?? "",
    });
    setShowForm(true);
  }
  function save() {
    if (!draft.title.trim() || !draft.date) return;
    if (editingId) update(editingId, draft as Partial<Event>);
    else add(draft as Omit<Event, "id">);
    setShowForm(false);
    setEditingId(null);
  }

  const monthLabel = new Date(cursor.y, cursor.m, 1).toLocaleString(undefined, { month: "long", year: "numeric" });

  return (
    <AppShell>
      <PageHeader
        eyebrow="Schedule"
        title="Calendar"
        description="Contests, deadlines, and appointments — all in one place."
        actions={
          <button
            onClick={() => openNew()}
            className="inline-flex items-center gap-2 rounded-lg bg-[image:var(--gradient-cyber)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Add event
          </button>
        }
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCursor(prevMonth)}
            className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-white/70 hover:bg-white/[0.06] hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="min-w-[10rem] text-center text-lg font-semibold text-white">{monthLabel}</div>
          <button
            onClick={() => setCursor(nextMonth)}
            className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-white/70 hover:bg-white/[0.06] hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              const d = new Date();
              setCursor({ y: d.getFullYear(), m: d.getMonth() });
              setSelectedDate(fmtDate(d));
            }}
            className="ml-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/70 hover:bg-white/[0.06] hover:text-white"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-3 pr-4">
          <Clock className="h-3.5 w-3.5 text-[oklch(0.82_0.14_200)]" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">Now</span>
          <span className="font-mono text-sm text-white">
            {now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mb-6">
            <GlassCard glow="cyan" className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/50">
                  {editingId ? "Edit event" : "New event"}
                </div>
                <button onClick={() => setShowForm(false)} className="rounded-md p-1 text-white/50 hover:bg-white/[0.06] hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  className="sm:col-span-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
                  placeholder="Title"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                />
                <input
                  type="date"
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
                  value={draft.date}
                  onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                />
                <input
                  type="time"
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
                  value={draft.time}
                  onChange={(e) => setDraft({ ...draft, time: e.target.value })}
                />
                <select
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
                  value={draft.category ?? ""}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                >
                  <option value="" className="bg-[#0b1024]">Category…</option>
                  {CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#0b1024]">{c}</option>)}
                </select>
                <select
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
                  value={draft.priority ?? ""}
                  onChange={(e) => setDraft({ ...draft, priority: e.target.value })}
                >
                  <option value="" className="bg-[#0b1024]">Priority…</option>
                  {PRIORITIES.map((p) => <option key={p} value={p} className="bg-[#0b1024]">{p}</option>)}
                </select>
                <textarea
                  className="sm:col-span-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
                  placeholder="Description"
                  rows={3}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setShowForm(false)} className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/70 hover:bg-white/[0.06] hover:text-white">
                  Cancel
                </button>
                <button onClick={save} className="inline-flex items-center gap-2 rounded-lg bg-[image:var(--gradient-cyber)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow)]">
                  <Check className="h-4 w-4" /> Save
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <GlassCard glow="cyan" className="p-5">
          <div className="mb-2 grid grid-cols-7 gap-1 text-center font-mono text-[10px] uppercase tracking-widest text-white/45">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => <div key={d} className="py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {monthGrid.map((cell) => {
              const isToday = cell.date === today;
              const inMonth = cell.inMonth;
              const dayEvs = eventsByDate.get(cell.date) ?? [];
              const isSelected = selectedDate === cell.date;
              return (
                <button
                  key={cell.date}
                  onClick={() => setSelectedDate(cell.date)}
                  className={`relative aspect-square rounded-lg border p-1.5 text-left transition ${
                    isSelected
                      ? "border-white/40 bg-white/[0.08]"
                      : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05]"
                  } ${!inMonth ? "opacity-30" : ""}`}
                >
                  <div className={`font-mono text-[11px] ${isToday ? "text-[oklch(0.83_0.16_85)]" : "text-white/70"}`}>
                    {Number(cell.date.slice(-2))}
                    {isToday && <span className="ml-1 inline-block h-1 w-1 rounded-full bg-[oklch(0.83_0.16_85)]" />}
                  </div>
                  {dayEvs.length > 0 && (
                    <div className="absolute bottom-1 left-1 right-1 flex flex-wrap gap-0.5">
                      {dayEvs.slice(0, 4).map((e, i) => (
                        <span
                          key={e.id}
                          className={`h-1.5 w-1.5 rounded-full ${priorityDot(e.priority)}`}
                          style={{ opacity: 1 - i * 0.15 }}
                        />
                      ))}
                      {dayEvs.length > 4 && <span className="font-mono text-[8px] text-white/50">+{dayEvs.length - 4}</span>}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard glow="purple" className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
                  {selectedDate ? "Selected day" : "Pick a day"}
                </div>
                <div className="mt-1 text-lg font-semibold text-white">
                  {selectedDate ? prettyDate(selectedDate) : "—"}
                </div>
              </div>
              {selectedDate && (
                <button
                  onClick={() => openNew(selectedDate)}
                  className="rounded-md border border-white/10 bg-white/[0.03] p-1.5 text-white/70 hover:bg-white/[0.06] hover:text-white"
                  title="Add event to this day"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            {selectedDate ? (
              dayEvents.length === 0 ? (
                <p className="text-sm text-white/50">No events for this day.</p>
              ) : (
                <ul className="space-y-2">
                  {dayEvents.map((e) => (
                    <li key={e.id} className="group rounded-lg border border-white/5 bg-white/[0.03] p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-white">{e.title}</div>
                          <div className="font-mono text-[10px] uppercase tracking-widest text-white/45">
                            {e.time || "all day"}{e.category ? ` · ${e.category}` : ""}{e.priority ? ` · ${e.priority}` : ""}
                          </div>
                          {e.description && <p className="mt-1 text-xs text-white/60">{e.description}</p>}
                          <div className="mt-1 font-mono text-[10px] uppercase tracking-widest">
                            <CountdownLabel date={e.date} />
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                          <button onClick={() => openEdit(e)} className="rounded-md p-1 text-white/50 hover:bg-white/[0.06] hover:text-white">
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button onClick={() => remove(e.id)} className="rounded-md p-1 text-white/50 hover:bg-white/[0.06] hover:text-red-300">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )
            ) : (
              <p className="text-sm text-white/50">Click a day in the calendar to see events.</p>
            )}
          </GlassCard>

          <UpcomingList items={items} onEdit={openEdit} onRemove={remove} />
        </div>
      </div>
    </AppShell>
  );
}

function UpcomingList({
  items, onEdit, onRemove,
}: {
  items: Event[];
  onEdit: (e: Event) => void;
  onRemove: (id: string) => void;
}) {
  const today = fmtDate(new Date());
  const upcoming = [...items]
    .filter((e) => e.date && e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  return (
    <GlassCard glow="blue" className="p-5">
      <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">Upcoming</div>
      {upcoming.length === 0 ? (
        <p className="text-sm text-white/50">No upcoming events.</p>
      ) : (
        <ul className="space-y-2">
          {upcoming.map((e) => (
            <li key={e.id} className="group flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] p-2.5">
              <div className="min-w-0">
                <div className="truncate text-sm text-white">{e.title}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-white/45">
                  {e.date}{e.time ? ` · ${e.time}` : ""}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CountdownLabel date={e.date} />
                <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                  <button onClick={() => onEdit(e)} className="rounded-md p-1 text-white/50 hover:text-white">
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button onClick={() => onRemove(e.id)} className="rounded-md p-1 text-white/50 hover:text-red-300">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}

export function CountdownLabel({ date }: { date: string }) {
  const days = daysUntil(date);
  let text = `${Math.abs(days)} Days Left`;
  let cls = "text-[oklch(0.82_0.14_200)]";
  if (days === 0) { text = "Today"; cls = "text-[oklch(0.83_0.16_85)]"; }
  else if (days < 0) { text = "Completed"; cls = "text-white/40"; }
  else if (days === 1) { text = "1 Day Left"; cls = "text-[oklch(0.83_0.16_85)]"; }
  return <span className={`font-mono text-[10px] uppercase tracking-widest ${cls}`}>{text}</span>;
}

export function daysUntil(date: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = date.split("-").map(Number);
  const target = new Date(y, (m || 1) - 1, d || 1);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function prettyDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  return dt.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}
function fmtDate(d: Date) {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function prevMonth(c: { y: number; m: number }) {
  return c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 };
}
function nextMonth(c: { y: number; m: number }) {
  return c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 };
}
function buildMonthGrid(y: number, m: number) {
  const first = new Date(y, m, 1);
  const start = new Date(first);
  start.setDate(1 - first.getDay());
  const cells: { date: string; inMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push({ date: fmtDate(d), inMonth: d.getMonth() === m });
  }
  return cells;
}
function priorityDot(priority?: string) {
  switch (priority) {
    case "High": return "bg-[oklch(0.7_0.19_25)]";
    case "Medium": return "bg-[oklch(0.83_0.16_85)]";
    case "Low": return "bg-[oklch(0.75_0.18_155)]";
    default: return "bg-[oklch(0.72_0.2_255)]";
  }
}
