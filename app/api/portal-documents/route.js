import db from "@/app/lib/db";
import { ensurePortalActivityTable } from "@/app/lib/portal-activity-schema";
import { readServerSession } from "@/app/lib/server-session";

const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);
const maxFileSize = 5 * 1024 * 1024;

export async function GET(request) {
  const session = readServerSession(request);
  if (!session) return Response.json({ success: false, message: "Sesi server diperlukan untuk melihat berkas." }, { status: 401 });
  const searchParams = new URL(request.url).searchParams;
  const studentId = (searchParams.get("studentId") || "").trim();
  const documentName = (searchParams.get("documentName") || "").trim();
  if (!studentId || !documentName) {
    return Response.json({ success: false, message: "Identitas pendaftar dan jenis berkas wajib diisi." }, { status: 400 });
  }
  if (session.role === "pelajar" && studentId !== session.id) {
    return Response.json({ success: false, message: "Akun pelajar hanya dapat melihat berkas miliknya sendiri." }, { status: 403 });
  }

  try {
    await ensurePortalActivityTable();
    const [rows] = await db.execute(
      "SELECT file_name AS fileName, mime_type AS mimeType, file_data AS fileData FROM portal_documents WHERE student_id = ? AND document_name = ? LIMIT 1",
      [studentId, documentName],
    );
    if (!rows.length) return Response.json({ success: false, message: "Berkas belum tersedia di server." }, { status: 404 });
    const file = rows[0];
    return new Response(file.fileData, {
      headers: {
        "Content-Type": allowedTypes.has(file.mimeType) ? file.mimeType : "application/octet-stream",
        "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(file.fileName)}`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Berkas pendaftaran tidak dapat dimuat dari server.", error);
    return Response.json({ success: false, message: "Berkas tidak dapat dimuat dari server sekolah." }, { status: 503 });
  }
}

export async function POST(request) {
  const session = readServerSession(request);
  if (!session) return Response.json({ success: false, message: "Silakan login kembali sebelum mengunggah berkas." }, { status: 401 });
  if (session.role !== "pelajar") {
    return Response.json({ success: false, message: "Hanya akun pelajar yang dapat mengunggah berkas." }, { status: 403 });
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ success: false, message: "Formulir berkas tidak valid." }, { status: 400 });
  }

  const studentId = String(form.get("studentId") || "").trim();
  const documentName = String(form.get("documentName") || "").trim();
  const file = form.get("file");
  if (!studentId || studentId.length > 120 || !documentName || documentName.length > 120
      || !file || typeof file.arrayBuffer !== "function") {
    return Response.json({ success: false, message: "Identitas pendaftar, jenis berkas, dan file wajib diisi." }, { status: 400 });
  }
  if (studentId !== session.id) {
    return Response.json({ success: false, message: "Akun pelajar hanya dapat mengunggah berkas untuk dirinya sendiri." }, { status: 403 });
  }
  if (!allowedTypes.has(file.type)) {
    return Response.json({ success: false, message: "Berkas harus berupa PDF, JPG, atau PNG." }, { status: 415 });
  }
  if (!file.size || file.size > maxFileSize) {
    return Response.json({ success: false, message: "Ukuran berkas harus lebih dari 0 dan maksimal 5 MB." }, { status: 413 });
  }

  let connection;
  try {
    await ensurePortalActivityTable();
    connection = await db.getConnection();
    await connection.beginTransaction();
    await connection.execute(
      `INSERT INTO portal_documents (student_id, document_name, file_name, mime_type, file_size, file_data)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE file_name = VALUES(file_name), mime_type = VALUES(mime_type),
         file_size = VALUES(file_size), file_data = VALUES(file_data), uploaded_at = CURRENT_TIMESTAMP`,
      [studentId, documentName, file.name, file.type, file.size, Buffer.from(await file.arrayBuffer())],
    );
    const summary = `${documentName} diunggah oleh pendaftar ${studentId}`;
    const [activityResult] = await connection.execute(
      "INSERT INTO portal_activity (actor_role, event_type, entity_id, summary, payload) VALUES ('pelajar', 'document_uploaded', ?, ?, ?)",
      [`student:${studentId}`, summary, JSON.stringify({ documentName, fileName: file.name, mimeType: file.type, size: file.size })],
    );
    const [activities] = await connection.execute(
      "SELECT id, actor_role AS actorRole, event_type AS eventType, entity_id AS entityId, summary, payload, created_at AS createdAt FROM portal_activity WHERE id = ?",
      [activityResult.insertId],
    );
    await connection.commit();

    return Response.json({ success: true, event: activities[0] }, { status: 201 });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Gagal menyimpan berkas pendaftaran ke database sekolah.", error);
    return Response.json({ success: false, message: "Berkas gagal disinkronkan ke server sekolah." }, { status: 503 });
  } finally {
    if (connection) connection.release();
  }
}
