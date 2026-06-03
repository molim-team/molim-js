import Database from 'better-sqlite3';
import path from 'path';

// تحديد مسار ملف قاعدة البيانات داخل المشروع
const dbPath = path.resolve(process.cwd(), 'certs_database.db');
const db = new Database(dbPath);

db.prepare(`
  CREATE TABLE IF NOT EXISTS certificates (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT,
    cert_type TEXT,
    certificate_text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

export default db;