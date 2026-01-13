import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "one-to-fifty:best";

function sanitizeTime(time: number) {
  if (!Number.isFinite(time) || time <= 0) return null;
  return Number(time.toFixed(2));
}

function loadBest(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return sanitizeTime(Number(JSON.parse(raw)));
  } catch {
    return null;
  }
}

function persistBest(time: number) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(time));
  } catch {
    /* ignore write errors */
  }
}

export function useRanking() {
  const [bestTime, setBestTime] = useState<number | null>(() => loadBest());
  const bestRef = useRef<number | null>(bestTime);

  useEffect(() => {
    bestRef.current = bestTime;
  }, [bestTime]);

  const addRecord = useCallback((time: number) => {
    const sanitized = sanitizeTime(time);
    if (sanitized === null) return { newRecord: false, best: bestRef.current };

    const prev = bestRef.current;
    const next = prev === null ? sanitized : Math.min(prev, sanitized);
    const newRecord = prev === null || sanitized < prev;

    bestRef.current = next;
    setBestTime(next);
    persistBest(next);

    return { newRecord, best: next };
  }, []);

  return { bestTime, addRecord };
}
