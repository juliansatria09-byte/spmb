import db from "@/app/lib/db";

let tableCreation;

export function ensurePortalActivityTable() {
  if (!tableCreation) {
    tableCreation = Promise.all([
      db.query(`
      CREATE TABLE IF NOT EXISTS portal_activity (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        actor_role ENUM('pelajar', 'admin', 'kepala') NOT NULL,
        event_type VARCHAR(40) NOT NULL,
        entity_id VARCHAR(120) NOT NULL,
        summary VARCHAR(255) NOT NULL,
        payload JSON NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_portal_activity_created_at (created_at),
        KEY idx_portal_activity_entity (entity_id, id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `),
      db.query(`
        CREATE TABLE IF NOT EXISTS portal_documents (
          id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
          student_id VARCHAR(120) NOT NULL,
          document_name VARCHAR(120) NOT NULL,
          file_name VARCHAR(255) NOT NULL,
          mime_type VARCHAR(100) NOT NULL,
          file_size INT UNSIGNED NOT NULL,
          file_data MEDIUMBLOB NOT NULL,
          uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          UNIQUE KEY uq_portal_documents_student_document (student_id, document_name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `),
    ]).catch((error) => {
      tableCreation = null;
      throw error;
    });
  }
  return tableCreation;
}
