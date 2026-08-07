import { useCallback, useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
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

function col(uid: string) {
  return collection(db, "users", uid, "categories");
}

export function useCategories() {
  const [uid, setUid] = useState<string | null>(auth.currentUser?.uid ?? null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [hydrated, setHydrated] = useState(false);

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
      (snap) => {
        const out: Category[] = [];
        snap.forEach((d) => {
          const data = d.data() as Omit<Category, "id">;
          out.push({ ...data, id: d.id });
        });
        out.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || (a.createdAt ?? 0) - (b.createdAt ?? 0));
        setCategories(out);
        setHydrated(true);
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

  const update = useCallback(async (id: string, patch: Partial<Omit<Category, "id">>) => {
    const u = auth.currentUser?.uid;
    if (!u) throw new Error("Not signed in");
    await updateDoc(doc(col(u), id), patch as Record<string, unknown>);
  }, []);

  const remove = useCallback(async (id: string) => {
    const u = auth.currentUser?.uid;
    if (!u) throw new Error("Not signed in");
    await deleteDoc(doc(col(u), id));
  }, []);

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

/** Titles only — handy for <select> options across every module. */
export function useCategoryOptions() {
  const { categories, hydrated } = useCategories();
  return { options: categories.map((c) => c.title), categories, hydrated };
}
