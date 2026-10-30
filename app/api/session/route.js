import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import db from "@/app/lib/db";
import { applySessionCookie, clearSessionCookie } from "@/app/lib/server-session";
import { ensurePortalActivityTable } from "@/app/lib/portal-activity-schema";

const scrypt = promisify(scryptCallback);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = await scrypt(password, salt, 64);
  return `scrypt$${salt}$${Buffer.from(hash).toString("hex")}`;
}

async function verifyPassword(password, stored) {
  if (!stored.startsWith("scrypt$")) return stored === password ? "legacy" : false;
  const [, salt, expected] = stored.split("$");
  if (!salt || !expected) return false;
  const actual = Buffer.from(await scrypt(password, salt, 64)).toString("hex");
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

function validateRegistration(body) {
  if (typeof body.name !== "string" || !body.name.trim() || body.name.trim().length > 120) {
    return "Nama calon siswa wajib diisi (maksimal 120 karakter).";
  }
  if (typeof body.parentName !== "string" || !body.parentName.trim() || body.parentName.trim().length > 120) {
    return "Nama orang tua/wali wajib diisi (maksimal 120 karakter).";
  }
  if (typeof body.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
    return "Masukkan alamat email yang valid.";
  }
  if (typeof body.phone !== "string" || !body.phone.trim() || body.phone.trim().length > 20) {
    return "Nomor WhatsApp wajib diisi (maksimal 20 karakter).";
  }
  if (typeof body.password !== "string" || body.password.length < 8
      || !/[A-Za-z]/.test(body.password) || !/\d/.test(body.password)) {
    return "Kata sandi harus minimal 8 karakter serta mengandung huruf dan angka.";
  }
  if (typeof body.birthDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(body.birthDate)) {
    return "Tanggal lahir wajib dipilih dari kalender.";
  }
  const parsedDate = new Date(`${body.birthDate}T00:00:00Z`);
  if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== body.birthDate
      || parsedDate > new Date()) {
    return "Tanggal lahir tidak valid atau berada di masa depan.";
  }
  return null;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, message: "Format permintaan tidak valid." }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ success: false, message: "Format permintaan tidak valid." }, { status: 400 });
  }

  if (body.mode === "register") {
    const registrationError = validateRegistration(body);
    if (registrationError) return Response.json({ success: false, message: registrationError }, { status: 400 });

    let connection;
    try {
      await ensurePortalActivityTable();
      connection = await db.getConnection();
      await connection.beginTransaction();
      const [roles] = await connection.execute("SELECT id FROM roles WHERE slug = 'pelajar' LIMIT 1");
      if (!roles.length) {
        await connection.rollback();
        return Response.json({ success: false, message: "Peran pelajar belum tersedia di database." }, { status: 503 });
      }

      const email = body.email.trim().toLowerCase();
      const passwordHash = await hashPassword(body.password);
      const [userResult] = await connection.execute(
        "INSERT INTO users (role_id, full_name, email, password_hash, phone, school_name) VALUES (?, ?, ?, ?, ?, ?)",
        [roles[0].id, body.name.trim(), email, passwordHash, body.phone.trim(), "SMK Tadika Mesra Jakarta"],
      );
      const user = {
        id: `student-${userResult.insertId}`,
        role: "pelajar",
        name: body.name.trim(),
        email,
        phone: body.phone.trim(),
        school: "SMK Tadika Mesra Jakarta",
      };
      await connection.execute(
        "INSERT INTO portal_activity (actor_role, event_type, entity_id, summary, payload) VALUES ('pelajar', 'applicant_created', ?, ?, ?)",
        [`student:${user.id}`, `Pendaftaran baru: ${user.name}`, JSON.stringify({
          name: user.name,
          email,
          phone: user.phone,
          parentName: body.parentName.trim(),
          birthDate: body.birthDate,
          program: "Belum dipilih",
        })],
      );
      await connection.commit();
      return applySessionCookie(Response.json({ success: true, user }, { status: 201 }), user);
    } catch (error) {
      if (connection) await connection.rollback();
      if (error.code === "ER_DUP_ENTRY") {
        return Response.json({ success: false, message: "Email sudah terdaftar. Silakan login atau gunakan email lain." }, { status: 409 });
      }
      console.error("Pendaftaran tidak dapat disimpan ke database sekolah.", error);
      return Response.json({ success: false, message: "Pendaftaran gagal disimpan di server sekolah." }, { status: 503 });
    } finally {
      if (connection) connection.release();
    }
  }

  if (body.mode !== "login" || !["pelajar", "admin", "kepala"].includes(body.role)
      || typeof body.email !== "string" || typeof body.password !== "string") {
    return Response.json({ success: false, message: "Jenis akun atau data login tidak valid." }, { status: 400 });
  }

  try {
    const [rows] = await db.execute(
      `SELECT u.id, u.full_name AS name, u.email, u.password_hash AS passwordHash,
              u.phone, u.school_name AS school, r.slug AS role
       FROM users u JOIN roles r ON r.id = u.role_id
       WHERE u.email = ? AND r.slug = ? LIMIT 1`,
      [body.email.trim().toLowerCase(), body.role],
    );
    const account = rows[0];
    if (!account || !await verifyPassword(body.password, account.passwordHash)) {
      return Response.json({ success: false, message: "Akun tidak ditemukan atau kata sandi salah." }, { status: 401 });
    }

    if (!account.passwordHash.startsWith("scrypt$")) {
      await db.execute("UPDATE users SET password_hash = ? WHERE id = ?", [await hashPassword(body.password), account.id]);
    }
    const user = {
      id: `${account.role === "pelajar" ? "student" : account.role}-${account.id}`,
      name: account.name,
      role: account.role,
      email: account.email,
      phone: account.phone || "",
      school: account.school || "SMK Tadika Mesra Jakarta",
    };
    return applySessionCookie(Response.json({ success: true, user }), user);
  } catch (error) {
    console.error("Login tidak dapat diverifikasi melalui database sekolah.", error);
    return Response.json({ success: false, message: "Login tidak dapat diverifikasi. Periksa koneksi server sekolah." }, { status: 503 });
  }
}

export async function DELETE() {
  return clearSessionCookie(Response.json({ success: true }));
}
