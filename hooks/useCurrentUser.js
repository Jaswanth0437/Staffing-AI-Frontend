"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/currentUser";

const FALLBACK_USER = { name: "Alex Morgan", email: "" };

/** Reads the mock-SSO identity captured at login (see lib/currentUser.js).
 * Starts as the fallback on the server/first render and swaps in the real
 * value from localStorage once mounted, avoiding a hydration mismatch. */
export function useCurrentUser() {
  const [user, setUser] = useState(FALLBACK_USER);
  useEffect(() => {
    const stored = getCurrentUser();
    // Reading an external system (localStorage) and syncing it in, not
    // synchronously derived from props/state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setUser(stored);
  }, []);
  return user;
}
