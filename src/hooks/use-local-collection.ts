// Firestore-backed replacement for the old localStorage hooks.
// API preserved so every existing page keeps working untouched.
import { useCallback, useEffect, useRef, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  getDocs,
  query,
  orderBy,
  writeBatch,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

export type Identified = { id: string };

function userSub(uid: string, key: string) {
  return collection(db, "users", uid, key);
}
function stateDoc(uid: string, key: string) {
  return doc(db, "users", uid, "state", key);
}

/** Single-value user state, backed by users/{uid}/state/{key}.value */
export function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);
  const uidRef = useRef<string | null>(null);

  useEffect(() => {
    const u = auth.currentUser;
    if (!u) {
      setHydrated(true);
      return;
    }
    uidRef.current = u.uid;
    const ref = stateDoc(u.uid, key);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as { value?: T };
          setValue(data.value !== undefined ? (data.value as T) : initial);
        } else {
          setValue(initial);
        }
        setHydrated(true);
      },
      (err) => {
        // eslint-disable-next-line no-console
        console.error("[useLocalState]", key, err);
        setHydrated(true);
      },
    );
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (v: T | ((prev: T) => T)) => {
      const uid = uidRef.current ?? auth.currentUser?.uid;
      if (!uid) return;
      setValue((prev) => {
        const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
        void setDoc(stateDoc(uid, key), { value: next }, { merge: true });
        return next;
      });
    },
    [key],
  );

  return [value, update, hydrated] as const;
}

/** Collection of items, backed by users/{uid}/{key}/{docId} */
export function useLocalCollection<T extends Identified>(key: string, _initial: T[] = []) {
  const [items, setItems] = useState<T[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const uidRef = useRef<string | null>(null);

  useEffect(() => {
    const u = auth.currentUser;
    if (!u) {
      setHydrated(true);
      return;
    }
    uidRef.current = u.uid;
    const col = userSub(u.uid, key);
    // Order by _createdAt descending (newest first) if present.
    const q = query(col, orderBy("_createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const out: T[] = [];
        snap.forEach((d) => {
          const data = d.data() as Record<string, unknown>;
          out.push({ ...(data as T), id: d.id });
        });
        setItems(out);
        setHydrated(true);
      },
      (err) => {
        // Fallback: no createdAt on legacy docs → fetch without ordering
        // eslint-disable-next-line no-console
        console.warn("[useLocalCollection]", key, err?.message);
        const unsub2 = onSnapshot(col, (snap) => {
          const out: T[] = [];
          snap.forEach((d) => {
            const data = d.data() as Record<string, unknown>;
            out.push({ ...(data as T), id: d.id });
          });
          setItems(out);
          setHydrated(true);
        });
        return unsub2;
      },
    );
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const add = useCallback(
    (item: Omit<T, "id"> & Partial<Identified>) => {
      const uid = uidRef.current ?? auth.currentUser?.uid;
      if (!uid) return "";
      const col = userSub(uid, key);
      const payload = { ...(item as Record<string, unknown>), _createdAt: Date.now() };
      delete (payload as Record<string, unknown>).id;
      if ((item as Partial<Identified>).id) {
        const ref = doc(col, (item as Identified).id);
        void setDoc(ref, payload);
        return (item as Identified).id;
      }
      const ref = doc(col);
      void setDoc(ref, payload);
      return ref.id;
    },
    [key],
  );

  const update = useCallback(
    (id: string, patch: Partial<T>) => {
      const uid = uidRef.current ?? auth.currentUser?.uid;
      if (!uid) return;
      const ref = doc(userSub(uid, key), id);
      const clean: Record<string, unknown> = { ...(patch as Record<string, unknown>) };
      delete clean.id;
      void updateDoc(ref, clean);
    },
    [key],
  );

  const remove = useCallback(
    (id: string) => {
      const uid = uidRef.current ?? auth.currentUser?.uid;
      if (!uid) return;
      void deleteDoc(doc(userSub(uid, key), id));
    },
    [key],
  );

  const clear = useCallback(async () => {
    const uid = uidRef.current ?? auth.currentUser?.uid;
    if (!uid) return;
    const snap = await getDocs(userSub(uid, key));
    const batch = writeBatch(db);
    snap.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }, [key]);

  const setItemsExternal = useCallback(
    async (next: T[] | ((prev: T[]) => T[])) => {
      const uid = uidRef.current ?? auth.currentUser?.uid;
      if (!uid) return;
      const value = typeof next === "function" ? (next as (p: T[]) => T[])(items) : next;
      const col = userSub(uid, key);
      const snap = await getDocs(col);
      const batch = writeBatch(db);
      snap.forEach((d) => batch.delete(d.ref));
      for (const it of value) {
        const id = it.id || doc(col).id;
        batch.set(doc(col, id), {
          ...(it as Record<string, unknown>),
          _createdAt: (it as unknown as { _createdAt?: number })._createdAt ?? Date.now(),
        });
      }
      await batch.commit();
    },
    [items, key],
  );

  return { items, add, update, remove, clear, setItems: setItemsExternal, hydrated };
}

/** Delete all Ascend data across common collections for the signed-in user. */
export async function clearAllAscendData() {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  const collections = [
    "tasks", "study", "study-timers", "calendar", "goals", "habits", "habit-logs",
    "journal", "roadmap", "cp-contests", "math", "ai", "projects", "internships",
    "resume", "achievements",
  ];
  for (const key of collections) {
    const snap = await getDocs(userSub(uid, key));
    if (snap.empty) continue;
    const batch = writeBatch(db);
    snap.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
  // Reset xp/level and profile scalars
  await setDoc(doc(db, "users", uid), { xp: 0 }, { merge: true });
  const stateSnap = await getDocs(collection(db, "users", uid, "state"));
  const b = writeBatch(db);
  stateSnap.forEach((d) => b.delete(d.ref));
  await b.commit();
}

/** Helper: add XP to the user profile (level derived on read). */
export async function addXP(delta: number) {
  const uid = auth.currentUser?.uid;
  if (!uid || !delta) return;
  const ref = doc(db, "users", uid);
  const { getDoc, updateDoc } = await import("firebase/firestore");
  const snap = await getDoc(ref);
  const cur = snap.exists() ? Number((snap.data() as { xp?: number }).xp) || 0 : 0;
  await updateDoc(ref, { xp: cur + delta });
}
