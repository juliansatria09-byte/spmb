"use client";

import { useEffect, useState } from "react";

const POLL_INTERVAL_MS = 3000;

export async function publishPortalActivity(activity) {
  const response = await fetch("/api/portal-activity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(activity),
  });
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || "Perubahan gagal disinkronkan.");
  }
  return result.event;
}

export async function uploadPortalDocument(studentId, documentName, file) {
  const form = new FormData();
  form.set("studentId", studentId);
  form.set("documentName", documentName);
  form.set("file", file);
  const response = await fetch("/api/portal-documents", { method: "POST", body: form });
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || "Berkas gagal disinkronkan.");
  }
  return result.event;
}

export function usePortalActivity() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let latestId = 0;
    let loading = false;

    const refresh = async () => {
      if (loading) return;
      loading = true;
      try {
        const response = await fetch(`/api/portal-activity${latestId ? `?after=${latestId}` : ""}`, { cache: "no-store" });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Aktivitas terbaru tidak dapat dimuat.");
        }
        if (!active) return;
        if (result.events.length) {
          latestId = Number(result.latestId);
          setEvents((current) => {
            const byId = new Map(current.map((item) => [Number(item.id), item]));
            result.events.forEach((item) => byId.set(Number(item.id), item));
            return [...byId.values()].sort((a, b) => Number(a.id) - Number(b.id));
          });
        }
        setError("");
      } catch (refreshError) {
        if (active) setError(refreshError.message);
      } finally {
        loading = false;
      }
    };

    refresh();
    const interval = window.setInterval(refresh, POLL_INTERVAL_MS);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  return { events, error };
}
