"use client";

import { useCallback, useEffect, useState } from "react";

export interface AsyncDataState<T> {
  data: T | undefined;
  loading: boolean;
  error: string | undefined;
  refetch: () => void;
}

export function useAsyncData<T>(fetcher: () => Promise<T>, deps: unknown[] = []): AsyncDataState<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [reloadKey, setReloadKey] = useState(0);
  const depsKey = JSON.stringify(deps);

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(undefined);
    fetcher()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Something went wrong.");
      })
      .finally(() => {
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

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  return { data, loading, error, refetch };
}
