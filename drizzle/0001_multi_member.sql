CREATE TABLE IF NOT EXISTS member_profiles (id TEXT PRIMARY KEY, display_name TEXT NOT NULL, portal_name TEXT NOT NULL, tier TEXT NOT NULL, tier_credits INTEGER NOT NULL, member_number_last4 TEXT NOT NULL, snapshot_date TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS app_metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS member_bookings (member_id TEXT NOT NULL, id TEXT NOT NULL, data_json TEXT NOT NULL, updated_at TEXT NOT NULL, PRIMARY KEY (member_id, id));
CREATE TABLE IF NOT EXISTS member_saved_searches (member_id TEXT NOT NULL, id TEXT NOT NULL, name TEXT NOT NULL, criteria_json TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, PRIMARY KEY (member_id, id));
CREATE TABLE IF NOT EXISTS member_offer_statuses (member_id TEXT NOT NULL, slot_key TEXT NOT NULL, status TEXT NOT NULL, notes TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL, PRIMARY KEY (member_id, slot_key));
CREATE TABLE IF NOT EXISTS member_offer_snapshots (member_id TEXT NOT NULL, id TEXT NOT NULL, snapshot_date TEXT NOT NULL, unique_offers INTEGER NOT NULL, usable_slots INTEGER NOT NULL, sailing_rows INTEGER NOT NULL, data_json TEXT NOT NULL, PRIMARY KEY (member_id, id));
CREATE INDEX IF NOT EXISTS idx_member_saved_searches_member_updated ON member_saved_searches(member_id, updated_at);
CREATE INDEX IF NOT EXISTS idx_member_snapshots_member_date ON member_offer_snapshots(member_id, snapshot_date);
CREATE INDEX IF NOT EXISTS idx_member_bookings_member_updated ON member_bookings(member_id, updated_at);
