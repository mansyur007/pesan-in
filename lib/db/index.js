import Database from 'better-sqlite3';
import path from 'node:path';
import { SCHEMA, seed } from './schema';

const DB_PATH = path.join(process.cwd(), 'app.db');

// Cache instance across hot reloads in dev.
let _db = globalThis.__pesaninDb;

export function getDB() {
  if (_db) return _db;
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(SCHEMA);

  const { count } = db.prepare('SELECT COUNT(*) AS count FROM merchants').get();
  if (count === 0) {
    const run = db.transaction(seed);
    run(db);
  }

  _db = db;
  globalThis.__pesaninDb = db;
  return db;
}
