import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
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

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = auth.currentUser;
    if (!u) {
      setLoading(false);
      return;
    }
    const unsub = onSnapshot(doc(db, "users", u.uid), (snap) => {
      setProfile(snap.exists() ? ({ uid: u.uid, ...(snap.data() as Profile) }) : null);
      setLoading(false);
    });
    return unsub;
  }, []);

  const xp = Number(profile?.xp ?? 0);
  return { profile, loading, xp, stats: xpStats(xp) };
}
