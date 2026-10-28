/*
# Reset seats with new capacity: VIP 50, Platinum 100, General 200

1. Changes
- Clear existing seats and re-populate with new counts
- VIP: 50 seats across 5 rows (A-E), 10 seats each
- Platinum: 100 seats across 10 rows (F-O), 10 seats each  
- General: 200 seats across 10 rows (P-Y), 20 seats each
- All seats start as 'available'
2. Security
- No policy changes (existing policies remain)
3. Note
- DELETE is used here only on the seats table which is a derived/seed table
  with no user data to preserve. Orders are not affected.
*/

DELETE FROM seats;

-- VIP: rows A-E (5 rows x 10 seats = 50)
INSERT INTO seats (zone, row_label, seat_number, label)
SELECT 'vip', chr(64 + r), n, 'VIP-' || chr(64 + r) || '-' || n::text
FROM generate_series(1, 5) AS r, generate_series(1, 10) AS n;

-- Platinum: rows F-O (10 rows x 10 seats = 100)
INSERT INTO seats (zone, row_label, seat_number, label)
SELECT 'platinum', chr(64 + r), n, 'PLT-' || chr(64 + r) || '-' || n::text
FROM generate_series(6, 15) AS r, generate_series(1, 10) AS n;

-- General: rows P-Y (10 rows x 20 seats = 200)
INSERT INTO seats (zone, row_label, seat_number, label)
SELECT 'general', chr(64 + r), n, 'GEN-' || chr(64 + r) || '-' || n::text
FROM generate_series(16, 25) AS r, generate_series(1, 20) AS n;
