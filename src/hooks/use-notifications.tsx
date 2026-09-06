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
  inIframe: boolean;
  requestPermission: () => Promise<NotificationPermission | "unsupported">;
  settings: NotifSettings;
  updateSettings: (patch: Partial<NotifSettings>) => Promise<void>;
  items: NotifItem[];
  unread: number;
  push: (n: Omit<NotifItem, "id" | "createdAt" | "read">) => Promise<void>;
  pushOnce: (key: string, n: Omit<NotifItem, "id" | "createdAt" | "read">) => Promise<void>;
  sendTest: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
};

const NotifCtx = createContext<Ctx | null>(null);

// Local-timezone day key (never UTC — reminders follow the user's clock).
export function localDay(d: Date = new Date()) {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function minutesNow(d: Date = new Date()) {
  return d.getHours() * 60 + d.getMinutes();
}

function hhmmToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [uid, setUid] = useState<string | null>(auth.currentUser?.uid ?? null);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "unsupported",
  );
  const [inIframe, setInIframe] = useState(false);
  const [settings, setSettings] = useState<NotifSettings>(DEFAULT_SETTINGS);
  const [items, setItems] = useState<NotifItem[]>([]);
  // Persisted dedupe ledger: key -> timestamp. Survives refresh and re-render.
  const firedRef = useRef<Record<string, number>>({});
  const firedLoadedRef = useRef(false);

  useEffect(() => onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null)), []);
  useEffect(() => setInIframe(window.top !== window.self), []);

  // Load settings + items + dedupe ledger
  useEffect(() => {
    firedRef.current = {};
    firedLoadedRef.current = false;
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
    const unsubF = onSnapshot(doc(db, "users", uid, "state", "notif-fired"), (snap) => {
      const v = (snap.exists() ? (snap.data() as { keys?: Record<string, number> }).keys : {}) ?? {};
      // Remote wins, but never forget keys fired in this session.
      firedRef.current = { ...v, ...firedRef.current };
      firedLoadedRef.current = true;
    });
    const unsubI = onSnapshot(collection(db, "users", uid, "notifications"), (snap) => {
      const arr: NotifItem[] = [];
      snap.forEach((d) => arr.push({ ...(d.data() as NotifItem), id: d.id }));
      arr.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setItems(arr);
    });
    return () => {
      unsubS();
      unsubF();
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
      setPermission(Notification.permission);
      return Notification.permission;
    }
  }, []);

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

  const deliver = useCallback(
    async (uidValue: string, n: Omit<NotifItem, "id" | "createdAt" | "read">) => {
      const id = crypto.randomUUID();
      const item: NotifItem = {
        id,
        title: n.title,
        message: n.message,
        icon: n.icon ?? "🔔",
        category: n.category ?? "general",
        createdAt: Date.now(),
        read: false,
      };
      await setDoc(doc(db, "users", uidValue, "notifications", id), item);
      try {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(n.title, { body: n.message, tag: n.category ?? "ascend" });
        }
      } catch {}
    },
    [],
  );

  const push = useCallback<Ctx["push"]>(
    async (n) => {
      if (!uid || !settings.enabled) return;
      await deliver(uid, n);
    },
    [uid, settings.enabled, deliver],
  );

  // Fires at most once per key, ever (ledger lives in Firestore).
  const pushOnce = useCallback<Ctx["pushOnce"]>(
    async (key, n) => {
      if (!uid || !settings.enabled) return;
      if (!firedLoadedRef.current) return; // wait for ledger, avoids refresh duplicates
      if (firedRef.current[key]) return;
      firedRef.current[key] = Date.now();
      await deliver(uid, n);
      // Prune entries older than 14 days so the doc stays small.
      const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
      const keys: Record<string, number> = {};
      for (const [k, ts] of Object.entries(firedRef.current)) if (ts >= cutoff) keys[k] = ts;
      firedRef.current = keys;
      await setDoc(doc(db, "users", uid, "state", "notif-fired"), { keys }, { merge: false });
    },
    [uid, settings.enabled, deliver],
  );

  const sendTest = useCallback(async () => {
    if (!uid) return;
    await deliver(uid, {
      title: "✅ Test notification",
      message: "If you can see this, Ascend reminders are working.",
      icon: "✅",
      category: "test",
    });
  }, [uid, deliver]);

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
      if (!it.read)
        batch.set(doc(db, "users", uid, "notifications", it.id), { read: true }, { merge: true });
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
      inIframe,
      requestPermission,
      settings,
      updateSettings,
      items,
      unread: items.filter((i) => !i.read).length,
      push,
      pushOnce,
      sendTest,
      markRead,
      markAllRead,
      remove,
      clearAll,
    }),
    [
      permission,
      inIframe,
      requestPermission,
      settings,
      updateSettings,
      items,
      push,
      pushOnce,
      sendTest,
      markRead,
      markAllRead,
      remove,
      clearAll,
    ],
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

type Task = { id: string; title: string; done?: boolean; createdAt?: number };
type Event = { id: string; title: string; date?: string; time?: string };
type Session = { id: string; subject?: string; minutes?: number; date?: string };

// Scans live Firestore data every minute (and on open, catching up on missed
// times today) and fires each reminder at most once via the persisted ledger.
function ReminderEngine() {
  const { settings, pushOnce } = useNotifications();
  const [uid, setUid] = useState<string | null>(auth.currentUser?.uid ?? null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null)), []);

  useEffect(() => {
    if (!uid) {
      setTasks([]);
      setEvents([]);
      setSessions([]);
      return;
    }
    const subs = [
      onSnapshot(collection(db, "users", uid, "tasks"), (s) =>
        setTasks(s.docs.map((d) => ({ ...(d.data() as Task), id: d.id }))),
      ),
      onSnapshot(collection(db, "users", uid, "calendar"), (s) =>
        setEvents(s.docs.map((d) => ({ ...(d.data() as Event), id: d.id }))),
      ),
      onSnapshot(collection(db, "users", uid, "study"), (s) =>
        setSessions(s.docs.map((d) => ({ ...(d.data() as Session), id: d.id }))),
      ),
    ];
    return () => subs.forEach((u) => u());
  }, [uid]);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!uid || !settings.enabled) return;
    void tick;
    const now = new Date();
    const day = localDay(now);
    const mins = minutesNow(now);
    const times = settings.reminderTimes
      .map((t) => ({ t, m: hhmmToMinutes(t) }))
      .filter((x): x is { t: string; m: number } => x.m !== null)
      .sort((a, b) => a.m - b.m);
    const firstTime = times[0]?.m ?? 9 * 60;

    // 1. Daily check-in at each configured local time (catch-up if page opened later).
    if (settings.daily) {
      for (const { t, m } of times) {
        if (mins >= m) {
          void pushOnce(`daily-${day}-${t}`, {
            title: "🎯 Daily check-in",
            message: "Review today's tasks, log study, and keep the streak alive.",
            category: "daily",
            icon: "🎯",
          });
        }
      }
    }

    // 2. Pending / overdue tasks summary.
    if (settings.task && mins >= firstTime) {
      const pending = tasks.filter((t) => !t.done);
      const stale = pending.filter(
        (t) => t.createdAt && now.getTime() - t.createdAt > 2 * 24 * 60 * 60 * 1000,
      );
      if (pending.length > 0) {
        void pushOnce(`task-${day}`, {
          title: `📋 ${pending.length} task${pending.length === 1 ? "" : "s"} pending`,
          message: stale.length
            ? `${stale.length} have been open for more than 2 days — including "${stale[0].title}".`
            : `Next up: "${pending[0].title}".`,
          category: "task",
          icon: "📋",
        });
      }
    }

    // 3. Calendar events: 60 min before timed events, and a morning list for today.
    if (settings.calendar) {
      const todays = events.filter((e) => e.date === day);
      if (todays.length && mins >= firstTime) {
        void pushOnce(`cal-day-${day}`, {
          title: `📅 ${todays.length} event${todays.length === 1 ? "" : "s"} today`,
          message: todays.map((e) => e.title).join(", "),
          category: "calendar",
          icon: "📅",
        });
      }
      for (const e of todays) {
        const m = e.time ? hhmmToMinutes(e.time) : null;
        if (m === null) continue;
        if (mins >= m - 60 && mins <= m + 5) {
          void pushOnce(`cal-${e.id}-${day}`, {
            title: `⏰ ${e.title}`,
            message: `Starts at ${e.time} (in ${Math.max(0, m - mins)} min).`,
            category: "calendar",
            icon: "⏰",
          });
        }
      }
    }

    // 4. Study reminder + 5. streak-at-risk warning, evening only.
    const studiedToday = sessions.some((s) => s.date === day);
    if (!studiedToday && mins >= 20 * 60) {
      if (settings.study) {
        void pushOnce(`study-${day}`, {
          title: "📚 No study logged today",
          message: "Even 25 focused minutes keeps the momentum going.",
          category: "study",
          icon: "📚",
        });
      }
      if (settings.streak) {
        const yesterday = localDay(new Date(now.getTime() - 24 * 60 * 60 * 1000));
        if (sessions.some((s) => s.date === yesterday)) {
          void pushOnce(`streak-${day}`, {
            title: "🔥 Streak at risk",
            message: "You studied yesterday — log a session before midnight to keep the streak.",
            category: "streak",
            icon: "🔥",
          });
        }
      }
    }
  }, [uid, settings, tasks, events, sessions, tick, pushOnce]);

  return null;
}
