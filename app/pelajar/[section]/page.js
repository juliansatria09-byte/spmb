import { notFound } from "next/navigation";
import StudentPortal from "../student-portal";

const sections = [
  "data-pendaftaran",
  "berkas-saya",
  "jadwal-kegiatan",
  "pembayaran",
  "pengumuman",
];

export function generateStaticParams() {
  return sections.map((section) => ({ section }));
}

export default async function StudentSectionPage({ params }) {
  const { section } = await params;
  if (!sections.includes(section)) notFound();

  return <StudentPortal section={section} />;
}
