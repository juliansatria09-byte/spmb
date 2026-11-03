"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearSession } from "@/app/lib/auth";
import { usePersistentState } from "@/app/lib/use-persistent-state";
import PortalActivityFeed from "@/app/lib/portal-activity-feed";
import { publishPortalActivity, usePortalActivity } from "@/app/lib/portal-activity-client";

const navigation = [
  { id: "dashboard", label: "Dashboard", icon: "grid", href: "/admin" },
  { id: "data-pendaftar", label: "Data pendaftar", icon: "users", href: "/admin/data-pendaftar", badge: "128" },
  { id: "verifikasi-berkas", label: "Verifikasi berkas", icon: "file", href: "/admin/verifikasi-berkas", badge: "32" },
  { id: "pembayaran", label: "Pembayaran", icon: "wallet", href: "/admin/pembayaran", badge: "12" },
  { id: "jadwal-kegiatan", label: "Jadwal kegiatan", icon: "calendar", href: "/admin/jadwal-kegiatan" },
  { id: "pengumuman", label: "Pengumuman", icon: "megaphone", href: "/admin/pengumuman" },
  { id: "laporan", label: "Laporan", icon: "chart", href: "/admin/laporan" },
];

const titles = {
  dashboard: { title: "Dashboard Admin SPMB SMK", description: "Pantau pendaftar, verifikasi berkas, dan pembayaran untuk penerimaan kelas X." },
  "data-pendaftar": { title: "Data pendaftar", description: "Kelola direktori penerimaan kelas X dan tinjau kelengkapan setiap pendaftaran." },
  "verifikasi-berkas": { title: "Verifikasi berkas", description: "Tinjau dokumen dan catat perbaikan sebelum pendaftaran dilanjutkan." },
  pembayaran: { title: "Pembayaran", description: "Pantau status pembayaran dan tindak lanjuti transaksi pendaftaran." },
  "jadwal-kegiatan": { title: "Jadwal kegiatan", description: "Atur agenda umum dan tinjau kesiapan peserta untuk penerimaan kelas X." },
  pengumuman: { title: "Pengelolaan pengumuman", description: "Siapkan informasi yang jelas untuk pendaftar dan pantau status publikasinya." },
  laporan: { title: "Pusat laporan administratif", description: "Susun rekap penerimaan kelas X dari snapshot data yang sama." },
};

const applicants = [
  { id: "TM-270128", name: "Alya Putri Ramadhani", initials: "AR", program: "Desain Komunikasi Visual", date: "12 Mei 2027", document: "Perlu perbaikan", payment: "Belum dibayar", tone: "amber", phone: "0812-0000-0128", parent: "Rina Ramadhani", invoice: "INV-TM-270128", amount: "Rp350.000" },
  { id: "TM-270127", name: "Raka Aditya Pratama", initials: "RP", program: "Rekayasa Perangkat Lunak", date: "12 Mei 2027", document: "Menunggu verifikasi", payment: "Perlu verifikasi", tone: "amber", phone: "0812-0000-0127", parent: "Sukmawati Pratama", invoice: "INV-TM-270127", amount: "Rp350.000" },
  { id: "TM-270126", name: "Naira Safira", initials: "NS", program: "Manajemen Perkantoran", date: "11 Mei 2027", document: "Terverifikasi", payment: "Lunas", tone: "green", phone: "0812-0000-0126", parent: "Dewi Safira", invoice: "INV-TM-270126", amount: "Rp350.000" },
  { id: "TM-270125", name: "Bima Arkan Wijaya", initials: "BW", program: "Kuliner", date: "11 Mei 2027", document: "Terverifikasi", payment: "Lunas", tone: "green", phone: "0812-0000-0125", parent: "Arkan Wijaya", invoice: "INV-TM-270125", amount: "Rp350.000" },
  { id: "TM-270124", name: "Sofia Maharani", initials: "SM", program: "Desain Komunikasi Visual", date: "11 Mei 2027", document: "Menunggu verifikasi", payment: "Belum dibayar", tone: "amber", phone: "0812-0000-0124", parent: "Maya Maharani", invoice: "INV-TM-270124", amount: "Rp350.000" },
  { id: "TM-270123", name: "Danar Rizki Saputra", initials: "DS", program: "Rekayasa Perangkat Lunak", date: "10 Mei 2027", document: "Terverifikasi", payment: "Lunas", tone: "green", phone: "0812-0000-0123", parent: "Rizki Saputra", invoice: "INV-TM-270123", amount: "Rp350.000" },
];

const documents = [
  { name: "Akta kelahiran", file: "akta_alya.pdf", size: "1,2 MB", status: "Terverifikasi", documentNames: ["Akta kelahiran"] },
  { name: "Kartu keluarga", file: "kk_alya.pdf", size: "980 KB", status: "Terverifikasi", documentNames: ["Kartu Keluarga", "Kartu keluarga"] },
  { name: "Pasfoto pelajar", file: "foto_alya.jpg", size: "450 KB", status: "Terverifikasi", documentNames: ["Pas foto 3 × 4", "Pasfoto pelajar", "Pas foto 3x4"] },
  { name: "Surat keterangan sehat", file: "surat_sehat.pdf", size: "820 KB", status: "Perlu perbaikan", documentNames: ["Surat keterangan sehat"] },
];

const initialEvents = [
  { day: "15", month: "MEI 2027", title: "Kelengkapan berkas & pembayaran", time: "Sampai 23.59 WIB · Portal SPMB", status: "Tenggat" },
  { day: "17", month: "MEI 2027", title: "Tes seleksi & wawancara", time: "08.30–11.00 WIB · Aula sekolah", status: "Agenda umum" },
  { day: "24", month: "MEI 2027", title: "Pengumuman hasil SPMB", time: "Rencana publikasi · Portal SPMB", status: "Terjadwal" },
];

const initialAnnouncements = [
  { id: "announcement-documents", title: "Lengkapi berkas pendaftaran", audience: "Seluruh pendaftar", date: "12 Mei 2027", status: "Dipublikasikan", category: "Berkas", body: "Calon siswa silakan cek pas, pastikan akta kelahiran, kartu keluarga, pasfoto pelajar, dan surat keterangan sehat sudah diunggah dengan jelas." },
  { id: "announcement-payment", title: "Batas pembayaran 15 Mei 2027", audience: "Belum dibayar", date: "12 Mei 2027", status: "Dipublikasikan", category: "Pembayaran", body: "Selesaikan pembayaran sebelum batas waktu yang ditentukan." },
  { id: "announcement-selection", title: "Persiapan seleksi & wawancara", audience: "Peserta seleksi", date: "12 Mei 2027", status: "Dipublikasikan", category: "Seleksi", body: "Periksa kembali jadwal dan persiapkan dokumen yang diperlukan." },
  { id: "announcement-results", title: "Informasi rencana hasil SPMB", audience: "Seluruh pendaftar", date: "Rencana 24 Mei", status: "Draf", category: "Informasi", body: "Hasil seleksi akan diumumkan melalui portal pendaftaran." },
];

const reportRows = [
  { name: "Rekap pendaftar kelas X", coverage: "128 pendaftar · identitas & tanggal", snapshot: "12 Mei 2027", period: "2027-05", wave: "Gelombang 1", className: "Kelas X" },
  { name: "Rekap verifikasi berkas", coverage: "96 terverifikasi · 32 belum selesai", snapshot: "12 Mei 2027", period: "2027-05", wave: "Gelombang 1", className: "Kelas X" },
  { name: "Rekap pembayaran", coverage: "84 lunas · 12 verifikasi · 32 belum bayar", snapshot: "12 Mei 2027", period: "2027-05", wave: "Gelombang 1", className: "Kelas X" },
  { name: "Rekap penerimaan", coverage: "72 diterima · 100 kursi tersedia", snapshot: "12 Mei 2027", period: "2027-05", wave: "Gelombang 1", className: "Kelas X" },
];

const SESSION_HYDRATING = "__session_hydrating__";

function readActivityPayload(event) {
  if (typeof event.payload !== "string") return event.payload || {};
  try {
    return JSON.parse(event.payload);
  } catch (error) {
    console.error("Rincian aktivitas pendaftar tidak dapat dibaca.", error);
    return {};
  }
}

function normalizeDocumentName(value) {
  return value.toLocaleLowerCase("id").replace(/[^a-z0-9]/g, "");
}

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  return bytes < 1024 * 1024
    ? `${Math.round(bytes / 1024)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

function matchesApplicantStatus(student, statusFilter) {
  return statusFilter === "Semua (128)"
    || (statusFilter === "Terverifikasi (96)" && student.document === "Terverifikasi")
    || (statusFilter === "Belum selesai (32)" && student.document !== "Terverifikasi")
    || (statusFilter === "Perlu tindakan (32)" && student.document !== "Terverifikasi")
    || (statusFilter === "Belum dibayar" && student.payment === "Belum dibayar")
    || (statusFilter === "Perlu verifikasi" && student.payment === "Perlu verifikasi")
    || (statusFilter === "Lunas" && student.payment === "Lunas");
}

function subscribeToSession(callback) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSessionSnapshot() {
  try {
    return window.localStorage.getItem("spmb-session");
  } catch (error) {
    console.error("Tidak dapat membaca sesi admin.", error);
    return null;
  }
}

function getServerSessionSnapshot() {
  return SESSION_HYDRATING;
}

function AdminIcon({ name, className = "h-[17px] w-[17px]" }) {
  const common = { className, fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" };
  if (name === "grid") return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
  if (name === "users") return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><circle cx="9" cy="8" r="3" /><path d="M3 20v-1a6 6 0 0 1 12 0v1m1-14a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4.6V20" /></svg>;
  if (name === "file") return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><path d="M6 3h8l5 5v13H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm8 0v5h5m-9 5 2 2 4-4" /></svg>;
  if (name === "wallet") return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H20v16H5a2 2 0 0 1-2-2V6.5ZM3 8h17m-5 5h5m-5 0a2 2 0 1 0 4 0" /></svg>;
  if (name === "calendar") return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18m-13 4h2m3 0h2" /></svg>;
  if (name === "megaphone") return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><path d="M4 13V9a2 2 0 0 1 2-2h3l10-4v16L9 15H6a2 2 0 0 1-2-2Zm5 2 2 6h3l-2-5" /></svg>;
  if (name === "chart") return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><path d="M4 20V10m5 10V4m5 16v-7m5 7V7m-17 16h20" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 17v3h14v-3" /></svg>;
}

function BrandMark() {
  return <Image src="/images/smk-tadika-mesra-seal.png" alt="Lambang SMK Tadika Mesra Jakarta" width={40} height={40} className="h-9 w-9 shrink-0 rounded-full bg-white object-contain" />;
}

function Panel({ children, className = "" }) {
  return <section className={`admin-panel rounded-[18px] border border-[#e3ece8] bg-white p-4 shadow-[0_6px_20px_rgba(17,55,48,0.035)] sm:p-5 ${className}`}>{children}</section>;
}

function Pill({ children, tone = "green" }) {
  const tones = {
    green: "bg-[#e6f5ef] text-[#15735b]",
    amber: "bg-[#fff2d9] text-[#99630b]",
    blue: "bg-[#e9f2fa] text-[#336483]",
    gray: "bg-[#eef2f1] text-[#677a76]",
    red: "bg-[#ffebe6] text-[#a44d36]",
  };
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[9px] font-bold ${tones[tone]}`}>{children}</span>;
}

function SectionHeading({ eyebrow, title, action }) {
  return <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#82938f]">{eyebrow}</p><h2 className="mt-1 text-base font-semibold tracking-[-0.02em] text-[#21413b]">{title}</h2></div>{action}</div>;
}

function ActionButton({ children, onClick, href, variant = "outline", type = "button", disabled = false, className = "" }) {
  const variants = {
    outline: "border border-[#dce7e3] bg-white text-[#187b69] hover:bg-[#f3f9f6]",
    primary: "border border-[#087f71] bg-[#087f71] text-white hover:bg-[#066b60]",
    dark: "border border-[#0e3b37] bg-[#0e3b37] text-white hover:bg-[#16544b]",
  };
  const classes = `inline-flex min-h-9 items-center justify-center gap-2 rounded-lg px-3 text-[10px] font-bold transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#0b8373]/25 disabled:cursor-not-allowed disabled:opacity-45 ${variants[variant]} ${className}`;
  if (href) return <Link className={classes} href={href}>{children}</Link>;
  return <button type={type} onClick={onClick} disabled={disabled} className={classes}>{children}</button>;
}

function PageIntro({ title, description, action }) {
  return (
    <div className="admin-page-intro mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <div className="mb-2 inline-flex items-center gap-2"><span className="text-[9px] font-semibold text-[#078675]">Gelombang 1 · Kelas X</span></div>
        <h1 className="text-[1.65rem] font-semibold leading-tight tracking-[-0.04em] text-[#183d38] sm:text-[1.9rem]">{title}</h1>
        <p className="mt-1.5 max-w-3xl text-xs leading-5 text-[#82938f]">{description}</p>
      </div>
      {action || <span className="text-[9px] text-[#8a9995]">Snapshot 12 Mei 2027, 09.30 WIB</span>}
    </div>
  );
}

function SearchBox({ value, onChange, placeholder = "Cari nama atau nomor daftar" }) {
  return <label className="flex h-9 min-w-0 items-center gap-2 rounded-lg border border-[#dfe9e5] bg-white px-3 text-[#7b8d88] focus-within:border-[#14927d] focus-within:ring-2 focus-within:ring-[#14927d]/10">
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0 fill-none stroke-current stroke-[1.8]"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" strokeLinecap="round" /></svg>
    <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full min-w-0 bg-transparent text-[10px] text-[#284740] outline-none placeholder:text-[#9ba9a5]" />
  </label>;
}

function downloadCsv(filename, rows, delimiter = ",") {
  const hasSeparatorDirective = delimiter === ";" && rows[0]?.length === 1 && rows[0][0] === "sep=;";
  const dataRows = hasSeparatorDirective ? rows.slice(1) : rows;
  const csv = `${hasSeparatorDirective ? "sep=;\r\n" : ""}${dataRows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(delimiter)).join("\r\n")}`;
  const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function printReport(title, rows, scope) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return false;

  const tableRows = rows.map((row) => `<tr><td>${escapeHtml(row.name)}</td><td>${escapeHtml(row.coverage)}</td><td>${escapeHtml(row.snapshot)}</td><td>${escapeHtml(row.wave)} · ${escapeHtml(row.className)}</td><td>Siap ditinjau</td></tr>`).join("");
  const generatedAt = new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date());
  printWindow.document.open();
  printWindow.document.write(`<!doctype html>
    <html lang="id">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${escapeHtml(title)} - SMK Tadika Mesra Jakarta</title>
        <style>
          @page { size: A4 landscape; margin: 12mm; }
          * { box-sizing: border-box; }
          body { margin: 0; color: #203b35; font: 10px/1.55 Arial, Helvetica, sans-serif; background: #fff; }
          .sheet { position: relative; min-height: 180mm; overflow: hidden; }
          .sheet:after { position: absolute; z-index: -1; right: 5mm; bottom: 20mm; width: 54mm; height: 54mm; border: 1px solid #edf4f0; border-radius: 50%; content: ""; box-shadow: 0 0 0 8mm #f8fbf9, 0 0 0 9mm #edf4f0; }
          .masthead { position: relative; display: flex; align-items: center; gap: 13px; padding: 0 0 12px; border-bottom: 3px solid #16836f; }
          .crest { display: block; width: 58px; height: 58px; flex: 0 0 auto; object-fit: contain; }
          .school { color: #173d36; font-size: 17px; font-weight: 800; letter-spacing: .055em; }
          .subhead { margin-top: 3px; color: #607870; font-size: 8px; letter-spacing: .15em; text-transform: uppercase; }
          .school-line { width: 58mm; height: 3px; margin-top: 8px; background: linear-gradient(90deg,#16836f 0 72%,#d7aa51 72% 100%); }
          .doc-tag { margin-left: auto; padding: 7px 10px; border: 1px solid #dce9e3; border-radius: 4px; color: #16836f; font-size: 8px; font-weight: 700; letter-spacing: .1em; text-align: center; text-transform: uppercase; }
          .doc-tag span { display: block; margin-top: 3px; color: #73877f; font-size: 7px; font-weight: 400; letter-spacing: .04em; }
          .title-block { position: relative; margin: 19px 0 15px; text-align: center; }
          .kicker { color: #16836f; font-size: 8px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; }
          h1 { margin: 3px 0 2px; color: #173d36; font-size: 18px; letter-spacing: .09em; }
          .subtitle { margin: 0; color: #607870; font-size: 10px; }
          .rule { width: 34mm; height: 2px; margin: 9px auto 0; background: #d7aa51; }
          .meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 0 0 15px; }
          .meta-card { min-height: 47px; padding: 8px 10px; border: 1px solid #dce9e3; border-top: 2px solid #16836f; background: #f7faf8; }
          .meta strong { display: block; color: #71847d; font-size: 7px; font-weight: 600; letter-spacing: .09em; text-transform: uppercase; }
          .meta span { display: block; margin-top: 4px; color: #23483f; font-size: 10px; font-weight: 700; }
          .table-label { display: flex; align-items: center; justify-content: space-between; margin: 0 0 6px; color: #34564e; font-size: 9px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
          .table-label span { color: #81918b; font-size: 8px; font-weight: 400; letter-spacing: 0; text-transform: none; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #e8f2ed; color: #34564e; text-align: left; font-size: 8px; letter-spacing: .05em; text-transform: uppercase; }
          th, td { border: 1px solid #dce6e1; padding: 8px; vertical-align: top; }
          td { color: #425e56; }
          tbody tr:nth-child(even) { background: #f8fbf9; }
          tr { break-inside: avoid; }
          .note { margin-top: 12px; padding: 8px 10px; border-left: 3px solid #d4a346; background: #fff9ec; color: #72571e; font-size: 8px; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 45px; margin: 24px 0 0; text-align: center; }
          .signature-space { height: 45px; }
          .sign-line { width: 65%; margin: 0 auto; border-bottom: 1px solid #657a73; }
          .sign-name { margin-top: 4px; color: #607870; font-size: 8px; }
          .footer { position: relative; display: flex; justify-content: space-between; gap: 12px; margin-top: 15px; padding-top: 7px; border-top: 1px solid #dce6e1; color: #71847d; font-size: 7px; }
          .footer strong { color: #16836f; }
          @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
          @media screen { body { max-width: 1100px; margin: 24px auto; padding: 24px; box-shadow: 0 8px 40px #163d351c; } }
        </style>
      </head>
      <body>
        <div class="sheet">
        <header class="masthead">
          <img class="crest" src="/images/smk-tadika-mesra-seal.png" alt="Lambang SMK Tadika Mesra Jakarta"/>
          <div><div class="school">SMK TADIKA MESRA JAKARTA</div><div class="subhead">Penerimaan Murid Baru · Tahun Ajaran 2027/2028</div><div class="school-line"></div></div>
          <div class="doc-tag">Dokumen sekolah<span>Rekapitulasi · SPMB</span></div>
        </header>
        <main>
          <div class="title-block"><div class="kicker">Lembar laporan resmi</div><h1>LAPORAN ADMINISTRATIF SPMB</h1><p class="subtitle">${escapeHtml(title)}</p><div class="rule"></div></div>
          <section class="meta">
            <div class="meta-card"><strong>Periode laporan</strong><span>${escapeHtml(scope.period)}</span></div>
            <div class="meta-card"><strong>Gelombang</strong><span>${escapeHtml(scope.wave)}</span></div>
            <div class="meta-card"><strong>Kelas penerimaan</strong><span>${escapeHtml(scope.className)}</span></div>
            <div class="meta-card"><strong>Tanggal dokumen</strong><span>${escapeHtml(generatedAt)}</span></div>
          </section>
          <div class="table-label">Ringkasan data<span>${rows.length} jenis laporan dalam dokumen ini</span></div>
          <table>
            <thead><tr><th>Jenis laporan</th><th>Cakupan data</th><th>Snapshot</th><th>Ruang lingkup</th><th>Status</th></tr></thead>
            <tbody>${tableRows || '<tr><td colspan="5">Tidak ada laporan untuk filter yang dipilih.</td></tr>'}</tbody>
          </table>
          <p class="note"><strong>Catatan penggunaan:</strong> Data pada portal ini bersifat ilustratif. Verifikasi dan sahkan data sebelum dokumen digunakan sebagai laporan resmi sekolah.</p>
          <section class="signatures">
            <div><div>Mengetahui,<br><strong>Kepala Sekolah</strong></div><div class="signature-space"></div><div class="sign-line"></div><div class="sign-name">(........................................)</div></div>
            <div><div>Jakarta, .........................<br><strong>Panitia SPMB</strong></div><div class="signature-space"></div><div class="sign-line"></div><div class="sign-name">(........................................)</div></div>
          </section>
        </main>
        <footer class="footer"><span><strong>SMK Tadika Mesra Jakarta</strong> · Portal Penerimaan Murid Baru</span><span>Dicetak ${escapeHtml(generatedAt)} · Dokumen perlu disahkan</span></footer>
        </div>
        <script>window.addEventListener("load", () => { window.focus(); window.print(); });</script>
      </body>
    </html>`);
  printWindow.document.close();
  return true;
}

function ApplicantsTable({ rows, onSelect, compact = false }) {
  return <div className="overflow-x-auto">
    <table className="w-full min-w-[690px] border-collapse text-left text-[10px]">
      <thead className="bg-[#f3f7f5] text-[8px] uppercase tracking-[0.08em] text-[#718681]">
        <tr>{["Nama pelajar", "Kelas", "Tanggal daftar", "Berkas", "Pembayaran", "Aksi"].map((heading) => <th key={heading} className="px-3 py-3 font-bold">{heading}</th>)}</tr>
      </thead>
      <tbody>{rows.map((student) => <tr key={student.id} className="border-b border-[#edf2ef] transition-colors hover:bg-[#f8fbf9]">
        <td className="px-3 py-3">
          <div className="flex items-center gap-2.5"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e7f3ee] text-[8px] font-bold text-[#167b69]">{student.initials}</span><span><span className="block font-semibold text-[#294943]">{student.name}</span><span className="mt-0.5 block text-[8px] text-[#94a39f]">{student.id}</span></span></div>
        </td>
        <td className="px-3 py-3 text-[#48635d]">X</td>
        <td className="px-3 py-3 whitespace-nowrap text-[#48635d]">{student.date}</td>
        <td className="px-3 py-3"><Pill tone={student.document === "Terverifikasi" ? "green" : "amber"}>{student.document}</Pill></td>
        <td className="px-3 py-3"><Pill tone={student.payment === "Lunas" ? "green" : student.payment === "Perlu verifikasi" ? "amber" : "gray"}>{student.payment}</Pill></td>
        <td className="px-3 py-3"><button type="button" onClick={() => onSelect(student)} aria-label={`${compact ? "Lihat" : "Detail"} ${student.name}`} className="whitespace-nowrap font-bold text-[#078675] hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#078675]/40">{compact ? "Lihat" : "Detail"} →</button></td>
      </tr>)}</tbody>
    </table>
    {rows.length === 0 ? <p className="px-4 py-8 text-center text-xs text-[#82938f]">Tidak ada pendaftar yang cocok dengan pencarian.</p> : null}
  </div>;
}

function ApplicantDetailsDialog({ applicant, onClose }) {
  useEffect(() => {
    if (!applicant) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [applicant, onClose]);

  if (!applicant) return null;

  const details = [
    ["Nomor pendaftaran", applicant.id],
    ["Program pilihan", applicant.program],
    ["Tanggal pendaftaran", applicant.date],
    ["Nomor WhatsApp", applicant.phone || "Belum ditambahkan"],
    ["Orang tua / wali", applicant.parent || "Belum ditambahkan"],
    ["Email", applicant.email || "Belum ditambahkan"],
    ["Nomor tagihan", applicant.invoice || "Belum tersedia"],
    ["Nominal tagihan", applicant.amount || "Belum ditetapkan"],
  ];

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102b27]/50 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="applicant-detail-title" className="max-h-[min(90vh,760px)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#e3ece8] bg-white p-5 shadow-2xl sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#078675]">Detail pendaftar · Kelas X</p>
          <h2 id="applicant-detail-title" className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#21413b]">{applicant.name}</h2>
          <p className="mt-1 text-xs text-[#82938f]">{applicant.id}</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Tutup detail pendaftar" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#e3ece8] text-lg text-[#607870] hover:bg-[#f3f7f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#078675]/40">×</button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-[#e8efec] bg-[#f8faf9] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#82938f]">Status berkas</p>
          <div className="mt-2"><Pill tone={applicant.document === "Terverifikasi" ? "green" : applicant.document === "Menunggu verifikasi" ? "blue" : "amber"}>{applicant.document}</Pill></div>
        </div>
        <div className="rounded-xl border border-[#e8efec] bg-[#f8faf9] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#82938f]">Status pembayaran</p>
          <div className="mt-2"><Pill tone={applicant.payment === "Lunas" ? "green" : applicant.payment === "Belum dibayar" ? "gray" : "amber"}>{applicant.payment}</Pill></div>
        </div>
      </div>

      <dl className="mt-5 grid gap-x-8 sm:grid-cols-2">
        {details.map(([label, value]) => <div key={label} className="border-b border-[#edf2ef] py-3">
          <dt className="text-[10px] text-[#82938f]">{label}</dt>
          <dd className="mt-1 break-words text-sm font-medium text-[#34564e]">{value}</dd>
        </div>)}
      </dl>

      <div className="mt-6 flex justify-end">
        <button type="button" onClick={onClose} className="min-h-10 rounded-lg bg-[#087f71] px-4 text-xs font-bold text-white transition hover:bg-[#066b60] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#078675]/40 focus-visible:ring-offset-2">Tutup detail</button>
      </div>
    </section>
  </div>;
}

function PaymentDetailsDialog({ payment, notice, onClose, onMarkPaid, onSaveAmount }) {
  const [saving, setSaving] = useState(false);
  const [amountDraft, setAmountDraft] = useState(() => payment?.amount?.replace(/\D/g, "") || "");
  const [amountError, setAmountError] = useState("");

  useEffect(() => {
    if (!payment) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, payment, saving]);

  if (!payment) return null;

  const details = [
    ["Nama pendaftar", payment.name],
    ["Nomor pendaftaran", payment.id],
    ["Nomor tagihan", payment.invoice || "Belum tersedia"],
    ["Tanggal pendaftaran", payment.date || "Belum tersedia"],
    ["Program pilihan", payment.program || "Belum dipilih"],
  ];
  const savedAmount = Number(payment.amount?.replace(/\D/g, ""));
  const hasSavedAmount = Number.isSafeInteger(savedAmount) && savedAmount > 0;
  const markPaid = async () => {
    if (!hasSavedAmount) return;
    setSaving(true);
    try {
      await onMarkPaid(payment);
    } finally {
      setSaving(false);
    }
  };
  const saveAmount = async (event) => {
    event.preventDefault();
    const amount = Number(amountDraft);
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      setAmountError("Masukkan nominal lebih dari Rp0.");
      return;
    }
    setSaving(true);
    setAmountError("");
    try {
      const saved = await onSaveAmount(payment, `Rp${new Intl.NumberFormat("id-ID").format(amount)}`);
      if (saved) setAmountDraft(String(amount));
    } finally {
      setSaving(false);
    }
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102b27]/50 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="payment-detail-title" className="max-h-[min(90vh,760px)] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#e3ece8] bg-white p-5 shadow-2xl sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#078675]">Detail transaksi pembayaran</p>
          <h2 id="payment-detail-title" className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#21413b]">{payment.invoice || "Nomor tagihan belum tersedia"}</h2>
        </div>
        <button type="button" autoFocus onClick={onClose} aria-label="Tutup detail transaksi" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#e3ece8] text-lg text-[#607870] hover:bg-[#f3f7f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#078675]/40">×</button>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-[#e8efec] bg-[#f8faf9] p-4">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-[#82938f]">Status pembayaran</span>
        <Pill tone={payment.payment === "Lunas" ? "green" : payment.payment === "Perlu verifikasi" ? "amber" : "gray"}>{payment.payment}</Pill>
      </div>

      <dl className="mt-4 grid gap-x-8 sm:grid-cols-2">
        {details.map(([label, value]) => <div key={label} className="border-b border-[#edf2ef] py-3">
          <dt className="text-[10px] text-[#82938f]">{label}</dt>
          <dd className="mt-1 break-words text-sm font-medium text-[#34564e]">{value}</dd>
        </div>)}
      </dl>

      <form onSubmit={saveAmount} className="mt-5 rounded-xl border border-[#e8efec] bg-[#f8faf9] p-4">
        <label htmlFor="payment-amount" className="block text-[10px] font-semibold uppercase tracking-wide text-[#82938f]">Nominal tagihan (Rupiah)</label>
        <div className="mt-2 flex flex-wrap gap-2">
          <div className="flex min-w-[180px] flex-1 items-center rounded-lg border border-[#dfe9e5] bg-white px-3 focus-within:border-[#14927d] focus-within:ring-2 focus-within:ring-[#14927d]/10">
            <span className="mr-2 text-xs font-semibold text-[#718681]">Rp</span>
            <input id="payment-amount" type="number" inputMode="numeric" min="1" step="1" value={amountDraft} onChange={(event) => { setAmountDraft(event.target.value); setAmountError(""); }} disabled={saving} required aria-describedby={amountError ? "payment-amount-error" : undefined} className="h-10 w-full min-w-0 bg-transparent text-sm text-[#284740] outline-none disabled:opacity-60" placeholder="Contoh: 350000" />
          </div>
          <button type="submit" disabled={saving} className="min-h-10 rounded-lg border border-[#dfe9e5] bg-white px-4 text-xs font-bold text-[#078675] hover:bg-[#eef7f3] disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#078675]/40">{saving ? "Menyimpan..." : "Simpan nominal"}</button>
        </div>
        {amountError ? <p id="payment-amount-error" role="alert" className="mt-2 text-xs text-[#b45309]">{amountError}</p> : null}
      </form>

      {notice ? <p role="status" className="mt-4 text-xs text-[#078675]">{notice}</p> : null}

      <div className="mt-6 flex flex-wrap justify-end gap-2">
        {payment.payment !== "Lunas" ? <button type="button" disabled={saving || !hasSavedAmount} onClick={markPaid} className="min-h-10 rounded-lg bg-[#087f71] px-4 text-xs font-bold text-white transition hover:bg-[#066b60] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#078675]/40 focus-visible:ring-offset-2">{saving ? "Menyimpan..." : "Tandai lunas"}</button> : null}
        <button type="button" disabled={saving} onClick={onClose} className="min-h-10 rounded-lg border border-[#dfe9e5] bg-white px-4 text-xs font-bold text-[#607870] hover:bg-[#f3f7f5] disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#078675]/40">Tutup detail</button>
      </div>
      {!hasSavedAmount && payment.payment !== "Lunas" ? <p className="mt-2 text-right text-[10px] text-[#82938f]">Simpan nominal tagihan sebelum menandai pembayaran lunas.</p> : null}
    </section>
  </div>;
}

function AdminContent({ section, onExport }) {
  const { events: sharedEvents } = usePortalActivity();
  const [search, setSearch] = useState("");
  const [reportPeriod, setReportPeriod] = useState("all");
  const [reportWave, setReportWave] = useState("all");
  const [reportClass, setReportClass] = useState("all");
  const [applicantRows, setApplicantRows] = usePersistentState("spmb-admin-applicants", applicants);
  const [selectedApplicant, setSelectedApplicant] = useState(applicants[0]);
  const [detailsApplicantId, setDetailsApplicantId] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(documents[0]);
  const [documentPreview, setDocumentPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewRequestId = useRef(0);
  const [documentStatuses, setDocumentStatuses] = usePersistentState("spmb-admin-document-statuses", {});
  const [statusFilter, setStatusFilter] = useState("Semua (128)");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("Semua pembayaran");
  const [applicantPage, setApplicantPage] = useState(1);
  const [announcementStatusFilter, setAnnouncementStatusFilter] = useState("Semua status");
  const [announcementAudienceFilter, setAnnouncementAudienceFilter] = useState("Semua audiens");
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [announcementAudience, setAnnouncementAudience] = useState("Seluruh pendaftar");
  const [announcementCategory, setAnnouncementCategory] = useState("Informasi");
  const [announcementDraftStatus, setAnnouncementDraftStatus] = useState("Draf");
  const [eventMonth, setEventMonth] = useState("Mei 2027");
  const [eventWave, setEventWave] = useState("Gelombang 1");
  const [attendanceFilter, setAttendanceFilter] = useState("Semua konfirmasi");
  const [events, setEvents] = usePersistentState("spmb-admin-events", initialEvents);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEventKey, setEditingEventKey] = useState(null);
  const [eventTitle, setEventTitle] = useState("");
  const [selectedEventKey, setSelectedEventKey] = useState(initialEvents[1].title);
  const [eventDate, setEventDate] = useState("2027-05-20");
  const [eventTime, setEventTime] = useState("08:30");
  const [eventLocation, setEventLocation] = useState("Aula sekolah");
  const [eventEditTimeLocation, setEventEditTimeLocation] = useState("");
  const [attendanceStatuses, setAttendanceStatuses] = usePersistentState("spmb-admin-attendance-statuses", {});
  const [showActivityHistory, setShowActivityHistory] = useState(false);
  const [showVerificationGuide, setShowVerificationGuide] = useState(false);
  const [announcements, setAnnouncements] = usePersistentState("spmb-announcements", initialAnnouncements);
  const [announcementTitle, setAnnouncementTitle] = useState("Lengkapi berkas pendaftaran");
  const [announcementBody, setAnnouncementBody] = useState(initialAnnouncements[0].body);
  const [notice, setNotice] = useState("");
  const selectedEvent = events.find((item) => item.id === selectedEventKey)
    || events.find((item) => item.title === selectedEventKey)
    || events.find((item) => item.title === initialEvents[1].title)
    || events[0]
    || initialEvents[1];
  const liveApplicants = useMemo(() => sharedEvents
    .filter((event) => event.eventType === "applicant_created")
    .map((registration) => {
      const data = typeof registration.payload === "string" ? JSON.parse(registration.payload) : registration.payload;
      const student = {
        id: registration.entityId,
        name: data.name,
        initials: data.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase(),
        email: data.email,
        program: data.program || "Belum dipilih",
        date: registration.createdAt ? new Date(registration.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "Baru saja",
        document: "Belum diunggah",
        payment: "Belum dibayar",
        tone: "amber",
        phone: data.phone || "Belum ditambahkan",
        parent: data.parentName || "Belum ditambahkan",
        invoice: `INV-${registration.entityId}`,
        amount: "Belum ditetapkan",
      };
      sharedEvents.filter((event) => event.entityId === registration.entityId).forEach((event) => {
        const update = typeof event.payload === "string" ? JSON.parse(event.payload) : event.payload;
        if (event.eventType === "document_uploaded") student.document = "Menunggu verifikasi";
        if (update.name) student.name = update.name;
        if (update.email) student.email = update.email;
        if (update.phone) student.phone = update.phone;
        if (update.parentName) student.parent = update.parentName;
        if (update.program) student.program = update.program;
        if (update.document) student.document = update.document;
        if (update.payment) student.payment = update.payment;
        if (update.amount) student.amount = update.amount;
      });
      student.initials = student.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
      return student;
    }), [sharedEvents]);
  const allApplicantRows = useMemo(() => [...liveApplicants, ...applicantRows], [applicantRows, liveApplicants]);
  const uploadedDocuments = useMemo(() => sharedEvents
    .filter((event) => event.eventType === "document_uploaded" && event.entityId === selectedApplicant.id)
    .map((event) => readActivityPayload(event))
    .filter((payload) => payload.documentName), [selectedApplicant.id, sharedEvents]);
  const reviewedDocumentStatuses = useMemo(() => {
    const statuses = {};
    sharedEvents
      .filter((event) => event.entityId === selectedApplicant.id && event.eventType === "application_updated")
      .forEach((event) => {
        const payload = readActivityPayload(event);
        if (payload.documentName && payload.documentStatus) {
          statuses[normalizeDocumentName(payload.documentName)] = payload.documentStatus;
        }
      });
    return statuses;
  }, [selectedApplicant.id, sharedEvents]);
  const selectedApplicantDocuments = useMemo(() => documents.map((document) => {
    const expectedName = normalizeDocumentName(document.name);
    const upload = uploadedDocuments.find((item) => {
      const uploadedName = normalizeDocumentName(item.documentName);
      return uploadedName === expectedName
        || (expectedName === "pasfotopelajar" && uploadedName.startsWith("pasfoto"));
    });
    return { ...document, upload };
  }).concat(uploadedDocuments
    .filter((upload) => !documents.some((document) => {
      const expectedName = normalizeDocumentName(document.name);
      const uploadedName = normalizeDocumentName(upload.documentName);
      return uploadedName === expectedName
        || (expectedName === "pasfotopelajar" && uploadedName.startsWith("pasfoto"));
    }))
    .map((upload) => ({
      name: upload.documentName,
      file: upload.fileName || upload.documentName,
      size: formatFileSize(Number(upload.size)),
      status: "Menunggu verifikasi",
      upload,
    }))), [uploadedDocuments]);
  const activeSelectedDocument = selectedApplicantDocuments.find((document) => document.name === selectedDocument.name)
    || selectedApplicantDocuments[0];
  const documentStatusFor = (document) => reviewedDocumentStatuses[normalizeDocumentName(document.name)]
    || document.documentNames?.map(normalizeDocumentName).map((name) => reviewedDocumentStatuses[name]).find(Boolean)
    || documentStatuses[`${selectedApplicant.id}:${document.name}`]
    || (document.upload ? "Menunggu verifikasi" : "Belum diunggah");
  const verifiedDocumentCount = selectedApplicantDocuments.filter((document) => documentStatusFor(document) === "Terverifikasi").length;
  const detailsApplicant = detailsApplicantId
    ? allApplicantRows.find((student) => student.id === detailsApplicantId) || null
    : null;

  const filteredApplicants = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("id");
    return allApplicantRows.filter((student) => {
      const matchesQuery = !query || `${student.name} ${student.id} ${student.program}`.toLocaleLowerCase("id").includes(query);
      return matchesQuery && matchesApplicantStatus(student, statusFilter);
    });
  }, [allApplicantRows, search, statusFilter]);

  const filteredPaymentApplicants = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("id");
    return allApplicantRows.filter((student) => {
      const matchesQuery = !query || `${student.name} ${student.id} ${student.invoice}`.toLocaleLowerCase("id").includes(query);
      const matchesPayment = paymentStatusFilter === "Semua pembayaran" || student.payment === paymentStatusFilter;
      return matchesQuery && matchesPayment;
    });
  }, [allApplicantRows, paymentStatusFilter, search]);

  const filteredReports = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("id");
    return reportRows.filter((report) => {
      const matchesQuery = !query || `${report.name} ${report.coverage}`.toLocaleLowerCase("id").includes(query);
      const matchesPeriod = reportPeriod === "all" || report.period === reportPeriod;
      const matchesWave = reportWave === "all" || report.wave === reportWave;
      const matchesClass = reportClass === "all" || report.className === reportClass;
      return matchesQuery && matchesPeriod && matchesWave && matchesClass;
    });
  }, [search, reportPeriod, reportWave, reportClass]);

  const selectStudent = (student) => {
    setSelectedApplicant(student);
    setSelectedDocument(documents[0]);
    previewRequestId.current += 1;
    setDocumentPreview(null);
    setPreviewLoading(false);
    setNotice("");
  };
  const openApplicantDetails = (student) => {
    selectStudent(student);
    setDetailsApplicantId(student.id);
  };
  const updateVerificationSearch = (value) => {
    setSearch(value);
    const query = value.trim().toLocaleLowerCase("id");
    const nextQueue = allApplicantRows.filter((student) => (
      (!query || `${student.name} ${student.id} ${student.program}`.toLocaleLowerCase("id").includes(query))
      && matchesApplicantStatus(student, statusFilter)
      && student.document !== "Terverifikasi"
    ));
    if (!nextQueue.some((student) => student.id === selectedApplicant.id)) {
      if (nextQueue[0]) selectStudent(nextQueue[0]);
      else setNotice("Tidak ada pendaftar dalam antrean yang cocok dengan pencarian.");
    }
  };

  const updateApplicant = async (id, updates) => {
    const applicant = allApplicantRows.find((student) => student.id === id);
    if (!applicant) {
      setNotice("Pendaftar tidak ditemukan. Muat ulang halaman dan coba lagi.");
      return false;
    }
    const field = Object.keys(updates)[0];
    const eventType = field === "payment" ? "payment_updated" : "application_updated";
    try {
      await publishPortalActivity({
        actorRole: "admin",
        eventType,
        entityId: id,
        summary: `Data ${applicant.name} diperbarui oleh Admin`,
        payload: { name: applicant.name, registrationNumber: id, ...updates },
      });
    } catch (error) {
      console.error("Perubahan pendaftar tidak dapat disinkronkan.", error);
      setNotice(`${error.message} Perubahan belum disimpan.`);
      return false;
    }
    setApplicantRows((current) => current.map((student) => student.id === id ? { ...student, ...updates } : student));
    setSelectedApplicant((current) => current.id === id ? { ...current, ...updates } : current);
    setSelectedPayment((current) => current?.id === id ? { ...current, ...updates } : current);
    return true;
  };
  const markPaymentPaid = async (payment) => {
    const saved = await updateApplicant(payment.id, { payment: "Lunas" });
    if (saved) setNotice(`Pembayaran ${payment.invoice} ditandai lunas.`);
    return saved;
  };
  const savePaymentAmount = async (payment, amount) => {
    const saved = await updateApplicant(payment.id, { amount });
    if (saved) setNotice(`Nominal tagihan ${payment.invoice} berhasil disimpan: ${amount}.`);
    return saved;
  };
  const closePaymentDetails = () => setSelectedPayment(null);

  const updateDocumentStatus = async (status) => {
    const document = activeSelectedDocument;
    if (!document) {
      setNotice("Pilih dokumen yang akan ditinjau.");
      return;
    }
    if (!document.upload) {
      setNotice(`${document.name} belum diunggah. Keputusan verifikasi belum dapat diberikan.`);
      return;
    }
    const statusesAfterDecision = selectedApplicantDocuments.map((item) => (
      item.name === document.name ? status : documentStatusFor(item)
    ));
    const applicantDocumentStatus = statusesAfterDecision.every((item) => item === "Terverifikasi")
      ? "Terverifikasi"
      : statusesAfterDecision.includes("Perlu perbaikan")
        ? "Perlu perbaikan"
        : "Menunggu verifikasi";
    const saved = await updateApplicant(selectedApplicant.id, {
      document: applicantDocumentStatus,
      documentName: document.name,
      documentStatus: status,
    });
    if (!saved) return;
    setDocumentStatuses((current) => ({
      ...current,
      [`${selectedApplicant.id}:${document.name}`]: status,
    }));
    setNotice(`${document.name} untuk ${selectedApplicant.name} diperbarui: ${status}.`);
  };

  const previewApplicantDocument = async (document) => {
    setSelectedDocument(document);
    setNotice("");
    setDocumentPreview(null);
    const requestId = ++previewRequestId.current;
    setPreviewLoading(true);
    try {
      const studentId = selectedApplicant.id.replace(/^student:/, "");
      const documentNames = [...new Set([
        document.upload?.documentName,
        ...document.documentNames || [document.name],
      ].filter(Boolean))];
      let response;
      let loadedDocumentName;
      for (const documentName of documentNames) {
        const params = new URLSearchParams({ studentId, documentName });
        const candidateResponse = await fetch(`/api/portal-documents?${params.toString()}`, { cache: "no-store" });
        if (candidateResponse.status === 404) continue;
        if (!candidateResponse.ok) {
          if (candidateResponse.status === 401 || candidateResponse.status === 403) {
            const result = await candidateResponse.json();
            throw new Error(result.message || "Anda tidak memiliki izin melihat berkas ini.");
          }
          let message = "Berkas tidak dapat dimuat dari server.";
          try {
            const result = await candidateResponse.json();
            message = result.message || message;
          } catch (error) {
            console.error("Pesan kesalahan pemuatan berkas tidak dapat dibaca.", error);
          }
          throw new Error(message);
        }
        response = candidateResponse;
        loadedDocumentName = documentName;
        break;
      }
      if (!response) {
        if (requestId === previewRequestId.current) {
          setNotice(`${document.name} belum memiliki berkas asli dari ${selectedApplicant.name}.`);
        }
        return;
      }

      const file = await response.blob();
      if (requestId !== previewRequestId.current) return;
      if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
        throw new Error("Format berkas yang diterima tidak didukung untuk pratinjau.");
      }
      const disposition = response.headers.get("content-disposition") || "";
      const encodedFileName = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
      const fileName = encodedFileName ? decodeURIComponent(encodedFileName) : document.upload?.fileName || document.name;
      setDocumentPreview({ url: URL.createObjectURL(file), mimeType: file.type, fileName, documentName: loadedDocumentName });
      setNotice(`Berkas ${fileName} berhasil dimuat.`);
    } catch (error) {
      if (requestId !== previewRequestId.current) return;
      setNotice(error.message || "Berkas tidak dapat dimuat. Coba pilih kembali.");
    } finally {
      if (requestId === previewRequestId.current) setPreviewLoading(false);
    }
  };

  useEffect(() => () => {
    if (documentPreview?.url) URL.revokeObjectURL(documentPreview.url);
  }, [documentPreview?.url]);

  const exportApplicants = (filename, rows = allApplicantRows) => onExport(filename, rows);
  const openNextVerificationApplicant = () => {
    const queue = filteredApplicants.filter((student) => student.document !== "Terverifikasi");
    if (queue.length === 0) {
      setNotice(search.trim()
        ? "Tidak ada pendaftar yang perlu diverifikasi sesuai pencarian."
        : "Antrean verifikasi kosong; semua pendaftar sudah terverifikasi.");
      return;
    }
    const currentIndex = queue.findIndex((student) => student.id === selectedApplicant.id);
    const nextApplicant = queue[currentIndex < 0 ? 0 : (currentIndex + 1) % queue.length];
    selectStudent(nextApplicant);
    setNotice(`Pendaftar antrean dipilih: ${nextApplicant.name}.`);
  };

  if (section === "dashboard") {
    const metrics = [
      { label: "Total pendaftar", value: "128", note: "+18 pendaftar hari ini", icon: "users", tone: "green" },
      { label: "Berkas terverifikasi", value: "96", note: "75% dari seluruh pendaftar", icon: "file", tone: "blue" },
      { label: "Pembayaran lunas", value: "84", note: "Total terverifikasi Rp29.400.000", icon: "wallet", tone: "amber" },
      { label: "Diterima", value: "72", note: "Dari 100 kuota tersedia", icon: "grid", tone: "violet" },
    ];
    return <div className="admin-dashboard">
      <PageIntro title={titles[section].title} description="Selamat pagi, Dina. Pantau pendaftar, verifikasi berkas, dan pembayaran untuk penerimaan kelas X." action={<ActionButton onClick={() => exportApplicants("rekap-pendaftar.csv", [["Nama", "Nomor daftar", "Program", "Status berkas", "Pembayaran"], ...allApplicantRows.map((a) => [a.name, a.id, a.program, a.document, a.payment])])}><AdminIcon name="download" className="h-3.5 w-3.5" />Unduh laporan</ActionButton>} section={section} />
      <section className="admin-stagger mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Statistik penerimaan">
        {metrics.map((metric) => <article key={metric.label} className={`admin-metric admin-metric-${metric.tone} rounded-xl border p-4`}>
          <div className="flex items-center justify-between"><p className="text-[10px] text-[#748681]">{metric.label}</p><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/80 text-[#078675]"><AdminIcon name={metric.icon} className="h-4 w-4" /></span></div>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#21413b]">{metric.value}</p><p className="mt-2 border-t border-current/10 pt-2 text-[8px] text-[#81918d]">{metric.note}</p>
        </article>)}
      </section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#fae9ca] bg-[#fff4df] px-3.5 py-2.5 text-[9px] text-[#87580c]">
        <span><strong>Perlu ditindaklanjuti:</strong> 32 berkas belum selesai · 12 pembayaran menunggu verifikasi</span>
        <Link href="/admin/verifikasi-berkas" className="font-bold hover:underline">Buka antrean →</Link>
      </div>
      <Panel className="mb-4">
        <SectionHeading eyebrow="Gelombang 1 · 128 pendaftar · Diperbarui 12 Mei 2027, 09.30 WIB" title="Pengelolaan pendaftaran" action={<Link href="/admin/data-pendaftar" className="text-[9px] font-bold text-[#078675]">Lihat semua →</Link>} />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {["Semua (128)", "Perlu tindakan (32)", "Terverifikasi (96)"].map((label) => {
            const active = statusFilter === label || (label === "Perlu tindakan (32)" && statusFilter === "Belum selesai (32)");
            return <button key={label} type="button" aria-pressed={active} onClick={() => setStatusFilter(label === "Perlu tindakan (32)" ? "Belum selesai (32)" : label)} className={`rounded-md px-2.5 py-1.5 text-[9px] font-semibold transition ${active ? "bg-[#e6f5ef] text-[#087f71]" : "text-[#81918d] hover:bg-[#f4f8f6]"}`}>{label}</button>;
          })}
          <div className="ml-auto w-full sm:w-56"><SearchBox value={search} onChange={setSearch} placeholder="Cari nama atau nomor daftar" /></div>
        </div>
        <div className="mt-3 overflow-hidden rounded-lg border border-[#e8efec]"><ApplicantsTable rows={filteredApplicants.slice(0, 6)} onSelect={openApplicantDetails} compact /></div>
        <div className="mt-3 flex items-center justify-between text-[8px] text-[#8a9995]"><span>Menampilkan {Math.min(filteredApplicants.length, 6)} dari {filteredApplicants.length} data contoh</span><Link href="/admin/data-pendaftar" className="font-bold text-[#078675]">Kelola pendaftar →</Link></div>
      </Panel>
      <ApplicantDetailsDialog applicant={detailsApplicant} onClose={() => setDetailsApplicantId(null)} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <SectionHeading eyebrow="12 Mei 2027" title="Aktivitas terbaru" action={<button aria-expanded={showActivityHistory} onClick={() => setShowActivityHistory((current) => !current)} className="text-[9px] font-bold text-[#078675]">{showActivityHistory ? "Tutup riwayat ↑" : "Riwayat →"}</button>} />
          <div className="mt-3 space-y-3">{[
            ["Berkas Naira Safira telah diverifikasi", "Oleh Dina Pratiwi · 09.24 WIB", "file"],
            ["Bukti pembayaran Raka Aditya masuk", "Rp350.000 · Menunggu verifikasi · 09.18 WIB", "wallet"],
            ["Alya Putri menyelesaikan formulir", "Nomor daftar TM-270128 · 08.56 WIB", "users"],
          ].map(([text, time, icon]) => <div key={text} className="flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e8f4f0] text-[#078675]"><AdminIcon name={icon} className="h-3.5 w-3.5" /></span><span><span className="block text-[9px] font-semibold text-[#405d56]">{text}</span><span className="mt-1 block text-[8px] text-[#8a9995]">{time}</span></span></div>)}</div>
          {showActivityHistory ? <div className="mt-3 border-t border-[#edf2ef] pt-3 text-[8px] leading-4 text-[#718681]"><p>08.42 · Pembaruan data calon siswa disimpan.</p><p>08.15 · Jadwal wawancara dibagikan kepada panitia.</p><p className="mt-1 text-[#9aa7a3]">Riwayat ini merupakan data contoh pada perangkat demo.</p></div> : null}
          {notice ? <p role="status" className="mt-3 text-[9px] text-[#078675]">{notice}</p> : null}
        </Panel>
        <Panel>
          <SectionHeading eyebrow="Koordinasi penerimaan kelas X" title="Agenda penerimaan" action={<Pill tone="green">17 Mei</Pill>} />
          <div className="mt-4 flex items-center gap-3 rounded-lg bg-[#f2f8f5] p-3"><span className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-white text-[#078675]"><strong className="text-base leading-4">17</strong><small className="text-[7px]">MEI</small></span><span><strong className="block text-[10px] text-[#31564e]">Tes seleksi & wawancara</strong><span className="mt-1 block text-[8px] text-[#81918d]">08.30–11.00 WIB · Aula sekolah</span></span></div>
          <p className="mt-3 text-[8px] leading-4 text-[#81918d]">Pastikan daftar hadir, berkas pendaftar, dan tim pembayaran siap sebelum kegiatan.</p>
          <ActionButton href="/admin/jadwal-kegiatan" className="mt-3">Kelola agenda</ActionButton>
        </Panel>
      </div>
    </div>;
  }

  if (section === "data-pendaftar") {
    const filterOptions = ["Semua (128)", "Belum selesai (32)", "Terverifikasi (96)"];
    return <>
      <PageIntro {...titles[section]} action={<ActionButton onClick={() => onExport("direktori-pendaftar.csv", [["Nama", "Nomor daftar", "Program", "Tanggal daftar", "Berkas", "Pembayaran"], ...filteredApplicants.map((a) => [a.name, a.id, a.program, a.date, a.document, a.payment])])}><AdminIcon name="download" className="h-3.5 w-3.5" />Ekspor pendaftar</ActionButton>} />
      <Panel className="mb-4">
        <SectionHeading eyebrow="128 pendaftar · 96 berkas terverifikasi · 32 belum selesai" title="Direktori pendaftar" action={<span className="text-[8px] text-[#81918d]">Snapshot 12 Mei 2027, 09.30 WIB</span>} />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="min-w-[220px] flex-1"><SearchBox value={search} onChange={(value) => { setSearch(value); setApplicantPage(1); }} /></div>
          <select aria-label="Filter status berkas" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setApplicantPage(1); }} className="h-9 rounded-lg border border-[#dfe9e5] bg-white px-2 text-[9px] text-[#52716a]"><option>Semua (128)</option><option>Belum selesai (32)</option><option>Terverifikasi (96)</option></select>
          <select aria-label="Filter gelombang" value="Gelombang 1" className="h-9 rounded-lg border border-[#dfe9e5] bg-white px-2 text-[9px] text-[#52716a]" disabled><option>Gelombang 1</option></select>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">{filterOptions.map((label) => <button key={label} onClick={() => { setStatusFilter(label); setApplicantPage(1); }} className={`rounded-full px-2.5 py-1 text-[8px] font-semibold ${statusFilter === label ? "bg-[#e6f5ef] text-[#087f71]" : "bg-[#f4f7f6] text-[#85938f]"}`}>{label}</button>)}</div>
        <div className="mt-4 overflow-hidden rounded-lg border border-[#e8efec]"><ApplicantsTable rows={filteredApplicants.slice((applicantPage - 1) * 4, applicantPage * 4)} onSelect={openApplicantDetails} /></div>
        <div className="mt-3 flex items-center justify-between text-[8px] text-[#8a9995]"><span>Menampilkan {filteredApplicants.length ? (applicantPage - 1) * 4 + 1 : 0}–{Math.min(applicantPage * 4, filteredApplicants.length)} dari {filteredApplicants.length} data contoh</span><div className="flex items-center gap-2"><button disabled={applicantPage === 1} onClick={() => setApplicantPage((page) => Math.max(1, page - 1))} className="rounded-md border border-[#e4ece9] px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40">Sebelumnya</button><span className="rounded-md bg-[#e6f5ef] px-2 py-1 text-[#087f71]">{applicantPage} / {Math.max(1, Math.ceil(filteredApplicants.length / 4))}</span><button disabled={applicantPage >= Math.ceil(filteredApplicants.length / 4)} onClick={() => setApplicantPage((page) => page + 1)} className="rounded-md border border-[#e4ece9] px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40">Berikutnya</button></div></div>
      </Panel>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <SectionHeading eyebrow={`Ringkasan data · ${selectedApplicant.id}`} title="Pendaftar terpilih" action={<Pill tone={selectedApplicant.document === "Terverifikasi" ? "green" : "amber"}>{selectedApplicant.document}</Pill>} />
          <p className="mt-3 text-xs font-bold text-[#31564e]">{selectedApplicant.name}</p>
          <div className="mt-3 space-y-2.5">{[["Kelas", "X · " + selectedApplicant.program], ["Orang tua / wali", selectedApplicant.parent], ["Nomor WhatsApp", selectedApplicant.phone], ["Formulir", "Sudah dikirim"], ["Berkas", "3 dari 4 terverifikasi"]].map(([label, value]) => <div key={label} className="flex justify-between gap-3 border-b border-[#edf2ef] pb-2 text-[9px]"><span className="text-[#82938f]">{label}</span><span className="text-right font-medium text-[#47625b]">{value}</span></div>)}</div>
          <ActionButton href="/admin/verifikasi-berkas" className="mt-3">Buka detail pendaftaran</ActionButton>
        </Panel>
        <Panel>
          <SectionHeading eyebrow="Tindak lanjut pendaftar" title={`Tindak lanjut ${selectedApplicant.name.split(" ")[0]}`} />
          <div className="mt-3 rounded-lg bg-[#fff4df] p-3 text-[9px] leading-4 text-[#87580c]"><strong>Surat sehat perlu perbaikan</strong><br />Tulisan kurang terbaca. Minta hasil pindai yang lebih jelas, maksimal 2 MB.</div>
          <div className="mt-3 space-y-2.5">{[["Tagihan", `${selectedApplicant.invoice} · ${selectedApplicant.amount}`], ["Pembayaran", selectedApplicant.payment], ["Tenggat 15 Mei 2027", "23.59 WIB"]].map(([label, value]) => <div key={label} className="flex justify-between gap-3 text-[9px]"><span className="text-[#82938f]">{label}</span><span className="text-right text-[#47625b]">{value}</span></div>)}</div>
          <p className="mt-3 text-[8px] leading-4 text-[#82938f]">Data, status, dan nominal pada halaman ini adalah ilustrasi.</p>
        </Panel>
      </div>
      <ApplicantDetailsDialog applicant={detailsApplicant} onClose={() => setDetailsApplicantId(null)} />
    </>;
  }

  if (section === "verifikasi-berkas") {
    const verificationQueue = filteredApplicants.filter((item) => item.document !== "Terverifikasi");
    const activeDocumentUploaded = Boolean(activeSelectedDocument?.upload);
    const selectedApplicantInQueue = verificationQueue.some((item) => item.id === selectedApplicant.id);
    const verificationHistory = sharedEvents
      .filter((event) => event.entityId === selectedApplicant.id
        && (event.eventType === "document_uploaded"
          || (event.eventType === "application_updated" && readActivityPayload(event).documentStatus)))
      .slice(-5)
      .reverse();
    return <>
      <PageIntro {...titles[section]} action={<ActionButton aria-expanded={showVerificationGuide} onClick={() => setShowVerificationGuide((current) => !current)}>{showVerificationGuide ? "Tutup panduan" : "▣ Panduan verifikasi"}</ActionButton>} />
      {showVerificationGuide ? <Panel className="mb-4"><SectionHeading eyebrow="Daftar periksa" title="Panduan verifikasi berkas" /><ol className="mt-3 list-inside list-decimal space-y-2 text-[9px] leading-4 text-[#607870]"><li>Cocokkan nama dan nomor pendaftaran dengan formulir siswa.</li><li>Pastikan dokumen lengkap, terbaca jelas, dan sesuai format yang diminta.</li><li>Periksa masa berlaku serta kecocokan data pada dokumen.</li><li>Pilih “Setujui berkas” atau “Minta perbaikan” untuk dokumen yang sedang dipilih.</li></ol><p className="mt-3 text-[8px] text-[#82938f]">Keputusan disinkronkan ke aktivitas portal; status per dokumen juga tersimpan di perangkat ini.</p></Panel> : null}
      <div className="mb-4 rounded-lg border border-[#d8efe5] bg-[#e8f6ef] px-4 py-3 text-[9px] leading-4 text-[#276751]"><strong>{verificationQueue.length} pendaftar dalam antrean yang cocok dengan pencarian</strong><br />Antrean hanya menampilkan pendaftar yang status berkasnya belum terverifikasi. Jumlah adalah data yang tersedia pada portal ini.</div>
      <div className="grid items-start gap-4 xl:grid-cols-[0.72fr_1.28fr]">
        <div className="space-y-4">
          <Panel>
            <SectionHeading eyebrow="Terbaru · Gelombang 1" title="Antrean berkas" />
            <div className="mt-3"><SearchBox value={search} onChange={updateVerificationSearch} placeholder="Cari pendaftar" /></div>
            <div className="mt-3 space-y-2">{verificationQueue.map((item) => <button key={item.id} type="button" aria-pressed={selectedApplicant.id === item.id} onClick={() => selectStudent(item)} className={`w-full rounded-lg p-3 text-left transition ${selectedApplicant.id === item.id ? "bg-[#e8f5ef]" : "bg-[#f5f8f6] hover:bg-[#edf5f1]"}`}><span className="block text-[9px] font-bold text-[#34564e]">{item.name}</span><span className="mt-1 block text-[8px] text-[#8a9995]">{item.id}</span><span className="mt-2 inline-flex"><Pill tone={item.document === "Perlu perbaikan" ? "amber" : "blue"}>{item.document}</Pill></span></button>)}
              {verificationQueue.length === 0 ? <p className="rounded-lg bg-[#f5f8f6] p-4 text-center text-[9px] text-[#82938f]">{search.trim() ? "Tidak ada hasil antrean yang cocok dengan pencarian." : "Antrean kosong. Semua pendaftar yang tersedia sudah terverifikasi."}</p> : null}
            </div>
            <p className="mt-3 text-[8px] text-[#82938f]">Menampilkan {verificationQueue.length} pendaftar yang memerlukan tindak lanjut.</p>
            <ActionButton onClick={openNextVerificationApplicant} className="mt-3" disabled={verificationQueue.length < 2}>Antrean berikutnya →</ActionButton>
          </Panel>
          <Panel><SectionHeading eyebrow={`Riwayat · ${selectedApplicant.id}`} title="Aktivitas verifikasi" /><div className="mt-3 space-y-3 text-[9px] text-[#607870]">{verificationHistory.map((event) => {
            const payload = readActivityPayload(event);
            const time = event.createdAt ? new Date(event.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "Baru saja";
            const summary = event.eventType === "document_uploaded"
              ? `${payload.documentName || "Berkas"} diunggah${payload.fileName ? `: ${payload.fileName}` : ""}`
              : `${payload.documentName || "Berkas"}: ${payload.documentStatus}`;
            return <p key={event.id}><strong>{time}</strong> · {summary}</p>;
          })}
            {verificationHistory.length === 0 ? <p>Belum ada aktivitas verifikasi untuk pendaftar ini.</p> : null}
          </div></Panel>
        </div>
        <div className="space-y-4">
          <Panel>
            <SectionHeading eyebrow={selectedApplicant.id} title={`Berkas ${selectedApplicant.name}`} action={<Pill tone={verifiedDocumentCount === selectedApplicantDocuments.length ? "green" : "amber"}>{verifiedDocumentCount} dari {selectedApplicantDocuments.length} berkas terverifikasi</Pill>} />
            <div className="mt-3 divide-y divide-[#edf2ef]">{selectedApplicantDocuments.map((document) => {
              const status = documentStatusFor(document);
              const tone = status === "Terverifikasi" ? "green" : status === "Menunggu verifikasi" ? "blue" : status === "Belum diunggah" ? "gray" : "amber";
              return <div key={document.name} className={`flex flex-wrap items-center justify-between gap-2 py-3 ${activeSelectedDocument.name === document.name ? "rounded-lg bg-[#f4f9f6] px-2" : ""}`}>
                <span className="flex items-center gap-2.5"><AdminIcon name="file" className="h-4 w-4 text-[#078675]" /><span><strong className="block text-[9px] text-[#405d56]">{document.name}</strong><span className="mt-0.5 block text-[8px] text-[#91a09c]">{document.upload ? `${document.upload.fileName || document.name}${document.size ? ` · ${document.size}` : ""}` : "Pilih “Lihat” untuk memeriksa berkas asli"}</span></span></span>
                <span className="flex items-center gap-2"><Pill tone={tone}>{status}</Pill><button type="button" aria-label={`Lihat ${document.name} milik ${selectedApplicant.name}`} aria-pressed={activeSelectedDocument.name === document.name} onClick={() => previewApplicantDocument(document)} className="rounded px-1 text-[8px] font-bold text-[#078675] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#078675]/40">Lihat →</button></span>
              </div>;
            })}</div>
            {notice ? <p role="status" className="mt-2 text-[8px] text-[#078675]">{notice}</p> : null}
          </Panel>
          <Panel>
            <SectionHeading eyebrow={`Pratinjau · ${documentPreview?.fileName || activeSelectedDocument.upload?.fileName || "Pilih berkas untuk memeriksa"}`} title={`Pratinjau ${activeSelectedDocument.name.toLowerCase()}`} />
            <div className="mt-3 grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
              <div className="flex min-h-[240px] items-center justify-center overflow-hidden rounded-lg border border-[#e8efec] bg-[#f2f7f5]">
                {previewLoading ? <p className="p-5 text-center text-xs text-[#718681]">Memuat berkas pilihan...</p>
                  : documentPreview?.mimeType === "application/pdf" ? <iframe title={`Pratinjau ${activeSelectedDocument.name}`} src={documentPreview.url} className="h-[420px] w-full bg-white" />
                    : documentPreview?.mimeType.startsWith("image/") ? <Image src={documentPreview.url} alt={`Pratinjau ${activeSelectedDocument.name}`} width={1200} height={1200} unoptimized className="max-h-[420px] w-full object-contain" />
                      : <div className="p-5 text-center"><AdminIcon name="file" className="mx-auto h-8 w-8 text-[#078675]" /><p className="mt-3 text-sm font-semibold text-[#34564e]">{activeSelectedDocument.name}</p><p className="mt-1 text-xs leading-5 text-[#82938f]">{notice || "Pilih “Lihat” untuk memeriksa dan memuat berkas asli."}</p></div>}
              </div>
              <div><Pill tone={documentStatusFor(activeSelectedDocument) === "Terverifikasi" ? "green" : documentStatusFor(activeSelectedDocument) === "Menunggu verifikasi" ? "blue" : documentStatusFor(activeSelectedDocument) === "Belum diunggah" ? "gray" : "amber"}>{documentStatusFor(activeSelectedDocument)}</Pill>
                <div className="mt-3 rounded-lg bg-[#f2f7f5] p-3 text-[9px] leading-4 text-[#607870]"><strong>Catatan admin</strong><br />{documentStatusFor(activeSelectedDocument) === "Perlu perbaikan" ? "Dokumen perlu diperbaiki. Periksa kualitas dan kecocokan data sebelum menyetujui." : activeSelectedDocument.upload ? "Periksa keterbacaan dan kecocokan data pada berkas asli sebelum memberi keputusan." : "Dokumen asli belum diunggah sehingga belum dapat ditinjau."}</div>
                <div className="mt-3 space-y-2 text-[8px] text-[#718681]"><p>Peninjau <strong className="ml-2 text-[#47625b]">Admin SPMB</strong></p><p>Status berkas tersimpan pada data pendaftar.</p></div>
                <div className="mt-3 flex flex-wrap gap-2"><ActionButton variant="primary" disabled={!activeDocumentUploaded || !selectedApplicantInQueue} onClick={() => updateDocumentStatus("Perlu perbaikan")}>Minta perbaikan</ActionButton><ActionButton disabled={!activeDocumentUploaded || !selectedApplicantInQueue} onClick={() => updateDocumentStatus("Terverifikasi")}>Setujui berkas</ActionButton></div>
                {!activeDocumentUploaded ? <p className="mt-2 text-[8px] text-[#82938f]">Keputusan aktif setelah pelajar mengunggah berkas asli.</p> : null}
                {activeDocumentUploaded && !selectedApplicantInQueue ? <p className="mt-2 text-[8px] text-[#82938f]">Pilih pendaftar yang masih ada di antrean untuk memberi keputusan.</p> : null}
                {documentPreview ? <a href={documentPreview.url} download={documentPreview.fileName || activeSelectedDocument.name} className="mt-3 inline-flex text-[9px] font-bold text-[#078675] hover:underline">Unduh berkas terpilih →</a> : null}
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </>;
  }

  if (section === "pembayaran") {
    const paid = allApplicantRows.filter((item) => item.payment === "Lunas").length;
    return <>
      <PageIntro {...titles[section]} action={<ActionButton onClick={() => onExport("rekap-pembayaran.csv", [["Nama", "Nomor tagihan", "Nominal", "Status"], ...filteredPaymentApplicants.map((a) => [a.name, a.invoice, a.amount, a.payment])])}><AdminIcon name="download" className="h-3.5 w-3.5" />Ekspor pembayaran</ActionButton>} />
      <section className="admin-stagger mb-4 grid gap-3 sm:grid-cols-3">{[{ label: "Pembayaran lunas", value: "84", note: "Rp29.400.000 terverifikasi", tone: "green" }, { label: "Menunggu verifikasi", value: "12", note: "Periksa bukti transfer", tone: "amber" }, { label: "Belum dibayar", value: "32", note: "Perlu pengingat tenggat", tone: "blue" }].map((metric) => <article key={metric.label} className={`admin-metric admin-metric-${metric.tone} rounded-xl border p-4`}><p className="text-[10px] text-[#748681]">{metric.label}</p><p className="mt-2 text-2xl font-semibold text-[#21413b]">{metric.value}</p><p className="mt-2 text-[8px] text-[#81918d]">{metric.note}</p></article>)}</section>
      <Panel className="mb-4"><SectionHeading eyebrow="Kelola nominal tagihan dan status pembayaran" title="Daftar transaksi" /><div className="mt-4 flex flex-wrap gap-2"><div className="min-w-[220px] flex-1"><SearchBox value={search} onChange={setSearch} placeholder="Cari nama atau nomor tagihan" /></div><select aria-label="Filter status pembayaran" value={paymentStatusFilter} onChange={(event) => setPaymentStatusFilter(event.target.value)} className="h-9 rounded-lg border border-[#dfe9e5] bg-white px-3 text-[9px] text-[#52716a]"><option>Semua pembayaran</option><option>Lunas</option><option>Perlu verifikasi</option><option>Belum dibayar</option></select></div><div className="mt-4 overflow-hidden rounded-lg border border-[#e8efec]"><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-[10px]"><thead className="bg-[#f3f7f5] text-[8px] uppercase tracking-wide text-[#718681]"><tr>{["Pendaftar", "Nomor tagihan", "Nominal", "Tanggal", "Status", "Aksi"].map((heading) => <th key={heading} className="px-3 py-3">{heading}</th>)}</tr></thead><tbody>{filteredPaymentApplicants.map((student) => <tr key={student.id} className="border-t border-[#edf2ef] hover:bg-[#f8fbf9]"><td className="px-3 py-3 font-semibold text-[#405d56]">{student.name}<span className="mt-1 block text-[8px] font-normal text-[#91a09c]">{student.id}</span></td><td className="px-3 py-3 text-[#607870]">{student.invoice}</td><td className="px-3 py-3 text-[#607870]">{student.amount}</td><td className="px-3 py-3 text-[#607870]">{student.date}</td><td className="px-3 py-3"><Pill tone={student.payment === "Lunas" ? "green" : student.payment === "Perlu verifikasi" ? "amber" : "gray"}>{student.payment}</Pill></td><td className="px-3 py-3"><button type="button" onClick={() => { setSelectedPayment(student); setNotice(""); }} className="font-bold text-[#078675] hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#078675]/40">Detail →</button></td></tr>)}</tbody></table></div></div><p className="mt-3 text-[8px] text-[#82938f]">Menampilkan {filteredPaymentApplicants.length} transaksi ilustratif dari {applicantRows.length} contoh pendaftar. {paid} transaksi lunas pada contoh data.</p>{filteredPaymentApplicants.length === 0 ? <p className="mt-3 text-center text-[9px] text-[#82938f]">Tidak ada transaksi sesuai pencarian atau filter.</p> : null}{notice ? <p role="status" className="mt-2 text-[9px] text-[#078675]">{notice}</p> : null}</Panel>
      {selectedPayment ? <PaymentDetailsDialog key={selectedPayment.id} payment={selectedPayment} notice={notice} onClose={closePaymentDetails} onMarkPaid={markPaymentPaid} onSaveAmount={savePaymentAmount} /> : null}
      <div className="grid gap-4 lg:grid-cols-2"><Panel><SectionHeading eyebrow="Rangkuman pembayaran" title="Status nominal ilustratif" /><div className="mt-3 space-y-3">{[["Lunas / terverifikasi", "84", "Rp29.400.000"], ["Menunggu verifikasi", "12", "Rp4.200.000"], ["Belum dibayar", "32", "Rp11.200.000"]].map(([label, count, amount]) => <div key={label} className="flex justify-between border-b border-[#edf2ef] pb-2 text-[9px]"><span className="text-[#718681]">{label}</span><span className="font-semibold text-[#405d56]">{count} · {amount}</span></div>)}</div><p className="mt-3 text-[8px] leading-4 text-[#82938f]">Nilai contoh ini bukan nominal tagihan resmi.</p></Panel><Panel><SectionHeading eyebrow="Perlu tindak lanjut" title="Pengingat pembayaran" /><p className="mt-3 text-[9px] leading-4 text-[#718681]">Ada pendaftar yang belum membayar. Periksa tenggat dan kirimkan informasi melalui pengumuman resmi.</p><ActionButton href="/admin/pengumuman" className="mt-3">Buat pengumuman</ActionButton></Panel></div>
    </>;
  }

  if (section === "jadwal-kegiatan") {
    const currentAttendanceStatus = attendanceStatuses[selectedApplicant.id] || "Jadwal awal";
    const attendanceMatchesFilter = attendanceFilter === "Semua konfirmasi" || currentAttendanceStatus === attendanceFilter;
    const updateAttendanceStatus = async () => {
      const nextStatus = currentAttendanceStatus === "Hadir" ? "Belum hadir" : "Hadir";
      try {
        await publishPortalActivity({
          actorRole: "admin",
          eventType: "application_updated",
          entityId: selectedApplicant.id,
          summary: `Kehadiran ${selectedApplicant.name} diperbarui: ${nextStatus}`,
          payload: { name: selectedApplicant.name, registrationNumber: selectedApplicant.id, attendance: nextStatus },
        });
      } catch (error) {
        console.error("Status kehadiran tidak dapat disinkronkan.", error);
        setNotice(`${error.message} Status kehadiran belum disimpan.`);
        return;
      }
      setAttendanceStatuses((current) => ({ ...current, [selectedApplicant.id]: nextStatus }));
      setNotice(`Kehadiran ${selectedApplicant.name} diperbarui: ${nextStatus}.`);
    };
    const scheduleSelectedEvent = async () => {
      const nextStatus = selectedEvent.status === "Terjadwal" ? "Draf" : "Terjadwal";
      try {
        await publishPortalActivity({
          actorRole: "admin",
          eventType: "application_updated",
          entityId: selectedEvent.id || `event:${selectedEvent.title}`,
          summary: `Agenda "${selectedEvent.title}" diubah menjadi ${nextStatus}`,
          payload: { eventTitle: selectedEvent.title, date: `${selectedEvent.day} ${selectedEvent.month}`, time: selectedEvent.time, status: nextStatus },
        });
      } catch (error) {
        console.error("Perubahan agenda tidak dapat disinkronkan.", error);
        setNotice(`${error.message} Perubahan agenda belum disimpan.`);
        return;
      }
      setEvents((current) => current.map((item) => (selectedEvent.id ? item.id === selectedEvent.id : item.title === selectedEvent.title) ? { ...item, status: nextStatus } : item));
      setNotice(`Status agenda "${selectedEvent.title}" diubah menjadi ${nextStatus}.`);
    };
    const saveEventEdit = async (event) => {
      event.preventDefault();
      const editedEvent = events.find((item) => (item.id || item.title) === editingEventKey);
      if (!editedEvent) {
        setNotice("Agenda tidak ditemukan. Muat ulang halaman dan coba lagi.");
        return;
      }
      if (!eventTitle.trim() || !eventEditTimeLocation.trim()) {
        setNotice("Isi nama kegiatan, waktu, dan lokasi sebelum menyimpan perubahan.");
        return;
      }
      const date = new Date(`${eventDate}T00:00:00`);
      if (Number.isNaN(date.getTime()) || date.getFullYear() !== 2027 || ![4, 5].includes(date.getMonth())) {
        setNotice("Pilih tanggal yang valid pada Mei atau Juni 2027.");
        return;
      }
      const updatedEvent = {
        ...editedEvent,
        day: eventDate.slice(-2),
        month: date.toLocaleDateString("id-ID", { month: "long" }).toLocaleUpperCase("id"),
        title: eventTitle.trim(),
        time: eventEditTimeLocation.trim(),
      };
      try {
        await publishPortalActivity({
          actorRole: "admin",
          eventType: "application_updated",
          entityId: editedEvent.id || `event:${editedEvent.title}`,
          summary: `Agenda "${editedEvent.title}" diperbarui oleh Admin`,
          payload: { eventTitle: updatedEvent.title, date: `${updatedEvent.day} ${updatedEvent.month}`, time: updatedEvent.time, status: updatedEvent.status },
        });
      } catch (error) {
        console.error("Perubahan agenda tidak dapat disinkronkan.", error);
        setNotice(`${error.message} Perubahan agenda belum disimpan.`);
        return;
      }
      setEvents((current) => current.map((item) => (editedEvent.id ? item.id === editedEvent.id : item.title === editedEvent.title) ? updatedEvent : item));
      setSelectedEventKey(updatedEvent.id || updatedEvent.title);
      setEventMonth(date.getMonth() === 4 ? "Mei 2027" : "Juni 2027");
      setEditingEventKey(null);
      setNotice(`Agenda "${updatedEvent.title}" berhasil diperbarui.`);
    };
    const addEvent = async (event) => {
      event.preventDefault();
      const monthNumber = eventMonth.startsWith("Mei") ? "05" : "06";
      if (!eventTitle.trim() || !eventLocation.trim()) {
        setNotice("Isi nama kegiatan dan lokasi sebelum menyimpan agenda.");
        return;
      }
      if (!eventDate.startsWith(`2027-${monthNumber}-`)) {
        setNotice(`Pilih tanggal pada bulan ${eventMonth}.`);
        return;
      }
      const newEvent = {
        id: `event-${Date.now()}`,
        day: eventDate.slice(-2),
        month: eventMonth.toUpperCase().split(" ")[0],
        title: eventTitle.trim(),
        time: `${eventTime} WIB · ${eventLocation.trim()}`,
        status: "Draf",
      };
      try {
        await publishPortalActivity({
          actorRole: "admin",
          eventType: "application_updated",
          entityId: newEvent.id,
          summary: `Agenda baru dibuat: ${newEvent.title}`,
          payload: { eventTitle: newEvent.title, date: `${newEvent.day} ${newEvent.month}`, time: newEvent.time, status: newEvent.status },
        });
      } catch (error) {
        console.error("Agenda tidak dapat disinkronkan.", error);
        setNotice(`${error.message} Agenda belum disimpan.`);
        return;
      }
      setEvents((current) => [...current, newEvent]);
      setSelectedEventKey(newEvent.id);
      setEventTitle("");
      setShowEventForm(false);
      setNotice("Agenda disimpan sebagai draf pada perangkat ini.");
    };
    return <>
      <PageIntro {...titles[section]} action={<ActionButton variant="primary" onClick={() => setShowEventForm((current) => !current)}>＋ Tambah jadwal</ActionButton>} />
      <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]"><SearchBox value={search} onChange={setSearch} placeholder="Cari kegiatan atau peserta" /><select aria-label="Pilih bulan" value={eventMonth} onChange={(event) => setEventMonth(event.target.value)} className="h-9 rounded-lg border border-[#dfe9e5] bg-white px-3 text-[9px] text-[#52716a]"><option>Mei 2027</option><option>Juni 2027</option></select><select aria-label="Pilih gelombang" value={eventWave} onChange={(event) => setEventWave(event.target.value)} className="h-9 rounded-lg border border-[#dfe9e5] bg-white px-3 text-[9px] text-[#52716a]"><option>Gelombang 1</option><option>Semua gelombang</option></select></div>
      {showEventForm || editingEventKey ? <Panel className="mb-4"><form onSubmit={editingEventKey ? saveEventEdit : addEvent} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><label className="text-[9px] font-semibold text-[#607870]">Nama kegiatan<input value={eventTitle} onChange={(event) => setEventTitle(event.target.value)} required className="mt-1 block h-9 w-full rounded-lg border border-[#dfe9e5] px-3 text-[10px] outline-none focus:border-[#14927d]" placeholder="Contoh: Orientasi calon siswa" /></label><label className="text-[9px] font-semibold text-[#607870]">Tanggal<input type="date" value={eventDate} onChange={(event) => setEventDate(event.target.value)} required className="mt-1 block h-9 w-full rounded-lg border border-[#dfe9e5] px-3 text-[10px] outline-none focus:border-[#14927d]" /></label>{editingEventKey ? <label className="text-[9px] font-semibold text-[#607870]">Waktu dan lokasi<input value={eventEditTimeLocation} onChange={(event) => setEventEditTimeLocation(event.target.value)} required className="mt-1 block h-9 w-full rounded-lg border border-[#dfe9e5] px-3 text-[10px] outline-none focus:border-[#14927d]" placeholder="08.30–11.00 WIB · Aula sekolah" /></label> : <><label className="text-[9px] font-semibold text-[#607870]">Waktu<input type="time" value={eventTime} onChange={(event) => setEventTime(event.target.value)} required className="mt-1 block h-9 w-full rounded-lg border border-[#dfe9e5] px-3 text-[10px] outline-none focus:border-[#14927d]" /></label><label className="text-[9px] font-semibold text-[#607870]">Lokasi<input value={eventLocation} onChange={(event) => setEventLocation(event.target.value)} required className="mt-1 block h-9 w-full rounded-lg border border-[#dfe9e5] px-3 text-[10px] outline-none focus:border-[#14927d]" placeholder="Lokasi kegiatan" /></label></>}<div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4"><ActionButton type="submit" variant="primary">{editingEventKey ? "Simpan perubahan" : "Simpan agenda"}</ActionButton>{editingEventKey ? <ActionButton onClick={() => setEditingEventKey(null)}>Batal</ActionButton> : null}</div></form></Panel> : null}
      {notice ? <p role="status" className="mb-3 text-[9px] text-[#078675]">{notice}</p> : null}
      <div className="grid items-start gap-4 lg:grid-cols-[1.3fr_0.7fr]"><Panel><SectionHeading eyebrow="Daftar kegiatan · waktu dalam WIB" title={`Agenda ${eventMonth}`} /><div className="mt-3 divide-y divide-[#edf2ef]">{events.filter((item) => (eventWave === "Semua gelombang" || eventWave === "Gelombang 1") && item.month.includes(eventMonth.toUpperCase().split(" ")[0]) && (!search || `${item.title} ${item.time}`.toLowerCase().includes(search.toLowerCase()))).map((item) => <article key={item.id || `${item.day}-${item.title}`} className="admin-list-item flex gap-3 py-4"><span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-[#e7f5ef] text-[#078675]"><strong className="text-base leading-4">{item.day}</strong><small className="text-[7px]">{item.month}</small></span><div className="min-w-0 flex-1"><h3 className="text-[10px] font-bold text-[#34564e]">{item.title}</h3><p className="mt-1 text-[8px] text-[#82938f]">{item.time}</p><Pill tone={item.status === "Draf" ? "gray" : "green"}>{item.status}</Pill></div><button onClick={() => { setSelectedEventKey(item.id || item.title); setEventTitle(item.title); setEventDate(`2027-${item.month.startsWith("MEI") ? "05" : "06"}-${item.day.padStart(2, "0")}`); setEventEditTimeLocation(item.time); setEditingEventKey(item.id || item.title); setShowEventForm(false); setNotice(`Agenda “${item.title}” siap dikelola.`); }} className="self-start cursor-pointer text-[8px] font-bold text-[#078675]">Kelola →</button></article>)}</div>{events.filter((item) => item.month.includes(eventMonth.toUpperCase().split(" ")[0]) && (!search || `${item.title} ${item.time}`.toLowerCase().includes(search.toLowerCase()))).length === 0 ? <p className="mt-4 text-center text-[9px] text-[#82938f]">Belum ada agenda pada bulan dan pencarian ini.</p> : null}<p className="mt-3 text-[8px] text-[#82938f]">Agenda pada halaman ini merupakan data contoh lokal.</p></Panel><Panel><SectionHeading eyebrow={`${selectedEvent.month} · ${selectedEvent.day}`} title="Detail agenda" action={<Pill tone={selectedEvent.status === "Draf" ? "gray" : "green"}>{selectedEvent.status}</Pill>} /><h3 className="mt-4 text-sm font-semibold text-[#34564e]">{selectedEvent.title}</h3><div className="mt-4 space-y-3">{[["Waktu / lokasi", selectedEvent.time], ["Peserta", "24 peserta terdaftar"], ["Penanggung jawab", "Panitia SPMB"]].map(([label, value]) => <div key={label} className="flex justify-between gap-3 text-[9px]"><span className="text-[#82938f]">{label}</span><span className="text-right font-medium text-[#47625b]">{value}</span></div>)}</div><div className="mt-4 rounded-lg bg-[#e8f6ef] p-3 text-[8px] leading-4 text-[#276751]"><strong>Persiapan panitia</strong><br />Siapkan daftar hadir dan koordinasikan sesi peserta sebelum kegiatan.</div><ActionButton onClick={scheduleSelectedEvent} className="mt-3">{selectedEvent.status === "Terjadwal" ? "Kembalikan ke draf" : "Jadwalkan agenda"}</ActionButton></Panel></div>
      <Panel className="mt-4"><SectionHeading eyebrow="Konfirmasi kehadiran" title="Peserta dan sesi" action={<select aria-label="Filter konfirmasi kehadiran" value={attendanceFilter} onChange={(event) => setAttendanceFilter(event.target.value)} className="h-8 rounded-lg border border-[#dfe9e5] bg-white px-2 text-[8px]"><option>Semua konfirmasi</option><option>Jadwal awal</option><option>Hadir</option><option>Belum hadir</option></select>} /><div className="mt-3 flex flex-wrap items-center gap-2"><div className="min-w-[220px] flex-1"><SearchBox value={search} onChange={setSearch} placeholder="Cari peserta pada jadwal" /></div></div>{(!search || `${selectedApplicant.name} ${selectedApplicant.id}`.toLowerCase().includes(search.toLowerCase())) && attendanceMatchesFilter ? <div className="mt-3 grid gap-2 rounded-lg bg-[#f3f7f5] p-3 text-[8px] sm:grid-cols-5"><span className="font-bold text-[#607870]">PESERTA</span><span className="font-bold text-[#607870]">KEGIATAN</span><span className="font-bold text-[#607870]">WAKTU / LOKASI</span><span className="font-bold text-[#607870]">STATUS</span><span className="font-bold text-[#607870]">AKSI</span><strong className="text-[#34564e]">{selectedApplicant.name}</strong><span className="text-[#607870]">Tes wawancara & verifikasi berkas</span><span className="text-[#607870]">17 Mei · 08.30–11.00<br />Ruang penerimaan</span><Pill tone={currentAttendanceStatus === "Hadir" ? "green" : currentAttendanceStatus === "Belum hadir" ? "amber" : "gray"}>{currentAttendanceStatus}</Pill><button onClick={updateAttendanceStatus} className="text-left font-bold text-[#078675]">{currentAttendanceStatus === "Hadir" ? "Tandai belum hadir" : "Tandai hadir"}</button></div> : <p className="mt-4 text-center text-[9px] text-[#82938f]">Tidak ada peserta yang cocok dengan filter.</p>}</Panel>
    </>;
  }

  if (section === "pengumuman") {
    const saveAnnouncement = async (status) => {
      if (!announcementTitle.trim() || !announcementBody.trim()) {
        setNotice("Isi judul dan isi pengumuman sebelum menyimpan.");
        return;
      }
      const nextAnnouncement = { title: announcementTitle.trim(), audience: announcementAudience, date: "Hari ini", status, category: announcementCategory, body: announcementBody.trim() };
      const activityId = editingAnnouncement || `announcement-${Date.now()}`;
      try {
        await publishPortalActivity({
          actorRole: "admin",
          eventType: "application_updated",
          entityId: activityId,
          summary: `Pengumuman ${status.toLowerCase()}: ${nextAnnouncement.title}`,
          payload: nextAnnouncement,
        });
      } catch (error) {
        console.error("Pengumuman tidak dapat disinkronkan.", error);
        setNotice(`${error.message} Pengumuman belum disimpan.`);
        return;
      }
      if (editingAnnouncement) {
        setAnnouncements((current) => current.map((item) => item.id === editingAnnouncement ? { ...item, ...nextAnnouncement } : item));
      } else {
        nextAnnouncement.id = activityId;
        setAnnouncements((current) => [nextAnnouncement, ...current]);
      }
      setEditingAnnouncement(null);
      setAnnouncementDraftStatus(status);
      setNotice(status === "Draf" ? "Draf pengumuman disimpan di browser ini." : "Pengumuman diperbarui dan tersedia untuk audiens yang dipilih.");
    };
    const handleSaveAnnouncement = (event) => {
      event.preventDefault();
      const currentAnnouncement = announcements.find((item) => item.id === editingAnnouncement);
      saveAnnouncement(currentAnnouncement?.status || "Draf");
    };
    return <>
      <PageIntro {...titles[section]} action={<ActionButton variant="primary" onClick={() => { setEditingAnnouncement(null); setAnnouncementTitle(""); setAnnouncementBody(""); setAnnouncementAudience("Seluruh pendaftar"); setAnnouncementCategory("Informasi"); setAnnouncementDraftStatus("Draf"); setNotice("Formulir siap untuk pengumuman baru."); }}>＋ Tambah pengumuman</ActionButton>} />
      <Panel className="mb-4"><SectionHeading eyebrow={`${announcements.length} pengumuman · tersimpan di browser`} title="Daftar publikasi" /><div className="mt-3 flex flex-wrap gap-2"><div className="min-w-[220px] flex-1"><SearchBox value={search} onChange={setSearch} placeholder="Cari judul pengumuman" /></div><select aria-label="Filter status pengumuman" value={announcementStatusFilter} onChange={(event) => setAnnouncementStatusFilter(event.target.value)} className="h-9 rounded-lg border border-[#dfe9e5] bg-white px-3 text-[9px] text-[#52716a]"><option>Semua status</option><option>Dipublikasikan</option><option>Draf</option></select><select aria-label="Filter audiens pengumuman" value={announcementAudienceFilter} onChange={(event) => setAnnouncementAudienceFilter(event.target.value)} className="h-9 rounded-lg border border-[#dfe9e5] bg-white px-3 text-[9px] text-[#52716a]"><option>Semua audiens</option><option>Seluruh pendaftar</option><option>Belum dibayar</option><option>Peserta seleksi</option></select></div><div className="mt-3 overflow-x-auto rounded-lg border border-[#e8efec]"><table className="w-full min-w-[570px] text-left text-[9px]"><thead className="bg-[#f3f7f5] text-[8px] uppercase text-[#718681]"><tr>{["Judul", "Audiens", "Tanggal", "Status", "Aksi"].map((heading) => <th key={heading} className="px-3 py-3">{heading}</th>)}</tr></thead><tbody>{announcements.filter((item) => (!search || item.title.toLowerCase().includes(search.toLowerCase())) && (announcementStatusFilter === "Semua status" || item.status === announcementStatusFilter) && (announcementAudienceFilter === "Semua audiens" || item.audience === announcementAudienceFilter)).map((item) => <tr key={item.id || `${item.title}-${item.date}`} className="border-t border-[#edf2ef]"><td className="px-3 py-3 font-semibold text-[#405d56]">{item.title}</td><td className="px-3 py-3 text-[#607870]">{item.audience}</td><td className="px-3 py-3 text-[#607870]">{item.date}</td><td className="px-3 py-3"><Pill tone={item.status === "Dipublikasikan" ? "green" : "gray"}>{item.status}</Pill></td><td className="px-3 py-3"><button onClick={() => { setEditingAnnouncement(item.id || null); setAnnouncementTitle(item.title); setAnnouncementBody(item.body); setAnnouncementAudience(item.audience); setAnnouncementCategory(item.category || "Informasi"); setAnnouncementDraftStatus(item.status); setNotice("Pengumuman dimuat ke editor."); }} className="font-bold text-[#078675]">Edit →</button></td></tr>)}</tbody></table></div></Panel>
      <div className="grid items-start gap-4 lg:grid-cols-2"><Panel><SectionHeading eyebrow={editingAnnouncement ? "Mode edit pengumuman" : "Pengumuman baru"} title="Editor pengumuman" /><form onSubmit={handleSaveAnnouncement} className="mt-3 space-y-3"><label className="block text-[9px] font-semibold text-[#526e67]">Judul<input value={announcementTitle} onChange={(event) => setAnnouncementTitle(event.target.value)} required className="mt-1 block h-9 w-full rounded-lg border border-[#dfe9e5] px-3 text-[9px] outline-none focus:border-[#14927d]" /></label><div className="grid gap-2 sm:grid-cols-2"><label className="text-[9px] font-semibold text-[#526e67]">Audiens<select value={announcementAudience} onChange={(event) => setAnnouncementAudience(event.target.value)} className="mt-1 block h-9 w-full rounded-lg border border-[#dfe9e5] bg-white px-2 text-[9px]"><option>Seluruh pendaftar</option><option>Belum dibayar</option><option>Peserta seleksi</option></select></label><label className="text-[9px] font-semibold text-[#526e67]">Kategori<select value={announcementCategory} onChange={(event) => setAnnouncementCategory(event.target.value)} className="mt-1 block h-9 w-full rounded-lg border border-[#dfe9e5] bg-white px-2 text-[9px]"><option>Berkas</option><option>Pembayaran</option><option>Seleksi</option><option>Informasi</option></select></label></div><label className="block text-[9px] font-semibold text-[#526e67]">Isi pengumuman<textarea value={announcementBody} onChange={(event) => setAnnouncementBody(event.target.value)} required rows={5} className="mt-1 block w-full resize-y rounded-lg border border-[#dfe9e5] p-3 text-[9px] leading-4 outline-none focus:border-[#14927d]" /></label><p className="text-[8px] leading-4 text-[#82938f]">Pengumuman dan perubahan status tersimpan secara lokal pada browser ini.</p><div className="flex flex-wrap gap-2"><ActionButton type="submit" variant="primary">{editingAnnouncement ? "Simpan perubahan" : "Simpan sebagai draf"}</ActionButton><ActionButton onClick={() => saveAnnouncement("Dipublikasikan")}>{editingAnnouncement ? "Simpan & publikasikan" : "Publikasikan"}</ActionButton></div></form>{notice ? <p role="status" className="mt-3 text-[8px] text-[#078675]">{notice}</p> : null}</Panel><Panel><SectionHeading eyebrow="Pratinjau sesuai form" title="Pratinjau pengumuman" action={<Pill tone={announcementDraftStatus === "Draf" ? "gray" : "green"}>{announcementCategory} · {announcementDraftStatus}</Pill>} /><h3 className="mt-4 text-base font-semibold text-[#34564e]">{announcementTitle || "Judul pengumuman"}</h3><p className="mt-2 text-[8px] text-[#82938f]">Panitia SPMB · {announcementAudience}</p><p className="mt-4 whitespace-pre-line text-[9px] leading-5 text-[#607870]">{announcementBody || "Isi pengumuman akan ditampilkan di sini."}</p><div className="mt-4 rounded-lg bg-[#fff4df] p-3 text-[8px] leading-4 text-[#87580c]"><strong>Batas kelengkapan: 15 Mei 2027</strong><br />Selesaikan perbaikan berkas dan pembayaran sebelum tenggat. Jadwal pribadi dikonfirmasi setelah keduanya diverifikasi.</div></Panel></div>
    </>;
  }

  if (section === "laporan") {
    const reportScope = {
      period: reportPeriod === "all" ? "Semua periode" : "Mei 2027",
      wave: reportWave === "all" ? "Semua gelombang" : reportWave,
      className: reportClass === "all" ? "Semua kelas" : reportClass,
    };
    const reportCsvRows = [
      ["sep=;"],
      ["Laporan", "Cakupan data", "Snapshot", "Status", "Gelombang", "Kelas"],
      ...filteredReports.map((report) => [report.name, report.coverage, report.snapshot, "Siap ditinjau", report.wave, report.className]),
    ];
    const exportReports = () => onExport("rekap-administratif.csv", reportCsvRows, ";");
    const printReports = (title, rows) => {
      const periodValues = new Set(rows.map((report) => report.period));
      const waveValues = new Set(rows.map((report) => report.wave));
      const classValues = new Set(rows.map((report) => report.className));
      const scope = {
        period: periodValues.size === 1 ? "Mei 2027" : reportScope.period,
        wave: waveValues.size === 1 ? [...waveValues][0] : reportScope.wave,
        className: classValues.size === 1 ? [...classValues][0] : reportScope.className,
      };
      if (!printReport(title, rows, scope)) {
        setNotice("Jendela cetak diblokir. Izinkan pop-up untuk portal ini, lalu coba lagi.");
        return;
      }
      setNotice("Laporan dibuka untuk dicetak atau disimpan sebagai PDF.");
    };
    return <>
      <PageIntro {...titles[section]} action={<div className="flex flex-wrap gap-2"><ActionButton onClick={exportReports}><AdminIcon name="download" className="h-3.5 w-3.5" />Unduh data CSV</ActionButton><ActionButton onClick={() => printReports("Rekap Administratif SPMB", filteredReports)}><AdminIcon name="file" className="h-3.5 w-3.5" />Lembar resmi / PDF</ActionButton></div>} />
      <div className="mb-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-[1fr_auto_auto_auto]">
        <SearchBox value={search} onChange={setSearch} placeholder="Cari nama laporan atau cakupan" />
        <select aria-label="Filter periode laporan" value={reportPeriod} onChange={(event) => setReportPeriod(event.target.value)} className="h-9 rounded-lg border border-[#dfe9e5] bg-white px-3 text-[9px] text-[#52716a]"><option value="all">Semua periode</option><option value="2027-05">Mei 2027</option></select>
        <select aria-label="Filter gelombang laporan" value={reportWave} onChange={(event) => setReportWave(event.target.value)} className="h-9 rounded-lg border border-[#dfe9e5] bg-white px-3 text-[9px] text-[#52716a]"><option value="all">Semua gelombang</option><option value="Gelombang 1">Gelombang 1</option></select>
        <select aria-label="Filter kelas laporan" value={reportClass} onChange={(event) => setReportClass(event.target.value)} className="h-9 rounded-lg border border-[#dfe9e5] bg-white px-3 text-[9px] text-[#52716a]"><option value="all">Semua kelas</option><option value="Kelas X">Kelas X</option></select>
      </div>
      <section className="admin-stagger mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[{ label: "Pendaftar", value: "128", note: "Gelombang 1 · 2027/2028", tone: "green" }, { label: "Berkas terverifikasi", value: "96", note: "32 belum selesai", tone: "blue" }, { label: "Pembayaran lunas", value: "84", note: "Rp29.400.000 ilustratif", tone: "amber" }, { label: "Diterima", value: "72", note: "24 belum diputuskan", tone: "violet" }].map((metric) => <article key={metric.label} className={`admin-metric admin-metric-${metric.tone} rounded-xl border p-4`}><p className="text-[9px] text-[#748681]">{metric.label}</p><p className="mt-2 text-2xl font-semibold text-[#21413b]">{metric.value}</p><p className="mt-2 text-[8px] text-[#81918d]">{metric.note}</p></article>)}</section>
      <Panel className="mb-4"><SectionHeading eyebrow="Rekap administratif · data ilustratif" title="Pilihan laporan" /><div className="mt-4 overflow-x-auto rounded-lg border border-[#e8efec]"><table className="w-full min-w-[700px] text-left text-[9px]"><thead className="bg-[#f3f7f5] text-[8px] uppercase text-[#718681]"><tr>{["Laporan", "Cakupan data", "Snapshot", "Status", "Unduh"].map((heading) => <th key={heading} className="px-3 py-3">{heading}</th>)}</tr></thead><tbody>{filteredReports.map((report) => <tr key={report.name} className="border-t border-[#edf2ef]"><td className="px-3 py-3 font-semibold text-[#405d56]">{report.name}</td><td className="px-3 py-3 text-[#607870]">{report.coverage}</td><td className="px-3 py-3 text-[#607870]">{report.snapshot}</td><td className="px-3 py-3"><Pill tone="green">Siap ditinjau</Pill></td><td className="whitespace-nowrap px-3 py-3"><button onClick={() => onExport(`${report.name.toLowerCase().replaceAll(" ", "-")}.csv`, [["sep=;"], ["Laporan", "Cakupan data", "Snapshot", "Status", "Gelombang", "Kelas"], [report.name, report.coverage, report.snapshot, "Siap ditinjau", report.wave, report.className]], ";")} className="mr-1 rounded border border-[#dfe9e5] px-2 py-1 font-bold text-[#078675]">CSV</button><button onClick={() => printReports(report.name, [report])} className="rounded border border-[#dfe9e5] px-2 py-1 font-bold text-[#078675]">PDF</button></td></tr>)}{filteredReports.length === 0 ? <tr><td colSpan={5} className="px-3 py-8 text-center text-[#82938f]">Tidak ada laporan yang sesuai dengan filter.</td></tr> : null}</tbody></table></div><p className="mt-3 text-[8px] text-[#82938f]">Filter yang dipilih diterapkan pada tabel dan hasil ekspor. Di dialog cetak, pilih “Simpan sebagai PDF” untuk mengunduh berkas PDF.</p>{notice ? <p role="status" className="mt-3 text-[8px] text-[#078675]">{notice}</p> : null}</Panel>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]"><Panel><SectionHeading eyebrow="Nominal per pendaftaran ilustratif Rp350.000" title="Pratinjau rekap pembayaran" /><div className="mt-3 divide-y divide-[#edf2ef]">{[["Lunas / terverifikasi", "84", "Rp29.400.000"], ["Menunggu verifikasi", "12", "Rp4.200.000"], ["Belum dibayar", "32", "Rp11.200.000"]].map(([label, count, amount]) => <div key={label} className="flex justify-between py-3 text-[9px]"><span className="text-[#607870]">{label}</span><span className="font-semibold text-[#405d56]">{count} · {amount}</span></div>)}</div><p className="mt-3 text-[8px] leading-4 text-[#82938f]">Hanya Rp29.400.000 dihitung sebagai pembayaran terverifikasi pada contoh ini.</p></Panel><Panel><SectionHeading eyebrow="Periode 1–12 Mei 2027" title="Informasi ekspor" /><div className="mt-3 space-y-3">{[["Pembuat", "Dina Pratiwi"], ["Pembaruan", "12 Mei 2027, 09.30 WIB"], ["Data", "Snapshot ilustratif"]].map(([label, value]) => <div key={label} className="flex justify-between gap-3 text-[9px]"><span className="text-[#82938f]">{label}</span><span className="text-right text-[#47625b]">{value}</span></div>)}</div><div className="mt-4 rounded-lg bg-[#e8f6ef] p-3 text-[8px] leading-4 text-[#276751]">Unduhan merupakan rekap dari data statis ilustratif. Tidak memuat dokumen atau data sensitif.</div></Panel></div>
    </>;
  }
  return null;
}

export default function AdminPortal({ section }) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sessionSnapshot = useSyncExternalStore(subscribeToSession, getSessionSnapshot, getServerSessionSnapshot);
  const user = useMemo(() => {
    if (!sessionSnapshot || sessionSnapshot === SESSION_HYDRATING) return null;
    try {
      return JSON.parse(sessionSnapshot);
    } catch (error) {
      console.error("Sesi admin tidak dapat dibaca sebagai JSON.", error);
      return null;
    }
  }, [sessionSnapshot]);

  useEffect(() => {
    if (sessionSnapshot === SESSION_HYDRATING) return;
    if (!sessionSnapshot || user?.role !== "admin") router.push("/");
  }, [router, sessionSnapshot, user]);

  if (!user || user.role !== "admin") return null;

  const handleLogout = () => {
    clearSession();
    router.push("/");
  };
  const initials = user.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  const currentPage = titles[section];
  const exportFile = (filename, rows, delimiter) => downloadCsv(filename, rows, delimiter);

  return <main className="admin-shell min-h-screen bg-[#f3f7f5] text-[#23443f]">
    <aside className="admin-sidebar border-r border-[#e4ece8] bg-white">
      <Link href="/admin" className="flex items-center gap-2.5 px-1 py-1"><BrandMark /><span><span className="block text-[11px] font-semibold leading-4 text-[#254841]">SMK Tadika Mesra<br />Jakarta</span><span className="mt-0.5 block text-[8px] uppercase tracking-[0.12em] text-[#8a9995]">Portal SPMB</span></span></Link>
      <div className="mt-5 rounded-xl bg-[#f2f7f5] p-3"><p className="text-[8px] font-bold uppercase tracking-wide text-[#85948f]">Tahun ajaran</p><p className="mt-1 text-[11px] font-semibold text-[#31564e]">2027 / 2028</p><p className="mt-1 text-[8px] text-[#078675]">Gelombang 1 · Dibuka</p></div>
      <p className="mb-2 mt-5 text-[8px] font-bold uppercase tracking-[0.12em] text-[#879691]">Menu admin</p>
      <nav className="space-y-1" aria-label="Menu admin">{navigation.map((item) => <Link key={item.id} href={item.href} aria-current={section === item.id ? "page" : undefined} onClick={() => setMobileMenuOpen(false)} className={`group flex min-h-9 items-center gap-2 rounded-lg px-2.5 text-[9px] transition-colors ${section === item.id ? "bg-[#e7f4ef] font-semibold text-[#078675]" : "text-[#73847f] hover:bg-[#f4f8f6] hover:text-[#28564d]"}`}><AdminIcon name={item.icon} className="h-4 w-4 shrink-0" /><span className="flex-1">{item.label}</span>{item.badge ? <span className="text-[8px] font-bold text-[#078675]">{item.badge}</span> : null}</Link>)}</nav>
      <div className="mt-auto hidden rounded-xl bg-[#e9f5f0] p-3 lg:block"><span className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-[#078675]">?</span><p className="mt-2 text-[9px] font-bold text-[#34564e]">Perlu bantuan?</p><p className="mt-1 text-[8px] leading-4 text-[#81918d]">Lihat panduan atau hubungi panitia SPMB.</p><Link href="/admin/verifikasi-berkas" className="mt-1 block text-[8px] font-bold text-[#078675]">Pusat bantuan →</Link></div>
      <button onClick={handleLogout} className="mt-3 hidden items-center gap-2 px-2 py-2 text-[9px] font-semibold text-[#718681] transition hover:text-[#a44d36] lg:flex"><span aria-hidden="true">↪</span> Keluar akun</button>
    </aside>
    <div className="admin-main min-w-0">
      <header className="admin-topbar flex min-h-[50px] items-center justify-between gap-3 border-b border-[#e5ede9] bg-white/90 px-4 py-2.5 backdrop-blur sm:px-6">
        <button type="button" aria-expanded={mobileMenuOpen} aria-controls="admin-mobile-menu" onClick={() => setMobileMenuOpen((open) => !open)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e1eae6] text-[#31564e] lg:hidden" aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}>{mobileMenuOpen ? "×" : "☰"}</button>
        <div className="min-w-0 flex-1 text-[8px] text-[#82938f]">Portal SPMB <span className="mx-1">/</span> <strong className="text-[#34564e]">{currentPage.title}</strong></div>
        <div className="flex items-center gap-2 sm:gap-3"><Pill tone="amber">Data ilustrasi</Pill><span className="hidden text-[#82938f] sm:inline" aria-hidden="true">♧</span><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e4f3ed] text-[8px] font-bold text-[#078675]">{initials}</span><span className="hidden sm:block"><span className="block text-[9px] font-semibold text-[#405d56]">{user.name}</span><span className="block text-[8px] text-[#91a09c]">Admin SPMB</span></span><button onClick={handleLogout} className="rounded-md border border-[#e1eae6] px-2 py-1.5 text-[8px] font-semibold text-[#718681] hover:text-[#a44d36] lg:hidden">Keluar</button><Link href="/" className="hidden text-[8px] font-semibold text-[#718681] hover:text-[#078675] sm:inline">Beranda</Link></div>
      </header>
      {mobileMenuOpen ? <nav id="admin-mobile-menu" aria-label="Menu admin seluler" className="admin-mobile-menu grid grid-cols-2 gap-1 border-b border-[#e5ede9] bg-white p-3 sm:grid-cols-3 lg:hidden">{navigation.map((item) => <Link key={item.id} href={item.href} aria-current={section === item.id ? "page" : undefined} onClick={() => setMobileMenuOpen(false)} className={`flex min-h-9 items-center gap-2 rounded-lg px-2.5 text-[9px] ${section === item.id ? "bg-[#e7f4ef] font-semibold text-[#078675]" : "text-[#73847f] hover:bg-[#f4f8f6]"}`}><AdminIcon name={item.icon} className="h-4 w-4" />{item.label}</Link>)}</nav> : null}
      <div key={section} className="admin-content-enter px-4 py-5 sm:px-6 sm:py-6 xl:px-7"><div className="mx-auto max-w-[1320px]"><PortalActivityFeed audience="Admin" /><AdminContent section={section} onExport={exportFile} /><footer className="mt-6 flex flex-col gap-1 border-t border-[#e5ede9] pt-3 text-[8px] text-[#91a09c] sm:flex-row sm:justify-between"><span>Seluruh data, jadwal, dan nominal pada halaman ini adalah ilustrasi desain.</span><span>Portal SPMB SMK Tadika Mesra Jakarta</span></footer></div></div>
    </div>
  </main>;
}
