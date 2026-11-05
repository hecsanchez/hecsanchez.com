PRAGMA foreign_keys = ON;

CREATE TABLE signup_requests (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL UNIQUE,
  fingerprint TEXT NOT NULL,
  email TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('kit_contexto', 'shipping_notes')),
  resource_id TEXT,
  resource_version TEXT,
  source_page TEXT NOT NULL,
  placement TEXT NOT NULL,
  locale TEXT NOT NULL CHECK (locale IN ('es', 'en')),
  consent INTEGER NOT NULL CHECK (consent IN (0, 1)),
  consent_version TEXT NOT NULL,
  consent_status TEXT NOT NULL CHECK (consent_status IN ('not_requested', 'requested', 'withdrawn')),
  privacy_version TEXT NOT NULL,
  attribution TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX signup_requests_created ON signup_requests(created_at);

-- An affirmative kit choice is evidence only. No list enrollment or preference
-- mutation is performed by this service. Newsletter intent is a separate purpose.
CREATE TABLE resource_contexts (
  token_hash TEXT PRIMARY KEY,
  request_id TEXT NOT NULL UNIQUE REFERENCES signup_requests(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action = 'resource_access_and_profile'),
  expires_at INTEGER NOT NULL
);
CREATE TABLE qualification (
  request_id TEXT PRIMARY KEY REFERENCES signup_requests(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  task TEXT NOT NULL,
  frequency TEXT,
  saved_at INTEGER NOT NULL
);
CREATE TABLE delivery_outbox (
  request_id TEXT PRIMARY KEY REFERENCES signup_requests(id) ON DELETE CASCADE,
  state TEXT NOT NULL CHECK (state IN ('queued', 'sending', 'sent', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  next_attempt_at INTEGER NOT NULL,
  lease_until INTEGER NOT NULL DEFAULT 0,
  retry_until INTEGER NOT NULL,
  sent_at INTEGER
);
CREATE INDEX delivery_outbox_due ON delivery_outbox(state, next_attempt_at);
CREATE TABLE contact_outbox (
  request_id TEXT PRIMARY KEY REFERENCES signup_requests(id) ON DELETE CASCADE,
  state TEXT NOT NULL CHECK (state IN ('queued', 'sending', 'synced', 'preserved', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  next_attempt_at INTEGER NOT NULL,
  lease_until INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE provider_contacts (
  email TEXT PRIMARY KEY,
  contact_id TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('synced', 'preserved'))
);
-- This operational queue temporarily owns the minimum data needed to complete
-- a verified erasure/withdrawal. Delete each job after provider confirmation.
CREATE TABLE rights_jobs (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  action TEXT NOT NULL CHECK (action IN ('erase', 'withdraw')),
  purpose TEXT CHECK (purpose IN ('kit_contexto', 'shipping_notes')),
  contact_id TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  next_attempt_at INTEGER NOT NULL,
  lease_until INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE operational_events (
  request_id TEXT NOT NULL REFERENCES signup_requests(id) ON DELETE CASCADE,
  event TEXT NOT NULL CHECK (event IN ('kit_request_accepted', 'newsletter_request_recorded', 'lead_profile_saved')),
  created_at INTEGER NOT NULL,
  PRIMARY KEY (request_id, event)
);
-- Anonymous counters expire independently; no IP, user-agent or raw email here.
CREATE TABLE rate_buckets (
  bucket TEXT PRIMARY KEY,
  count INTEGER NOT NULL CHECK (count <= 100),
  expires_at INTEGER NOT NULL
);