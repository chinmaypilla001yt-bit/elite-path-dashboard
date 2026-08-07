import { useCallback, useEffect, useRef, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import {
  emptyResume,
  normalizeResume,
  type ResumeData,
  type ResumeDoc,
} from "@/lib/resume";

const DRAFT_KEY = "ascend:resume-draft";

function col(uid: string) {
  return collection(db, "users", uid, "resumes");
}

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useResumes() {
  const [uid, setUid] = useState<string | null>(auth.currentUser?.uid ?? null);
  const [resumes, setResumes] = useState<ResumeDoc[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [local, setLocal] = useState<ResumeData | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeIdRef = useRef<string | null>(null);
  activeIdRef.current = activeId;

  useEffect(() => onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null)), []);

  // Restore an unsaved draft after an unexpected refresh.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { id: string; data: ResumeData };
      if (parsed?.id && parsed?.data) {
        setActiveId(parsed.id);
        setLocal(normalizeResume(parsed.data));
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!uid) {
      setResumes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = onSnapshot(
      col(uid),
      (snap) => {
        const out: ResumeDoc[] = [];
        snap.forEach((d) => {
          const raw = d.data() as Partial<ResumeDoc>;
          out.push({
            id: d.id,
            title: raw.title || "Untitled resume",
            data: normalizeResume(raw.data),
            createdAt: raw.createdAt ?? 0,
            updatedAt: raw.updatedAt ?? 0,
          });
        });
        out.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
        setResumes(out);
        setLoading(false);
        setActiveId((cur) => cur ?? out[0]?.id ?? null);
      },
      () => setLoading(false),
    );
    return unsub;
  }, [uid]);

  const active = resumes.find((r) => r.id === activeId) ?? null;
  const data = local ?? active?.data ?? null;

  const create = useCallback(
    async (title: string, seed?: ResumeData) => {
      const u = auth.currentUser?.uid;
      if (!u) throw new Error("Not signed in");
      const ref = doc(col(u));
      const now = Date.now();
      await setDoc(ref, {
        title: title.trim() || "Untitled resume",
        data: seed ?? emptyResume(auth.currentUser?.displayName ?? "", auth.currentUser?.email ?? ""),
        createdAt: now,
        updatedAt: now,
      });
      setLocal(null);
      setActiveId(ref.id);
      return ref.id;
    },
    [],
  );

  const rename = useCallback(async (id: string, title: string) => {
    const u = auth.currentUser?.uid;
    if (!u) throw new Error("Not signed in");
    await updateDoc(doc(col(u), id), { title: title.trim() || "Untitled resume", updatedAt: Date.now() });
  }, []);

  const duplicate = useCallback(
    async (id: string) => {
      const src = resumes.find((r) => r.id === id);
      if (!src) return;
      await create(`${src.title} (copy)`, src.data);
    },
    [resumes, create],
  );

  const remove = useCallback(
    async (id: string) => {
      const u = auth.currentUser?.uid;
      if (!u) throw new Error("Not signed in");
      await deleteDoc(doc(col(u), id));
      if (activeIdRef.current === id) {
        setLocal(null);
        setActiveId(null);
      }
    },
    [],
  );

  const flush = useCallback(async (id: string, next: ResumeData) => {
    const u = auth.currentUser?.uid;
    if (!u) return;
    setStatus("saving");
    try {
      await updateDoc(doc(col(u), id), { data: next, updatedAt: Date.now() });
      setStatus("saved");
      if (typeof window !== "undefined") window.localStorage.removeItem(DRAFT_KEY);
      setLocal(null);
    } catch {
      setStatus("error");
    }
  }, []);

  /** Optimistic local edit + debounced Firestore autosave. */
  const edit = useCallback(
    (updater: (prev: ResumeData) => ResumeData) => {
      const id = activeIdRef.current;
      const current = local ?? resumes.find((r) => r.id === id)?.data;
      if (!id || !current) return;
      const next = updater(current);
      setLocal(next);
      setStatus("saving");
      if (typeof window !== "undefined") {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ id, data: next }));
      }
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(id, next), 1200);
    },
    [local, resumes, flush],
  );

  const saveNow = useCallback(() => {
    const id = activeIdRef.current;
    if (id && local) {
      if (timer.current) clearTimeout(timer.current);
      void flush(id, local);
    }
  }, [local, flush]);

  const select = useCallback((id: string) => {
    setLocal(null);
    setActiveId(id);
  }, []);

  return {
    resumes, active, activeId, data, loading, status,
    create, rename, duplicate, remove, select, edit, saveNow,
  };
}
