"use client";

import { useCallback, useEffect, useRef, useState } from "react";
export function useAsyncData(fetcher, deps = []) {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(undefined);
  const [reloadKey, setReloadKey] = useState(0);
  const depsKey = JSON.stringify(deps);

  // Set from refetch({ silent: true }) — read (not written) during render
  // would trip react-hooks/refs, so it's only ever touched from the refetch
  // callback and from load() itself, both outside render.
  const silentRef = useRef(false);

  const load = useCallback(() => {
    let cancelled = false;
    if (!silentRef.current) setLoading(true);
    setError(undefined);
    fetcher().then(result => {
      if (!cancelled) setData(result);
    }).catch(err => {
      if (!cancelled) setError(err instanceof Error ? err.message : "Something went wrong.");
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depsKey, reloadKey]);
  useEffect(() => {
    // Data-fetching effect: setLoading/setData/setError are triggered by the
    // fetch lifecycle, not synchronously on every render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    return load();
  }, [load]);

  // refetch({ silent: true }) skips the loading flag — for background
  // refreshes (e.g. campaign-status polling every 2s while it's running)
  // that shouldn't re-flash the table skeleton on every tick.
  const refetch = useCallback(options => {
    silentRef.current = !!options?.silent;
    setReloadKey(k => k + 1);
  }, []);
  return {
    data,
    loading,
    error,
    refetch
  };
}
