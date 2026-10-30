import { notFound } from "next/navigation";
import AdminPortal from "../admin-portal";

const sections = ["data-pendaftar", "verifikasi-berkas", "pembayaran", "jadwal-kegiatan", "pengumuman", "laporan"];

export function generateStaticParams() {
  return sections.map((section) => ({ section }));
}

export default async function AdminSectionPage({ params }) {
  const { section } = await params;
  if (!sections.includes(section)) notFound();
  return <AdminPortal section={section} />;
}
