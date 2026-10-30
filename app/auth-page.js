"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getSession,
  roleConfig,
  saveSession,
} from "@/app/lib/auth";

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M9.55 18.2 3.8 12.45l1.4-1.4 4.35 4.35L18.8 4.7l1.4 1.4-10.65 12.1Z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-2">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.75" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-2">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-2">
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-2">
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z" />
      <path d="m5 7 7 5 7-5" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M7.5 3.5A2.5 2.5 0 0 1 10 1h4a2.5 2.5 0 0 1 2.5 2.5v1.9h1.8A2.7 2.7 0 0 1 21 8.1v9.7A2.7 2.7 0 0 1 18.3 20.5H5.7A2.7 2.7 0 0 1 3 17.8V8.1a2.7 2.7 0 0 1 2.7-2.7h1.8V3.5Zm3 0h3v1.9h-3V3.5Zm-3.5 6.6c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1Zm9 0c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1Zm-6 3.5c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1Zm3 0c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1Zm3 0c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1Z" />
    </svg>
  );
}

const perks = [
  "Pendaftaran lebih terarah",
  "Informasi mudah dipahami",
  "Berkas, jadwal, dan pembayaran yang jelas",
];

const roleList = [
  { key: "pelajar", label: "Calon Siswa" },
  { key: "admin", label: "Admin SPMB" },
  { key: "kepala", label: "Kepala Sekolah" },
];

const defaultLoginState = {
  email: "",
  password: "",
};

const defaultRegisterState = {
  name: "",
  birthDate: "",
  parentName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  agree: false,
};

const showcaseImages = [
  {
    name: "portal-hero.png",
    title: "SMK Tadika Mesra Jakarta",
    subtitle: "Portal penerimaan siswa baru",
  },
  {
    name: "student-portfolio.png",
    title: "Portfolio siswa",
    subtitle: "Belajar berbasis proyek",
  },
  {
    name: "art-class.png",
    title: "Kelas kreatif",
    subtitle: "24 tahun menginspirasi",
  },
  {
    name: "cooking-class.png",
    title: "Praktik kuliner",
    subtitle: "Pembelajaran industri",
  },
];

export default function AuthPage({ initialMode = "login" }) {
  const router = useRouter();
  const [mode, setMode] = useState(initialMode);
  const [selectedRole, setSelectedRole] = useState("pelajar");
  const [loginForm, setLoginForm] = useState(defaultLoginState);
  const [registerForm, setRegisterForm] = useState(defaultRegisterState);
  const [errorMessage, setErrorMessage] = useState("");
  const [registerMessage, setRegisterMessage] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) return;

    if (session.role === "pelajar") router.push("/pelajar");
    if (session.role === "admin") router.push("/admin");
    if (session.role === "kepala") router.push("/kepala-sekolah");
  }, [router]);

  const currentRoleLabel = roleConfig[selectedRole]?.label || "Calon Siswa";

  const updateLoginField = (field) => (event) => {
    setLoginForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const updateRegisterField = (field) => (event) => {
    const value = field === "agree" ? event.target.checked : event.target.value;
    setRegisterForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "login", role: selectedRole, ...loginForm }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        setErrorMessage(result.message || `Akun ${currentRoleLabel} tidak ditemukan atau kata sandi salah.`);
        return;
      }
      saveSession(result.user);
      setErrorMessage("");
      if (selectedRole === "pelajar") router.push("/pelajar");
      if (selectedRole === "admin") router.push("/admin");
      if (selectedRole === "kepala") router.push("/kepala-sekolah");
    } catch (error) {
      console.error("Login gagal menghubungi server sekolah.", error);
      setErrorMessage("Login tidak dapat diverifikasi. Periksa koneksi server dan coba lagi.");
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    if (!registerForm.name.trim() || !registerForm.parentName.trim() || !registerForm.phone.trim()) {
      setRegisterMessage("Lengkapi nama calon siswa, nama orang tua/wali, dan nomor WhatsApp.");
      return;
    }

    if (!registerForm.birthDate) {
      setRegisterMessage("Pilih tanggal lahir pelajar yang valid.");
      return;
    }

    const birthDate = new Date(`${registerForm.birthDate}T00:00:00Z`);
    if (Number.isNaN(birthDate.getTime()) || birthDate.toISOString().slice(0, 10) !== registerForm.birthDate) {
      setRegisterMessage("Tanggal lahir tidak valid. Pilih tanggal dari kalender.");
      return;
    }
    if (birthDate > new Date()) {
      setRegisterMessage("Tanggal lahir tidak boleh berada di masa depan.");
      return;
    }

    const email = registerForm.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setRegisterMessage("Masukkan alamat email yang valid.");
      return;
    }

    if (registerForm.password.length < 8 || !/[A-Za-z]/.test(registerForm.password) || !/\d/.test(registerForm.password)) {
      setRegisterMessage("Kata sandi harus minimal 8 karakter serta mengandung huruf dan angka.");
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setRegisterMessage("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    if (!registerForm.agree) {
      setRegisterMessage("Silakan centang persetujuan sebelum melanjutkan.");
      return;
    }

    try {
      const response = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "register",
          name: registerForm.name,
          birthDate: registerForm.birthDate,
          parentName: registerForm.parentName,
          email,
          phone: registerForm.phone,
          password: registerForm.password,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        setRegisterMessage(result.message || "Pendaftaran gagal disimpan di server sekolah.");
        return;
      }
      saveSession(result.user);
    } catch (error) {
      console.error("Pendaftaran tidak dapat disinkronkan ke portal sekolah.", error);
      setRegisterMessage(`${error.message} Periksa koneksi server dan coba lagi.`);
      return;
    }

    setRegisterMessage("");
    router.push("/pelajar");
  };

  return (
    <main className="min-h-screen bg-[#000000] px-3 py-5 sm:px-5 lg:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-[1360px] overflow-hidden rounded-[18px] border border-[#0b0b0b] bg-[#f3f4f2] shadow-[0_0_0_2px_rgba(255,255,255,0.08)]">
        <section className="flex w-full flex-col justify-between bg-[#0c665f] px-7 py-7 text-white sm:px-8 lg:w-[46%] lg:px-9 lg:py-8">
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/images/smk-tadika-mesra-seal.png"
                alt="Lambang SMK Tadika Mesra Jakarta"
                width={44}
                height={44}
                className="h-11 w-11 shrink-0 rounded-md bg-white object-contain"
              />
              <div>
                <div className="text-[12px] font-semibold tracking-[0.02em] text-white/90">SMK Tadika Mesra Jakarta</div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/70">Jakarta · Portal penerimaan SMK</div>
              </div>
            </div>

            <div className="mt-14 text-[11px] font-medium uppercase tracking-[0.28em] text-white/75">
              SPMB · Tahun ajaran 2027 / 2028
            </div>

            <h1 className="mt-8 max-w-[520px] text-[3.5rem] font-black leading-[0.9] tracking-[-0.07em] text-white sm:text-[4.2rem]">
              {mode === "register" ? "Mulai langkah pertama," : "Langkah awal SMK,"}
              <br />
              {mode === "register" ? "menuju masa depan" : "masa depan yang"}
              <br />
              {mode === "register" ? "SMK." : "berarti."}
            </h1>

            <p className="mt-8 max-w-[420px] text-base leading-7 text-white/75">
              {mode === "register"
                ? "Selamat datang di portal penerimaan calon siswa SMK Tadika Mesra Jakarta. Mulai proses pendaftaran dengan mudah dan terarah."
                : "Selamat datang di portal penerimaan calon siswa baru SMK Tadika Mesra Jakarta. Mulai perjalanan belajar SMK dengan mudah dan terarah."}
            </p>

            <div className="mt-9 space-y-3">
              <div className="overflow-hidden rounded-[22px] border border-white/20 bg-[#dfe8e3] shadow-[0_20px_38px_rgba(0,0,0,0.15)]">
                <div
                  className="aspect-[1.3] w-full bg-cover bg-center"
                  style={{
                    backgroundImage: "url('/images/portal-hero.png')",
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                  }}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                {showcaseImages.slice(1).map((image) => (
                  <div
                    key={image.name}
                    className="overflow-hidden rounded-[16px] border border-white/20 bg-[#dfe8e3] shadow-[0_12px_24px_rgba(0,0,0,0.1)]"
                  >
                    <div
                      className="aspect-[1.2] w-full bg-cover bg-center"
                      style={{
                        backgroundImage: `url('/images/${image.name}')`,
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3 pb-1 text-sm text-white/80">
            {perks.map((perk) => (
              <div key={perk} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[#d6f3ee]">
                  <CheckIcon />
                </span>
                <span>{perk}</span>
              </div>
            ))}

            <div className="pt-4 text-[11px] leading-5 text-white/55">
              Foto, perolehan data, dan informasi yang disediakan di halaman ini merupakan contoh ilustrasi. Sumber bisa diubah sesuai kebutuhan.
            </div>
          </div>
        </section>

        <section className="flex-1 bg-[#f5f6f4] px-6 py-7 text-[#123430] sm:px-8 lg:px-10 lg:py-8">
          {mode === "register" ? (
            <form onSubmit={handleRegister}>
              <div className="mx-auto flex max-w-[620px] flex-wrap items-center justify-between gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full border border-[#c7d4d1] bg-white/70 px-3.5 py-2 text-sm font-semibold text-[#123430] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#5b9b95]"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-2">
                    <path d="m14.5 5-7 7 7 7M8 12h13" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Kembali ke beranda
                </Link>
                <div className="flex items-center gap-3">
                  <div className="text-[14px] text-[#1f4c4a]">Sudah punya akun?</div>
                  <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="inline-flex items-center gap-2 rounded-full border border-[#c7d4d1] bg-white/80 px-4 py-2 text-sm font-semibold text-[#123430] shadow-sm transition hover:bg-white"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                      <path d="M10.5 8.5a1.5 1.5 0 0 1 1.5-1.5h7A1.5 1.5 0 0 1 20.5 8.5v7a1.5 1.5 0 0 1-1.5 1.5h-7a1.5 1.5 0 0 1-1.5-1.5v-7Zm-7 2A1.5 1.5 0 0 1 5 9v7a1.5 1.5 0 0 1-1.5 1.5h-2A1.5 1.5 0 0 1-.5 16v-7A1.5 1.5 0 0 1 1 7.5h2A1.5 1.5 0 0 1 4.5 9v1.5h7V9A1.5 1.5 0 0 1 13 7.5h.5v-1a3 3 0 1 0-6 0v1H6.5A1.5 1.5 0 0 1 5 7.5V7h-.5A1.5 1.5 0 0 1 3 5.5v-1A1.5 1.5 0 0 1 4.5 3h7.5A1.5 1.5 0 0 1 13.5 4.5v1H15v1.5H5.5Z" />
                    </svg>
                    Masuk akun
                  </button>
                </div>
              </div>

              <div className="mx-auto mt-7 max-w-[620px]">
                <div className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[#1b5e5a]">
                  Akun calon siswa
                </div>

                <h2 className="text-[3rem] font-black leading-[1.02] tracking-[-0.06em] text-[#123631]">
                  Mulai pendaftaran SMK.
                </h2>

                <p className="mt-3 max-w-[560px] text-base leading-7 text-[#53706b]">
                  Buat akun pelajar untuk mengikuti pendaftaran SMK. Orang tua atau wali dapat membantu mengisi pendaftaran.
                </p>

                <div className="mt-5 rounded-xl border border-[#bfe0d9] bg-[#e8f5f1] px-4 py-3 text-sm text-[#0c544f]">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#1d6d65] text-white">
                      <CheckIcon />
                    </div>
                    <span>
                      Pendaftaran publik hanya untuk Calon Siswa. Akun Admin SPMB dan Kepala Sekolah dapat disediakan di pengelola.
                    </span>
                  </div>
                </div>

                {registerMessage ? (
                  <div className="mt-5 rounded-xl border border-[#f4d4c7] bg-[#fff1ec] px-4 py-3 text-sm text-[#8a3d2d]">
                    {registerMessage}
                  </div>
                ) : null}

                <div className="mt-6 space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#23453f]">
                      Nama lengkap calon siswa <span className="text-[#1d6d65]">*</span>
                    </label>
                    <input
                      value={registerForm.name}
                      onChange={updateRegisterField("name")}
                      className="h-12 w-full rounded-md border border-[#d8e0dd] bg-white px-3 text-[15px] text-[#183b38] placeholder:text-[#7d8e8a] focus:border-[#5b9b95] focus:outline-none"
                      placeholder="Nama sesuai akta kelahiran atau ijazah"
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#23453f]">
                        Tanggal lahir pelajar <span className="text-[#1d6d65]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={registerForm.birthDate}
                          onChange={updateRegisterField("birthDate")}
                          max={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`}
                          required
                          className="h-12 w-full rounded-md border border-[#d8e0dd] bg-white px-3 pr-10 text-[15px] text-[#183b38] placeholder:text-[#7d8e8a] focus:border-[#5b9b95] focus:outline-none"
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#4d6d68]">
                          <CalendarIcon />
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#23453f]">
                        Nama orang tua / wali <span className="text-[#1d6d65]">*</span>
                      </label>
                      <input
                        value={registerForm.parentName}
                        onChange={updateRegisterField("parentName")}
                        className="h-12 w-full rounded-md border border-[#d8e0dd] bg-white px-3 text-[15px] text-[#183b38] placeholder:text-[#7d8e8a] focus:border-[#5b9b95] focus:outline-none"
                        placeholder="Nama lengkap orang tua / wali"
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#23453f]">
                        Alamat email <span className="text-[#1d6d65]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={registerForm.email}
                          onChange={updateRegisterField("email")}
                          className="h-12 w-full rounded-md border border-[#d8e0dd] bg-white px-3 pr-10 text-[15px] text-[#183b38] placeholder:text-[#7d8e8a] focus:border-[#5b9b95] focus:outline-none"
                          placeholder="nama@contoh.id"
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#4d6d68]">
                          <MailIcon />
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#23453f]">
                        Nomor WhatsApp wali <span className="text-[#1d6d65]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          value={registerForm.phone}
                          onChange={updateRegisterField("phone")}
                          className="h-12 w-full rounded-md border border-[#d8e0dd] bg-white px-3 pr-10 text-[15px] text-[#183b38] placeholder:text-[#7d8e8a] focus:border-[#5b9b95] focus:outline-none"
                          placeholder="0xxxxxxxxx"
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#4d6d68]">
                          <PhoneIcon />
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#23453f]">
                      Kata sandi <span className="text-[#1d6d65]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showRegisterPassword ? "text" : "password"}
                        value={registerForm.password}
                        onChange={updateRegisterField("password")}
                        className="h-12 w-full rounded-md border border-[#d8e0dd] bg-white px-3 pr-10 text-[15px] text-[#183b38] placeholder:text-[#7d8e8a] focus:border-[#5b9b95] focus:outline-none"
                        placeholder="Buat kata sandi"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4d6d68]"
                        aria-label="Toggle password visibility"
                      >
                        <EyeIcon />
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-[#55726c]">Minimal 8 karakter, dengan huruf dan angka.</div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#23453f]">
                      Konfirmasi kata sandi <span className="text-[#1d6d65]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showRegisterPassword ? "text" : "password"}
                        value={registerForm.confirmPassword}
                        onChange={updateRegisterField("confirmPassword")}
                        className="h-12 w-full rounded-md border border-[#d8e0dd] bg-white px-3 pr-10 text-[15px] text-[#183b38] placeholder:text-[#7d8e8a] focus:border-[#5b9b95] focus:outline-none"
                        placeholder="Ulangi kata sandi"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4d6d68]"
                        aria-label="Toggle password visibility"
                      >
                        <EyeIcon />
                      </button>
                    </div>
                  </div>

                  <label className="flex items-start gap-3 pt-2 text-sm leading-6 text-[#123430]">
                    <input
                      type="checkbox"
                      checked={registerForm.agree}
                      onChange={updateRegisterField("agree")}
                      className="mt-1 h-4 w-4 rounded border-[#b7c7c4] accent-[#0f5b57]"
                    />
                    <span>
                      Saya menyetujui ketentuan penggunaan dan kebijakan privasi serta memastikan data yang diisi benar dan dapat dipertanggungjawabkan.
                    </span>
                  </label>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f5b57] px-5 py-3.5 text-base font-bold text-white shadow-[0_12px_25px_rgba(15,91,87,0.25)] transition hover:bg-[#0d514d]"
                    >
                      <span>Buat akun calon siswa</span>
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                        <ArrowIcon />
                      </span>
                    </button>
                    <div className="mt-5 text-center text-sm text-[#67817c]">
                      Setelah akun dibuat, lakukan formulir dan berkas pendaftaran SMK.
                    </div>
                  </div>

                  <div className="pt-1 text-center">
                    <div className="text-sm font-semibold text-[#1d6d65]">Kesulitan membuat akun? Hubungi panitia</div>
                    <div className="mt-1 text-xs leading-5 text-[#6c7e7a]">
                      Tim panitia dapat membantu Anda melalui layanan WhatsApp maupun email resmi sekolah.
                    </div>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin}>
              <div className="mx-auto flex max-w-[620px] flex-wrap items-center justify-between gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full border border-[#c7d4d1] bg-white/70 px-3.5 py-2 text-sm font-semibold text-[#123430] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#5b9b95]"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-2">
                    <path d="m14.5 5-7 7 7 7M8 12h13" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Kembali ke beranda
                </Link>
                <div className="flex items-center gap-3">
                  <div className="text-[14px] text-[#1f4c4a]">Belum punya akun?</div>
                  <button
                    type="button"
                    onClick={() => router.push("/register")}
                    className="inline-flex items-center gap-2 rounded-full border border-[#c7d4d1] bg-white/80 px-4 py-2 text-sm font-semibold text-[#123430] shadow-sm transition hover:bg-white"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                      <path d="M9 12h6v2H9v6H7v-6H1v-2h6V6h2v6Zm12-6v12h-2V6h2Z" />
                    </svg>
                    Daftar akun pelajar
                  </button>
                </div>
              </div>

              <div className="mx-auto mt-7 max-w-[620px]">
                <div className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[#1b5e5a]">
                  Selamat datang kembali
                </div>

                <h2 className="text-[3rem] font-black leading-[1.02] tracking-[-0.06em] text-[#123631]">
                  Masuk ke portal penerimaan SMK.
                </h2>

                <p className="mt-3 max-w-[560px] text-base leading-7 text-[#53706b]">
                  Pilih jenis akun Anda dan lanjutkan proses penerimaan calon siswa SMK.
                </p>

                <div className="mt-7 grid gap-4 sm:grid-cols-3">
                  {roleList.map((item) => (
                    <button
                      type="button"
                      key={item.key}
                      onClick={() => setSelectedRole(item.key)}
                      className={`flex h-[108px] flex-col items-center justify-center rounded-xl border text-center transition ${
                        selectedRole === item.key
                          ? "border-[#6bb4a8] bg-[#eaf7f3] text-[#0a544f] shadow-[0_0_0_1px_rgba(74,154,138,0.25)]"
                          : "border-[#d8e0dd] bg-white text-[#123430] hover:bg-[#f5f8f7]"
                      }`}
                    >
                      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full border border-current bg-white/40">
                        {item.key === "pelajar" ? (
                          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                            <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
                          </svg>
                        ) : item.key === "admin" ? (
                          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                            <path d="M7 3.5A2.5 2.5 0 0 1 9.5 1h5A2.5 2.5 0 0 1 17 3.5V4h1.5A2.5 2.5 0 0 1 21 6.5v12A2.5 2.5 0 0 1 18.5 21h-13A2.5 2.5 0 0 1 3 18.5v-12A2.5 2.5 0 0 1 5.5 4H7v-.5Zm2 2.5h6V4h-6v2Zm-3 2.5v11.5h12V8.5H6Z" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                            <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-11Zm3 2.5h10v2H7V9Zm0 4h10v2H7v-2Z" />
                          </svg>
                        )}
                      </div>
                      <span className="text-[13px] font-medium">{item.key === "pelajar" ? "Calon Siswa" : item.label}</span>
                    </button>
                  ))}
                </div>

                {errorMessage ? (
                  <div className="mt-5 rounded-xl border border-[#f4d4c7] bg-[#fff1ec] px-4 py-3 text-sm text-[#8a3d2d]">
                    {errorMessage}
                  </div>
                ) : null}

                <div className="mt-7 space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#23453f]">Alamat email</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={loginForm.email}
                        onChange={updateLoginField("email")}
                        className="h-12 w-full rounded-md border border-[#d8e0dd] bg-white px-3 pr-10 text-[15px] text-[#183b38] placeholder:text-[#7d8e8a] focus:border-[#5b9b95] focus:outline-none"
                        placeholder="Masukkan email terdaftar"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#4d6d68]">
                        <MailIcon />
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#23453f]">Kata sandi</label>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        value={loginForm.password}
                        onChange={updateLoginField("password")}
                        className="h-12 w-full rounded-md border border-[#d8e0dd] bg-white px-3 pr-10 text-[15px] text-[#183b38] placeholder:text-[#7d8e8a] focus:border-[#5b9b95] focus:outline-none"
                        placeholder="Masukkan kata sandi"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4d6d68]"
                        aria-label="Toggle password visibility"
                      >
                        <EyeIcon />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-[#55726c]">
                      <label className="inline-flex items-center gap-2">
                        <input type="checkbox" className="h-4 w-4 rounded border-[#b7c7c4] accent-[#0f5b57]" />
                        Ingat saya
                      </label>
                      <button type="button" className="font-semibold text-[#1d6d65]">Lupa kata sandi?</button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f5b57] px-5 py-3.5 text-base font-bold text-white shadow-[0_12px_25px_rgba(15,91,87,0.25)] transition hover:bg-[#0d514d]"
                  >
                    <span>Masuk sebagai {currentRoleLabel}</span>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                      <ArrowIcon />
                    </span>
                  </button>
                </div>

                <div className="mt-8 space-y-3 rounded-[18px] border border-[#d8e0dd] bg-[#e7f1ee] px-4 py-4 text-sm text-[#133a36]">
                  <div className="font-semibold">Satu portal penerimaan SMK, akses sesuai peran.</div>
                  <div className="space-y-2 text-[#345c59]">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#0f5b57] text-white"><CheckIcon /></span>
                      <span>Calon Siswa · berkas, jadwal, dan pembayaran.</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#0f5b57] text-white"><CheckIcon /></span>
                      <span>Admin SPMB · kelola pendaftaran, verifikasi, dan pembayaran.</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#0f5b57] text-white"><CheckIcon /></span>
                      <span>Kepala Sekolah · ringkasan pendaftaran, kapasitas, dan laporan.</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center text-gray-500">
                  <button type="button" className="inline-flex items-center gap-2 rounded-full border border-[#c7d4d1] bg-white px-3 py-2 text-sm font-semibold text-[#123430] shadow-sm">
                    Butuh akses atau bantuan? Hubungi panitia
                  </button>
                </div>
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
