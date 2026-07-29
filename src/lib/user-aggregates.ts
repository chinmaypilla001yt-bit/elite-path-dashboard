// Syncs derived stats (study hours, streak) to users/{uid} so the leaderboard
// can rank without reading every user's private subcollections.
import { useEffect } from "react";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useLocalCollection } from "@/hooks/use-local-collection";

type Session = { id: string; subject: string; minutes?: number; date?: string };

function startOfWeek(d: Date) {
  const day = d.getDay(); // 0=Sun
  const diff = (day + 6) % 7; // Mon start
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - diff);
  return x;
}

export function useUserAggregatesSync() {
  const { items: sessions } = useLocalCollection<Session>("study");

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    let totalMin = 0;
    let weekMin = 0;
    let monthMin = 0;
    const now = new Date();
    const weekStart = startOfWeek(now).getTime();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const days = new Set<string>();
    for (const s of sessions) {
      const m = Number(s.minutes) || 0;
      totalMin += m;
      if (!s.date) continue;
      days.add(s.date);
      const t = new Date(s.date + "T00:00:00").getTime();
      if (t >= weekStart) weekMin += m;
      if (t >= monthStart) monthMin += m;
    }

    // Streak: consecutive days back from today with a session
    let streak = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    while (days.has(cursor.toISOString().slice(0, 10))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }

    const payload = {
      totalStudyHours: +(totalMin / 60).toFixed(2),
      weeklyStudyHours: +(weekMin / 60).toFixed(2),
      monthlyStudyHours: +(monthMin / 60).toFixed(2),
      streak,
      lastAggregateAt: Date.now(),
      // Also mirror auth info so leaderboard has fresh photo/name
      photoURL: auth.currentUser?.photoURL ?? null,
      displayName: auth.currentUser?.displayName ?? null,
      email: auth.currentUser?.email ?? null,
    };
    void setDoc(doc(db, "users", uid), payload, { merge: true });
  }, [sessions]);
}
