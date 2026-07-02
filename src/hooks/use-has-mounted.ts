"use client";

import { useSyncExternalStore } from "react";

/**
 * Returns true once the component has mounted on the client.
 * Uses useSyncExternalStore so SSR and first client render agree (returns false),
 * then re-renders to true afterwards — without any setState-in-effect.
 */
const emptySubscribe = () => () => {};

export function useHasMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true, // client snapshot: mounted
    () => false // server snapshot: not mounted
  );
}
