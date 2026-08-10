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
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";

export type ThemeId = "midnight" | "forest" | "sunset" | "arctic" | "obsidian";

export type ThemeMeta = {
  id: ThemeId;
  name: string;
  tagline: string;
  /** preview swatches: [background, surface, accent, accent-2, text] */
  background: string;
  surface: string;
  accent: string;
  accent2: string;
  text: string;
};

export const THEMES: ThemeMeta[] = [
  {
    id: "midnight",
    name: "Midnight",
    tagline: "Deep navy · electric blue · premium tech",
    background: "oklch(0.13 0.04 275)",
    surface: "oklch(0.21 0.05 275)",
    accent: "oklch(0.72 0.2 255)",
    accent2: "oklch(0.66 0.24 305)",
    text: "oklch(0.96 0.01 260)",
  },
  {
    id: "forest",
    name: "Forest",
    tagline: "Charcoal green · emerald · calm focus",
    background: "oklch(0.15 0.025 160)",
    surface: "oklch(0.22 0.03 160)",
    accent: "oklch(0.74 0.17 158)",
    accent2: "oklch(0.84 0.12 185)",
    text: "oklch(0.96 0.01 150)",
  },
  {
    id: "sunset",
    name: "Sunset",
    tagline: "Deep purple · orange & magenta · creative",
    background: "oklch(0.16 0.06 305)",
    surface: "oklch(0.23 0.07 305)",
    accent: "oklch(0.72 0.2 25)",
    accent2: "oklch(0.68 0.24 330)",
    text: "oklch(0.97 0.01 330)",
  },
  {
    id: "arctic",
    name: "Arctic",
    tagline: "Light & clean · blue and cyan accents",
    background: "oklch(0.98 0.005 240)",
    surface: "oklch(1 0 0)",
    accent: "oklch(0.55 0.18 250)",
    accent2: "oklch(0.66 0.13 210)",
    text: "oklch(0.22 0.03 260)",
  },
  {
    id: "obsidian",
    name: "Obsidian",
    tagline: "Near-black · violet accents · minimalist",
    background: "oklch(0.09 0.005 285)",
    surface: "oklch(0.17 0.008 285)",
    accent: "oklch(0.62 0.22 300)",
    accent2: "oklch(0.68 0.22 315)",
    text: "oklch(0.97 0.005 285)",
  },
];

export const DEFAULT_THEME: ThemeId = "midnight";
const LS_KEY = "ascend:theme";

function isTheme(v: unknown): v is ThemeId {
  return typeof v === "string" && THEMES.some((t) => t.id === v);
}

/** Applies the theme to <html> with a short, subtle cross-fade. */
function applyTheme(id: ThemeId, animate: boolean) {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  if (el.dataset.theme === id) return;
  if (animate) {
    el.setAttribute("data-theme-switching", "");
    window.setTimeout(() => el.removeAttribute("data-theme-switching"), 340);
  }
  el.dataset.theme = id;
}

type ThemeCtx = {
  theme: ThemeId;
  setTheme: (id: ThemeId) => Promise<void>;
  themes: ThemeMeta[];
};

const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const firstApply = useRef(true);

  // Local cache first — instant, flash-free on refresh.
  useEffect(() => {
    const cached = window.localStorage.getItem(LS_KEY);
    if (isTheme(cached)) setThemeState(cached);
  }, []);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  // Firestore profile is the source of truth (cross-device persistence).
  useEffect(() => {
    if (!user) return;
    return onSnapshot(doc(db, "users", user.uid), (snap) => {
      const remote = (snap.data() as { theme?: unknown } | undefined)?.theme;
      if (isTheme(remote)) {
        setThemeState(remote);
        window.localStorage.setItem(LS_KEY, remote);
      }
    });
  }, [user]);

  useEffect(() => {
    applyTheme(theme, !firstApply.current);
    firstApply.current = false;
  }, [theme]);

  const setTheme = useCallback(
    async (id: ThemeId) => {
      setThemeState(id); // immediate preview
      window.localStorage.setItem(LS_KEY, id);
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      await setDoc(doc(db, "users", uid), { theme: id }, { merge: true });
      await setDoc(doc(db, "users", uid, "state", "profile:theme"), { value: id }, { merge: true });
    },
    [],
  );

  const value = useMemo<ThemeCtx>(() => ({ theme, setTheme, themes: THEMES }), [theme, setTheme]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
