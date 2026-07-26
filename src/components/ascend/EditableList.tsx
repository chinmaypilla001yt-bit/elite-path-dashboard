import { useState, type ReactNode } from "react";
import { Plus, Trash2, Pencil, X, Check } from "lucide-react";
import { AppShell } from "./AppShell";
import { PageHeader } from "./PageHeader";
import { GlassCard } from "./GlassCard";
import { useLocalCollection, type Identified } from "@/hooks/use-local-collection";
import { motion, AnimatePresence } from "motion/react";

export type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "date" | "select";
  placeholder?: string;
  options?: string[];
  required?: boolean;
  full?: boolean;
};

export type EditableItem = Identified & Record<string, unknown>;

export function EditableList({
  storageKey,
  eyebrow,
  title,
  description,
  itemLabel = "item",
  fields,
  renderItem,
  emptyHint,
  glow = "purple",
}: {
  storageKey: string;
  eyebrow: string;
  title: string;
  description: string;
  itemLabel?: string;
  fields: FieldDef[];
  renderItem: (item: EditableItem) => ReactNode;
  emptyHint?: string;
  glow?: "blue" | "purple" | "cyan" | "emerald" | "gold";
}) {
  const { items, add, update, remove, hydrated } = useLocalCollection<EditableItem>(storageKey);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [showForm, setShowForm] = useState(false);

  function openNew() {
    setEditingId(null);
    setDraft(Object.fromEntries(fields.map((f) => [f.name, ""])));
    setShowForm(true);
  }
  function openEdit(item: EditableItem) {
    setEditingId(item.id);
    setDraft(
      Object.fromEntries(fields.map((f) => [f.name, String(item[f.name] ?? "")])),
    );
    setShowForm(true);
  }
  function cancel() {
    setShowForm(false);
    setEditingId(null);
    setDraft({});
  }
  function save() {
    const missing = fields.find((f) => f.required && !draft[f.name]?.trim());
    if (missing) return;
    const payload: Record<string, unknown> = {};
    for (const f of fields) {
      const v = draft[f.name] ?? "";
      payload[f.name] = f.type === "number" ? (v === "" ? 0 : Number(v)) : v;
    }
    if (editingId) update(editingId, payload);
    else add(payload as Omit<EditableItem, "id">);
    cancel();
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        action={
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 rounded-lg bg-[image:var(--gradient-cyber)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Add {itemLabel}
          </button>
        }
      />

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-6"
          >
            <GlassCard glow={glow} className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/50">
                  {editingId ? "Edit" : "New"} {itemLabel}
                </div>
                <button onClick={cancel} className="rounded-md p-1 text-white/50 hover:bg-white/[0.06] hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {fields.map((f) => (
                  <div key={f.name} className={f.full || f.type === "textarea" ? "sm:col-span-2" : ""}>
                    <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-white/45">
                      {f.label}
                      {f.required && <span className="text-[oklch(0.83_0.16_85)]"> *</span>}
                    </label>
                    {f.type === "textarea" ? (
                      <textarea
                        value={draft[f.name] ?? ""}
                        onChange={(e) => setDraft((d) => ({ ...d, [f.name]: e.target.value }))}
                        placeholder={f.placeholder}
                        rows={3}
                        className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
                      />
                    ) : f.type === "select" ? (
                      <select
                        value={draft[f.name] ?? ""}
                        onChange={(e) => setDraft((d) => ({ ...d, [f.name]: e.target.value }))}
                        className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
                      >
                        <option value="" className="bg-[#0b1024]">Select…</option>
                        {f.options?.map((o) => (
                          <option key={o} value={o} className="bg-[#0b1024]">{o}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={f.type ?? "text"}
                        value={draft[f.name] ?? ""}
                        onChange={(e) => setDraft((d) => ({ ...d, [f.name]: e.target.value }))}
                        placeholder={f.placeholder}
                        className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={cancel} className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/70 hover:bg-white/[0.06] hover:text-white">
                  Cancel
                </button>
                <button
                  onClick={save}
                  className="inline-flex items-center gap-2 rounded-lg bg-[image:var(--gradient-cyber)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition hover:opacity-90"
                >
                  <Check className="h-4 w-4" /> Save
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {hydrated && items.length === 0 ? (
        <GlassCard glow={glow} className="flex flex-col items-center justify-center p-16 text-center">
          <div className="text-lg font-semibold text-white">Nothing here yet</div>
          <p className="mt-2 max-w-md text-sm text-white/60">
            {emptyHint ?? `Click “Add ${itemLabel}” to start tracking.`}
          </p>
        </GlassCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {items.map((it) => (
              <motion.div
                key={it.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
              >
                <GlassCard glow={glow} className="group relative flex h-full flex-col p-5">
                  <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition group-hover:opacity-100">
                    <button
                      onClick={() => openEdit(it)}
                      className="rounded-md p-1.5 text-white/50 hover:bg-white/[0.06] hover:text-white"
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => remove(it.id)}
                      className="rounded-md p-1.5 text-white/50 hover:bg-white/[0.06] hover:text-red-300"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {renderItem(it)}
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </AppShell>
  );
}
