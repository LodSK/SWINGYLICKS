-- ============================================================
-- EXTENSIONS: branches (physical locations) + newsletter signups
-- ============================================================

CREATE TABLE branches (
    branch_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(120) NOT NULL,
    address         VARCHAR(200) NOT NULL,
    phone           VARCHAR(30),
    latitude        NUMERIC(9,6),
    longitude       NUMERIC(9,6),
    opens_at        TIME NOT NULL DEFAULT '10:00',
    closes_at       TIME NOT NULL DEFAULT '22:00',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (name)
);

CREATE TABLE newsletter_subscribers (
    subscriber_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(150) NOT NULL UNIQUE,
    subscribed_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sample branches (Accra-area, matching the FoodFusion/Swingy Licks brand)
INSERT INTO branches (name, address, phone, latitude, longitude, opens_at, closes_at) VALUES
  ('Spintex', 'Plot 12, Spintex Road, near Palace Mall, Accra', '+233302123456', 5.6389, -0.1029, '10:00', '22:30'),
  ('Osu', 'Oxford Street, Osu, Accra', '+233302654321', 5.5560, -0.1820, '10:00', '23:00'),
  ('East Legon', 'Lagos Avenue, East Legon, Accra', '+233302789012', 5.6501, -0.1560, '10:00', '22:00'),
  ('Kumasi', 'Prempeh II Street, Adum, Kumasi', '+233322456789', 6.6885, -1.6244, '09:30', '22:00');
