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
  migrate(db);

  const { count } = db.prepare('SELECT COUNT(*) AS count FROM merchants').get();
  if (count === 0) {
    const run = db.transaction(seed);
    run(db);
  }

  _db = db;
  globalThis.__pesaninDb = db;
  return db;
}

// Migrasi ringan untuk DB lama (idempoten).
function migrate(db) {
  const cols = db.prepare('PRAGMA table_info(orders)').all().map((c) => c.name);
  if (!cols.includes('delivery_lat')) db.exec('ALTER TABLE orders ADD COLUMN delivery_lat REAL');
  if (!cols.includes('delivery_lng')) db.exec('ALTER TABLE orders ADD COLUMN delivery_lng REAL');
  // Hash settle dicatat terpisah dari tx_hash (yang berisi hash pendanaan),
  // supaya receipt pendanaan tidak tertimpa saat payout selesai.
  if (!cols.includes('settle_tx_hash')) db.exec('ALTER TABLE orders ADD COLUMN settle_tx_hash TEXT');

  // Alamat tujuan payout escrow: subtotal → merchant, ongkir → driver.
  const userCols = db.prepare('PRAGMA table_info(users)').all().map((c) => c.name);
  if (!userCols.includes('wallet_address')) {
    db.exec("ALTER TABLE users ADD COLUMN wallet_address TEXT DEFAULT ''");
  }
  const merchantCols = db.prepare('PRAGMA table_info(merchants)').all().map((c) => c.name);
  if (!merchantCols.includes('wallet_address')) {
    db.exec("ALTER TABLE merchants ADD COLUMN wallet_address TEXT DEFAULT ''");
  }
}
