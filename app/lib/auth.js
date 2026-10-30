export const roleConfig = {
  pelajar: {
    label: "Calon Siswa",
    route: "/pelajar",
    title: "Portal Calon Siswa",
    primary: "#0f5b57",
  },
  admin: {
    label: "Admin SPMB",
    route: "/admin",
    title: "Admin SPMB",
    primary: "#1d4f7a",
  },
  kepala: {
    label: "Kepala Sekolah",
    route: "/kepala-sekolah",
    title: "Kepala Sekolah",
    primary: "#5c3d9a",
  },
};

export const defaultUsers = [
  {
    id: "pelajar-demo",
    name: "Rizki Pratama",
    role: "pelajar",
    email: "pelajar@smkmesra.id",
    password: "pelajar123",
    phone: "081234567890",
    school: "SMK Tadika Mesra Jakarta",
  },
  {
    id: "admin-demo",
    name: "Siti Nurhaliza",
    role: "admin",
    email: "admin@spmb.sch.id",
    password: "admin123",
    phone: "081298765432",
    school: "SPMB SMK Tadika Mesra Jakarta",
  },
  {
    id: "kepala-demo",
    name: "Hendri Kusuma",
    role: "kepala",
    email: "kepala@smkmesra.id",
    password: "kepala123",
    phone: "081212345678",
    school: "SMK Tadika Mesra Jakarta",
  },
];

const STORAGE_KEY = "spmb-session";
const ACCOUNT_KEY = "spmb-accounts";

export function getStorageItem(key) {
  if (typeof window === "undefined") return null;

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function setStorageItem(key, value) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getSession() {
  return getStorageItem(STORAGE_KEY);
}

export function saveSession(user) {
  setStorageItem(STORAGE_KEY, user);
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  fetch("/api/session", { method: "DELETE" }).catch((error) => {
    console.error("Sesi server tidak dapat diakhiri.", error);
  });
}

export function getRegisteredAccounts() {
  const stored = getStorageItem(ACCOUNT_KEY);
  return Array.isArray(stored) ? stored : [];
}

export function saveRegisteredAccount(account) {
  const existing = getRegisteredAccounts();
  const next = [...existing, account];
  setStorageItem(ACCOUNT_KEY, next);
}

export function getRoleUser(role, email, password) {
  const accounts = [...defaultUsers, ...getRegisteredAccounts()];

  return accounts.find(
    (user) =>
      user.role === role &&
      user.email.toLowerCase() === String(email).trim().toLowerCase() &&
      user.password === String(password).trim()
  );
}

export function loginUser({ role, email, password }) {
  const user = getRoleUser(role, email, password);
  if (!user) return null;

  const session = {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email,
    phone: user.phone,
    school: user.school,
  };

  saveSession(session);
  return session;
}

export function registerStudent(payload) {
  const account = {
    id: payload.id || `student-${Date.now()}`,
    name: payload.name,
    role: "pelajar",
    email: payload.email,
    phone: payload.phone,
    school: "SMK Tadika Mesra Jakarta",
  };

  const existing = getRegisteredAccounts();
  const duplicate = existing.some(
    (item) => item.email.toLowerCase() === payload.email.toLowerCase()
  );

  if (duplicate) {
    return { error: "Email sudah terdaftar. Silakan login atau gunakan email lain." };
  }

  saveRegisteredAccount(account);
  const session = {
    id: account.id,
    name: account.name,
    role: account.role,
    email: account.email,
    phone: account.phone,
    school: account.school,
  };

  saveSession(session);
  return { success: true, user: session };
}

export function logout() {
  clearSession();
}
