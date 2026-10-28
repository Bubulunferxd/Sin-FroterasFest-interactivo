/*
# Create orders table for concert ticket store

1. New Tables
- `orders`
  - `id` (uuid, primary key) — unique order identifier
  - `customer_name` (text, not null) — buyer's full name
  - `customer_email` (text, not null) — buyer's email
  - `customer_phone` (text, not null) — buyer's phone
  - `items` (jsonb, not null) — array of cart items with type/name/qty/price
  - `total` (numeric, not null) — total order amount in USD
  - `confirmation_code` (text, not null) — unique code embedded in QR
  - `status` (text, default 'confirmed') — order status
  - `created_at` (timestamptz, default now())
2. Security
- Enable RLS on `orders`.
- Allow anon + authenticated full CRUD (no-auth public store).
- All data is intentionally shared — no ownership checks needed.
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  items jsonb NOT NULL,
  total numeric(10,2) NOT NULL,
  confirmation_code text NOT NULL,
  status text NOT NULL DEFAULT 'confirmed',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_orders" ON orders;
CREATE POLICY "anon_select_orders" ON orders FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_orders" ON orders;
CREATE POLICY "anon_update_orders" ON orders FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_orders" ON orders;
CREATE POLICY "anon_delete_orders" ON orders FOR DELETE
  TO anon, authenticated USING (true);
