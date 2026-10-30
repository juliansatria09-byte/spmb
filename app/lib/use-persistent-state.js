"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const STORAGE_EVENT = "spmb-persistent-state-change";

function subscribe(key, callback) {
  const onStorage = (event) => {
    if (event.key === key || event.key === null) callback();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(STORAGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

function readSnapshot(key) {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.error(`Tidak dapat memuat data portal "${key}".`, error);
    return null;
  }
}

export function usePersistentState(key, initialValue) {
  const getSnapshot = useCallback(() => readSnapshot(key), [key]);
  const subscribeToKey = useCallback((callback) => subscribe(key, callback), [key]);
  const snapshot = useSyncExternalStore(subscribeToKey, getSnapshot, () => null);
  const value = useMemo(() => {
    if (snapshot === null) return initialValue;
    try {
      return JSON.parse(snapshot);
    } catch (error) {
      console.error(`Data portal "${key}" memiliki format yang tidak valid.`, error);
      return initialValue;
    }
  }, [initialValue, key, snapshot]);

  const setValue = useCallback((nextValue) => {
    try {
      const rawValue = window.localStorage.getItem(key);
      const currentValue = rawValue === null ? initialValue : JSON.parse(rawValue);
      const resolvedValue = typeof nextValue === "function" ? nextValue(currentValue) : nextValue;
      window.localStorage.setItem(key, JSON.stringify(resolvedValue));
      window.dispatchEvent(new Event(STORAGE_EVENT));
    } catch (error) {
      console.error(`Tidak dapat menyimpan data portal "${key}".`, error);
    }
  }, [initialValue, key]);

  return [value, setValue];
}
