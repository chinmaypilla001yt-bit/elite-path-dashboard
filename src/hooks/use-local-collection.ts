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
  getDocs,
  query,
  orderBy,
  writeBatch,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/lib/firebase";

export type Identified = { id: string };

function userSub(uid: string, key: string) {
  return collection(db, "users", uid, key);
}
function stateDoc(uid: string, key: string) {
  return doc(db, "users", uid, "state", key);
}

/** Track the current auth uid reactively so hooks re-subscribe on sign-in. */
function useUid() {
  const [uid, setUid] = useState<string | null>(() => auth.currentUser?.uid ?? null);
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null));
  }, []);
  return uid;
}

/** Single-value user state, backed by users/{uid}/state/{key}.value */
export function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);
  const uid = useUid();
  const initialRef = useRef(initial);
  initialRef.current = initial;

  useEffect(() => {
    if (!uid) {
      setValue(initialRef.current);
      setHydrated(true);
      return;
    }
    setHydrated(false);
    const ref = stateDoc(uid, key);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as { value?: T };
          setValue(data.value !== undefined ? (data.value as T) : initialRef.current);
        } else {
          setValue(initialRef.current);
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
  }, [uid, key]);

  const update = useCallback(
    (v: T | ((prev: T) => T)) => {
      const currentUid = uid ?? auth.currentUser?.uid;
      if (!currentUid) return;
      setValue((prev) => {
        const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
        void setDoc(stateDoc(currentUid, key), { value: next }, { merge: true });
        return next;
      });
    },
    [uid, key],
  );

  return [value, update, hydrated] as const;
}

/** Collection of items, backed by users/{uid}/{key}/{docId} */
export function useLocalCollection<T extends Identified>(key: string, _initial: T[] = []) {
  const [items, setItems] = useState<T[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const uid = useUid();

  useEffect(() => {
    if (!uid) {
      setItems([]);
      setHydrated(true);
      return;
    }
    setHydrated(false);
    const col = userSub(uid, key);
    const q = query(col, orderBy("_createdAt", "desc"));
    let fallbackUnsub: (() => void) | null = null;

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
        // eslint-disable-next-line no-console
        console.warn("[useLocalCollection]", key, err?.message);
        fallbackUnsub = onSnapshot(col, (snap) => {
          const out: T[] = [];
          snap.forEach((d) => {
            const data = d.data() as Record<string, unknown>;
            out.push({ ...(data as T), id: d.id });
          });
          setItems(out);
          setHydrated(true);
        });
      },
    );
    return () => {
      unsub();
      if (fallbackUnsub) fallbackUnsub();
    };
  }, [uid, key]);

  const add = useCallback(
    async (item: Omit<T, "id"> & Partial<Identified>) => {
      const currentUid = uid ?? auth.currentUser?.uid;
      if (!currentUid) throw new Error("Not signed in");
      const col = userSub(currentUid, key);
      const payload = { ...(item as Record<string, unknown>), _createdAt: Date.now() };
      delete (payload as Record<string, unknown>).id;
      const ref = (item as Partial<Identified>).id
        ? doc(col, (item as Identified).id)
        : doc(col);
      await setDoc(ref, payload);
      return ref.id;
    },
    [uid, key],
  );

  const update = useCallback(
    async (id: string, patch: Partial<T>) => {
      const currentUid = uid ?? auth.currentUser?.uid;
      if (!currentUid) throw new Error("Not signed in");
      const ref = doc(userSub(currentUid, key), id);
      const clean: Record<string, unknown> = { ...(patch as Record<string, unknown>) };
      delete clean.id;
      await updateDoc(ref, clean);
    },
    [uid, key],
  );

  const remove = useCallback(
    async (id: string) => {
      const currentUid = uid ?? auth.currentUser?.uid;
      if (!currentUid) throw new Error("Not signed in");
      await deleteDoc(doc(userSub(currentUid, key), id));
    },
    [uid, key],
  );

  const clear = useCallback(async () => {
    const currentUid = uid ?? auth.currentUser?.uid;
    if (!currentUid) return;
    const snap = await getDocs(userSub(currentUid, key));
    const batch = writeBatch(db);
    snap.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }, [uid, key]);

  const setItemsExternal = useCallback(
    async (next: T[] | ((prev: T[]) => T[])) => {
      const currentUid = uid ?? auth.currentUser?.uid;
      if (!currentUid) return;
      const value = typeof next === "function" ? (next as (p: T[]) => T[])(items) : next;
      const col = userSub(currentUid, key);
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
    [items, uid, key],
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
