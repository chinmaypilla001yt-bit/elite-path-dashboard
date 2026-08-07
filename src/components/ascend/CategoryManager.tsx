import { useState } from "react";
import * as Icons from "lucide-react";
import { GripVertical, Plus, Trash2, Pencil, Check, X, ChevronDown, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { GlassCard } from "@/components/ascend/GlassCard";
import {
  useCategories,
  CATEGORY_ICONS,
  CATEGORY_COLORS,
  type Category,
} from "@/hooks/use-categories";

export function CategoryIcon({ name, className }: { name?: string; className?: string }) {
  const Cmp = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[
    name || "Target"
  ] as React.ComponentType<{ className?: string }> | undefined;
  const Fallback = Icons.Target;
  const C = Cmp ?? Fallback;
  return <C className={className} />;
}

const SUGGESTED = [
  "Computer Science", "Machine Learning", "Backend", "Finance",
  "Investing", "Biology", "Civil Engineering", "Music",
];

export function CategoryManager() {
  const { categories, hydrated, add, update, remove, reorder } = useCategories();
  const [collapsed, setCollapsed] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newIcon, setNewIcon] = useState<string>("Target");
  const [newColor, setNewColor] = useState<string>(CATEGORY_COLORS[0]);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);

  async function handleAdd(title = newTitle) {
    if (!title.trim()) {
      toast.error("Category name is required");
      return;
    }
    setBusy(true);
    try {
      await add({ title, icon: newIcon, color: newColor });
      setNewTitle("");
      toast.success("Category added");
    } catch (e) {
      toast.error((e as Error).message || "Failed to add");
    } finally {
      setBusy(false);
    }
  }

  async function saveRename(c: Category) {
    if (!editTitle.trim()) return;
    try {
      await update(c.id, { title: editTitle.trim() });
      setEditingId(null);
      toast.success("Category renamed");
    } catch (e) {
      toast.error((e as Error).message || "Failed to rename");
    }
  }

  async function handleDrop(target: Category) {
    if (!dragId || dragId === target.id) return;
    const from = categories.findIndex((c) => c.id === dragId);
    const to = categories.findIndex((c) => c.id === target.id);
    if (from < 0 || to < 0) return;
    const next = [...categories];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setDragId(null);
    try {
      await reorder(next);
    } catch {
      toast.error("Failed to reorder");
    }
  }

  return (
    <GlassCard glow="purple" className="p-6">
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
            Shared across every module
          </div>
          <div className="mt-1 text-lg font-semibold text-white">Categories</div>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-white/50 transition ${collapsed ? "-rotate-90" : ""}`}
        />
      </button>

      {!collapsed && (
        <div className="mt-4">
          <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Add a category — e.g. Machine Learning"
              className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
            />
            <select
              value={newIcon}
              onChange={(e) => setNewIcon(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-2 text-sm text-white focus:outline-none"
            >
              {CATEGORY_ICONS.map((i) => (
                <option key={i} value={i} className="bg-[#0b1024]">{i}</option>
              ))}
            </select>
            <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2">
              {CATEGORY_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className={`h-4 w-4 rounded-full transition ${newColor === c ? "ring-2 ring-white/70" : ""}`}
                  style={{ background: c }}
                  aria-label="color"
                />
              ))}
            </div>
            <button
              onClick={() => handleAdd()}
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[image:var(--gradient-cyber)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition hover:opacity-90 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add
            </button>
          </div>

          {hydrated && categories.length === 0 && (
            <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-5 text-center">
              <div className="text-sm font-semibold text-white">No categories yet</div>
              <p className="mt-1 text-xs text-white/55">
                Tap a suggestion to get started — every module will use them instantly.
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleAdd(s)}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/75 hover:bg-white/[0.08] hover:text-white"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 space-y-2">
            <AnimatePresence>
              {categories.map((c) => (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  draggable
                  onDragStart={() => setDragId(c.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(c)}
                  className="group flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2"
                >
                  <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-white/30" />
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `color-mix(in oklch, ${c.color} 25%, transparent)` }}
                  >
                    <CategoryIcon name={c.icon} className="h-3.5 w-3.5" />
                  </span>

                  {editingId === c.id ? (
                    <input
                      value={editTitle}
                      autoFocus
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveRename(c)}
                      className="min-w-0 flex-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-sm text-white focus:outline-none"
                    />
                  ) : (
                    <span className="min-w-0 flex-1 truncate text-sm text-white">{c.title}</span>
                  )}

                  <select
                    value={c.icon}
                    onChange={(e) => update(c.id, { icon: e.target.value })}
                    className="hidden rounded-md border border-white/10 bg-white/[0.03] px-1 py-1 text-xs text-white/70 focus:outline-none sm:block"
                  >
                    {CATEGORY_ICONS.map((i) => (
                      <option key={i} value={i} className="bg-[#0b1024]">{i}</option>
                    ))}
                  </select>
                  <div className="hidden items-center gap-1 sm:flex">
                    {CATEGORY_COLORS.map((col2) => (
                      <button
                        key={col2}
                        onClick={() => update(c.id, { color: col2 })}
                        className={`h-3 w-3 rounded-full ${c.color === col2 ? "ring-2 ring-white/70" : ""}`}
                        style={{ background: col2 }}
                        aria-label="color"
                      />
                    ))}
                  </div>

                  {editingId === c.id ? (
                    <>
                      <button onClick={() => saveRename(c)} className="rounded-md p-1.5 text-white/60 hover:text-white">
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setEditingId(null)} className="rounded-md p-1.5 text-white/60 hover:text-white">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { setEditingId(c.id); setEditTitle(c.title); }}
                        className="rounded-md p-1.5 text-white/50 hover:bg-white/[0.06] hover:text-white"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => remove(c.id)}
                        className="rounded-md p-1.5 text-white/50 hover:bg-white/[0.06] hover:text-red-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
