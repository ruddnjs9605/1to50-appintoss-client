import { useEffect, useRef, useState } from "react";

export function useTimer(active: boolean, resetKey = 0) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);

  useEffect(() => {
    setElapsed(0);
    elapsedRef.current = 0;
    startRef.current = 0;
  }, [resetKey]);

  useEffect(() => {
    if (!active) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }

    startRef.current = Date.now() - elapsedRef.current * 1000;
    timerRef.current = window.setInterval(() => {
      const next = (Date.now() - startRef.current) / 1000;
      elapsedRef.current = next;
      setElapsed(next);
    }, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [active, resetKey]);

  return elapsed;
}
