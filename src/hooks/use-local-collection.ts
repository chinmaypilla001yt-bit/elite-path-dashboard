import { useCallback, useEffect, useState } from "react";

const PREFIX = "ascend:";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("ascend:storage", { detail: key }));
  } catch {
    /* noop */
  }
}

export function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setValue(read<T>(key, initial));
    setHydrated(true);
    const handler = (e: Event) => {
      if ((e as CustomEvent).detail === key) setValue(read<T>(key, initial));
    };
    window.addEventListener("ascend:storage", handler);
    return () => window.removeEventListener("ascend:storage", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (v: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
        write(key, next);
        return next;
      });
    },
    [key],
  );

  return [value, update, hydrated] as const;
}

export type Identified = { id: string };

export function useLocalCollection<T extends Identified>(key: string, initial: T[] = []) {
  const [items, setItems, hydrated] = useLocalState<T[]>(key, initial);

  const add = useCallback(
    (item: Omit<T, "id"> & Partial<Identified>) => {
      const id = item.id ?? (crypto?.randomUUID?.() ?? String(Date.now() + Math.random()));
      setItems((prev) => [{ ...(item as T), id }, ...prev]);
      return id;
    },
    [setItems],
  );

  const update = useCallback(
    (id: string, patch: Partial<T>) => {
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
    },
    [setItems],
  );

  const remove = useCallback(
    (id: string) => setItems((prev) => prev.filter((it) => it.id !== id)),
    [setItems],
  );

  const clear = useCallback(() => setItems([]), [setItems]);

  return { items, add, update, remove, clear, setItems, hydrated };
}

export function clearAllAscendData() {
  if (typeof window === "undefined") return;
  const keys: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (k && k.startsWith(PREFIX)) keys.push(k);
  }
  keys.forEach((k) => window.localStorage.removeItem(k));
  window.dispatchEvent(new CustomEvent("ascend:storage", { detail: "*" }));
}
