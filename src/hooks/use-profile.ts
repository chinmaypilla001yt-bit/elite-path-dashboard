import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { xpStats } from "@/lib/xp";

export type Profile = {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  xp?: number;
  name?: string;
};

/** Single source of truth for the user's name across the whole app. */
export function resolveDisplayName(
  profile: Pick<Profile, "name" | "displayName" | "email"> | null | undefined,
  user?: User | null,
) {
  return (
    profile?.name?.trim() ||
    profile?.displayName?.trim() ||
    user?.displayName?.trim() ||
    (profile?.email || user?.email || "").split("@")[0] ||
    "Ascending"
  );
}

/** Persist the custom display name — written to the user doc so every surface sees it. */
export async function saveDisplayName(name: string) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Not signed in");
  const clean = name.trim();
  await setDoc(doc(db, "users", uid), { name: clean }, { merge: true });
  await setDoc(doc(db, "users", uid, "state", "profile:name"), { value: clean }, { merge: true });
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(auth.currentUser);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = onSnapshot(
      doc(db, "users", user.uid),
      (snap) => {
        setProfile(snap.exists() ? { ...(snap.data() as Profile), uid: user.uid } : { uid: user.uid });
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsub;
  }, [user]);

  const xp = Number(profile?.xp ?? 0);
  return {
    profile,
    user,
    loading,
    xp,
    stats: xpStats(xp),
    displayName: resolveDisplayName(profile, user),
  };
}
