import { useEffect, useRef, useState } from "react";

export function useLocalStorage<T>(key: string, initial: T) {
  const isHydrated = useRef(false);
  const [state, setState] = useState<T>(initial);

  useEffect(() => {
    if (isHydrated.current) return;
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
      if (raw) setState(JSON.parse(raw) as T);
    } catch {}
    isHydrated.current = true;
  }, [key]);

  useEffect(() => {
    if (!isHydrated.current) return;
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(state));
      }
    } catch {}
  }, [key, state]);

  return [state, setState] as const;
}
