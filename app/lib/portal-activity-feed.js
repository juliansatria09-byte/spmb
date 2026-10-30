"use client";

import { usePortalActivity } from "@/app/lib/portal-activity-client";

const roleNames = { pelajar: "Pelajar", admin: "Admin", kepala: "Kepala Sekolah" };

function readPayload(event) {
  let payload = event.payload;
  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload);
    } catch (error) {
      console.error("Rincian notifikasi tidak dapat dibaca.", error);
      return null;
    }
  }
  return payload && typeof payload === "object" ? payload : null;
}

function activityDetails(event) {
  const payload = readPayload(event);
  if (!payload) return "";
  return [
    payload.email && `Email: ${payload.email}`,
    payload.program && `Program: ${payload.program}`,
    payload.birthDate && `Tanggal lahir: ${payload.birthDate}`,
    payload.documentName && `Berkas: ${payload.documentName}`,
    payload.fileName && `File: ${payload.fileName}`,
    payload.phone && `Telepon: ${payload.phone}`,
    payload.parentName && `Wali: ${payload.parentName}`,
    payload.payment && `Pembayaran: ${payload.payment}`,
    payload.decision && `Keputusan: ${payload.decision}`,
  ].filter(Boolean).join(" · ");
}

export default function PortalActivityFeed({ audience }) {
  const { events, error } = usePortalActivity();

  return <section aria-label={`Aktivitas realtime untuk ${audience}`} className="mb-4 rounded-xl border border-[#d8e9e2] bg-white p-4 shadow-[0_2px_10px_rgba(23,65,54,0.03)]">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div>
        <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-[#078675]">Sinkronisasi langsung · semua peran</p>
        <h2 className="mt-1 text-sm font-semibold text-[#34564e]">Notifikasi aktivitas terbaru</h2>
      </div>
      <span className={`rounded-full px-2.5 py-1 text-[8px] font-semibold ${error ? "bg-[#fff2e8] text-[#9a4b22]" : "bg-[#e8f6ef] text-[#276751]"}`}>
        {error ? "Koneksi terganggu" : "Memperbarui otomatis · ±3 detik"}
      </span>
    </div>
    {error ? <p role="alert" className="mt-3 text-[9px] text-[#9a4b22]">{error} Periksa koneksi database; halaman akan mencoba lagi otomatis.</p> : null}
    {!error && events.length === 0 ? <p className="mt-3 text-[9px] text-[#82938f]">Belum ada aktivitas baru yang tercatat.</p> : null}
    <ol className="mt-3 divide-y divide-[#edf2ef]">
      {events.slice(-8).reverse().map((event) => <li key={event.id} className="py-2 first:pt-0 last:pb-0">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p className="text-[9px] font-semibold text-[#405d56]">{event.summary}</p>
          <time className="text-[8px] text-[#91a09c]" dateTime={event.createdAt ? new Date(event.createdAt).toISOString() : undefined}>{event.createdAt ? new Date(event.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "Baru saja"}</time>
        </div>
        <p className="mt-1 text-[8px] text-[#718681]">{roleNames[event.actorRole] || event.actorRole} · {event.entityId}{activityDetails(event) ? ` · ${activityDetails(event)}` : ""}</p>
        {event.eventType === "document_uploaded" && readPayload(event)?.documentName ? <a className="mt-1 inline-block text-[8px] font-bold text-[#078675] hover:underline" href={`/api/portal-documents?studentId=${encodeURIComponent(event.entityId.replace(/^student:/, ""))}&documentName=${encodeURIComponent(readPayload(event).documentName)}`} target="_blank" rel="noreferrer">Lihat berkas di server →</a> : null}
      </li>)}
    </ol>
    <p className="mt-3 border-t border-[#edf2ef] pt-2 text-[8px] leading-4 text-[#82938f]">
      Aktivitas tersimpan di database bersama dan terlihat oleh Admin serta Kepala Sekolah. Notifikasi Admin tercatat bersamaan dengan pembaruan data.
    </p>
  </section>;
}
