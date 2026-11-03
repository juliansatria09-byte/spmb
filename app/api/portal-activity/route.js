import db from "@/app/lib/db";
import { ensurePortalActivityTable } from "@/app/lib/portal-activity-schema";
import { applySessionCookie, readServerSession } from "@/app/lib/server-session";
import { availablePrograms } from "@/app/lib/programs";

const eventTypes = new Set([
  "profile_updated",
  "payment_updated",
  "decision_updated",
  "application_updated",
]);

export async function GET(request) {
  const session = readServerSession(request);
  if (!session) return Response.json({ success: false, message: "Sesi server diperlukan untuk melihat aktivitas." }, { status: 401 });
  const requestedAfter = Number(new URL(request.url).searchParams.get("after") || 0);
  const after = Number.isSafeInteger(requestedAfter) && requestedAfter > 0 ? requestedAfter : 0;

  try {
    await ensurePortalActivityTable();
    const ownStudent = session.role === "pelajar";
    const ownEmail = ownStudent ? session.email : "";
    const query = after
      ? `SELECT id, actor_role AS actorRole, event_type AS eventType, entity_id AS entityId, summary, payload, created_at AS createdAt FROM portal_activity WHERE id > ? ${ownStudent ? "AND entity_id IN (?, ?) " : ""}ORDER BY id ASC LIMIT 200`
      : ownStudent
        ? "SELECT id, actor_role AS actorRole, event_type AS eventType, entity_id AS entityId, summary, payload, created_at AS createdAt FROM portal_activity WHERE entity_id IN (?, ?) ORDER BY id ASC"
        : `SELECT id, actor_role AS actorRole, event_type AS eventType, entity_id AS entityId, summary, payload, created_at AS createdAt
           FROM portal_activity
           WHERE event_type = 'applicant_created'
             OR id >= COALESCE((SELECT MIN(id) FROM (SELECT id FROM portal_activity ORDER BY id DESC LIMIT 100) AS recent_events), 0)
             OR id IN (SELECT MAX(id) FROM portal_activity WHERE entity_id LIKE 'student:%' GROUP BY entity_id)
           ORDER BY id ASC`;
    const values = after
      ? (ownStudent ? [after, `student:${session.id}`, `student:${ownEmail}`] : [after])
      : (ownStudent ? [`student:${session.id}`, `student:${ownEmail}`] : []);
    const [rows] = await db.execute(query, values);

    return Response.json({
      success: true,
      events: rows,
      latestId: rows.length ? Number(rows[rows.length - 1].id) : after,
    });
  } catch (error) {
    console.error("Gagal memuat aktivitas portal dari database.", error);
    return Response.json({ success: false, message: "Aktivitas portal tidak dapat dimuat." }, { status: 503 });
  }
}

export async function POST(request) {
  const session = readServerSession(request);
  if (!session) return Response.json({ success: false, message: "Sesi server diperlukan untuk menyimpan aktivitas." }, { status: 401 });
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, message: "Format permintaan tidak valid." }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ success: false, message: "Format permintaan tidak valid." }, { status: 400 });
  }

  const allowedTypesByRole = {
    pelajar: new Set(["profile_updated"]),
    admin: new Set(["payment_updated", "application_updated"]),
    kepala: new Set(["decision_updated"]),
  };
  if (body.actorRole !== session.role || !eventTypes.has(body.eventType) || !allowedTypesByRole[session.role].has(body.eventType)) {
    return Response.json({ success: false, message: "Jenis aktivitas atau peran tidak valid." }, { status: 400 });
  }
  if (typeof body.entityId !== "string" || !body.entityId.trim() || body.entityId.length > 120) {
    return Response.json({ success: false, message: "Identitas data tidak valid." }, { status: 400 });
  }
  if (session.role === "pelajar" && body.entityId !== `student:${session.id}`) {
    return Response.json({ success: false, message: "Akun pelajar hanya dapat mengubah data pendaftarannya sendiri." }, { status: 403 });
  }
  if (typeof body.summary !== "string" || !body.summary.trim() || body.summary.length > 255) {
    return Response.json({ success: false, message: "Ringkasan aktivitas wajib diisi." }, { status: 400 });
  }
  if (!body.payload || typeof body.payload !== "object" || Array.isArray(body.payload)) {
    return Response.json({ success: false, message: "Rincian aktivitas tidak valid." }, { status: 400 });
  }

  if (body.eventType === "profile_updated") {
    const userIdMatch = /^student-(\d+)$/.exec(session.id);
    const name = typeof body.payload.name === "string" ? body.payload.name.trim() : "";
    const email = typeof body.payload.email === "string" ? body.payload.email.trim().toLowerCase() : "";
    const phone = typeof body.payload.phone === "string" ? body.payload.phone.trim() : "";
    const phoneDigits = phone.replace(/\D/g, "");
    const parentName = typeof body.payload.parentName === "string" ? body.payload.parentName.trim() : "";
    const program = typeof body.payload.program === "string" ? body.payload.program.trim() : "";

    if (!userIdMatch || !name || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) {
      return Response.json({ success: false, message: "Nama lengkap atau alamat email tidak valid." }, { status: 400 });
    }
    if (!phone || phone.length > 20 || phoneDigits.length < 6 || phoneDigits.length > 15
        || !/^[+()\d\s.-]+$/.test(phone)) {
      return Response.json({ success: false, message: "Nomor WhatsApp tidak valid." }, { status: 400 });
    }
    if (!parentName || parentName.length > 120 || !availablePrograms.includes(program)) {
      return Response.json({ success: false, message: "Nama wali wajib diisi dan pilih jurusan yang tersedia." }, { status: 400 });
    }

    let connection;
    try {
      await ensurePortalActivityTable();
      connection = await db.getConnection();
      await connection.beginTransaction();
      const [users] = await connection.execute(
        `SELECT u.id, u.full_name AS name, u.email, u.phone
         FROM users u JOIN roles r ON r.id = u.role_id
         WHERE u.id = ? AND r.slug = 'pelajar' LIMIT 1`,
        [Number(userIdMatch[1])],
      );
      if (!users.length) {
        await connection.rollback();
        return Response.json({ success: false, message: "Akun pelajar tidak ditemukan." }, { status: 404 });
      }

      const user = users[0];
      const [programs] = await connection.execute(
        "SELECT id FROM programs WHERE name = ? AND is_active = 1 LIMIT 1",
        [program],
      );
      if (!programs.length) {
        await connection.rollback();
        return Response.json({ success: false, message: "Program pilihan tidak tersedia." }, { status: 400 });
      }

      const payload = { name, email, phone, parentName, program };
      await connection.execute(
        "UPDATE users SET full_name = ?, email = ?, phone = ? WHERE id = ?",
        [name, email, phone, Number(userIdMatch[1])],
      );
      const [applications] = await connection.execute(
        "SELECT id FROM applications WHERE user_id = ? ORDER BY created_at DESC LIMIT 1 FOR UPDATE",
        [user.id],
      );
      if (applications.length) {
        await connection.execute(
          "UPDATE applications SET parent_name = ?, program_id = ? WHERE id = ?",
          [parentName, programs[0].id, applications[0].id],
        );
      } else {
        const registrationNumber = `SMK-2027-${String(user.id).padStart(6, "0")}`;
        await connection.execute(
          "INSERT INTO applications (user_id, program_id, registration_number, parent_name) VALUES (?, ?, ?, ?)",
          [user.id, programs[0].id, registrationNumber, parentName],
        );
      }
      const [result] = await connection.execute(
        "INSERT INTO portal_activity (actor_role, event_type, entity_id, summary, payload) VALUES (?, ?, ?, ?, ?)",
        [session.role, body.eventType, body.entityId.trim(), `Data pendaftaran diperbarui: ${name}`, JSON.stringify(payload)],
      );
      const [rows] = await connection.execute(
        "SELECT id, actor_role AS actorRole, event_type AS eventType, entity_id AS entityId, summary, payload, created_at AS createdAt FROM portal_activity WHERE id = ?",
        [result.insertId],
      );
      await connection.commit();
      return applySessionCookie(
        Response.json({ success: true, event: rows[0] }, { status: 201 }),
        { id: session.id, role: session.role, email },
      );
    } catch (error) {
      if (connection) await connection.rollback();
      if (error.code === "ER_DUP_ENTRY") {
        return Response.json({ success: false, message: "Alamat email atau nomor pendaftaran sudah digunakan." }, { status: 409 });
      }
      console.error("Perubahan data pendaftaran tidak dapat disimpan.", error);
      return Response.json({ success: false, message: "Perubahan gagal disimpan ke akun sekolah." }, { status: 503 });
    } finally {
      if (connection) connection.release();
    }
  }

  try {
    await ensurePortalActivityTable();
    const [result] = await db.execute(
      "INSERT INTO portal_activity (actor_role, event_type, entity_id, summary, payload) VALUES (?, ?, ?, ?, ?)",
      [session.role, body.eventType, body.entityId.trim(), body.summary.trim(), JSON.stringify(body.payload)],
    );
    const [rows] = await db.execute(
      "SELECT id, actor_role AS actorRole, event_type AS eventType, entity_id AS entityId, summary, payload, created_at AS createdAt FROM portal_activity WHERE id = ?",
      [result.insertId],
    );

    return Response.json({ success: true, event: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Gagal menyimpan aktivitas portal ke database.", error);
    return Response.json({ success: false, message: "Perubahan gagal disinkronkan ke server sekolah." }, { status: 503 });
  }
}
