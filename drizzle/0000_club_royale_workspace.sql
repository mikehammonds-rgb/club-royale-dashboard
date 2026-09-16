CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  data_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS saved_searches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  criteria_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS offer_statuses (
  slot_key TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS offer_snapshots (
  id TEXT PRIMARY KEY,
  snapshot_date TEXT NOT NULL,
  unique_offers INTEGER NOT NULL,
  usable_slots INTEGER NOT NULL,
  sailing_rows INTEGER NOT NULL,
  data_json TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_saved_searches_updated_at ON saved_searches(updated_at);
CREATE INDEX IF NOT EXISTS idx_offer_snapshots_date ON offer_snapshots(snapshot_date);
PRAGMA optimize;
