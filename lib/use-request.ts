// lib/use-request.ts
// Small data-fetching hooks so list screens stay simple.
"use client";

import { useEffect, useRef, useState } from "react";

import { getErrorMessage } from "./auth";

/** Returns `value` only after it has stopped changing for `delay` ms */
export function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

/**
 * Runs `fetcher` whenever `key` changes. Put everything the request depends on
 * in `key` (e.g. JSON.stringify of the filters). While a new request is in
 * flight, `data` keeps the previous result so lists do not flash empty.
 */
export function useRequest<T>(fetcher: () => Promise<T>, key: string) {
  const latest = useRef(fetcher);
  useEffect(() => {
    latest.current = fetcher;
  });

  const [state, setState] = useState<{ key: string; data: T | null; error: string | null }>({
    key: "",
    data: null,
    error: null,
  });

  useEffect(() => {
    let active = true;

    latest
      .current()
      .then((data) => {
        if (active) setState({ key, data, error: null });
      })
      .catch((err: unknown) => {
        if (active) setState({ key, data: state.data, error: getErrorMessage(err) });
      });

    return () => {
      active = false;
    };
    // `key` is the only trigger on purpose; `state.data` is only read to keep stale data on error
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return {
    data: state.data,
    error: state.key === key ? state.error : null,
    loading: state.key !== key,
  };
}