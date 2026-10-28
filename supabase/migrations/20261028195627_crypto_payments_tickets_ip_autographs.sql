/*
# Crypto payments, individual tickets, IP blocking, autograph sessions

1. New Tables
- `crypto_payments`
  - `id` (uuid, primary key)
  - `order_id` (uuid, references orders)
  - `binance_order_id` (text) — Binance Pay order ID
  - `amount` (numeric) — amount in USDT
  - `currency` (text, default 'USDT')
  - `status` (text, default 'pending') — 'pending', 'paid', 'failed'
  - `wallet_address` (text) — deposit wallet address shown to user
  - `qr_code` (text) — Binance Pay QR string
  - `created_at` (timestamptz)
  - `confirmed_at` (timestamptz, nullable)

- `tickets`
  - `id` (uuid, primary key)
  - `order_id` (uuid, references orders)
  - `seat_id` (uuid, references seats, nullable)
  - `seat_label` (text) — human-readable seat label
  - `zone` (text) — 'vip', 'platinum', 'general'
  - `ticket_code` (text, unique) — unique per-entry QR code
  - `holder_name` (text) — attendee name
  - `status` (text, default 'valid') — 'valid', 'used', 'cancelled'
  - `created_at` (timestamptz)

- `ip_blocks`
  - `id` (uuid, primary key)
  - `ip_hash` (text, unique) — hashed IP to prevent duplicate purchases
  - `order_count` (int, default 1)
  - `last_order_at` (timestamptz)
  - `blocked` (boolean, default false)
  - `created_at` (timestamptz)

- `autograph_sessions`
  - `id` (uuid, primary key)
  - `artist_name` (text)
  - `artist_image` (text)
  - `description` (text)
  - `session_time` (text) — e.g. "6:00 PM"
  - `location` (text) — e.g. "Zone VIP"
  - `capacity` (int)
  - `registered_count` (int, default 0)
  - `created_at` (timestamptz)

2. Modified Tables
- `orders` — add columns: `payment_method` (text, default 'crypto'),
  `payment_status` (text, default 'pending'), `ip_hash` (text)

3. Security
- Enable RLS on all new tables.
- Grant SELECT, INSERT, UPDATE to anon + authenticated (no-auth public store).
- All data is intentionally public — no ownership checks needed.

4. Pre-populated autograph sessions for Bad Bunny, Grupo Frontera, C.R.O
*/

-- Add columns to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'crypto';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ip_hash text;

-- Create crypto_payments table
CREATE TABLE IF NOT EXISTS crypto_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  binance_order_id text,
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USDT',
  status text NOT NULL DEFAULT 'pending',
  wallet_address text,
  qr_code text,
  created_at timestamptz DEFAULT now(),
  confirmed_at timestamptz
);

ALTER TABLE crypto_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_crypto_payments" ON crypto_payments;
CREATE POLICY "anon_select_crypto_payments" ON crypto_payments FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_crypto_payments" ON crypto_payments;
CREATE POLICY "anon_insert_crypto_payments" ON crypto_payments FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_crypto_payments" ON crypto_payments;
CREATE POLICY "anon_update_crypto_payments" ON crypto_payments FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_crypto_payments" ON crypto_payments;
CREATE POLICY "anon_delete_crypto_payments" ON crypto_payments FOR DELETE
  TO anon, authenticated USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON crypto_payments TO anon, authenticated;

-- Create tickets table (individual per-seat tickets with unique QR codes)
CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  seat_id uuid REFERENCES seats(id) ON DELETE SET NULL,
  seat_label text,
  zone text NOT NULL,
  ticket_code text UNIQUE NOT NULL,
  holder_name text NOT NULL,
  status text NOT NULL DEFAULT 'valid',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_tickets" ON tickets;
CREATE POLICY "anon_select_tickets" ON tickets FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_tickets" ON tickets;
CREATE POLICY "anon_insert_tickets" ON tickets FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_tickets" ON tickets;
CREATE POLICY "anon_update_tickets" ON tickets FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_tickets" ON tickets;
CREATE POLICY "anon_delete_tickets" ON tickets FOR DELETE
  TO anon, authenticated USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON tickets TO anon, authenticated;

-- Create ip_blocks table
CREATE TABLE IF NOT EXISTS ip_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash text UNIQUE NOT NULL,
  order_count int NOT NULL DEFAULT 1,
  last_order_at timestamptz DEFAULT now(),
  blocked boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ip_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_ip_blocks" ON ip_blocks;
CREATE POLICY "anon_select_ip_blocks" ON ip_blocks FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_ip_blocks" ON ip_blocks;
CREATE POLICY "anon_insert_ip_blocks" ON ip_blocks FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_ip_blocks" ON ip_blocks;
CREATE POLICY "anon_update_ip_blocks" ON ip_blocks FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE ON ip_blocks TO anon, authenticated;

-- Create autograph_sessions table
CREATE TABLE IF NOT EXISTS autograph_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_name text NOT NULL,
  artist_image text,
  description text,
  session_time text NOT NULL,
  location text NOT NULL,
  capacity int NOT NULL DEFAULT 50,
  registered_count int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE autograph_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_autograph_sessions" ON autograph_sessions;
CREATE POLICY "anon_select_autograph_sessions" ON autograph_sessions FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_autograph_sessions" ON autograph_sessions;
CREATE POLICY "anon_insert_autograph_sessions" ON autograph_sessions FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_autograph_sessions" ON autograph_sessions;
CREATE POLICY "anon_update_autograph_sessions" ON autograph_sessions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE ON autograph_sessions TO anon, authenticated;

-- Pre-populate autograph sessions
INSERT INTO autograph_sessions (artist_name, artist_image, description, session_time, location, capacity)
VALUES
  ('Bad Bunny', 'https://images.pexels.com/photos/19437718/pexels-photo-19437718.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Sesion de autografos exclusiva con Bad Bunny. Solo para poseedores de tickets VIP.', '6:00 PM', 'VIP Lounge', 30),
  ('Grupo Frontera', 'https://images.pexels.com/photos/35587034/pexels-photo-35587034.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Meet & greet con Grupo Frontera. Fotos y firmas para todos los asistentes.', '7:00 PM', 'Platinum Zone', 50),
  ('C.R.O', 'https://images.pexels.com/photos/7971866/pexels-photo-7971866.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Sesion de autografos con C.R.O. Lleva tu merch y te lo firma personalmente.', '7:30 PM', 'General Zone', 80)
ON CONFLICT DO NOTHING;
