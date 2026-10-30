import Link from "next/link";
import Image from "next/image";
import ScrollReveal from "./components/scroll-reveal";

function ArrowIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`${className} fill-none stroke-current stroke-[1.8]`}>
      <path d="M5 12h14m-7-7 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
      <path d="M4 5.5c3.4-.7 6.1 0 8 2v12c-1.9-2-4.6-2.7-8-2V5.5Zm16 0c-3.4-.7-6.1 0-8 2v12c1.9-2 4.6-2.7 8-2V5.5Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-[1.7]">
      <path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Zm7 13 .9 3.1L23 19l-3.1.9L19 23l-.9-3.1L15 19l3.1-.9L19 15Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const statistics = [
  { value: "A", label: "Akreditasi sekolah" },
  { value: "92%", label: "Lulusan terserap kerja", accent: true },
  { value: "48+", label: "Mitra industri aktif" },
  { value: "1:18", label: "Rasio guru & murid" },
];

const benefits = [
  {
    title: "Kurikulum dekat industri",
    description: "Materi diperbarui bersama mitra profesional, dengan studi kasus yang relevan dan sertifikasi kompetensi.",
  },
  {
    title: "Praktik lebih banyak",
    description: "Studio, lab komputer, dapur produksi, dan ruang simulasi menjadi tempat belajar setiap minggu.",
  },
  {
    title: "Didampingi sampai siap",
    description: "Guru, mentor industri, dan konselor karier membantu setiap siswa membangun portofolio dan rencana masa depan.",
  },
];

const programs = [
  {
    name: "Rekayasa Perangkat Lunak",
    number: "PROGRAM 01 · FAVORIT",
    description: "Bangun aplikasi web, mobile, dan sistem digital melalui proyek nyata bersama praktisi teknologi.",
    tags: ["Web & mobile", "UI engineering", "Basis data"],
    image: "/images/coding-lab-background.png",
    theme: "software",
  },
  {
    name: "Desain Komunikasi Visual",
    number: "PROGRAM 02",
    description: "Ubah ide menjadi identitas, ilustrasi, foto, video, dan kampanye kreatif yang bermakna.",
    image: "/images/coding-lab-class.png",
    theme: "design",
  },
  {
    name: "Manajemen Perkantoran",
    number: "PROGRAM 03",
    description: "Kuasai administrasi digital, komunikasi bisnis, layanan pelanggan, dan tata kelola modern.",
    image: "/images/modern-classroom-qr.png",
    theme: "office",
  },
  {
    name: "Kuliner",
    number: "PROGRAM 04",
    description: "Pelajari teknik produksi, penyajian, keamanan pangan, kewirausahaan, dan pengelolaan bisnis kuliner.",
    image: "/images/culinary-class-celebration.png",
    theme: "culinary",
  },
];

const admissionSchedule = [
  { label: "Gelombang 1", date: "05 Okt – 30 Nov 2026", detail: "Bebas biaya formulir", active: true },
  { label: "Gelombang 2", date: "01 Des – 31 Jan 2027", detail: "Tes minat & wawancara" },
  { label: "Gelombang 3", date: "01 Feb – 30 Apr 2027", detail: "Selama kuota tersedia" },
  { label: "Daftar ulang", date: "Maks. 7 hari", detail: "Setelah dinyatakan lolos" },
];

const requirements = [
  "Siswa kelas IX atau lulusan SMP/MTs sederajat",
  "Salinan Kartu Keluarga dan Akta Kelahiran",
  "Rapor semester 1–5 atau Surat Keterangan Lulus",
  "Pas foto terbaru berlatar polos",
  "NISN dan nomor WhatsApp orang tua/wali aktif",
];

const registrationSteps = [
  { title: "Buat akun pendaftar", detail: "Isi email dan nomor WhatsApp aktif untuk menerima informasi pendaftaran." },
  { title: "Lengkapi data & pilihan program", detail: "Masukkan data diri, sekolah asal, dan program keahlian pilihan." },
  { title: "Unggah dokumen", detail: "Pastikan berkas jelas dan mudah dibaca dalam format JPG atau PDF." },
  { title: "Ikuti asesmen & wawancara", detail: "Pilih jadwal tes minat, potensi, dan percakapan singkat." },
  { title: "Cek hasil & daftar ulang", detail: "Pantau pengumuman seleksi melalui portal pendaftaran." },
];

const scholarships = [
  { title: "Beasiswa Prestasi", detail: "Dukungan biaya pendidikan bagi calon siswa berprestasi akademik maupun nonakademik.", icon: "trophy" },
  { title: "Beasiswa Sahabat", detail: "Dukungan biaya bagi calon siswa dari keluarga yang membutuhkan.", icon: "heart" },
  { title: "Beasiswa Alumni", detail: "Kesempatan dukungan khusus bagi keluarga alumni SMK Tadika Mesra Jakarta.", icon: "people" },
];

const testimonials = [
  { quote: "Di RPL, saya tidak hanya belajar coding. Saya belajar menjelaskan ide, menerima revisi, dan bekerja seperti tim produk sungguhan.", initials: "R", name: "Siswa RPL", detail: "Belajar lewat proyek kolaboratif", tone: "coral" },
  { quote: "Guru DKV mendorong saya punya gaya sendiri. Setiap proyek membuat saya lebih percaya diri menunjukkan karya.", initials: "D", name: "Siswa DKV", detail: "Berkarya dan menyusun portofolio", tone: "lime" },
  { quote: "Praktik di dapur sekolah melatih disiplin dan percaya diri. Saya belajar mengolah ide menjadi karya yang nyata.", initials: "K", name: "Siswa Kuliner", detail: "Belajar melalui praktik langsung", tone: "blue" },
];

const questions = [
  { question: "Apakah pendaftaran dilakukan sepenuhnya secara online?", answer: "Pembuatan akun, pengisian data, dan pengumpulan dokumen dapat dimulai melalui portal. Asesmen dapat berlangsung tatap muka atau daring sesuai jadwal yang diinformasikan panitia." },
  { question: "Bolehkah memilih lebih dari satu program keahlian?", answer: "Calon siswa memilih program keahlian utama pada formulir. Informasi mengenai pilihan tambahan dapat dikonfirmasi kepada panitia saat proses pendaftaran." },
  { question: "Apakah tersedia kelas kunjungan sebelum mendaftar?", answer: "Informasi kunjungan sekolah dan kegiatan pengenalan program akan diumumkan melalui portal SPMB." },
  { question: "Bagaimana jika belum memiliki seluruh dokumen?", answer: "Pendaftaran dapat dimulai dan dokumen dilengkapi bertahap sebelum batas verifikasi. Hubungi panitia untuk memastikan dokumen pengganti yang dapat digunakan." },
  { question: "Apakah lulusan dibantu mencari kerja?", answer: "Sekolah mendukung persiapan karier melalui pengembangan kompetensi, pendampingan, dan informasi peluang dari mitra industri." },
];

const calendarContent = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  "PRODID:-//SMK Tadika Mesra Jakarta//SPMB 2026-2027//ID",
  "CALSCALE:GREGORIAN",
  "BEGIN:VEVENT",
  "UID:spmb-gelombang1-2026@smktadikamesra",
  "DTSTAMP:20261013T000000Z",
  "DTSTART;VALUE=DATE:20261005",
  "DTEND;VALUE=DATE:20261201",
  "SUMMARY:Pendaftaran SPMB Gelombang 1",
  "END:VEVENT",
  "BEGIN:VEVENT",
  "UID:spmb-gelombang2-2026@smktadikamesra",
  "DTSTAMP:20261013T000000Z",
  "DTSTART;VALUE=DATE:20261201",
  "DTEND;VALUE=DATE:20270201",
  "SUMMARY:Pendaftaran SPMB Gelombang 2",
  "END:VEVENT",
  "BEGIN:VEVENT",
  "UID:spmb-gelombang3-2027@smktadikamesra",
  "DTSTAMP:20261013T000000Z",
  "DTSTART;VALUE=DATE:20270201",
  "DTEND;VALUE=DATE:20270501",
  "SUMMARY:Pendaftaran SPMB Gelombang 3",
  "END:VEVENT",
  "END:VCALENDAR",
].join("\r\n");

function ProgramIcon({ kind }) {
  if (kind === "design") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-[1.6]">
        <path d="m4 4 15 4-7 3-3 8L4 4Zm8 7 5 5m-1-8 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-[1.6]">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m-13 5h18m-11 0v2h4v-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="font-sans text-[#0b2238]">
      <header className="home-header relative z-20 border-b border-[#dce6eb] bg-white/95 px-5 py-3 shadow-[0_4px_18px_rgba(15,39,58,0.06)] backdrop-blur sm:px-8 lg:px-[6%]">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3">
          <Link href="/" aria-label="Beranda SMK Tadika Mesra Jakarta" className="flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f71]/50">
            <Image src="/images/smk-tadika-mesra-seal.png" alt="Lambang SMK Tadika Mesra Jakarta" width={56} height={56} priority className="h-12 w-12 shrink-0 rounded-full object-contain" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-extrabold tracking-[-0.02em] text-[#17354a] sm:text-base">SMK Tadika Mesra Jakarta</span>
              <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.16em] text-[#708596] sm:text-[10px]">Portal penerimaan murid baru</span>
            </span>
          </Link>
          <nav aria-label="Navigasi utama" className="flex items-center gap-2 sm:gap-3">
            <Link href="#program" className="hidden rounded-lg px-3 py-2 text-xs font-semibold text-[#526b7e] transition hover:bg-[#edf7f4] hover:text-[#087f71] md:inline-flex">Program</Link>
            <Link href="/login" className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#cbd8df] bg-white px-3 text-xs font-semibold text-[#294458] transition hover:border-[#087f71] hover:bg-[#f3faf8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f71]/40 sm:px-4">Masuk / Login</Link>
            <Link href="/register" className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#f97316] px-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#ea650b] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316]/50 focus-visible:ring-offset-2 sm:px-5">Daftar Akun</Link>
          </nav>
        </div>
      </header>
      <section className="home-welcome-banner" aria-label="Pesan selamat datang">
        <div className="home-welcome-track">
          <span>Selamat Datang di SPMB SMK Tadika Mesra Jakarta</span>
          <span aria-hidden="true">Selamat Datang di SPMB SMK Tadika Mesra Jakarta</span>
        </div>
      </section>
      <section
        className="relative isolate flex min-h-[600px] items-center overflow-hidden bg-[#071d32] text-white sm:min-h-[650px]"
      >
        <div
          className="motion-hero-image absolute inset-0 z-0 bg-cover"
          style={{ backgroundImage: "url('/images/school-courtyard.jpg')", backgroundPosition: "center 62%" }}
          aria-hidden="true"
        />
        <div
          className="motion-hero-shade absolute inset-0 z-[1] bg-gradient-to-r from-[#071d32]/80 via-[#071d32]/55 to-[#071d32]/20"
          aria-hidden="true"
        />
        <div className="relative z-10 w-full px-6 py-16 sm:px-10 lg:px-[7%] lg:py-20">
          <div className="motion-hero-copy w-full max-w-[650px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-3 py-1.5 text-[11px] font-semibold tracking-wide text-white/90">
              <span className="h-2 w-2 rounded-full bg-[#ff705e]" />
              SPMB 2026/2027
            </div>
            <h1 className="mt-7 max-w-[600px] text-[2.85rem] font-semibold leading-[1.04] tracking-[-0.035em] sm:text-6xl lg:text-[3.8rem]">
              Siap berkarya.
              <br />
              Siap melangkah
              <br />
              ke dunia nyata.
            </h1>
            <p className="mt-6 max-w-[510px] text-base leading-7 text-[#b9c7d4] sm:text-[17px] sm:leading-7">
              Bergabunglah dengan SMK Tadika Mesra Jakarta—tempat minatmu bertemu praktik industri, mentor berpengalaman, dan masa depan yang lebih terarah.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#keunggulan"
                className="inline-flex min-h-12 items-center gap-3 rounded-full border border-[#4b7899] bg-[#0c4b75] px-6 text-sm font-semibold text-white transition hover:bg-[#125b89] focus:outline-none focus:ring-2 focus:ring-white/70"
              >
                Lihat Panduan
                <BookIcon />
              </a>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-[11px] text-[#aebdcb]">
              <div className="flex -space-x-2" aria-hidden="true">
                <span className="h-6 w-6 rounded-full border-2 border-[#071d32] bg-[#ffaaa0]" />
                <span className="h-6 w-6 rounded-full border-2 border-[#071d32] bg-[#a9e4fa]" />
                <span className="h-6 w-6 rounded-full border-2 border-[#071d32] bg-[#d1f478]" />
              </div>
              <span>1.280+ siswa bertumbuh bersama kami</span>
            </div>
          </div>
        </div>
        <div className="motion-float absolute bottom-7 right-6 hidden max-w-[270px] rounded-2xl border border-white/20 bg-[#071d32]/75 p-4 text-white shadow-xl backdrop-blur-md lg:block xl:right-[7%]">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#c8f34f]">Lingkungan belajar</div>
          <p className="mt-1 text-sm font-semibold">Ruang untuk belajar, berkarya, dan bertumbuh.</p>
        </div>
      </section>

      <section aria-label="Statistik sekolah" className="bg-white px-6 py-8 sm:px-10 lg:px-[5%]">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 lg:grid-cols-4">
          {statistics.map((stat, index) => (
            <div
              key={stat.label}
              className={`px-4 py-3 sm:px-7 ${index % 2 === 0 ? "border-r border-[#d7e0e8]" : ""} ${index < 2 ? "border-b border-[#d7e0e8] lg:border-b-0" : ""} ${index === 2 ? "lg:border-r" : ""} ${index === 1 ? "lg:border-r" : ""}`}
            >
              <div className={`text-3xl font-medium tracking-[-0.04em] sm:text-[2.1rem] ${stat.accent ? "text-[#ff705e]" : "text-[#102f4c]"}`}>
                {stat.value}
              </div>
              <p className="mt-2 text-xs font-medium text-[#617387] sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="keunggulan" className="scroll-mt-8 bg-[#f7f5ef] px-6 py-16 sm:px-10 sm:py-20 lg:px-[6%] lg:py-24">
        <div className="mx-auto grid max-w-[1320px] items-center gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
          <div className="relative mx-auto aspect-[0.83] w-full max-w-[470px] overflow-hidden rounded-[24px]">
            <Image
              src="/images/students-classroom.png"
              alt="Siswa SMK belajar bersama di ruang kelas"
              fill
              sizes="(max-width: 1024px) 100vw, 470px"
              className="object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-[#134c76]">
              <span className="h-2 w-2 rounded-full bg-[#ff705e]" />
              Bukan sekadar sekolah
            </div>
            <h2 className="mt-4 max-w-[720px] text-3xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-4xl lg:text-[2.65rem]">
              Tempat kamu menemukan cara terbaik untuk tumbuh.
            </h2>
            <p className="mt-4 max-w-[740px] text-sm leading-6 text-[#6e7e8c] sm:text-base sm:leading-7">
              Di SMK Tadika Mesra Jakarta, pembelajaran dirancang agar kamu berani mencoba, mahir bekerja sama, dan percaya diri menunjukkan hasil karya.
            </p>
            <div className="mt-7 divide-y divide-[#dce2e5] border-y border-[#dce2e5]">
              {benefits.map((benefit, index) => (
                <article key={benefit.title} className="flex gap-4 py-5 sm:gap-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0d2d49] text-xs font-bold text-white">
                    0{index + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-[#102b43] sm:text-lg">{benefit.title}</h3>
                    <p className="mt-1 text-sm leading-5 text-[#71808e]">{benefit.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f5ef] px-6 pb-14 sm:px-10 lg:px-[4.2%]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-5 rounded-2xl bg-[#0b2c4b] px-6 py-6 text-white sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-3 text-base font-semibold sm:text-lg">
            <span className="text-[#c8f34f]"><SparkIcon /></span>
            Belajar nyata, karya nyata, peluang nyata.
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs text-[#c6d2dd]">
            {["Project-based learning", "Magang industri", "Bursa kerja khusus"].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#c8f34f] text-[9px] text-[#c8f34f]">✓</span>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="program" className="scroll-mt-8 bg-white px-6 py-16 sm:px-10 sm:py-20 lg:px-[4.2%]">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-[#134c76]">
                <span className="h-2 w-2 rounded-full bg-[#ff705e]" />
                Pilih jalurmu
              </div>
              <h2 className="mt-3 max-w-[620px] text-3xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-4xl">
                Empat program, banyak pintu masa depan.
              </h2>
            </div>
            <p className="max-w-[360px] text-sm leading-6 text-[#71808e]">
              Semua program memadukan fondasi akademik, praktik intensif, proyek kolaboratif, dan pengalaman bersama mitra industri.
            </p>
          </div>

          <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {programs.map((program, index) => (
              <article
                key={program.name}
                className={`program-card relative flex min-h-[390px] flex-col overflow-hidden rounded-[24px] p-6 sm:p-7 ${
                  program.theme === "software"
                    ? "justify-end bg-[#0b2b48] text-white shadow-lg shadow-[#0b2b48]/15"
                    : program.theme === "design"
                      ? "bg-[#def2fc] text-[#102b43]"
                      : program.theme === "office"
                        ? "bg-[#eff7d5] text-[#102b43]"
                        : "min-h-[340px] bg-[#ff705e] text-[#102b43] md:col-span-2 xl:col-span-3"
                }`}
              >
                {program.image ? (
                  <Image
                    src={program.image}
                    alt={program.theme === "office" ? "Suasana pembelajaran di kelas SMK Tadika Mesra Jakarta" : program.theme === "culinary" ? "Siswa merayakan kegiatan praktik di dapur kuliner sekolah" : `Kegiatan ${program.name}`}
                    fill
                    sizes={program.theme === "culinary" ? "100vw" : "(max-width: 768px) 100vw, 33vw"}
                    className={`program-card-image object-cover ${program.theme === "software" ? "opacity-55" : ""} ${program.theme === "culinary" ? "blur-[2px] scale-[1.03] brightness-75" : ""}`}
                  />
                ) : null}
                {program.theme === "software" ? (
                  <div className="absolute inset-0 bg-gradient-to-t from-[#061b30] via-[#061b30]/50 to-[#061b30]/10" />
                ) : null}
                {program.theme === "design" ? (
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#061b30]/95 via-[#061b30]/35 to-[#061b30]/10" aria-hidden="true" />
                ) : null}
                {program.theme === "office" ? (
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#eff7d5] via-[#eff7d5]/75 to-[#eff7d5]/5" aria-hidden="true" />
                ) : null}
                {program.theme === "culinary" ? (
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#ff705e]/90 via-[#ff705e]/50 to-[#ff705e]/10" aria-hidden="true" />
                ) : null}
                <div className="relative z-10 flex h-full flex-col">
                  <div className="flex items-center justify-between">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${program.theme === "software" || program.theme === "design" ? "bg-[#c8f34f] text-[#10253a]" : "bg-white/80 text-[#12314d]"}`}>
                      {program.number}
                    </span>
                    {program.theme !== "software" ? (
                      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${program.theme === "design" ? "bg-white/90 text-[#12314d]" : "bg-white/80 text-[#12314d]"}`}>
                        <ProgramIcon kind={program.theme} />
                      </span>
                    ) : null}
                  </div>
                  <div className={`mt-auto ${program.theme === "culinary" ? "max-w-[56%]" : ""} ${program.theme !== "software" && program.theme !== "culinary" ? "pt-28" : ""}`}>
                    <h3 className={`text-2xl font-semibold leading-tight tracking-[-0.02em] ${program.theme === "software" || program.theme === "design" ? "text-white" : ""} ${program.theme === "software" ? "sm:text-[1.7rem]" : ""}`}>
                      {program.name}
                    </h3>
                    <p className={`mt-3 max-w-[560px] text-sm leading-6 ${program.theme === "software" || program.theme === "design" ? "text-white/80" : "text-[#40586a]"}`}>
                      {program.description}
                    </p>
                    {program.tags ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {program.tags.map((tag) => (
                          <span key={tag} className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] text-white/85">{tag}</span>
                        ))}
                      </div>
                    ) : (
                      <a href="#keunggulan" className={`mt-4 inline-flex items-center gap-2 text-xs font-bold ${program.theme === "design" ? "text-white" : ""}`}>
                        Jelajahi program <ArrowIcon className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
                {index === 0 ? <span className="sr-only">Program unggulan</span> : null}
              </article>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-2xl bg-[#f7f5ef] px-6 py-7 sm:flex-row sm:items-center sm:px-8">
            <div>
              <h3 className="text-lg font-semibold">Siap memulai langkah pertamamu?</h3>
              <p className="mt-1 text-sm text-[#71808e]">Buat akun calon siswa dan ikuti proses pendaftaran secara online.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/register" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#c8f34f] px-5 text-sm font-bold text-[#10253a] transition hover:bg-[#d6ff65]">
                Daftar Sekarang <ArrowIcon />
              </Link>
              <Link href="/login" className="inline-flex min-h-11 items-center rounded-full border border-[#cad4db] px-5 text-sm font-semibold text-[#102b43] transition hover:bg-white">
                Masuk
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ScrollReveal>
      <section id="jadwal" className="scroll-mt-8 bg-[#071d32] px-6 py-16 text-white sm:px-10 sm:py-20 lg:px-[6.7%]">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-[#c8f34f]">
                <span className="h-2 w-2 rounded-full bg-[#ff705e]" />
                Catat tanggalnya
              </div>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-[2.6rem]">Jadwal SPMB 2026/2027</h2>
              <p className="mt-3 text-sm text-[#b9c7d4] sm:text-base">Daftar lebih awal untuk peluang kuota dan benefit terbaik.</p>
            </div>
            <a
              href={`data:text/calendar;charset=utf-8,${encodeURIComponent(calendarContent)}`}
              download="jadwal-spmb-smk-tadika-mesra-2026-2027.ics"
              className="inline-flex min-h-12 items-center justify-center gap-3 self-start rounded-full bg-white px-5 text-sm font-bold text-[#102b43] transition hover:bg-[#c8f34f] focus:outline-none focus:ring-2 focus:ring-white sm:self-auto"
            >
              Unduh Kalender
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
                <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 17v3h14v-3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
            {admissionSchedule.map((item, index) => (
              <article key={item.label} className="timeline-item relative border-t border-white/25 pt-5" style={{ animationDelay: `${index * 100}ms` }}>
                <span className={`absolute -top-[5px] left-0 h-[9px] w-[9px] rounded-full ${item.active ? "bg-[#ff705e]" : "bg-[#c8f34f]"}`} />
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#c8f34f]">{item.label}</p>
                <p className="mt-3 text-lg font-semibold tracking-[-0.02em] sm:text-xl">{item.date}</p>
                <p className="mt-2 text-xs text-[#a9b9c8]">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      </ScrollReveal>

      <ScrollReveal>
      <section id="persyaratan" className="scroll-mt-8 bg-[#f7f5ef] px-6 py-16 sm:px-10 sm:py-20 lg:px-[5.5%]">
        <div className="mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-[#134c76]">
              <span className="h-2 w-2 rounded-full bg-[#ff705e]" />
              Siapkan dari sekarang
            </div>
            <h2 className="mt-4 max-w-[440px] text-3xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-4xl">Persyaratan pendaftaran</h2>
            <p className="mt-4 max-w-[420px] text-sm leading-6 text-[#71808e]">Dokumen dapat dilengkapi bertahap sebelum asesmen berlangsung.</p>

            <div className="mt-7 rounded-[22px] border border-[#e0e7e8] bg-white px-5 py-2 sm:px-6">
              {requirements.map((requirement) => (
                <div key={requirement} className="flex items-start gap-3 border-b border-[#e4eaed] py-3.5 last:border-0">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#eff8d8] text-[#51712a]">
                    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-3 w-3 fill-none stroke-current stroke-2">
                      <path d="m4 10 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-xs leading-5 text-[#425a6d] sm:text-sm">{requirement}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl bg-[#def2fc] p-4 text-xs leading-5 text-[#315f80]">
              Belum punya rapor lengkap? Hubungi panitia SPMB untuk mendapatkan informasi dokumen pengganti.
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-[#134c76]">
              <span className="h-2 w-2 rounded-full bg-[#ff705e]" />
              Serba digital & sederhana
            </div>
            <h2 className="mt-4 max-w-[620px] text-3xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-4xl">Lima langkah menuju kelas impianmu.</h2>
            <p className="mt-4 text-sm leading-6 text-[#71808e]">Seluruh proses awal dapat dilakukan dari rumah melalui portal pendaftaran.</p>
            <div className="mt-6 divide-y divide-[#dce2e5] border-y border-[#dce2e5]">
              {registrationSteps.map((step, index) => (
                <article key={step.title} className="process-step group flex items-start gap-4 py-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0d2d49] text-xs font-bold text-white">0{index + 1}</span>
                    <span className="min-w-0 flex-1 pt-1">
                      <span className="block text-sm font-bold text-[#102b43] sm:text-base">{step.title}</span>
                      <span className="mt-1 block text-xs leading-5 text-[#71808e]">{step.detail}</span>
                    </span>
                    <ArrowIcon className="mt-1 h-4 w-4 shrink-0 text-[#ff705e]" />
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
      </ScrollReveal>

      <ScrollReveal>
      <section id="biaya" className="scroll-mt-8 bg-[#eff8d6] px-6 py-16 sm:px-10 sm:py-20 lg:px-[5.5%]">
        <div className="mx-auto grid max-w-[1320px] items-center gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-14">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-[#134c76]">
              <span className="h-2 w-2 rounded-full bg-[#ff705e]" />
              Investasi pendidikan
            </div>
            <h2 className="mt-4 max-w-[470px] text-3xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-4xl">Biaya transparan, pilihan pembayaran fleksibel.</h2>
            <p className="mt-4 max-w-[470px] text-sm leading-6 text-[#657b76]">Informasi biaya dapat dikonfirmasi kepada panitia agar keluarga dapat merencanakan pendidikan dengan tenang.</p>
            <div className="mt-6 rounded-[22px] bg-[#071d32] p-5 text-white sm:p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c8f34f]">Estimasi tahun pertama</p>
              <p className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-[2.4rem]">Mulai Rp1,35 jt / bulan</p>
              <p className="mt-3 text-xs leading-5 text-white/60">Nilai merupakan estimasi ilustratif. Rincian biaya dan skema pembayaran mengikuti informasi resmi panitia.</p>
              <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-4 text-xs">
                <span className="text-white/65">Biaya formulir Gelombang 1</span>
                <span className="font-bold text-[#c8f34f]">GRATIS</span>
              </div>
            </div>
            <a href="#beasiswa" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#ff705e] px-5 text-sm font-bold text-[#102b43] transition hover:bg-[#ff897a]">
              Lihat pilihan beasiswa <ArrowIcon />
            </a>
          </div>

          <div id="beasiswa" className="scroll-mt-8">
            <h3 className="text-xl font-semibold tracking-[-0.025em] text-[#102b43] sm:text-2xl">Program beasiswa yang bisa kamu pilih</h3>
            <div className="mt-5 space-y-3">
              {scholarships.map((scholarship) => (
                <article key={scholarship.title} className="scholarship-card flex items-start gap-4 rounded-[18px] border border-[#dce6c7] bg-white p-4 sm:p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#c8f34f] text-[#183b36]">
                    {scholarship.icon === "trophy" ? (
                      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-[1.7]">
                        <path d="M8 4h8v5a4 4 0 0 1-8 0V4Zm0 2H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4m-4 3v3m-4 2h8m-4-5v3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : scholarship.icon === "heart" ? (
                      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-[1.7]">
                        <path d="M20.8 8.8c0 4.2-8.8 10-8.8 10s-8.8-5.8-8.8-10A4.8 4.8 0 0 1 12 6a4.8 4.8 0 0 1 8.8 2.8Z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-[1.7]">
                        <circle cx="9" cy="8" r="3" /><path d="M3 20v-1a6 6 0 0 1 12 0v1m1-15a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4.6V20" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-[#102b43] sm:text-base">{scholarship.title}</h4>
                    <p className="mt-1 text-xs leading-5 text-[#71808e]">{scholarship.detail}</p>
                  </div>
                  <ArrowIcon className="mt-1 h-4 w-4 shrink-0 text-[#ff705e]" />
                </article>
              ))}
            </div>
            <p className="mt-4 text-[10px] leading-5 text-[#73847e]">Ketersediaan dan besaran beasiswa mengikuti hasil verifikasi dokumen serta ketentuan sekolah.</p>
          </div>
        </div>
      </section>
      </ScrollReveal>

      <ScrollReveal>
      <section className="bg-white px-6 py-16 sm:px-10 sm:py-20 lg:px-[5.5%]">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-[#134c76]">
                <span className="h-2 w-2 rounded-full bg-[#ff705e]" />
                Suara dari ruang belajar
              </div>
              <h2 className="mt-3 max-w-[650px] text-3xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-4xl">Cerita yang dimulai dari keberanian mencoba.</h2>
            </div>
            <p className="max-w-[330px] text-xs leading-5 text-[#71808e]">Contoh pengalaman belajar di berbagai program keahlian.</p>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article key={testimonial.name} className="testimonial-card flex min-h-[245px] flex-col justify-between rounded-[24px] bg-[#f7f5ef] p-5 sm:p-6">
                <div>
                  <span className="text-3xl leading-none text-[#ff705e]" aria-hidden="true">“</span>
                  <blockquote className="mt-3 text-base font-semibold leading-6 text-[#102b43]">“{testimonial.quote}”</blockquote>
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-[#102b43] ${testimonial.tone === "coral" ? "bg-[#ff705e]" : testimonial.tone === "lime" ? "bg-[#c8f34f]" : "bg-[#def2fc]"}`}>{testimonial.initials}</span>
                  <span>
                    <span className="block text-xs font-bold text-[#102b43]">{testimonial.name}</span>
                    <span className="mt-0.5 block text-[10px] text-[#71808e]">{testimonial.detail}</span>
                  </span>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-4 text-[10px] text-[#87939c]">Kutipan di atas merupakan ilustrasi pengalaman belajar, bukan testimoni terverifikasi.</p>
        </div>
      </section>
      </ScrollReveal>

      <ScrollReveal>
      <section id="faq" className="scroll-mt-8 bg-[#f7f5ef] px-6 py-16 sm:px-10 sm:py-20 lg:px-[5.5%]">
        <div className="mx-auto grid max-w-[1320px] gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-[#134c76]">
              <span className="h-2 w-2 rounded-full bg-[#ff705e]" />
              Yang sering ditanyakan
            </div>
            <h2 className="mt-4 max-w-[400px] text-3xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-4xl">Masih ada yang ingin kamu pastikan?</h2>
            <p className="mt-4 max-w-[380px] text-sm leading-6 text-[#71808e]">Temukan jawaban singkat tentang pendaftaran, program, dan pengalaman belajar.</p>
            <div className="mt-6 rounded-2xl bg-[#def2fc] p-5 text-[#183b56]">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#275d84]">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-[1.7]">
                  <path d="M4 5h16v11H9l-5 4V5Z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <h3 className="mt-3 text-sm font-bold">Butuh jawaban personal?</h3>
              <p className="mt-1 text-xs leading-5 text-[#58748a]">Tim SPMB siap membantu pada hari kerja melalui portal pendaftaran.</p>
              <Link href="/register" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#174e75]">Mulai pendaftaran <ArrowIcon className="h-3 w-3" /></Link>
            </div>
          </div>
          <div className="divide-y divide-[#dce2e5] border-y border-[#dce2e5]">
            {questions.map((item, index) => (
              <details key={item.question} className="faq-item group py-4" open={index === 0}>
                <summary className="flex cursor-pointer list-none items-start gap-4 text-sm font-semibold text-[#102b43] [&::-webkit-details-marker]:hidden">
                  <span className="flex-1 leading-6">{item.question}</span>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#d7e0e5] text-base font-normal text-[#526e81] transition group-open:border-[#ff705e] group-open:bg-[#ff705e] group-open:text-[#102b43]">
                    <span className="group-open:hidden" aria-hidden="true">＋</span>
                    <span className="hidden group-open:inline" aria-hidden="true">−</span>
                  </span>
                </summary>
                <p className="faq-answer ml-0 mt-3 max-w-[700px] pr-11 text-xs leading-5 text-[#71808e] sm:ml-1">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      </ScrollReveal>

      <ScrollReveal>
      <section className="overflow-hidden bg-[#ff705e]">
        <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[1.2fr_0.8fr]">
          <div className="px-6 py-14 sm:px-10 sm:py-16 lg:pl-[9%]">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#102b43]">Masa depan tidak menunggu</p>
            <h2 className="mt-3 max-w-[650px] text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-[#102b43] sm:text-4xl">Mulai satu langkah berani hari ini.</h2>
            <p className="mt-4 max-w-[550px] text-sm leading-6 text-[#27485b]">Amankan tempatmu di SMK Tadika Mesra Jakarta untuk tahun ajaran 2026/2027.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/register" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-[#102b43] transition hover:bg-[#c8f34f]">
                Daftar Sekarang <ArrowIcon />
              </Link>
              <Link href="/login" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#102b43]/50 px-5 text-sm font-bold text-[#102b43] transition hover:bg-white/20">
                Masuk ke akun
              </Link>
            </div>
          </div>
          <div className="relative min-h-[260px] overflow-hidden lg:min-h-[340px]">
            <Image
              src="/images/students-classroom-study.png"
              alt="Siswa SMK belajar bersama di ruang kelas"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="cta-image object-cover"
            />
          </div>
        </div>
      </section>
      </ScrollReveal>

      <footer className="bg-[#071d32] px-6 py-10 text-white sm:px-10 lg:px-[5.5%]">
        <div className="mx-auto grid max-w-[1320px] gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.7fr_0.8fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <Image src="/images/smk-tadika-mesra-seal.png" alt="Lambang SMK Tadika Mesra Jakarta" width={48} height={48} className="h-10 w-10 shrink-0 rounded-full bg-white p-0.5 object-contain" />
              <span>
                <span className="block text-xs font-bold">SMK TADIKA MESRA JAKARTA</span>
                <span className="mt-1 block text-[9px] uppercase tracking-[0.1em] text-white/50">Sekolah vokasi · Est. 2002</span>
              </span>
            </Link>
            <p className="mt-4 max-w-[340px] text-xs leading-5 text-white/60">Sekolah vokasi yang mendukung siswa belajar, berkarya, dan menemukan jalan masa depannya.</p>
          </div>
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#c8f34f]">Jelajahi</h3>
            <ul className="mt-3 space-y-2.5 text-xs text-white/65">
              <li><a href="#keunggulan" className="transition hover:text-white">Tentang sekolah</a></li>
              <li><a href="#program" className="transition hover:text-white">Program keahlian</a></li>
              <li><a href="#jadwal" className="transition hover:text-white">Jadwal pendaftaran</a></li>
              <li><a href="#persyaratan" className="transition hover:text-white">Syarat & alur</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#c8f34f]">Portal SPMB</h3>
            <ul className="mt-3 space-y-2.5 text-xs text-white/65">
              <li><Link href="/register" className="transition hover:text-white">Daftar calon siswa</Link></li>
              <li><Link href="/login" className="transition hover:text-white">Masuk ke portal</Link></li>
              <li><a href="#biaya" className="transition hover:text-white">Biaya pendidikan</a></li>
              <li><a href="#faq" className="transition hover:text-white">Pertanyaan umum</a></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-8 flex max-w-[1320px] flex-col gap-2 border-t border-white/15 pt-5 text-[10px] text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 SMK Tadika Mesra Jakarta. Informasi jadwal dan biaya dapat berubah.</span>
          <span>SPMB 2026/2027 · Jakarta</span>
        </div>
      </footer>
    </main>
  );
}
