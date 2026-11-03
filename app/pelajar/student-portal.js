"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearSession, roleConfig, saveSession } from "@/app/lib/auth";
import { usePersistentState } from "@/app/lib/use-persistent-state";
import { getStudentDocument, saveStudentDocument } from "@/app/lib/student-document-storage";
import { publishPortalActivity, uploadPortalDocument, usePortalActivity } from "@/app/lib/portal-activity-client";

const navigation = [
  { id: "dashboard", label: "Dashboard", icon: "grid", href: "/pelajar" },
  { id: "data-pendaftaran", label: "Data pendaftaran", icon: "clipboard", href: "/pelajar/data-pendaftaran" },
  { id: "berkas-saya", label: "Berkas saya", icon: "folder", href: "/pelajar/berkas-saya", badge: "1" },
  { id: "jadwal-kegiatan", label: "Jadwal kegiatan", icon: "calendar", href: "/pelajar/jadwal-kegiatan" },
  { id: "pembayaran", label: "Pembayaran", icon: "wallet", href: "/pelajar/pembayaran" },
  { id: "pengumuman", label: "Pengumuman", icon: "megaphone", href: "/pelajar/pengumuman" },
];

const studentPrograms = [
  "Teknik Komputer & Jaringan",
  "Akuntansi & Keuangan Lembaga",
  "Multimedia",
  "Farmasi Industri",
];

const titles = {
  dashboard: { title: "Dashboard", description: "Ringkasan proses penerimaan dan informasi terbaru untukmu." },
  "data-pendaftaran": { title: "Data pendaftaran", description: "Periksa kembali informasi pendaftaran calon siswa." },
  "berkas-saya": { title: "Berkas saya", description: "Pantau kelengkapan dokumen yang menjadi syarat pendaftaran." },
  "jadwal-kegiatan": { title: "Jadwal kegiatan", description: "Catat tanggal penting dalam rangkaian seleksi siswa baru." },
  pembayaran: { title: "Pembayaran", description: "Lihat status dan rincian pembayaran pendaftaran." },
  pengumuman: { title: "Pengumuman", description: "Informasi penting terbaru dari panitia SPMB." },
};

const applicationSteps = [
  { label: "Pendaftaran akun", detail: "Akun calon siswa berhasil dibuat", status: "Selesai" },
  { label: "Pengisian formulir", detail: "Data diri dan pilihan program studi", status: "Selesai" },
  { label: "Verifikasi berkas", detail: "Satu dokumen masih perlu dilengkapi", status: "Perlu dilengkapi" },
  { label: "Tes seleksi", detail: "12 Juli 2027 · 09.00 WIB", status: "Akan datang" },
  { label: "Pengumuman hasil", detail: "Informasi hasil seleksi akan diumumkan", status: "Akan datang" },
];

const documents = [
  { name: "Kartu Keluarga", detail: "kk_rizki_pratama.pdf", status: "Terverifikasi", tone: "green" },
  { name: "Akta kelahiran", detail: "akta_rizki_pratama.pdf", status: "Terverifikasi", tone: "green" },
  { name: "Pas foto 3 × 4", detail: "foto_rizki_pratama.jpg", status: "Terverifikasi", tone: "green" },
  { name: "Ijazah / SKL terakhir", detail: "ijazah_rizki_pratama.pdf", status: "Terverifikasi", tone: "green" },
  { name: "Surat keterangan sehat", detail: "Dokumen belum diunggah", status: "Belum lengkap", tone: "amber" },
];

const events = [
  { date: "10", month: "JUL", title: "Batas akhir verifikasi berkas", time: "08.00 – 16.00 WIB", type: "Administrasi", tone: "blue" },
  { date: "12", month: "JUL", title: "Tes akademik calon siswa", time: "09.00 – 11.30 WIB", type: "Seleksi", tone: "amber" },
  { date: "18", month: "JUL", title: "Pengumuman hasil seleksi", time: "Diumumkan melalui portal", type: "Pengumuman", tone: "green" },
];

const announcements = [
  { id: "student-selection", date: "08 JUL 2027", title: "Persiapkan diri untuk tes akademik", body: "Peserta diharapkan hadir 30 menit sebelum tes dengan membawa kartu identitas dan alat tulis.", category: "Seleksi", audience: "Seluruh pendaftar", status: "Dipublikasikan", pinned: true },
  { id: "student-documents", date: "05 JUL 2027", title: "Pemeriksaan kelengkapan dokumen", body: "Pastikan dokumen pendaftaran terlihat jelas dan telah diunggah sebelum batas verifikasi berkas.", category: "Berkas", audience: "Seluruh pendaftar", status: "Dipublikasikan" },
  { id: "student-schedule", date: "01 JUL 2027", title: "Informasi jadwal penerimaan", body: "Jadwal lengkap setiap tahapan seleksi dapat dilihat pada menu Jadwal kegiatan.", category: "Informasi", audience: "Seluruh pendaftar", status: "Dipublikasikan" },
];

const SESSION_HYDRATING = "__session_hydrating__";

function subscribeToSession(callback) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSessionSnapshot() {
  try {
    return window.localStorage.getItem("spmb-session");
  } catch {
    return null;
  }
}

function getServerSessionSnapshot() {
  return SESSION_HYDRATING;
}

function MenuIcon({ name, className = "h-[18px] w-[18px]" }) {
  const common = { className, fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" };

  if (name === "grid") {
    return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
  }
  if (name === "clipboard") {
    return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4.5h6a1.5 1.5 0 0 0-1.5-1.5h-3A1.5 1.5 0 0 0 9 4.5ZM9 10h6m-6 4h6m-6 4h4" /></svg>;
  }
  if (name === "folder") {
    return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h5l2 2h8A1.5 1.5 0 0 1 21 8.5v10a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5v-12Z" /><path d="m7 15 3-3 2 2 3-4 3 5" /></svg>;
  }
  if (name === "calendar") {
    return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18m-13 4h2m3 0h2m-7 3h2" /></svg>;
  }
  if (name === "wallet") {
    return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H20v16H5a2 2 0 0 1-2-2V6.5Z" /><path d="M3 8h17m-5 5h5m-5 0a2 2 0 1 0 4 0" /></svg>;
  }
  if (name === "megaphone") {
    return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><path d="M4 13V9a2 2 0 0 1 2-2h3l10-4v16L9 15H6a2 2 0 0 1-2-2Zm5 2 2 6h3l-2-5" /><path d="M19 9h2a2 2 0 0 1 0 4h-2" /></svg>;
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><path d="m5 12 4 4L19 6" /></svg>;
}

function BrandMark() {
  return (
    <Image src="/images/smk-tadika-mesra-seal.png" alt="Lambang SMK Tadika Mesra Jakarta" width={44} height={44} className="h-10 w-10 shrink-0 rounded-full bg-white object-contain" />
  );
}

function StatusPill({ children, tone = "green" }) {
  const tones = {
    green: "bg-[#e7f6ef] text-[#167052]",
    amber: "bg-[#fff4df] text-[#8b5c0b]",
    blue: "bg-[#eaf2fb] text-[#315f88]",
    gray: "bg-[#eef1f3] text-[#687984]",
  };

  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold ${tones[tone]}`}>{children}</span>;
}

function Panel({ children, className = "" }) {
  return <section className={`student-panel rounded-[22px] border border-[#e7eeec] bg-white p-5 shadow-[0_8px_24px_rgba(15,47,57,0.035)] sm:p-6 ${className}`}>{children}</section>;
}

function SectionContent({ section, user }) {
  const initialProfile = {
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    parent: "Sukmawati",
    program: "Teknik Komputer & Jaringan",
  };
  const [profile, setProfile] = usePersistentState(`spmb-student-profile:${user.id}`, initialProfile);
  const [documentRows, setDocumentRows] = usePersistentState(`spmb-student-documents:${user.id}`, documents);
  const [announcementRows] = usePersistentState("spmb-announcements", announcements);
  const [readAnnouncementIds, setReadAnnouncementIds] = usePersistentState(`spmb-student-read-announcements:${user.id}`, []);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState(initialProfile);
  const { events: portalEvents, addEvent } = usePortalActivity();
  const [savingProfile, setSavingProfile] = useState(false);
  const [announcementCategory, setAnnouncementCategory] = useState("Semua kategori");
  const [notice, setNotice] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const completeDocuments = documentRows.filter((document) => document.status === "Terverifikasi").length;

  useEffect(() => {
    if (editingProfile) return;
    const ownEvents = portalEvents.filter((item) => item.entityId === `student:${user.id}`);
    if (!ownEvents.length) return;

    const savedProfile = { name: "", email: "", phone: "", parent: "", program: "" };
    ownEvents.forEach((item) => {
      let payload = item.payload;
      if (typeof payload === "string") {
        try {
          payload = JSON.parse(payload);
        } catch (error) {
          console.error("Data profil tersimpan memiliki format yang tidak valid.", error);
          return;
        }
      }
      if (!payload || typeof payload !== "object") return;
      if (payload.name) savedProfile.name = payload.name;
      if (payload.email) savedProfile.email = payload.email;
      if (payload.phone) savedProfile.phone = payload.phone;
      if (payload.parentName) savedProfile.parent = payload.parentName;
      if (payload.program) savedProfile.program = payload.program;
    });

    if (!savedProfile.name && !savedProfile.email && !savedProfile.phone && !savedProfile.parent && !savedProfile.program) return;
    setProfile((current) => {
      const next = {
        ...current,
        name: savedProfile.name || current.name,
        email: savedProfile.email || current.email,
        phone: savedProfile.phone || current.phone,
        parent: savedProfile.parent || current.parent,
        program: savedProfile.program || current.program,
      };
      return next.name === current.name && next.email === current.email && next.phone === current.phone
        && next.parent === current.parent && next.program === current.program
        ? current
        : next;
    });
  }, [editingProfile, portalEvents, setProfile, user.id]);

  const saveProfileChanges = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    try {
      const savedEvent = await publishPortalActivity({
        actorRole: "pelajar",
        eventType: "profile_updated",
        entityId: `student:${user.id}`,
        summary: `Data pendaftaran diperbarui: ${profileDraft.name}`,
        payload: {
          name: profileDraft.name,
          email: profileDraft.email,
          phone: profileDraft.phone,
          parentName: profileDraft.parent,
          program: profileDraft.program,
        },
      });
      addEvent(savedEvent);
      setProfile(profileDraft);
      saveSession({ ...user, ...profileDraft });
      setEditingProfile(false);
      setNotice("Perubahan tersimpan di akun dan telah dikirim ke Admin serta Kepala Sekolah.");
    } catch (error) {
      console.error("Perubahan data pendaftaran tidak dapat disinkronkan.", error);
      setNotice(`${error.message} Data belum diperbarui.`);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDocumentUpload = async (documentName, file) => {
    if (!file) return;
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setNotice("Berkas harus berupa PDF, JPG, atau PNG.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setNotice("Ukuran berkas melebihi batas maksimal 5 MB.");
      return;
    }
    try {
      await saveStudentDocument(`${user.id}:${documentName}`, file);
      await uploadPortalDocument(user.id, documentName, file);
      setDocumentRows((current) => current.map((document) => document.name === documentName
        ? { ...document, detail: file.name, status: "Menunggu verifikasi", tone: "blue" }
        : document));
      setNotice(`${file.name} tersimpan di server sekolah dan menunggu verifikasi admin.`);
    } catch (error) {
      console.error("Berkas pendaftaran tidak dapat disimpan atau disinkronkan.", error);
      setNotice(`${error.message || "Berkas gagal disinkronkan ke server sekolah."} Coba unggah kembali.`);
    }
  };

  const openDocumentPreview = async (document) => {
    try {
      const file = await getStudentDocument(`${user.id}:${document.name}`);
      if (!file) {
        setNotice("Berkas contoh tidak tersedia. Unggah berkas asli untuk melihat atau mengunduhnya.");
        return;
      }
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
      setNotice(`Pratinjau ${document.detail} siap dibuka.`);
    } catch (error) {
      console.error("Gagal membuka berkas pendaftaran.", error);
      setNotice("Berkas tidak dapat dibuka dari penyimpanan browser.");
    }
  };

  const addToCalendar = (event) => {
    const monthNumber = { JAN: "01", FEB: "02", MAR: "03", APR: "04", MEI: "05", JUN: "06", JUL: "07", AGU: "08", SEP: "09", OKT: "10", NOV: "11", DES: "12" }[event.month];
    const date = `2027${monthNumber}${event.date.padStart(2, "0")}`;
    const escapeCalendarText = (value) => value.replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");
    const calendar = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//SMK Tadika Mesra Jakarta//SPMB//ID", "BEGIN:VEVENT", `UID:${user.id}-${date}-${event.title.replace(/[^a-z0-9]/gi, "")}@spmb.smktadikamesra.sch.id`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`, `DTSTART;VALUE=DATE:${date}`, `SUMMARY:${escapeCalendarText(event.title)}`, `DESCRIPTION:${escapeCalendarText(`${event.time} · ${event.type}`)}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const url = URL.createObjectURL(new Blob([calendar], { type: "text/calendar;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `spmb-${date}.ics`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice(`Jadwal "${event.title}" diunduh untuk ditambahkan ke kalender.`);
  };

  const downloadReceipt = () => {
    const rows = [["Bukti pembayaran SPMB"], ["Sekolah", "SMK Tadika Mesra Jakarta"], ["Nama", profile.name], ["Nomor pendaftaran", "SMK-2027-0142"], ["Nomor transaksi", "SPMB-2027-0142"], ["Nominal", "Rp 250.000"], ["Metode", "Transfer bank"], ["Status", "Terverifikasi"], ["Tanggal", "03 Juli 2027 · 14.32 WIB"]];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(";")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "bukti-pembayaran-spmb.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const printReceipt = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setNotice("Jendela cetak diblokir. Izinkan pop-up untuk membuat bukti PDF.");
      return;
    }
    const safeName = profile.name.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
    printWindow.document.write(`<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Bukti Pembayaran SPMB</title><style>@page{size:A4;margin:22mm}body{font:14px/1.7 Arial,sans-serif;color:#24443c}.school{text-align:center;border-bottom:3px solid #16836f;padding-bottom:16px;font-size:20px;font-weight:700}.title{text-align:center;margin:32px 0 24px;letter-spacing:.08em}.rows{width:100%;border-collapse:collapse}.rows td{padding:12px;border-bottom:1px solid #dce6e1}.rows td:first-child{color:#607870;width:38%}.note{margin-top:32px;padding:14px;background:#f1f7f4;font-size:11px}.sign{text-align:right;margin:55px 30px 0}.line{display:inline-block;width:190px;margin-top:65px;border-bottom:1px solid #607870}</style></head><body><header class="school">SMK TADIKA MESRA JAKARTA<br><small>BUKTI PEMBAYARAN PENDAFTARAN</small></header><main><h1 class="title">BUKTI TRANSAKSI</h1><table class="rows"><tr><td>Nama calon siswa</td><td>${safeName}</td></tr><tr><td>Nomor pendaftaran</td><td>SMK-2027-0142</td></tr><tr><td>Nomor transaksi</td><td>SPMB-2027-0142</td></tr><tr><td>Nominal pembayaran</td><td>Rp 250.000</td></tr><tr><td>Metode pembayaran</td><td>Transfer bank</td></tr><tr><td>Status</td><td>Terverifikasi</td></tr><tr><td>Tanggal</td><td>03 Juli 2027 · 14.32 WIB</td></tr></table><p class="note">Dokumen ini adalah bukti pembayaran dari portal demo dan perlu dicocokkan dengan transaksi resmi sekolah.</p><div class="sign">Petugas penerimaan<br><span class="line"></span></div></main><script>window.addEventListener("load",()=>{window.focus();window.print()})</script></body></html>`);
    printWindow.document.close();
  };

  if (section === "data-pendaftaran") {
    const fields = [
      ["Nomor pendaftaran", "SMK-2027-0142"],
      ["Nama lengkap", profile.name],
      ["Alamat email", profile.email],
      ["Nomor WhatsApp", profile.phone || "Belum ditambahkan"],
      ["Nama orang tua / wali", profile.parent],
      ["Program pilihan", profile.program],
      ["Tahun ajaran", "2027 / 2028"],
      ["Tanggal pendaftaran", "02 Juli 2027"],
    ];

    return (
      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <Panel>
          <SectionHeading eyebrow="Informasi calon siswa" title="Data pendaftaran" action={<StatusPill tone="green">Terkirim</StatusPill>} />
          <form onSubmit={saveProfileChanges}>
            {editingProfile ? <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ["name", "Nama lengkap", { autoComplete: "name", maxLength: 120 }],
                ["email", "Alamat email", { type: "email", autoComplete: "email", maxLength: 120 }],
                ["phone", "Nomor WhatsApp"],
                ["parent", "Nama orang tua / wali"],
              ].map(([field, label, inputProps = {}]) => <label key={field} className="rounded-2xl bg-[#f7faf9] p-4 text-[11px] font-medium text-[#788b88]">{label}<input {...inputProps} required value={profileDraft[field]} onChange={(event) => setProfileDraft((current) => ({ ...current, [field]: event.target.value }))} className="mt-1.5 block w-full rounded-lg border border-[#dfe9e5] bg-white px-3 py-2 text-sm font-semibold text-[#173c38]" /></label>)}
              <label className="rounded-2xl bg-[#f7faf9] p-4 text-[11px] font-medium text-[#788b88]">Program pilihan<select required value={studentPrograms.includes(profileDraft.program) ? profileDraft.program : ""} onChange={(event) => setProfileDraft((current) => ({ ...current, program: event.target.value }))} className="mt-1.5 block w-full rounded-lg border border-[#dfe9e5] bg-white px-3 py-2 text-sm font-semibold text-[#173c38]"><option value="">Pilih program</option>{studentPrograms.map((program) => <option key={program} value={program}>{program}</option>)}</select></label>
            </div> : <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {fields.map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-[#f7faf9] p-4">
                  <p className="text-[11px] font-medium text-[#788b88]">{label}</p>
                  <p className="mt-1.5 break-words text-sm font-semibold text-[#173c38]">{value}</p>
                </div>
              ))}
            </div>}
          <div className="mt-5 rounded-2xl border border-[#dcefe9] bg-[#f1faf6] p-4 text-sm leading-6 text-[#41645d]">
            Perubahan tersimpan di akun dan diteruskan ke Admin serta Kepala Sekolah untuk ditinjau.
          </div>
          <div className="mt-4 flex flex-wrap gap-2">{editingProfile ? <><button type="submit" disabled={savingProfile} className="rounded-lg bg-[#087f71] px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">{savingProfile ? "Menyimpan..." : "Simpan perubahan"}</button><button type="button" disabled={savingProfile} onClick={() => { setProfileDraft(profile); setEditingProfile(false); }} className="rounded-lg border border-[#dfe9e5] px-4 py-2 text-xs font-bold text-[#52716a] disabled:opacity-60">Batal</button></> : <button type="button" onClick={() => { setProfileDraft(profile); setEditingProfile(true); }} className="rounded-lg border border-[#dfe9e5] px-4 py-2 text-xs font-bold text-[#087f71]">Ubah data pendaftaran</button>}</div>
          {notice ? <p role="status" className={`mt-3 text-xs ${notice.includes("tersimpan") ? "text-[#078675]" : "text-[#a34526]"}`}>{notice}</p> : null}
          </form>
        </Panel>
        <Panel>
          <SectionHeading eyebrow="Proses saat ini" title="Tahapan seleksi" />
          <div className="mt-5 space-y-4">
            {applicationSteps.map((step, index) => {
              const complete = index < 2;
              const current = index === 2;
              return (
                <div key={step.label} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${complete ? "bg-[#078675] text-white" : current ? "bg-[#fff0cf] text-[#895c0b]" : "bg-[#eff3f2] text-[#81918e]"}`}>
                      {complete ? "✓" : `0${index + 1}`}
                    </span>
                    {index < applicationSteps.length - 1 ? <span className="my-1 min-h-5 w-px flex-1 bg-[#e3ece9]" /> : null}
                  </div>
                  <div className="pb-3">
                    <p className="text-sm font-semibold text-[#23443f]">{step.label}</p>
                    <p className="mt-1 text-xs leading-5 text-[#7a8e89]">{step.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    );
  }

  if (section === "berkas-saya") {
    return (
      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <Panel>
          <SectionHeading eyebrow="Dokumen pendaftaran" title="Berkas saya" action={<StatusPill tone={completeDocuments === documentRows.length ? "green" : "amber"}>{completeDocuments} dari {documentRows.length} terverifikasi</StatusPill>} />
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#edf2f0]">
            <div className="h-full rounded-full bg-[#078675] transition-all" style={{ width: `${documentRows.length ? completeDocuments / documentRows.length * 100 : 0}%` }} />
          </div>
          <p className="mt-2 text-xs text-[#7a8e89]">Kelengkapan berkas {documentRows.length ? Math.round(completeDocuments / documentRows.length * 100) : 0}% · Unggah dokumen yang belum lengkap sebelum 10 Juli 2027.</p>
          <div className="mt-5 divide-y divide-[#edf1ef]">
            {documentRows.map((document) => (
              <div key={document.name} className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center">
                <div className="flex items-start gap-3">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${document.tone === "green" ? "bg-[#e7f6ef] text-[#167052]" : "bg-[#fff4df] text-[#8b5c0b]"}`}>
                    <MenuIcon name={document.tone === "green" ? "check" : "folder"} className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-[#254540]">{document.name}</span>
                    <span className="mt-1 block text-xs text-[#82928f]">{document.detail}</span>
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill tone={document.tone}>{document.status}</StatusPill>
                  {document.detail !== "Dokumen belum diunggah" ? <button type="button" onClick={() => openDocumentPreview(document)} className="text-xs font-bold text-[#078675]">Lihat / unduh</button> : null}
                  <label className="cursor-pointer rounded-lg border border-[#dfe9e5] px-3 py-2 text-xs font-bold text-[#087f71]">{document.status === "Terverifikasi" ? "Unggah ulang" : "Unggah berkas"}<input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" className="sr-only" onChange={(event) => { handleDocumentUpload(document.name, event.target.files?.[0]); event.target.value = ""; }} /></label>
                </div>
              </div>
            ))}
          </div>
          {previewUrl ? <a href={previewUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-lg bg-[#e7f4ef] px-3 py-2 text-xs font-bold text-[#087f71]">Buka pratinjau berkas</a> : null}
          {notice ? <p role="status" className="mt-3 text-xs text-[#078675]">{notice}</p> : null}
        </Panel>
        <Panel className="bg-[#0b655d] text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/65">Perlu tindakan</p>
          <h2 className="mt-2 text-xl font-semibold">Lengkapi berkasmu</h2>
          <p className="mt-2 text-sm leading-6 text-white/75">Unggah surat keterangan sehat dari fasilitas kesehatan sebelum batas verifikasi berkas.</p>
          <div className="mt-5 rounded-2xl border border-white/15 bg-white/10 p-4">
            <p className="text-sm font-semibold">Surat keterangan sehat</p>
            <p className="mt-1 text-xs text-white/60">Format PDF, JPG, atau PNG · Maksimal 5 MB</p>
          </div>
          <label className="mt-4 inline-flex cursor-pointer rounded-lg bg-white px-4 py-2 text-xs font-bold text-[#0b655d]">Pilih dan unggah berkas<input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" className="sr-only" onChange={(event) => { handleDocumentUpload("Surat keterangan sehat", event.target.files?.[0]); event.target.value = ""; }} /></label>
          <p className="mt-3 text-xs leading-5 text-white/60">Berkas disimpan di browser/perangkat ini dan statusnya menunggu pemeriksaan admin. Ini bukan unggahan ke server sekolah.</p>
        </Panel>
      </div>
    );
  }

  if (section === "jadwal-kegiatan") {
    return (
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel>
          <SectionHeading eyebrow="Kalender penerimaan" title="Jadwal kegiatan" action={<StatusPill tone="blue">Juli 2027</StatusPill>} />
          <div className="mt-5 space-y-3">
            {events.map((event) => (
              <article key={event.title} className="flex flex-col gap-4 rounded-2xl border border-[#eaf0ee] p-4 sm:flex-row sm:items-center">
                <div className="flex h-[58px] w-[58px] shrink-0 flex-col items-center justify-center rounded-2xl bg-[#eaf5f1] text-[#087f71]">
                  <span className="text-xl font-bold leading-none">{event.date}</span>
                  <span className="mt-1 text-[9px] font-bold tracking-[0.12em]">{event.month}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-[#23443f]">{event.title}</h3>
                  <p className="mt-1 text-xs text-[#7a8e89]">{event.time}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2"><StatusPill tone={event.tone}>{event.type}</StatusPill><button type="button" onClick={() => addToCalendar(event)} className="rounded-lg border border-[#dfe9e5] px-3 py-2 text-xs font-bold text-[#087f71]">Tambah ke kalender</button></div>
              </article>
            ))}
          </div>
          {notice ? <p role="status" className="mt-3 text-xs text-[#078675]">{notice}</p> : null}
        </Panel>
        <Panel>
          <SectionHeading eyebrow="Yang perlu disiapkan" title="Sebelum tes" />
          <ul className="mt-5 space-y-3">
            {["Datang 30 menit sebelum jadwal", "Bawa kartu identitas calon siswa", "Siapkan alat tulis", "Gunakan seragam sekolah asal"].map((item, index) => (
              <li key={item} className="flex items-start gap-3 rounded-xl bg-[#f7faf9] p-3 text-sm text-[#49645e]">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#dff2eb] text-[10px] font-bold text-[#087f71]">{index + 1}</span>
                {item}
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    );
  }

  if (section === "pembayaran") {
    return (
      <div className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
        <Panel>
          <SectionHeading eyebrow="Biaya pendaftaran" title="Pembayaran" action={<StatusPill tone="green">Lunas</StatusPill>} />
          <div className="mt-5 rounded-[20px] bg-[#eff8f4] p-5 sm:p-6">
            <p className="text-sm text-[#607b73]">Total pembayaran</p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#12634f]">Rp 250.000</p>
            <p className="mt-2 text-xs text-[#6d877f]">Pembayaran berhasil diterima pada 03 Juli 2027</p>
          </div>
          <div className="mt-5 divide-y divide-[#edf1ef]">
            {[
              ["Nomor transaksi", "SPMB-2027-0142"],
              ["Metode pembayaran", "Transfer bank"],
              ["Tanggal pembayaran", "03 Juli 2027 · 14.32 WIB"],
              ["Status", "Pembayaran terverifikasi"],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between sm:gap-4">
                <span className="text-xs text-[#82928f]">{label}</span>
                <span className="text-sm font-semibold text-[#284740]">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={downloadReceipt} className="rounded-lg border border-[#dfe9e5] px-4 py-2 text-xs font-bold text-[#087f71]">Unduh bukti CSV</button><button type="button" onClick={printReceipt} className="rounded-lg bg-[#087f71] px-4 py-2 text-xs font-bold text-white">Cetak / Simpan PDF</button></div>
          {notice ? <p role="status" className="mt-3 text-xs text-[#078675]">{notice}</p> : null}
        </Panel>
        <Panel className="bg-[#102f4c] text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">Informasi</p>
          <h2 className="mt-2 text-xl font-semibold">Pembayaran sudah diterima</h2>
          <p className="mt-2 text-sm leading-6 text-white/70">Tidak ada tagihan yang perlu dibayar saat ini. Simpan nomor transaksi untuk referensi jika menghubungi panitia.</p>
          <div className="mt-5 rounded-2xl border border-white/15 bg-white/10 p-4">
            <p className="text-xs text-white/55">Nomor pendaftaran</p>
            <p className="mt-1 text-sm font-semibold">SMK-2027-0142</p>
          </div>
        </Panel>
      </div>
    );
  }

  if (section === "pengumuman") {
    const visibleAnnouncements = announcementRows.filter((announcement) => announcement.status === "Dipublikasikan"
      && (announcement.audience === "Seluruh pendaftar" || announcement.audience === "Peserta seleksi")
      && (announcementCategory === "Semua kategori" || announcement.category === announcementCategory));
    return (
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel>
          <SectionHeading eyebrow="Informasi dari panitia" title="Pengumuman" action={<StatusPill tone="blue">{visibleAnnouncements.length} informasi</StatusPill>} />
          <label className="mt-4 block text-xs font-semibold text-[#56766d]">Kategori
            <select value={announcementCategory} onChange={(event) => setAnnouncementCategory(event.target.value)} className="ml-2 rounded-lg border border-[#dfe9e5] bg-white px-3 py-2 text-xs"><option>Semua kategori</option><option>Berkas</option><option>Pembayaran</option><option>Seleksi</option><option>Informasi</option></select>
          </label>
          <div className="mt-5 space-y-3">
            {visibleAnnouncements.map((announcement) => (
              <article key={announcement.id || announcement.title} className="rounded-2xl border border-[#eaf0ee] p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] font-bold tracking-[0.12em] text-[#84938f]">{announcement.date}</span>
                  <div className="flex items-center gap-2">
                    {announcement.pinned ? <StatusPill tone="amber">Penting</StatusPill> : null}
                    <StatusPill tone="blue">{announcement.category || announcement.tag || "Informasi"}</StatusPill>
                  </div>
                </div>
                <h3 className="mt-3 text-base font-semibold text-[#23443f]">{announcement.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#718580]">{announcement.body || announcement.detail}</p>
                <button type="button" onClick={() => { setReadAnnouncementIds((current) => current.includes(announcement.id) ? current : [...current, announcement.id]); setNotice(`Pengumuman "${announcement.title}" ditandai sudah dibaca.`); }} className="mt-3 text-xs font-bold text-[#087f71]">{readAnnouncementIds.includes(announcement.id) ? "Sudah dibaca ✓" : "Tandai sudah dibaca"}</button>
              </article>
            ))}
            {visibleAnnouncements.length === 0 ? <p className="rounded-xl bg-[#f7faf9] p-5 text-sm text-[#718580]">Belum ada pengumuman terbit untuk kategori ini.</p> : null}
          </div>
          {notice ? <p role="status" className="mt-3 text-xs text-[#078675]">{notice}</p> : null}
        </Panel>
        <Panel className="bg-[#eaf6f1]">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#078675]"><MenuIcon name="megaphone" /></span>
          <h2 className="mt-4 text-xl font-semibold text-[#174b42]">Tetap ikuti informasi</h2>
          <p className="mt-2 text-sm leading-6 text-[#607b73]">Periksa halaman pengumuman dan email secara berkala agar tidak melewatkan informasi seleksi.</p>
          <div className="mt-5 rounded-2xl border border-[#d5e9e1] bg-white/70 p-4">
            <p className="text-xs font-semibold text-[#56766d]">Kontak panitia</p>
            <p className="mt-1 text-sm font-semibold text-[#174b42]">spmb@smktadikamesra.sch.id</p>
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="student-dashboard space-y-5">
      {notice ? <p role="status" className="rounded-lg border border-[#d8efe5] bg-[#e8f6ef] px-4 py-3 text-xs text-[#276751]">{notice}</p> : null}
      <section className="flex flex-col gap-5 overflow-hidden rounded-[24px] bg-[#0b655d] p-5 text-white shadow-[0_18px_40px_rgba(11,101,93,0.16)] sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div className="max-w-xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b8e7d8]">Langkah selanjutnya</p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] sm:text-2xl">
            {completeDocuments === documentRows.length ? "Berkasmu sudah diverifikasi" : "Lengkapi proses berkasmu"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/75">
            {completeDocuments} dari {documentRows.length} dokumen sudah diverifikasi. Buka menu berkas untuk melihat yang masih perlu ditindaklanjuti.
          </p>
          <Link href="/pelajar/berkas-saya" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-4 text-xs font-bold text-[#0b655d] transition hover:bg-[#e5f7ef]">
            Periksa berkas <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="w-full rounded-2xl border border-white/15 bg-white/10 p-4 sm:max-w-[220px]">
          <div className="flex items-center justify-between text-xs text-white/80">
            <span>Kelengkapan berkas</span>
            <strong className="text-white">{Math.round(completeDocuments / documentRows.length * 100)}%</strong>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-[#d9f5a4] transition-all" style={{ width: `${completeDocuments / documentRows.length * 100}%` }} />
          </div>
          <p className="mt-2 text-[10px] text-white/65">Pembaruan status oleh panitia SPMB</p>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Status pendaftaran", value: "Dalam proses", detail: "Tahap verifikasi", tone: "blue" },
          { label: "Berkas lengkap", value: `${completeDocuments} / ${documentRows.length}`, detail: `${documentRows.length - completeDocuments} berkas menunggu atau perlu dilengkapi`, tone: completeDocuments === documentRows.length ? "green" : "amber" },
          { label: "Jadwal tes", value: "12 Juli", detail: "Pukul 09.00 WIB", tone: "green" },
          { label: "Pembayaran", value: "Lunas", detail: "Terverifikasi 03 Juli", tone: "violet" },
        ].map((item) => (
          <article key={item.label} className={`student-stat student-stat-${item.tone} rounded-[20px] border p-4`}>
            <p className="text-xs font-medium opacity-70">{item.label}</p>
            <p className="mt-2 text-xl font-bold tracking-[-0.03em]">{item.value}</p>
            <p className="mt-1 text-[10px] opacity-70">{item.detail}</p>
          </article>
        ))}
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel>
          <SectionHeading eyebrow="Perjalanan SPMB" title="Tahapan pendaftaran" action={<StatusPill tone="blue">Sedang berjalan</StatusPill>} />
          <div className="mt-5 space-y-2">
            {applicationSteps.map((step, index) => {
              const currentStep = index === 2 && completeDocuments === documentRows.length
                ? { ...step, detail: "Seluruh dokumen telah diverifikasi admin", status: "Selesai" }
                : step;
              const complete = index < 2 || (index === 2 && completeDocuments === documentRows.length);
              const current = index === 2 && completeDocuments < documentRows.length;
              return (
                <div key={step.label} className="flex items-center gap-3 rounded-2xl bg-[#f8faf9] p-3.5">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${complete ? "bg-[#078675] text-white" : current ? "bg-[#fff0cf] text-[#895c0b]" : "bg-[#edf1f0] text-[#82918e]"}`}>
                    {complete ? "✓" : `0${index + 1}`}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-[#254540]">{step.label}</span>
                    <span className="mt-0.5 block text-xs text-[#80918d]">{currentStep.detail}</span>
                  </span>
                  <StatusPill tone={complete || currentStep.status === "Selesai" ? "green" : current ? "amber" : "gray"}>{currentStep.status}</StatusPill>
                </div>
              );
            })}
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel className="bg-[#0b655d] text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/65">Kegiatan selanjutnya</p>
                <h2 className="mt-2 text-xl font-semibold">Tes akademik</h2>
              </div>
              <span className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-white/10">
                <span className="text-lg font-bold leading-none">12</span>
                <span className="mt-1 text-[8px] font-bold tracking-widest">JUL</span>
              </span>
            </div>
            <p className="mt-3 text-sm text-white/75">Pukul 09.00 WIB · Aula SMK Tadika Mesra</p>
            <Link href="/pelajar/jadwal-kegiatan" className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#d9f5a4] hover:text-white">
              Lihat jadwal lengkap <span aria-hidden="true">→</span>
            </Link>
          </Panel>
          <Panel>
            <SectionHeading eyebrow="Pendaftaran" title="Data calon siswa" />
            <div className="mt-4 space-y-3">
              <InfoRow label="Nomor pendaftaran" value="SMK-2027-0142" />
              <InfoRow label="Program pilihan" value={profile.program} />
              <InfoRow label="Nama orang tua" value={profile.parent} />
            </div>
            <Link href="/pelajar/data-pendaftaran" className="mt-4 inline-flex text-xs font-bold text-[#078675] hover:text-[#075e54]">
              Lihat data pendaftaran <span className="ml-2" aria-hidden="true">→</span>
            </Link>
          </Panel>
        </div>
      </div>

      <Panel>
        <SectionHeading eyebrow="Informasi terbaru" title="Pengumuman untukmu" action={<Link href="/pelajar/pengumuman" className="text-xs font-bold text-[#078675] hover:text-[#075e54]">Semua pengumuman →</Link>} />
        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-[#e8efec] p-4 sm:flex-row sm:items-center">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff3dc] text-[#926013]"><MenuIcon name="megaphone" /></span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#284740]">{announcementRows.find((item) => item.status === "Dipublikasikan" && (item.audience === "Seluruh pendaftar" || item.audience === "Peserta seleksi"))?.title || "Belum ada pengumuman terbaru"}</p>
            <p className="mt-1 text-xs leading-5 text-[#81918d]">{announcementRows.find((item) => item.status === "Dipublikasikan" && (item.audience === "Seluruh pendaftar" || item.audience === "Peserta seleksi"))?.body || "Informasi baru dari panitia akan muncul di sini."}</p>
          </div>
          <StatusPill tone="amber">Penting</StatusPill>
        </div>
      </Panel>
    </div>
  );
}

function SectionHeading({ eyebrow, title, action }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#83928f]">{eyebrow}</p>
        <h2 className="mt-1 text-lg font-semibold tracking-[-0.025em] text-[#1e403a]">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 border-b border-[#edf1ef] pb-3 last:border-0 last:pb-0 sm:flex-row sm:justify-between sm:gap-4">
      <span className="text-xs text-[#80918d]">{label}</span>
      <span className="text-sm font-semibold text-[#284740]">{value}</span>
    </div>
  );
}

export default function StudentPortal({ section }) {
  const router = useRouter();
  const sessionSnapshot = useSyncExternalStore(
    subscribeToSession,
    getSessionSnapshot,
    getServerSessionSnapshot
  );
  const user = useMemo(() => {
    if (!sessionSnapshot || sessionSnapshot === SESSION_HYDRATING) return null;
    try {
      return JSON.parse(sessionSnapshot);
    } catch {
      return null;
    }
  }, [sessionSnapshot]);
  const [schoolYear, setSchoolYear] = useState("2027 / 2028");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (sessionSnapshot === SESSION_HYDRATING) return;
    if (!sessionSnapshot || user?.role !== "pelajar") {
      router.push("/");
    }
  }, [router, sessionSnapshot, user]);

  if (!user || user.role !== "pelajar") return null;

  const handleLogout = () => {
    clearSession();
    router.push("/");
  };

  const currentPage = titles[section];
  const initials = user.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();

  return (
    <main className="student-shell min-h-screen bg-[#f5f8f7] text-[#193b36]">
      <aside className="student-sidebar border-r border-[#e8efec] bg-white">
        <Link href="/pelajar" className="flex items-center gap-3 rounded-xl px-1 py-1">
          <BrandMark />
          <span className="min-w-0">
            <span className="block text-sm font-semibold leading-5 text-[#173c38]">SMK Tadika Mesra<br />Jakarta</span>
            <span className="mt-0.5 block text-[9px] uppercase tracking-[0.13em] text-[#81918d]">Portal SPMB</span>
          </span>
        </Link>

        <label className="mt-7 block rounded-2xl bg-[#f3f7f5] p-3">
          <span className="block text-[9px] font-bold uppercase tracking-[0.12em] text-[#81918d]">Tahun ajaran</span>
          <span className="relative mt-1 block">
            <select
              value={schoolYear}
              onChange={(event) => setSchoolYear(event.target.value)}
              aria-label="Pilih tahun ajaran"
              className="w-full appearance-none bg-transparent pr-5 text-sm font-medium text-[#294841] outline-none"
            >
              <option>2027 / 2028</option>
              <option>2026 / 2027</option>
            </select>
            <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[#078675]" aria-hidden="true">⌄</span>
          </span>
          <span className="mt-1 block text-[10px] text-[#078675]">Gelombang 1 · Dibuka</span>
        </label>

        <p className="mb-2 mt-7 text-[9px] font-bold uppercase tracking-[0.13em] text-[#81918d]">Menu pelajar</p>
        <nav className="space-y-1" aria-label="Menu pelajar">
          {navigation.map((item) => {
            const active = item.id === section;
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className={`group flex min-h-10 items-center gap-2.5 rounded-xl px-3 text-xs transition-colors ${
                  active
                    ? "bg-[#e7f4ef] font-semibold text-[#078675]"
                    : "text-[#718580] hover:bg-[#f4f8f6] hover:text-[#28564d]"
                }`}
              >
                <MenuIcon name={item.icon} className="h-[17px] w-[17px] shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge ? <span className="text-[10px] font-bold text-[#078675]">{item.badge}</span> : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto hidden rounded-2xl bg-[#f4f8f6] p-3 lg:block">
          <p className="truncate text-xs font-semibold text-[#294841]">{user.name}</p>
          <p className="mt-1 truncate text-[10px] text-[#81918d]">{user.email}</p>
          <button onClick={handleLogout} className="mt-3 text-xs font-semibold text-[#b2574c] hover:text-[#893c34]">
            Keluar dari akun
          </button>
        </div>
      </aside>

      <div className="student-main min-w-0">
        <header className="student-topbar flex items-center justify-between gap-4 border-b border-[#e8efec] bg-white/85 px-4 py-3 backdrop-blur sm:px-7">
          <button
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-controls="student-mobile-menu"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e3ece8] text-[#31564e] lg:hidden"
            aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
          >
            <span className="text-lg leading-none">{mobileMenuOpen ? "×" : "☰"}</span>
          </button>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] text-[#8a9995]">Portal SPMB <span className="mx-1">/</span> {currentPage.title}</div>
            <h1 className="truncate text-sm font-semibold text-[#23443f] sm:text-base">{currentPage.title}</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden text-right sm:block">
              <span className="block text-xs font-semibold text-[#31564e]">{user.name}</span>
              <span className="block text-[10px] text-[#8a9995]">Calon siswa</span>
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dff1ea] text-xs font-bold text-[#087f71]">{initials}</span>
            <button onClick={handleLogout} className="rounded-full border border-[#e2eae7] px-3 py-2 text-[10px] font-semibold text-[#657c75] transition hover:border-[#d9a49e] hover:text-[#a34e43] lg:hidden">
              Keluar
            </button>
          </div>
        </header>

        {mobileMenuOpen ? (
          <nav id="student-mobile-menu" className="student-mobile-menu grid grid-cols-2 gap-1 border-b border-[#e8efec] bg-white p-3 sm:grid-cols-3 lg:hidden" aria-label="Menu pelajar">
            {navigation.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                aria-current={item.id === section ? "page" : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex min-h-10 items-center gap-2 rounded-xl px-3 text-xs ${item.id === section ? "bg-[#e7f4ef] font-semibold text-[#078675]" : "text-[#718580] hover:bg-[#f4f8f6]"}`}
              >
                <MenuIcon name={item.icon} className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            ))}
          </nav>
        ) : null}

        <div className="student-content px-4 py-5 sm:px-7 sm:py-7">
          <div className="student-content-enter mx-auto max-w-6xl">
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#078675]">{roleConfig.pelajar.title} · Gelombang 1</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#183c36] sm:text-[1.75rem]">
                {section === "dashboard" ? `Halo, ${user.name.split(" ")[0]}!` : currentPage.title}
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-[#81918d]">{section === "dashboard" ? "Berikut ringkasan proses pendaftaranmu saat ini." : currentPage.description}</p>
            </div>
            <SectionContent section={section} user={user} />
          </div>
        </div>
      </div>
    </main>
  );
}
