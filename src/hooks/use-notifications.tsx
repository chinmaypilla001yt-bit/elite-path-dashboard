import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  writeBatch,
  getDocs,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";

export type NotifSettings = {
  enabled: boolean;
  daily: boolean;
  study: boolean;
  task: boolean;
  calendar: boolean;
  xp: boolean;
  streak: boolean;
  reminderTimes: string[]; // "HH:MM"
};

export type NotifItem = {
  id: string;
  icon?: string;
  title: string;
  message: string;
  createdAt: number;
  read?: boolean;
  category?: string;
};

const DEFAULT_SETTINGS: NotifSettings = {
  enabled: true,
  daily: true,
  study: true,
  task: true,
  calendar: true,
  xp: true,
  streak: true,
  reminderTimes: ["08:00", "18:00", "21:00"],
};

type Ctx = {
  permission: NotificationPermission | "unsupported";
  requestPermission: () => Promise<NotificationPermission | "unsupported">;
  settings: NotifSettings;
  updateSettings: (patch: Partial<NotifSettings>) => Promise<void>;
  items: NotifItem[];
  unread: number;
  push: (n: Omit<NotifItem, "id" | "createdAt" | "read">) => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
};

const NotifCtx = createContext<Ctx | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [uid, setUid] = useState<string | null>(auth.currentUser?.uid ?? null);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "unsupported",
  );
  const [settings, setSettings] = useState<NotifSettings>(DEFAULT_SETTINGS);
  const [items, setItems] = useState<NotifItem[]>([]);

  useEffect(() => onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null)), []);

  // Load settings + items
  useEffect(() => {
    if (!uid) {
      setSettings(DEFAULT_SETTINGS);
      setItems([]);
      return;
    }
    const unsubS = onSnapshot(doc(db, "users", uid, "state", "notif-settings"), (snap) => {
      if (snap.exists()) {
        const v = (snap.data() as { value?: Partial<NotifSettings> }).value ?? {};
        setSettings({ ...DEFAULT_SETTINGS, ...v });
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
    });
    const unsubI = onSnapshot(collection(db, "users", uid, "notifications"), (snap) => {
      const arr: NotifItem[] = [];
      snap.forEach((d) => arr.push({ ...(d.data() as NotifItem), id: d.id }));
      arr.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setItems(arr);
    });
    return () => {
      unsubS();
      unsubI();
    };
  }, [uid]);

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return "unsupported" as const;
    try {
      const p = await Notification.requestPermission();
      setPermission(p);
      return p;
    } catch {
      return Notification.permission;
    }
  }, []);

  // Ask permission once shortly after login
  useEffect(() => {
    if (!uid) return;
    if (permission === "default") {
      const t = window.setTimeout(() => void requestPermission(), 1500);
      return () => window.clearTimeout(t);
    }
  }, [uid, permission, requestPermission]);

  const updateSettings = useCallback(
    async (patch: Partial<NotifSettings>) => {
      if (!uid) return;
      const next = { ...settings, ...patch };
      setSettings(next);
      await setDoc(
        doc(db, "users", uid, "state", "notif-settings"),
        { value: next },
        { merge: true },
      );
    },
    [uid, settings],
  );

  const push = useCallback<Ctx["push"]>(
    async (n) => {
      if (!uid) return;
      if (!settings.enabled) return;
      const id = crypto.randomUUID();
      const item: NotifItem = {
        id,
        title: n.title,
        message: n.message,
        icon: n.icon,
        category: n.category,
        createdAt: Date.now(),
        read: false,
      };
      await setDoc(doc(db, "users", uid, "notifications", id), item);
      try {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(n.title, { body: n.message });
        }
      } catch {}
    },
    [uid, settings.enabled],
  );

  const markRead = useCallback(
    async (id: string) => {
      if (!uid) return;
      await setDoc(doc(db, "users", uid, "notifications", id), { read: true }, { merge: true });
    },
    [uid],
  );

  const markAllRead = useCallback(async () => {
    if (!uid) return;
    const batch = writeBatch(db);
    for (const it of items) {
      if (!it.read) batch.set(doc(db, "users", uid, "notifications", it.id), { read: true }, { merge: true });
    }
    await batch.commit();
  }, [uid, items]);

  const remove = useCallback(
    async (id: string) => {
      if (!uid) return;
      await deleteDoc(doc(db, "users", uid, "notifications", id));
    },
    [uid],
  );

  const clearAll = useCallback(async () => {
    if (!uid) return;
    const snap = await getDocs(collection(db, "users", uid, "notifications"));
    const batch = writeBatch(db);
    snap.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }, [uid]);

  const value = useMemo<Ctx>(
    () => ({
      permission,
      requestPermission,
      settings,
      updateSettings,
      items,
      unread: items.filter((i) => !i.read).length,
      push,
      markRead,
      markAllRead,
      remove,
      clearAll,
    }),
    [permission, requestPermission, settings, updateSettings, items, push, markRead, markAllRead, remove, clearAll],
  );

  return (
    <NotifCtx.Provider value={value}>
      {children}
      <ReminderEngine />
    </NotifCtx.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotifCtx);
  if (!ctx) throw new Error("useNotifications must be inside NotificationsProvider");
  return ctx;
}

// Fires daily reminder messages at the configured local times.
function ReminderEngine() {
  const { settings, push } = useNotifications();
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!settings.enabled || !settings.daily) return;
    const id = window.setInterval(() => {
      const now = new Date();
      const hhmm = now.toTimeString().slice(0, 5);
      const dayKey = now.toISOString().slice(0, 10);
      for (const t of settings.reminderTimes) {
        const key = `${dayKey}-${t}`;
        if (t === hhmm && !firedRef.current.has(key)) {
          firedRef.current.add(key);
          void push({
            title: "🎯 Daily check-in",
            message: "Review today's tasks, log study, and keep the streak alive.",
            category: "daily",
            icon: "🎯",
          });
        }
      }
    }, 30_000);
    return () => window.clearInterval(id);
  }, [settings, push]);

  return null;
}
