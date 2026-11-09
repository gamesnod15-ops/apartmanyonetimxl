"use client";

import { useEffect, useState } from "react";

export function useNow(intervalMs = 60000) {
  const [now, setNow] = useState(0);

  useEffect(() => {
    const update = () => setNow(Date.now());
    const timeout = setTimeout(update, 0);
    const interval = setInterval(update, intervalMs);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [intervalMs]);

  return now;
}
