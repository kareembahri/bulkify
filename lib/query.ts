'use client';
// Tiny query cache: dedupes requests, shares data between screens, supports
// optimistic updates (setData) and invalidation after writes.
import { useEffect, useReducer, useRef } from 'react';

type Entry = { data?: unknown; error?: Error; promise?: Promise<unknown>; ts: number; stale?: boolean };
const store = new Map<string, Entry>();
const subs = new Map<string, Set<() => void>>();
const fetchers = new Map<string, () => Promise<unknown>>();

const emit = (key: string) => subs.get(key)?.forEach((f) => f());

function load(key: string, fn: () => Promise<unknown>) {
  const cur = store.get(key);
  if (cur?.promise) return cur.promise;
  const p = fn()
    .then((data) => { store.set(key, { data, ts: Date.now() }); emit(key); return data; })
    .catch((err: Error) => { store.set(key, { data: store.get(key)?.data, error: err, ts: Date.now() }); emit(key); throw err; });
  store.set(key, { ...(cur ?? { ts: 0 }), promise: p, error: undefined });
  emit(key);
  return p;
}

export function useQuery<T>(key: string | null, fn: () => Promise<T>, staleMs = 20_000) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const [, force] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    if (!key) return;
    let set = subs.get(key);
    if (!set) subs.set(key, (set = new Set()));
    set.add(force);
    fetchers.set(key, () => fnRef.current());
    const e = store.get(key);
    if (!e || e.stale || (!e.promise && Date.now() - e.ts > staleMs)) load(key, () => fnRef.current()).catch(() => {});
    return () => { set!.delete(force); };
  }, [key, staleMs]);

  const e = key ? store.get(key) : undefined;
  return {
    data: e?.data as T | undefined,
    error: e?.error,
    loading: !!key && e?.data === undefined && !e?.error,
    refreshing: !!e?.promise,
    refresh: () => (key ? load(key, () => fnRef.current()).catch(() => {}) : Promise.resolve()),
  };
}

/** Optimistically replace cached data for a key. */
export function setData<T>(key: string, updater: (prev: T | undefined) => T) {
  const cur = store.get(key);
  store.set(key, { ...(cur ?? { ts: Date.now() }), data: updater(cur?.data as T | undefined) });
  emit(key);
}

export function getData<T>(key: string) { return store.get(key)?.data as T | undefined; }

/** Mark every key starting with one of the prefixes as stale and refetch the ones on screen. */
export function invalidate(...prefixes: string[]) {
  for (const [key, e] of store) {
    if (!prefixes.some((p) => key.startsWith(p))) continue;
    e.stale = true;
    const f = fetchers.get(key);
    if (f && subs.get(key)?.size) load(key, f).catch(() => {});
  }
}

export function clearQueries() { store.clear(); }
