"use client";
import { useState, useEffect } from "react";

export function useCountdown(seed: number, hours: number = 48) {
  const [remaining, setRemaining] = useState<{ h: number; m: number; s: number; expired: boolean }>({
    h: 0, m: 0, s: 0, expired: false,
  });

  useEffect(() => {
    const windowMs = hours * 60 * 60 * 1000;
    const epoch = 1782000000000;
    const offset = (seed * 3600000) % windowMs;
    const cycle = Math.floor((Date.now() - epoch - offset) / windowMs);
    const deadline = epoch + offset + (cycle + 1) * windowMs;

    const tick = () => {
      const diff = deadline - Date.now();
      if (diff <= 0) { setRemaining({ h: 0, m: 0, s: 0, expired: true }); return; }
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setRemaining({ h, m, s, expired: false });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [seed, hours]);

  return remaining;
}

export function formatCountdown(r: { h: number; m: number; s: number }): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(r.h)}:${pad(r.m)}:${pad(r.s)}`;
}
