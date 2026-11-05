-- Serialize different accepted requests for the same address before discovery
-- and create. Only a keyed digest is retained, and expired leases are cleaned.
CREATE TABLE contact_locks (
  email_hash TEXT PRIMARY KEY,
  lease_until INTEGER NOT NULL
);