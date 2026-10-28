/*
# Create seats table for interactive seat selection

1. New Tables
- `seats`
  - `id` (uuid, primary key)
  - `zone` (text, not null) — 'vip', 'platinum', or 'general'
  - `row_label` (text, not null) — letter label like 'A', 'B', etc.
  - `seat_number` (int, not null) — number within the row
  - `label` (text, not null) — full label like 'VIP-A-5'
  - `status` (text, not null, default 'available') — 'available', 'sold'
  - `order_id` (uuid, nullable, references orders) — set when seat is sold
  - `created_at` (timestamptz, default now())
  - Unique constraint on (zone, row_label, seat_number)
2. Security
- Enable RLS on `seats`.
- Allow anon + authenticated SELECT (public can see seat availability).
- Allow anon + authenticated UPDATE (to mark seats as sold on checkout).
- No INSERT/DELETE needed from frontend (seats are pre-populated).
3. Pre-populated seats:
- VIP: rows A-C, 10 seats each (30 total)
- Platinum: rows D-G, 12 seats each (48 total)
- General: rows H-M, 15 seats each (90 total)
*/

CREATE TABLE IF NOT EXISTS seats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone text NOT NULL,
  row_label text NOT NULL,
  seat_number int NOT NULL,
  label text NOT NULL,
  status text NOT NULL DEFAULT 'available',
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(zone, row_label, seat_number)
);

ALTER TABLE seats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_seats" ON seats;
CREATE POLICY "anon_select_seats" ON seats FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_update_seats" ON seats;
CREATE POLICY "anon_update_seats" ON seats FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- Pre-populate VIP seats: rows A-C, 10 seats each
INSERT INTO seats (zone, row_label, seat_number, label)
SELECT 'vip', chr(64 + r), n, 'VIP-' || chr(64 + r) || '-' || n::text
FROM generate_series(1, 3) AS r, generate_series(1, 10) AS n
ON CONFLICT (zone, row_label, seat_number) DO NOTHING;

-- Pre-populate Platinum seats: rows D-G, 12 seats each
INSERT INTO seats (zone, row_label, seat_number, label)
SELECT 'platinum', chr(64 + r), n, 'PLT-' || chr(64 + r) || '-' || n::text
FROM generate_series(4, 7) AS r, generate_series(1, 12) AS n
ON CONFLICT (zone, row_label, seat_number) DO NOTHING;

-- Pre-populate General seats: rows H-M, 15 seats each
INSERT INTO seats (zone, row_label, seat_number, label)
SELECT 'general', chr(64 + r), n, 'GEN-' || chr(64 + r) || '-' || n::text
FROM generate_series(8, 13) AS r, generate_series(1, 15) AS n
ON CONFLICT (zone, row_label, seat_number) DO NOTHING;
