import { useCallback, useEffect, useRef, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/lib/firebase";

export type Category = {
  id: string;
  title: string;
  icon: string;
  color: string;
  order: number;
  createdAt: number;
};

/** Icon keys are resolved against this map in the UI (lucide names). */
export const CATEGORY_ICONS = [
  "Sigma", "Brain", "Code2", "Database", "Cloud", "LineChart", "Wallet",
  "FlaskConical", "Atom", "Building2", "Music", "Palette", "Globe", "BookOpen",
  "Cpu", "Server", "Shield", "Rocket", "Target", "Trophy",
] as const;

export const CATEGORY_COLORS = [
  "oklch(0.72 0.2 255)",
  "oklch(0.66 0.24 305)",
  "oklch(0.82 0.14 200)",
  "oklch(0.75 0.18 155)",
  "oklch(0.83 0.16 85)",
  "oklch(0.68 0.21 25)",
  "oklch(0.78 0.15 130)",
  "oklch(0.7 0.18 340)",
] as const;

/**
 * The categories the app used to hardcode. They are seeded once per user so
 * they exist as normal, fully editable rows — rename/delete/reorder them freely.
 */
const SEED: Array<{ title: string; icon: string; color: string }> = [
  { title: "Mathematics", icon: "Sigma", color: CATEGORY_COLORS[0] },
  { title: "Physics", icon: "Atom", color: CATEGORY_COLORS[2] },
  { title: "Chemistry", icon: "FlaskConical", color: CATEGORY_COLORS[3] },
  { title: "Computer Science", icon: "Code2", color: CATEGORY_COLORS[1] },
  { title: "AI & ML", icon: "Brain", color: CATEGORY_COLORS[7] },
  { title: "Contest", icon: "Trophy", color: CATEGORY_COLORS[4] },
  { title: "Deadline", icon: "Target", color: CATEGORY_COLORS[5] },
  { title: "Interview", icon: "Building2", color: CATEGORY_COLORS[6] },
];

/**
 * Every place a category title is stored, so a rename/delete propagates
 * across the whole app instead of orphaning rows.
 */
const REFERENCES: Array<{ collection: string; field: string }> = [
  { collection: "tasks", field: "tag" },
  { collection: "calendar", field: "category" },
  { collection: "study", field: "subject" },
  { collection: "study-timers", field: "subject" },
  { collection: "goals", field: "category" },
  { collection: "projects", field: "category" },
  { collection: "ai", field: "category" },
  { collection: "math", field: "area" },
  { collection: "internships", field: "category" },
  { collection: "roadmap", field: "category" },
  { collection: "achievements", field: "category" },
  { collection: "certifications", field: "category" },
  { collection: "portfolio", field: "category" },
  { collection: "jobs", field: "category" },
  { collection: "journal", field: "category" },
  { collection: "habits", field: "category" },
];

function col(uid: string) {
  return collection(db, "users", uid, "categories");
}

/** Rewrite every stored reference of `from` to `to` (empty string = cleared). */
async function propagate(uid: string, from: string, to: string) {
  if (!from || from === to) return;
  await Promise.all(
    REFERENCES.map(async (ref) => {
      try {
        const snap = await getDocs(
          query(collection(db, "users", uid, ref.collection), where(ref.field, "==", from)),
        );
        if (snap.empty) return;
        const batch = writeBatch(db);
        snap.forEach((d) => batch.update(d.ref, { [ref.field]: to }));
        await batch.commit();
      } catch {
        /* collection may not exist yet — ignore */
      }
    }),
  );
}

export function useCategories() {
  const [uid, setUid] = useState<string | null>(auth.currentUser?.uid ?? null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const seeding = useRef(false);

  useEffect(() => onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null)), []);

  useEffect(() => {
    if (!uid) {
      setCategories([]);
      setHydrated(true);
      return;
    }
    setHydrated(false);
    const unsub = onSnapshot(
      col(uid),
      async (snap) => {
        const out: Category[] = [];
        snap.forEach((d) => {
          const data = d.data() as Omit<Category, "id">;
          out.push({ ...data, id: d.id });
        });
        out.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || (a.createdAt ?? 0) - (b.createdAt ?? 0));
        setCategories(out);
        setHydrated(true);

        // Seed the former hardcoded defaults once, so they are editable rows.
        if (out.length === 0 && !seeding.current) {
          seeding.current = true;
          try {
            const marker = doc(db, "users", uid, "state", "categoriesSeeded");
            const batch = writeBatch(db);
            SEED.forEach((s, i) =>
              batch.set(doc(col(uid)), { ...s, order: i, createdAt: Date.now() + i }),
            );
            batch.set(marker, { value: true });
            await batch.commit();
          } catch {
            seeding.current = false;
          }
        }
      },
      () => setHydrated(true),
    );
    return unsub;
  }, [uid]);

  const add = useCallback(
    async (input: { title: string; icon?: string; color?: string }) => {
      const id = auth.currentUser?.uid;
      if (!id) throw new Error("Not signed in");
      const ref = doc(col(id));
      await setDoc(ref, {
        title: input.title.trim(),
        icon: input.icon || "Target",
        color: input.color || CATEGORY_COLORS[0],
        order: categories.length,
        createdAt: Date.now(),
      });
      return ref.id;
    },
    [categories.length],
  );

  const update = useCallback(
    async (id: string, patch: Partial<Omit<Category, "id">>) => {
      const u = auth.currentUser?.uid;
      if (!u) throw new Error("Not signed in");
      const prev = categories.find((c) => c.id === id);
      await updateDoc(doc(col(u), id), patch as Record<string, unknown>);
      if (patch.title && prev && patch.title !== prev.title) {
        await propagate(u, prev.title, patch.title.trim());
      }
    },
    [categories],
  );

  const remove = useCallback(
    async (id: string) => {
      const u = auth.currentUser?.uid;
      if (!u) throw new Error("Not signed in");
      const prev = categories.find((c) => c.id === id);
      await deleteDoc(doc(col(u), id));
      if (prev) await propagate(u, prev.title, "");
    },
    [categories],
  );

  /** Persist a full reorder (drag & drop result). */
  const reorder = useCallback(async (ordered: Category[]) => {
    const u = auth.currentUser?.uid;
    if (!u) throw new Error("Not signed in");
    setCategories(ordered.map((c, i) => ({ ...c, order: i })));
    const batch = writeBatch(db);
    ordered.forEach((c, i) => batch.update(doc(col(u), c.id), { order: i }));
    await batch.commit();
  }, []);

  return { categories, hydrated, add, update, remove, reorder };
}

/** Titles only — handy for pickers across every module. */
export function useCategoryOptions() {
  const { categories, hydrated } = useCategories();
  return { options: categories.map((c) => c.title), categories, hydrated };
}
