-- portfolio-analytics D1 schema
-- Apply with: wrangler d1 execute portfolio-analytics --remote --file=./schema.sql

CREATE TABLE IF NOT EXISTS analytics_events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  event       TEXT NOT NULL,
  distinct_id TEXT,
  session_id  TEXT,
  path        TEXT,
  properties  TEXT,                                   -- full client properties as JSON
  referer     TEXT,
  user_agent  TEXT,
  country     TEXT,                                   -- from CF-IPCountry
  client_ts   TEXT,                                   -- properties.ts (client clock)
  received_at TEXT NOT NULL DEFAULT (datetime('now')) -- server clock
);

CREATE INDEX IF NOT EXISTS idx_events_event       ON analytics_events(event);
CREATE INDEX IF NOT EXISTS idx_events_received_at ON analytics_events(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_distinct    ON analytics_events(distinct_id);
CREATE INDEX IF NOT EXISTS idx_events_session     ON analytics_events(session_id);
