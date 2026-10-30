"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearSession } from "@/app/lib/auth";
import { usePersistentState } from "@/app/lib/use-persistent-state";
import PortalActivityFeed from "@/app/lib/portal-activity-feed";
import { publishPortalActivity, usePortalActivity } from "@/app/lib/portal-activity-client";

const navigation = [
  { id: "ringkasan-penerimaan", label: "Ringkasan penerimaan", icon: "grid", href: "/kepala-sekolah" },
  { id: "kapasitas-kelas", label: "Kapasitas kelas", icon: "school", href: "/kepala-sekolah/kapasitas-kelas" },
  { id: "hasil-seleksi", label: "Hasil seleksi", icon: "check", href: "/kepala-sekolah/hasil-seleksi" },
  { id: "laporan-penerimaan", label: "Laporan penerimaan", icon: "chart", href: "/kepala-sekolah/laporan-penerimaan" },
  { id: "arsip-laporan", label: "Arsip laporan", icon: "archive", href: "/kepala-sekolah/arsip-laporan" },
];

const pageInfo = {
  "ringkasan-penerimaan": { title: "Dashboard Kepala Sekolah · Penerimaan Kelas X", description: "Ringkasan penerimaan, kapasitas kelas X, hasil seleksi, dan laporan pembayaran untuk keputusan yang terarah." },
  "kapasitas-kelas": { title: "Kapasitas kelas X", description: "Tinjau daya tampung dan pertimbangan kapasitas ke kelas atau jurusan." },
  "hasil-seleksi": { title: "Hasil seleksi", description: "Tinjau rekap keputusan dan proses seleksi. Status berikut bukan keputusan penerimaan." },
  "laporan-penerimaan": { title: "Laporan penerimaan kelas X", description: "Rekap pimpinan untuk evaluasi penerimaan, kapasitas, dan status pembayaran." },
  "arsip-laporan": { title: "Arsip laporan", description: "Temukan laporan tersimpan dan tinjau metadata snapshot penerimaan kelas X." },
};

const students = [
  { id: "TM-270128", name: "Alya Putri Ramadhani", program: "Desain Komunikasi Visual", documents: "Perlu perbaikan", decision: "Belum diputuskan", publication: "Belum diumumkan", tone: "amber" },
  { id: "TM-270127", name: "Raka Aditya Pratama", program: "Rekayasa Perangkat Lunak", documents: "Menunggu verifikasi", decision: "Belum diputuskan", publication: "Belum diumumkan", tone: "amber" },
  { id: "TM-270126", name: "Naira Safira", program: "Manajemen Perkantoran", documents: "Terverifikasi", decision: "Belum diputuskan", publication: "Belum diumumkan", tone: "green" },
  { id: "TM-270125", name: "Bima Arkan Wijaya", program: "Kuliner", documents: "Terverifikasi", decision: "Belum diputuskan", publication: "Belum diumumkan", tone: "green" },
  { id: "TM-270124", name: "Sofia Maharani", program: "Desain Komunikasi Visual", documents: "Menunggu verifikasi", decision: "Belum diputuskan", publication: "Belum diumumkan", tone: "amber" },
  { id: "TM-270123", name: "Danar Rizki Saputra", program: "Rekayasa Perangkat Lunak", documents: "Terverifikasi", decision: "Belum diputuskan", publication: "Belum diumumkan", tone: "green" },
];

const reports = [
  { id: "rekap-penerimaan", name: "Rekap penerimaan kelas X", type: "Ringkasan pimpinan", period: "1–12 Mei 2027", author: "Dina Pratiwi", date: "12 Mei 2027", format: "PDF", version: "v1.0 · Tersimpan", coverage: "128 pendaftar · 72 diterima" },
  { id: "kapasitas-hasil", name: "Kapasitas & hasil seleksi", type: "Rekap penerimaan", period: "1–12 Mei 2027", author: "Dina Pratiwi", date: "12 Mei 2027", format: "XLSX", version: "v1.0 · Tersimpan", coverage: "72 / 100 kursi terisi" },
  { id: "rekap-pembayaran", name: "Rekap pembayaran kelas X", type: "Administratif", period: "1–12 Mei 2027", author: "Dina Pratiwi", date: "12 Mei 2027", format: "PDF", version: "v1.0 · Tersimpan", coverage: "84 lunas · ilustrasi" },
  { id: "rekap-berkas", name: "Rekap pendaftar & berkas", type: "Administratif", period: "1–12 Mei 2027", author: "Dina Pratiwi", date: "12 Mei 2027", format: "XLSX", version: "v1.0 · Tersimpan", coverage: "96 terverifikasi · ilustrasi" },
];

const trend = [
  { date: "6 Mei", value: 8 },
  { date: "7 Mei", value: 12 },
  { date: "8 Mei", value: 10 },
  { date: "9 Mei", value: 9 },
  { date: "10 Mei", value: 14 },
  { date: "11 Mei", value: 16 },
  { date: "12 Mei", value: 18 },
];

const SESSION_HYDRATING = "__session_hydrating__";
const capacity = 100;
const admitted = 72;

function subscribeToSession(callback) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSessionSnapshot() {
  try {
    return window.localStorage.getItem("spmb-session");
  } catch (error) {
    console.error("Tidak dapat membaca sesi kepala sekolah.", error);
    return null;
  }
}

function getServerSessionSnapshot() {
  return SESSION_HYDRATING;
}

function SchoolIcon({ name, className = "h-4 w-4" }) {
  const common = { className, fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" };
  if (name === "grid") return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
  if (name === "school") return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><path d="m3 9 9-6 9 6v11H3V9Zm5 11v-7h8v7m-10-7h2m8 0h2m-6-4h.01" /></svg>;
  if (name === "check") return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></svg>;
  if (name === "chart") return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><path d="M4 20V10m5 10V4m5 16v-7m5 7V7m-17 16h20" /></svg>;
  if (name === "archive") return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><path d="M4 4h16v5H4zm2 5v11h12V9m-8 4h4" /></svg>;
  if (name === "download") return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 17v3h14v-3" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><path d="M12 3v18m9-9H3" /></svg>;
}

function BrandMark() {
  return <Image src="/images/smk-tadika-mesra-seal.png" alt="Lambang SMK Tadika Mesra Jakarta" width={36} height={36} className="h-8 w-8 shrink-0 rounded-full bg-white object-contain" />;
}

function Panel({ children, className = "" }) {
  return <section className={`principal-panel rounded-[14px] border border-[#e5ece9] bg-white p-4 shadow-[0_5px_17px_rgba(17,55,48,0.03)] sm:p-5 ${className}`}>{children}</section>;
}

function Pill({ children, tone = "green" }) {
  const tones = {
    green: "bg-[#e6f5ef] text-[#15735b]",
    amber: "bg-[#fff2d9] text-[#99630b]",
    blue: "bg-[#e9f2fa] text-[#336483]",
    gray: "bg-[#eef2f1] text-[#677a76]",
  };
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-1 text-[8px] font-bold ${tones[tone]}`}>{children}</span>;
}

function SectionHeading({ eyebrow, title, action }) {
  return <div className="flex flex-wrap items-end justify-between gap-3"><div>{eyebrow ? <p className="text-[8px] font-semibold text-[#879792]">{eyebrow}</p> : null}<h2 className="mt-1 text-sm font-semibold tracking-[-0.015em] text-[#254841]">{title}</h2></div>{action}</div>;
}

function ActionButton({ children, onClick, href, primary = false, className = "" }) {
  const style = primary ? "border-[#168775] bg-[#168775] text-white hover:bg-[#0d6f60]" : "border-[#dce7e3] bg-white text-[#187b69] hover:bg-[#f2f8f5]";
  const classes = `inline-flex min-h-8 items-center justify-center gap-1.5 rounded-md border px-2.5 text-[8px] font-bold transition focus:outline-none focus:ring-2 focus:ring-[#168775]/20 ${style} ${className}`;
  if (href) return <Link href={href} className={classes}>{children}</Link>;
  return <button type="button" onClick={onClick} className={classes}>{children}</button>;
}

function PageIntro({ section, title, description, action }) {
  return <div className="principal-intro mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><div className="mb-2"><Pill tone="green">Gelombang 1 · Kelas X</Pill></div><h1 className="text-xl font-semibold leading-tight tracking-[-0.035em] text-[#1c4039] sm:text-[1.55rem]">{title}</h1><p className="mt-1 max-w-3xl text-[9px] leading-4 text-[#82918d] sm:text-[10px]">{description}</p></div>{action || <span className="text-[8px] text-[#8b9a96]">Pembaruan terakhir: 12 Mei 2027, 09.30 WIB</span>}</div>;
}

function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\r\n");
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

function printPrincipalReport(title, rows) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return false;
  const safeTitle = escapeHtml(title);
  const tableRows = rows.map((row) => `<tr><td>${escapeHtml(row.name)}</td><td>${escapeHtml(row.type)}</td><td>${escapeHtml(row.period)}</td><td>${escapeHtml(row.coverage)}</td><td>${escapeHtml(row.date)}</td></tr>`).join("");
  printWindow.document.open();
  printWindow.document.write(`<!doctype html><html lang="id"><head><meta charset="utf-8"><title>${safeTitle} · SMK Tadika Mesra Jakarta</title><style>@page{size:A4 landscape;margin:16mm}*{box-sizing:border-box}body{font:11px/1.6 Arial,sans-serif;color:#203b35;margin:0}.header{display:flex;align-items:center;gap:12px;padding-bottom:12px;border-bottom:3px solid #16836f}.mark{display:block;width:48px;height:48px;object-fit:contain}.school{font-size:17px;font-weight:700;letter-spacing:.04em}.sub{font-size:9px;color:#607870;letter-spacing:.1em;text-transform:uppercase}h1{text-align:center;margin:25px 0 3px;font-size:17px}.subtitle{text-align:center;color:#607870;margin:0 0 20px}table{width:100%;border-collapse:collapse}th{background:#eaf3ef;color:#34564e;text-align:left;text-transform:uppercase;font-size:9px}th,td{border:1px solid #dce6e1;padding:9px;vertical-align:top}.note{margin-top:15px;padding:10px;background:#fff8e9;border-left:3px solid #d49a31;color:#72571e;font-size:9px}.sign{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin:35px 0 0;text-align:center}.space{height:65px}.line{width:70%;margin:auto;border-bottom:1px solid #657a73}.footer{text-align:center;margin-top:20px;padding-top:8px;border-top:1px solid #dce6e1;color:#71847d;font-size:8px}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body><header class="header"><img class="mark" src="/images/smk-tadika-mesra-seal.png" alt="Lambang SMK Tadika Mesra Jakarta"><div><div class="school">SMK TADIKA MESRA JAKARTA</div><div class="sub">Penerimaan Murid Baru · Tahun Ajaran 2027/2028</div></div></header><main><h1>LAPORAN PENERIMAAN SPMB</h1><p class="subtitle">${safeTitle}</p><table><thead><tr><th>Nama arsip</th><th>Jenis</th><th>Periode</th><th>Cakupan</th><th>Snapshot</th></tr></thead><tbody>${tableRows || '<tr><td colspan="5">Tidak ada laporan untuk ditampilkan.</td></tr>'}</tbody></table><p class="note"><strong>Catatan:</strong> Laporan ini berasal dari data ilustratif portal. Verifikasi data dan keputusan pada sistem resmi sebelum dokumen ditandatangani atau disebarkan.</p><section class="sign"><div>Mengetahui,<br>Kepala Sekolah<div class="space"></div><div class="line"></div><div>(........................................)</div></div><div>Jakarta, .........................<br>Petugas SPMB<div class="space"></div><div class="line"></div><div>(........................................)</div></div></section></main><footer class="footer">SMK Tadika Mesra Jakarta · Dicetak dari Portal SPMB</footer><script>window.addEventListener("load",()=>{window.focus();window.print()})</script></body></html>`);
  printWindow.document.close();
  return true;
}

function ProgressBar({ value, color = "bg-[#168775]" }) {
  return <div className="h-1.5 overflow-hidden rounded-full bg-[#edf2ef]"><div className={`h-full rounded-full ${color} principal-progress`} style={{ width: `${value}%` }} /></div>;
}

function ApplicantTable({ rows, onDecision }) {
  return <div className="overflow-x-auto rounded-lg border border-[#e9efec]"><table className="w-full min-w-[660px] text-left text-[8px]"><thead className="bg-[#f3f7f5] text-[7px] uppercase tracking-wide text-[#72837e]"><tr>{["Peserta", "Berkas", "Keputusan", "Publikasi", "Tinjauan"].map((name) => <th key={name} className="px-2.5 py-2.5">{name}</th>)}</tr></thead><tbody>{rows.map((student) => <tr key={student.id} className="border-t border-[#edf2ef] hover:bg-[#f8fbf9]"><td className="px-2.5 py-2.5"><strong className="block text-[#38564f]">{student.name}</strong><span className="mt-0.5 block text-[7px] text-[#94a39f]">{student.id} · Kelas X</span></td><td className="px-2.5 py-2.5"><Pill tone={student.documents === "Terverifikasi" ? "green" : "amber"}>{student.documents}</Pill></td><td className="px-2.5 py-2.5"><Pill tone={student.decision === "Belum diputuskan" ? "gray" : student.decision === "Diterima" ? "green" : "amber"}>{student.decision}</Pill></td><td className="px-2.5 py-2.5 text-[#80908b]">{student.publication}</td><td className="px-2.5 py-2.5"><button onClick={() => onDecision(student)} className="font-bold text-[#078675] hover:underline">Lihat →</button></td></tr>)}</tbody></table>{rows.length === 0 ? <p className="p-6 text-center text-[9px] text-[#82918d]">Tidak ditemukan peserta sesuai filter.</p> : null}</div>;
}

function SummaryMetrics({ items }) {
  return <section className="principal-stagger mb-3 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">{items.map((item) => <article key={item.label} className="principal-metric rounded-xl border border-[#e5ece9] bg-white p-3"><div className="flex items-center justify-between"><span className="text-[8px] text-[#7f8f8b]">{item.label}</span><span className={`flex h-6 w-6 items-center justify-center rounded-md ${item.tone === "amber" ? "bg-[#fff2d9] text-[#a26b12]" : "bg-[#e7f4ef] text-[#138271]"}`}><SchoolIcon name={item.icon || "grid"} className="h-3.5 w-3.5" /></span></div><p className="mt-1.5 text-xl font-semibold tracking-[-0.04em] text-[#21443c]">{item.value}</p><p className="mt-1 text-[7px] text-[#8b9a96]">{item.note}</p></article>)}</section>;
}

function PrincipalContent({ section, year, setYear }) {
  const { events: sharedEvents } = usePortalActivity();
  const [search, setSearch] = useState("");
  const [studentRows, setStudentRows] = usePersistentState("spmb-principal-decisions", students);
  const [selectedStudent, setSelectedStudent] = useState(students[0]);
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("Semua proses");
  const [selectionWave, setSelectionWave] = useState("Gelombang 1");
  const [selectedReport, setSelectedReport] = useState(reports[0]);
  const [archiveFormat, setArchiveFormat] = useState("Semua format");
  const [archiveType, setArchiveType] = useState("Semua jenis");
  const [archivePeriod, setArchivePeriod] = useState("Mei 2027");
  const [period, setPeriod] = useState("1–12 Mei 2027");
  const liveStudents = useMemo(() => sharedEvents
    .filter((event) => event.eventType === "applicant_created")
    .map((registration) => {
      const data = typeof registration.payload === "string" ? JSON.parse(registration.payload) : registration.payload;
      const student = {
        id: registration.entityId,
        name: data.name,
        program: data.program || "Belum dipilih",
        documents: "Belum diunggah",
        decision: "Belum diputuskan",
        publication: "Belum diumumkan",
        tone: "amber",
      };
      sharedEvents.filter((event) => event.entityId === registration.entityId).forEach((event) => {
        const update = typeof event.payload === "string" ? JSON.parse(event.payload) : event.payload;
        if (event.eventType === "document_uploaded") student.documents = "Menunggu verifikasi";
        if (update.document) student.documents = update.document;
        if (update.decision) student.decision = update.decision;
        if (update.program) student.program = update.program;
      });
      return student;
    }), [sharedEvents]);
  const allStudentRows = useMemo(() => [...liveStudents, ...studentRows], [liveStudents, studentRows]);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("id");
    return allStudentRows.filter((student) => {
      const matchesQuery = !query || `${student.name} ${student.id} ${student.program}`.toLocaleLowerCase("id").includes(query);
      const matchesFilter = filter === "Semua proses"
        || (filter === "Berkas terverifikasi" && student.documents === "Terverifikasi")
        || (filter === "Berkas belum selesai" && student.documents !== "Terverifikasi")
        || (filter === "Belum diputuskan" && student.decision === "Belum diputuskan")
        || (filter === "Diterima" && student.decision === "Diterima");
      const matchesWave = selectionWave === "Semua gelombang" || selectionWave === "Gelombang 1";
      return matchesQuery && matchesFilter && matchesWave;
    });
  }, [allStudentRows, filter, search, selectionWave]);

  const filteredReports = useMemo(() => reports.filter((report) => {
    const matchesSearch = !search || `${report.name} ${report.type} ${report.author}`.toLocaleLowerCase("id").includes(search.toLocaleLowerCase("id"));
    const matchesFormat = archiveFormat === "Semua format" || report.format === archiveFormat;
    const matchesType = archiveType === "Semua jenis" || report.type === archiveType;
    const matchesPeriod = archivePeriod === "Semua periode" || report.period.toLocaleLowerCase("id").includes(archivePeriod.toLocaleLowerCase("id"));
    return matchesSearch && matchesFormat && matchesType && matchesPeriod;
  }), [archiveFormat, archivePeriod, archiveType, search]);

  const exportStudents = (filename = "rekap-seleksi-kelas-x.csv") => downloadCsv(filename, [["Nama peserta", "Nomor pendaftaran", "Program", "Berkas", "Keputusan", "Publikasi"], ...filteredStudents.map((student) => [student.name, student.id, student.program, student.documents, student.decision, student.publication])]);
  const exportReport = (report) => downloadCsv(`${report.id}-${report.period.replaceAll(" ", "-")}.csv`, [["Laporan", report.name], ["Jenis", report.type], ["Periode", report.period], ["Pembuat", report.author], ["Snapshot", report.date], ["Format arsip tercatat", report.format], ["Cakupan", report.coverage], ["Catatan", "Data contoh ilustratif; unduhan ini merupakan CSV ringkasan"]]);

  const setDecision = async (student, decision) => {
    if (decision === "Diterima" && student.documents !== "Terverifikasi") {
      setNotice(`Keputusan ${student.name} belum dapat ditetapkan: berkas masih ${student.documents.toLocaleLowerCase("id")}.`);
      return;
    }
    try {
      await publishPortalActivity({
        actorRole: "kepala",
        eventType: "decision_updated",
        entityId: student.id,
        summary: `Keputusan ${student.name} diperbarui: ${decision}`,
        payload: { name: student.name, registrationNumber: student.id, decision },
      });
    } catch (error) {
      console.error("Keputusan seleksi tidak dapat disinkronkan.", error);
      setNotice(`${error.message} Keputusan belum disimpan.`);
      return;
    }
    setStudentRows((current) => current.map((item) => item.id === student.id ? { ...item, decision } : item));
    setSelectedStudent((current) => current.id === student.id ? { ...current, decision } : current);
    setNotice(`${student.name}: keputusan lokal diperbarui menjadi “${decision}”. Keputusan belum dipublikasikan ke peserta.`);
  };

  if (section === "ringkasan-penerimaan") {
    const metrics = [
      { label: "Total pendaftar", value: "128", note: "87 pendaftar baru dalam 7 hari", icon: "grid" },
      { label: "Pelajar diterima", value: "72", note: "56,3% dari total pendaftar", icon: "check" },
      { label: "Keterisian kelas X", value: "72%", note: "72 dari 100 kursi kelas X terisi", icon: "school" },
      { label: "Sisa kursi", value: "28", note: "28 kursi kelas X tersisa", icon: "archive", tone: "amber" },
    ];
    return <div className="principal-dashboard">
      <PageIntro section={section} title={pageInfo[section].title} description="Ringkasan penerimaan, kapasitas kelas X, hasil seleksi, dan laporan pembayaran untuk keputusan yang terarah." action={<ActionButton primary onClick={() => exportStudents("ringkasan-penerimaan.csv")}><SchoolIcon name="download" className="h-3 w-3" />Unduh ringkasan</ActionButton>} />
      <div className="mb-3 flex items-center gap-2 text-[8px] text-[#879792]"><Pill tone="green">Gelombang 1</Pill><span>Tahun ajaran {year}</span><span className="ml-auto">Pembaruan terakhir: 12 Mei 2027, 09.30 WIB</span></div>
      <SummaryMetrics items={metrics} />
      <div className="grid items-start gap-3 xl:grid-cols-[1.42fr_0.78fr]">
        <Panel>
          <SectionHeading eyebrow="Jumlah pendaftar baru per hari · 6–12 Mei 2027" title="Tren pendaftaran" action={<Pill tone="green">18 pendaftar hari ini</Pill>} />
          <div className="mt-3 flex items-end gap-2"><strong className="text-2xl font-semibold text-[#234a41]">87</strong><span className="pb-1 text-[8px] text-[#82918d]">pendaftar minggu ini</span></div>
          <div className="mt-3 grid h-32 grid-cols-7 items-end gap-2 border-b border-l border-[#edf2ef] px-2 pb-1 sm:h-40 sm:gap-3">
            {trend.map((item, index) => <div key={item.date} className="flex h-full flex-col items-center justify-end gap-1"><span className="text-[7px] text-[#71857f]">{item.value}</span><div className={`principal-chart-bar w-full max-w-8 rounded-t-[3px] ${index === trend.length - 1 ? "bg-[#168775]" : "bg-[#a4cdbd]"}`} style={{ height: `${(item.value / 20) * 72}%`, animationDelay: `${index * 70}ms` }} /><span className="text-[6px] text-[#879792] sm:text-[7px]">{item.date}</span></div>)}
          </div>
          <p className="mt-2 text-[7px] text-[#8b9a96]">41 pendaftar tercatat sebelum 6 Mei. Total kumulatif: 128 pendaftar.</p>
        </Panel>
        <Panel>
          <SectionHeading eyebrow="Kursi kelas X terisi berdasarkan hasil penerimaan" title="Kapasitas kelas X" action={<Link href="/kepala-sekolah/kapasitas-kelas" className="text-[8px] font-bold text-[#078675]">Detail →</Link>} />
          <div className="mt-4 flex items-center justify-between"><strong className="text-2xl font-semibold text-[#234a41]">72%</strong><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e7f4ef] text-[#138271]"><SchoolIcon name="school" /></span></div>
          <p className="mb-2 text-[8px] text-[#82918d]">Daya tampung total 100 kursi kelas X</p>
          <div className="border-t border-[#edf2ef] pt-3"><div className="mb-2 flex justify-between text-[8px]"><strong>Kelas X</strong><strong>72 / 100 kursi</strong></div><ProgressBar value={72} /><p className="mt-2 text-[7px] text-[#82918d]">72% terisi · 28 kursi tersisa</p></div>
          <div className="mt-3 rounded-md bg-[#fff4df] p-2.5 text-[7px] leading-4 text-[#87580c]">Masih tersedia 28 kursi. Tinjau hasil seleksi sebelum menentukan pembukaan gelombang berikutnya.</div>
        </Panel>
      </div>
      <div className="mt-3 grid items-start gap-3 xl:grid-cols-[1.42fr_0.78fr]">
        <Panel>
          <SectionHeading eyebrow="Status saat ini dari 128 pendaftar" title="Ringkasan proses penerimaan" action={<Link href="/kepala-sekolah/hasil-seleksi" className="text-[8px] font-bold text-[#078675]">Tinjau hasil →</Link>} />
          <div className="mt-3 space-y-3">{[
            { name: "Kelengkapan & verifikasi", detail: "Berkas belum selesai", count: "32", percent: "25%", color: "bg-[#f0c777]" },
            { name: "Proses seleksi", detail: "Berkas terverifikasi, belum diputuskan", count: "24", percent: "18,7%", color: "bg-[#9dcbb8]" },
            { name: "Diterima", detail: "72 siswa diterima kelas X", count: "72", percent: "56,3%", color: "bg-[#168775]" },
          ].map((item) => <div key={item.name} className="flex items-center gap-2.5 border-b border-[#edf2ef] pb-2.5"><span className={`h-7 w-1 shrink-0 rounded-full ${item.color}`} /><span className="min-w-0 flex-1"><strong className="block text-[8px] text-[#38564f]">{item.name}</strong><span className="block text-[7px] text-[#889893]">{item.detail}</span></span><strong className="text-[10px] text-[#38564f]">{item.count}</strong><span className="w-8 text-right text-[7px] text-[#889893]">{item.percent}</span></div>)}</div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#f2f8f5] p-2.5"><span className="text-[8px] font-semibold text-[#43635b]">Pembayaran kelas X terverifikasi: Rp29.400.000</span><Link href="/kepala-sekolah/laporan-penerimaan" className="text-[8px] font-bold text-[#078675]">Laporan →</Link></div>
        </Panel>
        <Panel>
          <SectionHeading eyebrow="Akses ringkasan dan arsip penerimaan" title="Laporan siap ditinjau" action={<Link href="/kepala-sekolah/arsip-laporan" className="text-[8px] font-bold text-[#078675]">Semua laporan →</Link>} />
          <div className="mt-3 space-y-2">{reports.slice(0, 3).map((report) => <div key={report.id} className={`flex items-center gap-2 rounded-md border p-2 transition hover:border-[#c9e3d9] hover:bg-[#f8fbf9] ${selectedReport.id === report.id ? "border-[#c9e3d9] bg-[#f5faf7]" : "border-transparent"}`}><button onClick={() => { setSelectedReport(report); setNotice(`Laporan “${report.name}” dipilih untuk ditinjau.`); }} className="flex min-w-0 flex-1 items-center gap-2 text-left"><SchoolIcon name="archive" className="h-3.5 w-3.5 shrink-0 text-[#168775]" /><span className="min-w-0 flex-1"><strong className="block truncate text-[8px] font-semibold text-[#405d56]">{report.name}</strong><span className="block text-[7px] text-[#8b9a96]">{report.format} · {report.date}</span></span></button><button aria-label={`Unduh ${report.name}`} onClick={() => exportReport(report)} className="text-[#168775]"><SchoolIcon name="download" className="h-3 w-3" /></button></div>)}</div>
          {notice ? <p role="status" className="mt-2 text-[7px] text-[#078675]">{notice}</p> : null}
          <ActionButton href="/kepala-sekolah/arsip-laporan" className="mt-3 w-full">Buka semua laporan</ActionButton>
          <p className="mt-2 text-[7px] leading-4 text-[#8b9a96]">Data pada ringkasan ini adalah ilustrasi, bukan data sistem produksi.</p>
        </Panel>
      </div>
    </div>;
  }

  if (section === "kapasitas-kelas") {
    const metrics = [
      { label: "Kapasitas total", value: "100", note: "Kursi penerimaan kelas X", icon: "school" },
      { label: "Terisi / diterima", value: "72", note: "Berdasarkan rekap penerimaan", icon: "check" },
      { label: "Keterisian", value: "72%", note: "72 dari 100 kursi", icon: "chart" },
      { label: "Sisa kursi", value: "28", note: "Belum terisi pada snapshot ini", icon: "archive", tone: "amber" },
    ];
    return <>
      <PageIntro section={section} {...pageInfo[section]} action={<ActionButton primary onClick={() => exportStudents("ringkasan-kapasitas-kelas.csv")}><SchoolIcon name="download" className="h-3 w-3" />Unduh ringkasan kapasitas</ActionButton>} />
      <div className="mb-3 flex justify-between"><Pill tone="green">Gelombang 1 · Kelas X</Pill><span className="text-[8px] text-[#8b9a96]">Snapshot 12 Mei 2027, 09.30 WIB</span></div>
      <SummaryMetrics items={metrics} />
      <div className="grid items-start gap-3 xl:grid-cols-[1.28fr_0.72fr]">
        <Panel>
          <SectionHeading eyebrow="Setiap petak mewakili satu kursi · bukan pembagian kelas resmi" title="Visual kapasitas penerimaan" action={<Pill tone="amber">28 kursi tersisa</Pill>} />
          <p className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-[#234a41]">72 / 100 kursi</p>
          <div className="mt-3 grid grid-cols-10 gap-1 sm:gap-1.5">{Array.from({ length: capacity }, (_, index) => <span key={index} aria-label={index < admitted ? `Kursi ${index + 1} terisi` : `Kursi ${index + 1} tersedia`} className={`capacity-seat ${index < admitted ? "bg-[#168775]" : "bg-[#f1f5f3]"}`} />)}</div>
          <div className="mt-3 flex flex-wrap gap-2 text-[7px] text-[#81918d]"><Pill tone="green">Terisi · 72</Pill><Pill tone="gray">Tersisa · 28</Pill></div>
          <p className="mt-3 text-[7px] leading-4 text-[#8b9a96]">Kapasitas total kelas X tetap 100 kursi. Keputusan individual tidak ditampilkan pada visual ini.</p>
        </Panel>
        <Panel>
          <SectionHeading eyebrow="Catatan peninjauan · bukan keputusan pembukaan" title="Pertimbangan gelombang berikutnya" action={<Pill tone="green">Analisis penerimaan</Pill>} />
          <div className="mt-3 rounded-md bg-[#fff4df] p-3 text-[8px] leading-4 text-[#87580c]"><strong>Tinjau 24 pendaftar yang belum diputuskan</strong><br />Berkas mereka telah terverifikasi. Pertimbangkan hasil review sebelum mengalokasikan sisa 28 kursi.</div>
          <p className="mt-3 text-[8px] leading-4 text-[#647a73]">32 pendaftar masih memiliki berkas belum selesai. Penyelesaian proses ini dapat memengaruhi tindak lanjut penerimaan.</p>
          <div className="mt-3 space-y-2.5">{[["Gelombang saat ini", "Gelombang 1 · Dibuka"], ["Hasil terjadwal", "24 Mei 2027"], ["Tinjauan berikutnya", "Belum ditetapkan"]].map(([label, value]) => <div key={label} className="flex justify-between gap-3 text-[8px]"><span className="text-[#82918d]">{label}</span><span className="text-right font-medium text-[#47625b]">{value}</span></div>)}</div>
          <ActionButton href="/kepala-sekolah/hasil-seleksi" className="mt-3">Tinjau hasil seleksi</ActionButton>
        </Panel>
      </div>
      <Panel className="mt-3"><SectionHeading eyebrow="Total 128 pendaftar · jumlah tahapan tidak selalu sama dengan kapasitas kursi" title="Konteks proses penerimaan" /><div className="mt-3 overflow-x-auto"><table className="w-full min-w-[520px] text-left text-[8px]"><thead className="bg-[#f3f7f5] uppercase text-[#72837e]"><tr>{["Tahapan", "Jumlah", "Implikasi peninjauan"].map((item) => <th key={item} className="px-2.5 py-2.5">{item}</th>)}</tr></thead><tbody>{[["Diterima", "72", "Menjadi dasar keterisian 72% dari kapasitas 100."], ["Terverifikasi, belum diputuskan", "24", "Masih dalam proses seleksi; belum mengisi kursi."], ["Berkas belum selesai", "32", "Menunggu kelengkapan / verifikasi oleh Admin SPMB."]].map((row) => <tr key={row[0]} className="border-b border-[#edf2ef]"><td className="px-2.5 py-3 font-medium text-[#45635b]">{row[0]}</td><td className="px-2.5 py-3 text-[#45635b]">{row[1]}</td><td className="px-2.5 py-3 text-[#7d8d88]">{row[2]}</td></tr>)}</tbody></table></div><p className="mt-2 text-[7px] text-[#8b9a96]">Verifikasi berkas dan pembayaran dilakukan oleh admin. Kepala sekolah meninjau rekap dan laporan.</p></Panel>
    </>;
  }

  if (section === "hasil-seleksi") {
    const metrics = [
      { label: "Diterima", value: "72", note: "Keputusan pada snapshot ini", icon: "check" },
      { label: "Terverifikasi, belum diputuskan", value: "24", note: "Menunggu keputusan seleksi", icon: "school" },
      { label: "Berkas belum selesai", value: "32", note: "Menunggu kelengkapan / verifikasi", icon: "archive", tone: "amber" },
    ];
    return <>
      <PageIntro section={section} {...pageInfo[section]} action={<ActionButton primary onClick={() => exportStudents()}><SchoolIcon name="download" className="h-3 w-3" />Unduh rekap seleksi</ActionButton>} />
      <div className="mb-3 flex justify-between"><Pill tone="green">Gelombang 1 · Kelas X</Pill><span className="text-[8px] text-[#8b9a96]">Snapshot 12 Mei 2027, 09.30 WIB</span></div>
      <SummaryMetrics items={metrics} />
      <div className="mb-3 rounded-md border border-[#d9efe5] bg-[#e9f6ef] p-3 text-[8px] leading-4 text-[#286950]"><strong>Hasil individu belum diumumkan.</strong><br />Rekap ini hanya menunjukkan status sementara. Pastikan calon di bawah telah memenuhi keputusan dan persetujuan sebelum dipublikasikan.</div>
      <Panel className="mb-3">
        <SectionHeading eyebrow="Cuplikan enam contoh · status hasil keputusan dan berkas" title="Daftar peninjauan peserta" />
        <div className="mt-3 flex flex-wrap gap-2"><div className="min-w-[210px] flex-1"><label className="flex h-8 items-center gap-2 rounded-md border border-[#dfe9e5] px-2.5 text-[#82918d]"><svg viewBox="0 0 24 24" className="h-3 w-3 fill-none stroke-current" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></svg><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama atau nomor daftar" className="w-full bg-transparent text-[8px] outline-none placeholder:text-[#9aa8a4]" /></label></div><select aria-label="Filter proses seleksi" value={filter} onChange={(event) => setFilter(event.target.value)} className="h-8 rounded-md border border-[#dfe9e5] bg-white px-2 text-[8px] text-[#52716a]"><option>Semua proses</option><option>Berkas terverifikasi</option><option>Berkas belum selesai</option><option>Belum diputuskan</option><option>Diterima</option></select><select aria-label="Filter gelombang seleksi" value={selectionWave} onChange={(event) => setSelectionWave(event.target.value)} className="h-8 rounded-md border border-[#dfe9e5] bg-white px-2 text-[8px] text-[#52716a]"><option>Gelombang 1</option><option>Semua gelombang</option></select></div>
        <div className="mt-3"><ApplicantTable rows={filteredStudents} onDecision={(student) => { setSelectedStudent(student); setNotice(""); }} /></div>
        <p className="mt-2 text-[7px] text-[#8b9a96]">Menampilkan {filteredStudents.length} dari contoh data; angka total mengikuti snapshot ilustratif.</p>
      </Panel>
      <div className="grid items-start gap-3 lg:grid-cols-[1.1fr_0.9fr]">
        <Panel><SectionHeading eyebrow="Tinjauan status administratif" title="Tahapan review" /><div className="mt-3 overflow-x-auto"><table className="w-full min-w-[400px] text-left text-[8px]"><thead className="bg-[#f3f7f5] text-[7px] uppercase text-[#72837e]"><tr>{["Tahap", "Penanggung jawab", "Keterangan"].map((label) => <th key={label} className="px-2 py-2.5">{label}</th>)}</tr></thead><tbody>{[["Kelengkapan berkas", "Admin SPMB", "96 terverifikasi · 32 belum selesai"], ["Tes seleksi & wawancara", "Panitia SPMB", "Agenda umum · 17 Mei 2027"], ["Peninjauan rekap", "Kepala Sekolah", "Tinjau keputusan dan kapasitas"], ["Publikasi hasil", "Panitia SPMB", "Rencana 24 Mei 2027"]].map((row) => <tr key={row[0]} className="border-b border-[#edf2ef]"><td className="px-2 py-3 font-medium text-[#45635b]">{row[0]}</td><td className="px-2 py-3 text-[#71857f]">{row[1]}</td><td className="px-2 py-3 text-[#71857f]">{row[2]}</td></tr>)}</tbody></table></div></Panel>
        <Panel><SectionHeading eyebrow={selectedStudent.id} title="Ringkasan keputusan" action={<Pill tone={selectedStudent.decision === "Belum diputuskan" ? "amber" : "green"}>{selectedStudent.decision}</Pill>} /><p className="mt-3 text-[9px] font-bold text-[#405d56]">{selectedStudent.name}</p><p className="mt-1 text-[8px] text-[#82918d]">{selectedStudent.program}</p><div className="mt-3 rounded-lg bg-[#e8f6ef] p-3 text-[8px] leading-4 text-[#286950]">Keputusan individual tidak dikirim ke peserta. Tindakan di sini hanya mengubah contoh status lokal.</div><div className="mt-3 flex flex-wrap gap-2"><ActionButton primary onClick={() => setDecision(selectedStudent, "Diterima")}>Tandai diterima</ActionButton><ActionButton onClick={() => setDecision(selectedStudent, "Perlu ditinjau")}>Perlu ditinjau</ActionButton><ActionButton onClick={() => setDecision(selectedStudent, "Belum diputuskan")}>Batalkan keputusan</ActionButton></div>{notice ? <p role="status" className="mt-3 text-[7px] leading-4 text-[#078675]">{notice}</p> : null}<ActionButton href="/kepala-sekolah/laporan-penerimaan" className="mt-3">Lihat laporan penerimaan</ActionButton></Panel>
      </div>
    </>;
  }

  if (section === "laporan-penerimaan") {
    const reportMetrics = [
      { label: "Total pendaftar", value: "128", note: "Seluruh pendaftar Gelombang 1", icon: "grid" },
      { label: "Pelajar diterima", value: "72", note: "56,3% dari 128 pendaftar", icon: "check" },
      { label: "Keterisian kelas X", value: "72%", note: "72 kursi terisi · kapasitas 100", icon: "school" },
      { label: "Pembayaran terverifikasi", value: "Rp29.400.000", note: "84 lunas · biaya ilustratif", icon: "chart" },
    ];
    return <>
      <PageIntro section={section} {...pageInfo[section]} action={<div className="flex gap-2"><ActionButton primary onClick={() => exportStudents("laporan-penerimaan-kelas-x.csv")}><SchoolIcon name="download" className="h-3 w-3" />Unduh CSV</ActionButton><ActionButton onClick={() => { const reportRow = { name: "Laporan penerimaan kelas X", type: "Ringkasan pimpinan", period, coverage: "128 pendaftar · 72 diterima · kapasitas 100", date: "12 Mei 2027" }; if (!printPrincipalReport(`Laporan Penerimaan · ${period}`, [reportRow])) setNotice("Jendela cetak diblokir. Izinkan pop-up untuk menyimpan laporan sebagai PDF."); else setNotice("Laporan siap dicetak atau disimpan sebagai PDF."); }}>Cetak / PDF</ActionButton></div>} />
      <div className="mb-3 flex flex-wrap items-center gap-2"><Pill tone="green">Gelombang 1 · Kelas X</Pill><label className="ml-auto text-[8px] text-[#82918d]">Periode <select aria-label="Periode laporan" value={period} onChange={(event) => setPeriod(event.target.value)} className="ml-1 rounded border border-[#dfe9e5] bg-white px-2 py-1 text-[8px] text-[#52716a]"><option>1–12 Mei 2027</option><option>1–31 Mei 2027</option><option>1–12 Juni 2027</option></select></label><label className="text-[8px] text-[#82918d]">Tahun <select aria-label="Tahun ajaran laporan" value={year} onChange={(event) => setYear(event.target.value)} className="ml-1 rounded border border-[#dfe9e5] bg-white px-2 py-1 text-[8px] text-[#52716a]"><option>2027 / 2028</option><option>2026 / 2027</option></select></label></div>
      {period === "1–12 Mei 2027" && year === "2027 / 2028" ? <>
      <SummaryMetrics items={reportMetrics} />
      <div className="grid items-start gap-3 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel><SectionHeading eyebrow={`Ringkasan setiap tahap · ${period}`} title="Grafik status proses" /><div className="mt-4 space-y-4">{[["Diterima", 72, "72 · 56,25%", "bg-[#168775]"], ["Terverifikasi, belum diputuskan", 24, "24 · 18,75%", "bg-[#a4cdbd]"], ["Berkas belum selesai", 32, "32 · 25%", "bg-[#efc777]"]].map(([label, value, text, color]) => <div key={label}><div className="mb-1.5 flex justify-between text-[8px]"><span className="text-[#607870]">{label}</span><strong className="text-[#34564e]">{text}</strong></div><ProgressBar value={Number(value) / 128 * 100} color={color} /></div>)}</div><div className="mt-5 rounded-lg bg-[#e8f6ef] p-3"><div className="flex justify-between text-[8px]"><span className="text-[#607870]">Kapasitas kelas X</span><strong className="text-[#34564e]">72 / 100 kursi</strong></div><div className="mt-2"><ProgressBar value={72} /></div><p className="mt-2 text-[7px] text-[#71857f]">72% terisi · 28 kursi tersisa</p></div></Panel>
        <Panel><SectionHeading eyebrow="Untuk peninjauan kepala sekolah" title="Catatan evaluasi" action={<Pill tone="amber">Laporan ilustratif</Pill>} /><div className="mt-3 rounded-md bg-[#fff4df] p-3 text-[8px] leading-4 text-[#87580c]"><strong>Prioritas kelengkapan</strong><br />32 pendaftar masih memiliki berkas belum selesai. Tindak lanjut administratif dilakukan oleh admin.</div><div className="mt-3 space-y-3 text-[8px] leading-4 text-[#6d807a]"><p>Tinjau 24 pendaftar terverifikasi yang belum diputuskan sebelum mempertimbangkan pembukaan gelombang berikutnya.</p><p>12 bukti pembayaran menunggu verifikasi. Belum termasuk Rp29.400.000 pembayaran terverifikasi.</p><p>Publikasi hasil direncanakan 24 Mei 2027.</p></div><ActionButton href="/kepala-sekolah/hasil-seleksi" className="mt-2">Tinjau hasil seleksi</ActionButton></Panel>
      </div>
      <Panel className="mt-3"><SectionHeading eyebrow={`Snapshot: ${period} · Semua status merupakan ilustrasi`} title="Tabel rekap penerimaan" action={<button onClick={() => exportStudents("tabel-rekap-penerimaan.csv")} className="text-[8px] font-bold text-[#078675]">Unduh rekap</button>} /><div className="mt-3 overflow-x-auto rounded-lg border border-[#e9efec]"><table className="w-full min-w-[580px] text-left text-[8px]"><thead className="bg-[#f3f7f5] text-[7px] uppercase text-[#72837e]"><tr>{["Bidang", "Indikator", "Jumlah / nominal", "Keterangan"].map((item) => <th key={item} className="px-2.5 py-2.5">{item}</th>)}</tr></thead><tbody>{[["Pendaftar", "Total pendaftar", "128", "Penerimaan kelas X"], ["Berkas", "Terverifikasi / belum selesai", "96 / 32", "75% terverifikasi"], ["Seleksi", "Diterima / belum diputuskan", "72 / 24", "24 berkas terverifikasi"], ["Kapasitas", "Terisi / tersisa / total", "72 / 28 / 100", "72% keterisian"], ["Pembayaran", "Lunas / verifikasi / belum bayar", "84 / 12 / 32", "Rp350.000 per pendaftar"], ["Penerimaan biaya", "Pembayaran terverifikasi", "Rp29.400.000", "Hanya 84 pembayaran lunas"]].map((row) => <tr key={row[0]} className="border-b border-[#edf2ef]"><td className="px-2.5 py-3 font-medium text-[#45635b]">{row[0]}</td><td className="px-2.5 py-3 text-[#71857f]">{row[1]}</td><td className="px-2.5 py-3 text-[#45635b]">{row[2]}</td><td className="px-2.5 py-3 text-[#71857f]">{row[3]}</td></tr>)}</tbody></table></div><p className="mt-2 text-[7px] text-[#8b9a96]">Rekap adalah contoh desain. Verifikasi data dan keputusan penerimaan melalui sistem resmi.</p></Panel>
      </> : <div role="status" className="rounded-lg border border-[#f3e4c5] bg-[#fff8ea] p-4 text-[9px] leading-5 text-[#805d20]">Snapshot ilustratif hanya tersedia untuk periode 1–12 Mei 2027 pada tahun ajaran 2027 / 2028. Pilih filter tersebut untuk melihat contoh rekap.</div>}
    </>;
  }

  if (section === "arsip-laporan") {
    return <>
      <PageIntro section={section} {...pageInfo[section]} action={<ActionButton primary onClick={() => { if (!selectedReport) { setNotice("Pilih laporan terlebih dahulu."); return; } if (!printPrincipalReport(selectedReport.name, [selectedReport])) setNotice("Jendela cetak diblokir. Izinkan pop-up lalu coba lagi."); else setNotice("Laporan dibuka untuk dicetak atau disimpan sebagai PDF."); }}><SchoolIcon name="download" className="h-3 w-3" />Cetak laporan terpilih · PDF</ActionButton>} />
      <div className="mb-3 flex flex-wrap gap-2"><div className="min-w-[200px] flex-1"><label className="flex h-8 items-center gap-2 rounded-md border border-[#dfe9e5] bg-white px-2.5 text-[#82918d]"><svg viewBox="0 0 24 24" className="h-3 w-3 fill-none stroke-current" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></svg><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari judul atau pembuat laporan" className="w-full bg-transparent text-[8px] outline-none placeholder:text-[#9aa8a4]" /></label></div><select aria-label="Filter jenis arsip" value={archiveType} onChange={(event) => setArchiveType(event.target.value)} className="h-8 rounded-md border border-[#dfe9e5] bg-white px-2 text-[8px] text-[#52716a]"><option>Semua jenis</option><option>Ringkasan pimpinan</option><option>Rekap penerimaan</option><option>Administratif</option></select><select aria-label="Filter periode arsip" value={archivePeriod} onChange={(event) => setArchivePeriod(event.target.value)} className="h-8 rounded-md border border-[#dfe9e5] bg-white px-2 text-[8px] text-[#52716a]"><option>Mei 2027</option><option>Semua periode</option><option>Juni 2027</option></select><select aria-label="Filter format arsip" value={archiveFormat} onChange={(event) => setArchiveFormat(event.target.value)} className="h-8 rounded-md border border-[#dfe9e5] bg-white px-2 text-[8px] text-[#52716a]"><option>Semua format</option><option>PDF</option><option>XLSX</option></select></div>
      <Panel className="mb-3"><SectionHeading eyebrow={`${filteredReports.length} laporan ilustratif · Snapshot 12 Mei 2027 · Gelombang 1`} title="Laporan tersimpan" /><div className="mt-3 overflow-x-auto rounded-lg border border-[#e9efec]"><table className="w-full min-w-[760px] text-left text-[8px]"><thead className="bg-[#f3f7f5] text-[7px] uppercase text-[#72837e]"><tr>{["Nama & jenis laporan", "Periode", "Pembuat", "Disimpan", "Format", "Versi / status", "Aksi"].map((item) => <th key={item} className="px-2 py-2.5">{item}</th>)}</tr></thead><tbody>{filteredReports.map((report) => <tr key={report.id} onClick={() => { setSelectedReport(report); setNotice(""); }} className={`cursor-pointer border-b border-[#edf2ef] transition-colors hover:bg-[#f7fbf9] ${selectedReport.id === report.id ? "bg-[#f2f8f5]" : ""}`}><td className="px-2 py-3"><strong className="block text-[#45635b]">{report.name}</strong><span className="text-[7px] text-[#8b9a96]">{report.type}</span></td><td className="px-2 py-3 whitespace-nowrap text-[#71857f]">{report.period}</td><td className="px-2 py-3 text-[#71857f]">{report.author}</td><td className="px-2 py-3 whitespace-nowrap text-[#71857f]">{report.date}</td><td className="px-2 py-3"><Pill tone="green">{report.format}</Pill></td><td className="px-2 py-3"><Pill tone="green">{report.version}</Pill></td><td className="whitespace-nowrap px-2 py-3"><button onClick={(event) => { event.stopPropagation(); setSelectedReport(report); exportReport(report); setNotice(`Ringkasan CSV untuk "${report.name}" berhasil diunduh; format arsip tercatat: ${report.format}.`); }} className="mr-2 font-bold text-[#078675]">CSV</button><button onClick={(event) => { event.stopPropagation(); setSelectedReport(report); if (!printPrincipalReport(report.name, [report])) setNotice("Jendela cetak diblokir. Izinkan pop-up lalu coba lagi."); else setNotice(`"${report.name}" siap dicetak atau disimpan sebagai PDF.`); }} className="font-bold text-[#078675]">PDF</button></td></tr>)}</tbody></table></div><p className="mt-2 text-[7px] text-[#8b9a96]">Menampilkan {filteredReports.length} dari 4 metadata arsip contoh. Tombol CSV membuat ringkasan CSV; tombol PDF menyusun lembar laporan yang dapat disimpan sebagai PDF.</p>{filteredReports.length === 0 ? <p className="mt-3 text-center text-[9px] text-[#82918d]">Tidak ada arsip yang cocok dengan filter.</p> : null}</Panel>
      <div className="grid items-start gap-3 lg:grid-cols-2">
        <Panel><SectionHeading eyebrow={`Pratinjau laporan kelas X · ${selectedReport.period}`} title="Pratinjau laporan terpilih" /><div className="principal-report-preview mt-3 rounded-lg border border-[#e3ece8] bg-[#f7faf8] p-4"><div className="flex items-center gap-2"><BrandMark /><span><strong className="block text-[9px] text-[#34564e]">SMK Tadika Mesra Jakarta</strong><span className="text-[7px] text-[#8b9a96]">Ringkasan penerimaan kelas X</span></span></div><Pill tone="amber" >LAPORAN ILUSTRATIF</Pill><h3 className="mt-3 text-sm font-semibold text-[#254841]">{selectedReport.name}</h3><p className="mt-1 text-[8px] text-[#82918d]">Tahun ajaran {year}<br />Gelombang 1 · Snapshot {selectedReport.date}</p><div className="mt-3 border-t border-[#e3ece8] pt-3 text-[8px] text-[#607870]"><p>Pendaftar / diterima <strong className="float-right text-[#34564e]">128 / 72</strong></p><p className="mt-2">Kapasitas / sisa kursi <strong className="float-right text-[#34564e]">100 / 28</strong></p><p className="mt-2">Cakupan <strong className="float-right text-[#34564e]">{selectedReport.coverage}</strong></p></div></div><div className="mt-3 flex flex-wrap gap-2"><ActionButton onClick={() => { exportReport(selectedReport); setNotice(`Ringkasan ${selectedReport.name} diunduh sebagai CSV.`); }}><SchoolIcon name="download" className="h-3 w-3" />Unduh CSV</ActionButton><ActionButton primary onClick={() => { if (!printPrincipalReport(selectedReport.name, [selectedReport])) setNotice("Jendela cetak diblokir. Izinkan pop-up lalu coba lagi."); else setNotice("Laporan dibuka untuk dicetak atau disimpan sebagai PDF."); }}><SchoolIcon name="file" className="h-3 w-3" />Cetak / Simpan PDF</ActionButton></div></Panel>
        <Panel><SectionHeading eyebrow="v1.0 · Tersimpan" title="Metadata arsip" action={<Pill tone="green">{selectedReport.version}</Pill>} /><div className="mt-3 space-y-3">{[["Nama berkas ringkasan", `${selectedReport.id}_${selectedReport.period.replaceAll(" ", "-").replaceAll("–", "-").toLowerCase()}.csv`], ["Format arsip tercatat", `${selectedReport.type} / ${selectedReport.format}`], ["Periode", `${selectedReport.period} · Gelombang 1`], ["Pembuat", `${selectedReport.author} · Kepala Admin SPMB`], ["Snapshot data", `${selectedReport.date}, 09.30 WIB`], ["Tanggal tersimpan", "12 Mei 2027 (ilustratif)"]].map(([label, value]) => <div key={label} className="grid grid-cols-[95px_1fr] gap-2 text-[8px]"><span className="text-[#82918d]">{label}</span><span className="break-words text-[#45635b]">{value}</span></div>)}</div><div className="mt-4 rounded-lg bg-[#e8f6ef] p-3 text-[8px] leading-4 text-[#286950]">Arsip sumber hanya berupa metadata ilustratif. Portal dapat membuat ringkasan CSV atau PDF cetak, bukan memulihkan file PDF/XLSX asli yang tidak tersedia.</div>{notice ? <p role="status" className="mt-3 text-[7px] leading-4 text-[#078675]">{notice}</p> : null}</Panel>
      </div>
    </>;
  }
  return null;
}

export default function PrincipalPortal({ section }) {
  const router = useRouter();
  const [year, setYear] = useState("2027 / 2028");
  const sessionSnapshot = useSyncExternalStore(subscribeToSession, getSessionSnapshot, getServerSessionSnapshot);
  const user = useMemo(() => {
    if (!sessionSnapshot || sessionSnapshot === SESSION_HYDRATING) return null;
    try {
      return JSON.parse(sessionSnapshot);
    } catch (error) {
      console.error("Sesi kepala sekolah tidak dapat dibaca sebagai JSON.", error);
      return null;
    }
  }, [sessionSnapshot]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (sessionSnapshot === SESSION_HYDRATING) return;
    if (!sessionSnapshot || user?.role !== "kepala") router.push("/");
  }, [router, sessionSnapshot, user]);

  if (!user || user.role !== "kepala") return null;

  const handleLogout = () => {
    clearSession();
    router.push("/");
  };
  const initials = user.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();

  return <main className="principal-shell min-h-screen bg-[#f4f8f6] text-[#23443e]">
    <aside className="principal-sidebar border-r border-[#e7eeeb] bg-white">
      <Link href="/kepala-sekolah" className="flex items-center gap-2.5 px-1 py-1"><BrandMark /><span><span className="block text-[10px] font-semibold leading-4 text-[#254841]">SMK Tadika Mesra<br />Jakarta</span><span className="mt-0.5 block text-[7px] uppercase tracking-[0.12em] text-[#8a9995]">Portal SPMB</span></span></Link>
      <div className="mt-4 rounded-lg bg-[#f3f7f5] p-2.5"><span className="block text-[7px] font-bold uppercase tracking-wide text-[#85948f]">Tahun ajaran</span><select aria-label="Pilih tahun ajaran" value={year} onChange={(event) => setYear(event.target.value)} className="mt-1 w-full bg-transparent text-[9px] font-semibold text-[#31564e] outline-none"><option>2027 / 2028</option><option>2026 / 2027</option></select><span className="mt-0.5 block text-[7px] text-[#078675]">Gelombang 1 · Dibuka</span></div>
      <p className="mb-1.5 mt-4 text-[7px] font-bold uppercase tracking-[0.12em] text-[#879691]">Menu pimpinan</p>
      <nav className="space-y-1" aria-label="Menu kepala sekolah">{navigation.map((item) => <Link key={item.id} href={item.href} aria-current={section === item.id ? "page" : undefined} onClick={() => setMobileMenuOpen(false)} className={`flex min-h-8 items-center gap-2 rounded-md px-2 text-[8px] transition-colors ${section === item.id ? "bg-[#e8f5ef] font-semibold text-[#078675]" : "text-[#73847f] hover:bg-[#f4f8f6] hover:text-[#28564d]"}`}><SchoolIcon name={item.icon} className="h-3.5 w-3.5 shrink-0" /><span>{item.label}</span></Link>)}</nav>
      <div className="mt-auto hidden rounded-lg bg-[#e9f5f0] p-2.5 lg:block"><span className="flex h-5 w-5 items-center justify-center rounded-md bg-white text-[10px] text-[#078675]">?</span><p className="mt-1.5 text-[8px] font-bold text-[#34564e]">Perlu bantuan?</p><p className="mt-1 text-[7px] leading-3 text-[#81918d]">Lihat panduan atau hubungi panitia SPMB.</p><Link href="/kepala-sekolah/laporan-penerimaan" className="mt-1 block text-[7px] font-bold text-[#078675]">Pusat bantuan →</Link></div>
      <button onClick={handleLogout} className="mt-2 hidden items-center gap-2 px-2 py-1.5 text-[8px] font-semibold text-[#718681] transition hover:text-[#a44d36] lg:flex">↪ Keluar akun</button>
    </aside>
    <div className="principal-main min-w-0">
      <header className="principal-topbar flex min-h-[42px] items-center justify-between gap-2 border-b border-[#e6eeea] bg-white/90 px-3 py-2 backdrop-blur sm:px-5">
        <button type="button" aria-expanded={mobileMenuOpen} aria-controls="principal-mobile-menu" onClick={() => setMobileMenuOpen((open) => !open)} className="flex h-7 w-7 items-center justify-center rounded-md border border-[#e1eae6] text-[#31564e] lg:hidden" aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}>{mobileMenuOpen ? "×" : "☰"}</button>
        <div className="min-w-0 flex-1 truncate text-[7px] text-[#82938f]">Portal SPMB <span className="mx-1">›</span><strong className="text-[#34564e]">{navigation.find((item) => item.id === section)?.label}</strong></div>
        <div className="flex items-center gap-2"><Pill tone="amber">Data ilustrasi</Pill><span className="hidden text-[#82938f] sm:inline" aria-hidden="true">♧</span><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e5f2ed] text-[7px] font-bold text-[#078675]">{initials}</span><span className="hidden sm:block"><strong className="block text-[8px] text-[#405d56]">{user.name}</strong><span className="block text-[7px] text-[#91a09c]">Kepala Sekolah</span></span><button onClick={handleLogout} className="rounded border border-[#e1eae6] px-1.5 py-1 text-[7px] text-[#718681] hover:text-[#a44d36] lg:hidden">Keluar</button><Link href="/" className="hidden text-[7px] font-semibold text-[#718681] hover:text-[#078675] sm:inline">Beranda</Link></div>
      </header>
      {mobileMenuOpen ? <nav id="principal-mobile-menu" aria-label="Menu kepala sekolah seluler" className="grid grid-cols-2 gap-1 border-b border-[#e6eeea] bg-white p-2 sm:grid-cols-3 lg:hidden">{navigation.map((item) => <Link key={item.id} href={item.href} aria-current={section === item.id ? "page" : undefined} onClick={() => setMobileMenuOpen(false)} className={`flex min-h-8 items-center gap-2 rounded-md px-2 text-[8px] ${section === item.id ? "bg-[#e8f5ef] font-semibold text-[#078675]" : "text-[#73847f] hover:bg-[#f4f8f6]"}`}><SchoolIcon name={item.icon} className="h-3.5 w-3.5" />{item.label}</Link>)}</nav> : null}
      <div key={section} className="principal-content-enter px-3 py-4 sm:px-5 sm:py-5 xl:px-6"><div className="mx-auto max-w-[1320px]">{year !== "2027 / 2028" ? <p role="status" className="mb-3 rounded-md bg-[#fff8ea] px-3 py-2 text-[8px] leading-4 text-[#805d20]">Data ilustratif yang tersedia berasal dari tahun ajaran 2027 / 2028. Angka contoh tidak berubah saat tahun ajaran lain dipilih.</p> : null}<PortalActivityFeed audience="Kepala Sekolah" /><PrincipalContent section={section} year={year} setYear={setYear} /><footer className="mt-5 flex flex-col gap-1 border-t border-[#e5ede9] pt-2.5 text-[7px] text-[#91a09c] sm:flex-row sm:justify-between"><span>Seluruh data, jadwal, dan nominal pada halaman ini merupakan ilustrasi desain, bukan informasi resmi.</span><span>SPMB · {year}</span></footer></div></div>
    </div>
  </main>;
}
