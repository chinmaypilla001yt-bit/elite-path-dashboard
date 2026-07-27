import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, writeBatch, collection } from "firebase/firestore";

type AuthCtx = {
  user: User | null;
  loading: boolean;
  signInGoogle: () => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

const LOCAL_PREFIX = "ascend:";

// Migrate any pre-existing localStorage ascend:* data into the user's Firestore doc, then clear it.
async function migrateLocalStorageOnce(uid: string) {
  if (typeof window === "undefined") return;
  const profileRef = doc(db, "users", uid);
  const snap = await getDoc(profileRef);
  if (snap.exists() && (snap.data() as { migrated?: boolean }).migrated) return;

  const keys: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (k && k.startsWith(LOCAL_PREFIX)) keys.push(k);
  }

  const batch = writeBatch(db);
  let wrote = false;

  for (const fullKey of keys) {
    const key = fullKey.slice(LOCAL_PREFIX.length);
    const raw = window.localStorage.getItem(fullKey);
    if (!raw) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      continue;
    }
    if (Array.isArray(parsed)) {
      // Collection → users/{uid}/{key}/{id}
      for (const item of parsed) {
        if (item && typeof item === "object" && (item as { id?: string }).id) {
          const it = item as Record<string, unknown> & { id: string };
          const ref = doc(collection(db, "users", uid, key), it.id);
          batch.set(ref, { ...it, _createdAt: Date.now() });
          wrote = true;
        }
      }
    } else {
      // Scalar / object → users/{uid}/state/{key}
      const ref = doc(db, "users", uid, "state", key);
      batch.set(ref, { value: parsed });
      wrote = true;
    }
  }

  batch.set(profileRef, { migrated: true, migratedAt: Date.now() }, { merge: true });
  await batch.commit();

  if (wrote) {
    for (const k of keys) window.localStorage.removeItem(k);
  }
}

async function ensureProfile(u: User) {
  const ref = doc(db, "users", u.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: u.uid,
      email: u.email,
      displayName: u.displayName,
      photoURL: u.photoURL,
      xp: 0,
      createdAt: Date.now(),
    });
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          await ensureProfile(u);
          await migrateLocalStorageOnce(u.uid);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error("[auth] post-login setup failed", e);
        }
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signInGoogle = useCallback(async () => {
    await signInWithPopup(auth, googleProvider);
  }, []);
  const signInEmail = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);
  const signUpEmail = useCallback(async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  }, []);
  const signOut = useCallback(async () => {
    await fbSignOut(auth);
  }, []);

  const value = useMemo(
    () => ({ user, loading, signInGoogle, signInEmail, signUpEmail, signOut }),
    [user, loading, signInGoogle, signInEmail, signUpEmail, signOut],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
