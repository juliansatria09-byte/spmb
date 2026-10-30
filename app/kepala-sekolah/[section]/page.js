import { notFound } from "next/navigation";
import PrincipalPortal from "../principal-portal";

const sections = ["kapasitas-kelas", "hasil-seleksi", "laporan-penerimaan", "arsip-laporan"];

export function generateStaticParams() {
  return sections.map((section) => ({ section }));
}

export default async function PrincipalSectionPage({ params }) {
  const { section } = await params;
  if (!sections.includes(section)) notFound();
  return <PrincipalPortal section={section} />;
}
