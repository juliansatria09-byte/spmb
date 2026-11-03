INSERT INTO roles (name, slug) VALUES
  ('Pelajar', 'pelajar'),
  ('Admin SPMB', 'admin'),
  ('Kepala Sekolah', 'kepala')
ON DUPLICATE KEY UPDATE name = VALUES(name), slug = VALUES(slug);

INSERT INTO users (role_id, full_name, email, password_hash, phone, school_name) VALUES
  (1, 'Rizki Pratama', 'pelajar@smkmesra.id', 'pelajar123', '081234567890', 'SMK Tadika Mesra Jakarta'),
  (2, 'Siti Nurhaliza', 'admin@spmb.sch.id', 'admin123', '081298765432', 'SPMB SMK Tadika Mesra Jakarta'),
  (3, 'Hendri Kusuma', 'kepala@smkmesra.id', 'kepala123', '081212345678', 'SMK Tadika Mesra Jakarta')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), phone = VALUES(phone), school_name = VALUES(school_name);

INSERT INTO programs (name, description, capacity, is_active) VALUES
  ('Teknik Komputer & Jaringan', 'Program unggulan teknik komputer dan jaringan', 180, 1),
  ('Akuntansi & Keuangan Lembaga', 'Program unggulan akuntansi dan administrasi keuangan', 150, 1),
  ('Multimedia', 'Program desain komunikasi visual multimedia', 120, 1),
  ('Farmasi Industri', 'Program farmasi industri dan produk kesehatan', 90, 1),
  ('Rekayasa Perangkat Lunak', 'Program keahlian rekayasa perangkat lunak', 0, 1),
  ('Desain Komunikasi Visual', 'Program keahlian desain komunikasi visual', 0, 1),
  ('Manajemen Perkantoran', 'Program keahlian manajemen perkantoran', 0, 1),
  ('Kuliner', 'Program keahlian kuliner', 0, 1)
ON DUPLICATE KEY UPDATE description = VALUES(description), capacity = VALUES(capacity), is_active = VALUES(is_active);

INSERT INTO applications (user_id, program_id, registration_number, parent_name, birth_date, status, application_step, notes) VALUES
  (1, 1, 'SMK-2027-0142', 'Sukmawati', '2012-04-15', 'paid', 4, 'Berkas lengkap dan pembayaran valid'),
  (2, 2, 'ADM-2027-0091', NULL, NULL, 'review', 2, 'Menunggu validasi admin'),
  (3, 4, 'KPL-2027-0038', 'Dewi Lestari', '2011-09-28', 'tested', 5, 'Tes seleksi sudah dilaksanakan')
ON DUPLICATE KEY UPDATE program_id = VALUES(program_id), registration_number = VALUES(registration_number), parent_name = VALUES(parent_name), birth_date = VALUES(birth_date), status = VALUES(status), application_step = VALUES(application_step), notes = VALUES(notes);

INSERT INTO application_documents (application_id, document_type, file_name, file_path) VALUES
  (1, 'ijazah', 'ijazah-siswa.pdf', '/uploads/ijazah-siswa.pdf'),
  (1, 'akte', 'akte-kelahiran.pdf', '/uploads/akte-kelahiran.pdf'),
  (2, 'kk', 'kartu-keluarga.pdf', '/uploads/kartu-keluarga.pdf')
ON DUPLICATE KEY UPDATE file_name = VALUES(file_name), file_path = VALUES(file_path);

INSERT INTO payments (application_id, amount, payment_status, payment_method, paid_at) VALUES
  (1, 250000.00, 'paid', 'bank_transfer', NOW()),
  (2, 250000.00, 'pending', 'bank_transfer', NULL),
  (3, 250000.00, 'paid', 'bank_transfer', NOW())
ON DUPLICATE KEY UPDATE amount = VALUES(amount), payment_status = VALUES(payment_status), payment_method = VALUES(payment_method), paid_at = VALUES(paid_at);

INSERT INTO announcements (title, content) VALUES
  ('Pendaftaran dibuka', 'Penerimaan siswa baru untuk tahun ajaran 2027/2028 telah dibuka.'),
  ('Jadwal tes', 'Tes seleksi akan dilaksanakan pada tanggal 12 Juli 2027.'),
  ('Hasil review', 'Calon siswa yang belum lengkap berkas dimohon segera melengkapi dokumen.')
ON DUPLICATE KEY UPDATE content = VALUES(content);
