"use client";

import { useEffect, useState } from "react";

/** Keeps a modal/drawer mounted for `duration` ms after `open` goes false,
 * so its exit animation actually gets to play instead of the element
 * disappearing the instant `open` flips (React would otherwise unmount it
 * on the same render). Returns [shouldRender, closing] — render nothing
 * when shouldRender is false, and apply the exit animation class while
 * closing is true. */
export function useDelayedUnmount(open, duration = 200) {
  const [shouldRender, setShouldRender] = useState(open);
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    // Syncing to an external prop transition (open), not state derived from
    // props/state available during render — same pattern as
    // hooks/useCurrentUser.js's external-source sync.
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShouldRender(true);
      setClosing(false);
      return;
    }
    if (!shouldRender) return;
    setClosing(true);
    const timer = setTimeout(() => {
      setShouldRender(false);
      setClosing(false);
    }, duration);
    return () => clearTimeout(timer);
    // shouldRender is read, not depended on for re-triggering — only `open`
    // flipping should start/stop the exit timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, duration]);
  return [shouldRender, closing];
}
