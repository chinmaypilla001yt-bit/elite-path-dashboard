import { useEffect, useRef, useState } from "react";
import * as Icons from "lucide-react";
import { GripVertical, Plus, Trash2, Pencil, Check, X, Settings2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
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
  const C = Cmp ?? Icons.Target;
  return <C className={className} />;
}

/**
 * The single category picker used by every module. The gear opens an inline
 * editor (add / rename / delete / icon / color / drag-reorder) — no separate page.
 */
export function CategorySelect({
  value,
  onChange,
  className = "",
  placeholder = "Category…",
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
}) {
  const { categories, hydrated, add, update, remove, reorder } = useCategories();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newIcon, setNewIcon] = useState<string>("Target");
  const [newColor, setNewColor] = useState<string>(CATEGORY_COLORS[0]);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  async function handleAdd() {
    if (!newTitle.trim()) {
      toast.error("Category name is required");
      return;
    }
    setBusy(true);
    try {
      await add({ title: newTitle, icon: newIcon, color: newColor });
      if (!value) onChange(newTitle.trim());
      setNewTitle("");
      toast.success("Category added");
    } catch (e) {
      toast.error((e as Error).message || "Failed to add");
    } finally {
      setBusy(false);
    }
  }

  async function saveRename(c: Category) {
    const next = editTitle.trim();
    if (!next) return;
    try {
      await update(c.id, { title: next });
      if (value === c.title) onChange(next);
      setEditingId(null);
      toast.success("Renamed everywhere");
    } catch (e) {
      toast.error((e as Error).message || "Failed to rename");
    }
  }

  async function handleRemove(c: Category) {
    try {
      await remove(c.id);
      if (value === c.title) onChange("");
      toast.success("Category deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  async function handleDrop(target: Category) {
    if (!dragId || dragId === target.id) return;
    const from = categories.findIndex((c) => c.id === dragId);
    const to = categories.findIndex((c) => c.id === target.id);
    setDragId(null);
    if (from < 0 || to < 0) return;
    const next = [...categories];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    try {
      await reorder(next);
    } catch {
      toast.error("Failed to reorder");
    }
  }

  return (
    <div ref={wrap} className={`relative ${className}`}>
      <div className="flex gap-1">
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
        >
          <option value="" className="bg-[#0b1024]">{placeholder}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.title} className="bg-[#0b1024]">{c.title}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          title="Manage categories"
          aria-label="Manage categories"
          className="shrink-0 rounded-lg border border-white/10 bg-white/[0.03] px-2 text-white/60 transition hover:bg-white/[0.07] hover:text-white"
        >
          <Settings2 className="h-4 w-4" />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute right-0 z-50 mt-2 w-[min(22rem,80vw)] rounded-xl border border-white/10 bg-[#0b1024]/95 p-3 shadow-2xl backdrop-blur-xl"
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
              Categories · shared everywhere
            </div>

            <div className="mt-2 flex gap-1">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="New category"
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
              />
              <select
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                className="w-20 rounded-lg border border-white/10 bg-white/[0.03] px-1 py-1.5 text-xs text-white focus:outline-none"
              >
                {CATEGORY_ICONS.map((i) => (
                  <option key={i} value={i} className="bg-[#0b1024]">{i}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAdd}
                disabled={busy}
                className="rounded-lg bg-[image:var(--gradient-cyber)] px-2 text-white disabled:opacity-60"
                aria-label="Add category"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </button>
            </div>
            <div className="mt-1.5 flex items-center gap-1">
              {CATEGORY_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewColor(c)}
                  className={`h-3.5 w-3.5 rounded-full ${newColor === c ? "ring-2 ring-white/70" : ""}`}
                  style={{ background: c }}
                  aria-label="color"
                />
              ))}
            </div>

            <div className="mt-3 max-h-64 space-y-1.5 overflow-y-auto pr-1">
              {hydrated && categories.length === 0 && (
                <p className="py-2 text-center text-xs text-white/45">
                  No categories yet — add one above.
                </p>
              )}
              {categories.map((c) => (
                <div
                  key={c.id}
                  draggable
                  onDragStart={() => setDragId(c.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(c)}
                  className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-2 py-1.5"
                >
                  <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-white/30" />
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                    style={{ background: `color-mix(in oklch, ${c.color} 25%, transparent)` }}
                  >
                    <CategoryIcon name={c.icon} className="h-3 w-3" />
                  </span>

                  {editingId === c.id ? (
                    <input
                      value={editTitle}
                      autoFocus
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveRename(c)}
                      className="min-w-0 flex-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-sm text-white focus:outline-none"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => { onChange(c.title); setOpen(false); }}
                      className="min-w-0 flex-1 truncate text-left text-sm text-white/85 hover:text-white"
                    >
                      {c.title}
                    </button>
                  )}

                  <select
                    value={c.icon}
                    onChange={(e) => update(c.id, { icon: e.target.value })}
                    className="w-14 rounded-md border border-white/10 bg-white/[0.03] px-1 py-0.5 text-[10px] text-white/70 focus:outline-none"
                    aria-label="icon"
                  >
                    {CATEGORY_ICONS.map((i) => (
                      <option key={i} value={i} className="bg-[#0b1024]">{i}</option>
                    ))}
                  </select>
                  <span className="flex items-center gap-0.5">
                    {CATEGORY_COLORS.slice(0, 4).map((col2) => (
                      <button
                        key={col2}
                        type="button"
                        onClick={() => update(c.id, { color: col2 })}
                        className={`h-2.5 w-2.5 rounded-full ${c.color === col2 ? "ring-2 ring-white/70" : ""}`}
                        style={{ background: col2 }}
                        aria-label="color"
                      />
                    ))}
                  </span>

                  {editingId === c.id ? (
                    <>
                      <button type="button" onClick={() => saveRename(c)} className="p-1 text-white/60 hover:text-white">
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => setEditingId(null)} className="p-1 text-white/60 hover:text-white">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => { setEditingId(c.id); setEditTitle(c.title); }}
                        className="p-1 text-white/50 hover:text-white"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(c)}
                        className="p-1 text-white/50 hover:text-red-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
