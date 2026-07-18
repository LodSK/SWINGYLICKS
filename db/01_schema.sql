-- ============================================================
-- RESTAURANT MANAGEMENT SYSTEM — FULL SCHEMA
-- Target: PostgreSQL 15+ (Supabase)
-- ============================================================

-- ------------------------------------------------------------
-- EXTENSIONS
-- ------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- for gen_random_uuid()

-- ------------------------------------------------------------
-- ENUM TYPES
-- ------------------------------------------------------------
CREATE TYPE staff_role         AS ENUM ('owner','manager','chef','waiter','host','delivery_driver');
CREATE TYPE order_channel      AS ENUM ('dine_in','takeaway','delivery');
CREATE TYPE order_status       AS ENUM ('pending','confirmed','preparing','ready','completed','cancelled');
CREATE TYPE payment_status     AS ENUM ('unpaid','paid','refunded','failed');
CREATE TYPE payment_method     AS ENUM ('cash','card','mobile_money','wallet');
CREATE TYPE reservation_status AS ENUM ('booked','seated','completed','no_show','cancelled');
CREATE TYPE delivery_status    AS ENUM ('assigned','picked_up','en_route','delivered','failed');
CREATE TYPE loyalty_txn_type   AS ENUM ('earn','redeem','expire','adjustment');
CREATE TYPE bot_channel        AS ENUM ('customer','admin');

-- ------------------------------------------------------------
-- STAFF (self-referencing FK for management chain)
-- ------------------------------------------------------------
CREATE TABLE staff (
    staff_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manager_id      UUID REFERENCES staff(staff_id) ON DELETE SET NULL,
    full_name       VARCHAR(120) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    phone           VARCHAR(30)  NOT NULL UNIQUE,
    role            staff_role   NOT NULL,
    hourly_rate     NUMERIC(8,2) CHECK (hourly_rate >= 0),
    hired_at        DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Owner can't report to anyone; enforce at app layer + this check helps catch obvious loops later via trigger (see 02_logic.sql)

-- ------------------------------------------------------------
-- CUSTOMERS
-- ------------------------------------------------------------
CREATE TABLE customers (
    customer_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name       VARCHAR(120) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    phone           VARCHAR(30)  NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE customer_addresses (
    address_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id     UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    label           VARCHAR(40) NOT NULL DEFAULT 'home',
    line1           VARCHAR(150) NOT NULL,
    city            VARCHAR(80)  NOT NULL,
    latitude        NUMERIC(9,6),
    longitude       NUMERIC(9,6),
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE (customer_id, label)
);

-- ------------------------------------------------------------
-- MENU
-- ------------------------------------------------------------
CREATE TABLE menu_categories (
    category_id     SERIAL PRIMARY KEY,
    name            VARCHAR(80) NOT NULL UNIQUE,
    display_order   INT NOT NULL DEFAULT 0
);

CREATE TABLE menu_items (
    item_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id     INT NOT NULL REFERENCES menu_categories(category_id) ON DELETE RESTRICT,
    name            VARCHAR(120) NOT NULL,
    description     TEXT,
    price           NUMERIC(8,2) NOT NULL CHECK (price > 0),
    is_available    BOOLEAN NOT NULL DEFAULT TRUE,
    calories        INT CHECK (calories >= 0),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (category_id, name)
);

-- ------------------------------------------------------------
-- INVENTORY / INGREDIENTS / SUPPLIERS
-- ------------------------------------------------------------
CREATE TABLE suppliers (
    supplier_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(120) NOT NULL UNIQUE,
    contact_email   VARCHAR(150),
    contact_phone   VARCHAR(30),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE ingredients (
    ingredient_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(120) NOT NULL UNIQUE,
    unit            VARCHAR(20) NOT NULL,              -- kg, litre, unit...
    reorder_level   NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (reorder_level >= 0),
    stock_quantity  NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0)
);

-- many-to-many, ingredient <-> supplier, with attributes
CREATE TABLE ingredient_suppliers (
    ingredient_id   UUID NOT NULL REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
    supplier_id     UUID NOT NULL REFERENCES suppliers(supplier_id) ON DELETE CASCADE,
    unit_cost       NUMERIC(10,2) NOT NULL CHECK (unit_cost >= 0),
    lead_time_days  INT NOT NULL DEFAULT 1 CHECK (lead_time_days >= 0),
    PRIMARY KEY (ingredient_id, supplier_id)
);

-- many-to-many, menu_item <-> ingredient (recipe), with attributes
CREATE TABLE menu_item_ingredients (
    item_id         UUID NOT NULL REFERENCES menu_items(item_id) ON DELETE CASCADE,
    ingredient_id   UUID NOT NULL REFERENCES ingredients(ingredient_id) ON DELETE RESTRICT,
    quantity_needed NUMERIC(10,3) NOT NULL CHECK (quantity_needed > 0),
    PRIMARY KEY (item_id, ingredient_id)
);

-- ------------------------------------------------------------
-- TABLES & RESERVATIONS
-- ------------------------------------------------------------
CREATE TABLE restaurant_tables (
    table_id        SERIAL PRIMARY KEY,
    table_number    INT NOT NULL UNIQUE,
    capacity        INT NOT NULL CHECK (capacity > 0),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE reservations (
    reservation_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id     UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    table_id        INT  NOT NULL REFERENCES restaurant_tables(table_id) ON DELETE RESTRICT,
    party_size      INT NOT NULL CHECK (party_size > 0),
    reservation_time TIMESTAMPTZ NOT NULL,
    status          reservation_status NOT NULL DEFAULT 'booked',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (reservation_time > created_at)
);

CREATE INDEX idx_reservations_time ON reservations(reservation_time);

-- ------------------------------------------------------------
-- ORDERS
-- ------------------------------------------------------------
CREATE TABLE orders (
    order_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id     UUID REFERENCES customers(customer_id) ON DELETE SET NULL,
    staff_id        UUID REFERENCES staff(staff_id) ON DELETE SET NULL,
    reservation_id  UUID REFERENCES reservations(reservation_id) ON DELETE SET NULL,
    channel         order_channel NOT NULL,
    status          order_status  NOT NULL DEFAULT 'pending',
    subtotal        NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    discount_total  NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (discount_total >= 0),
    tax_total       NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (tax_total >= 0),
    grand_total     NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (grand_total >= 0),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status_created ON orders(status, created_at);

CREATE TABLE order_items (
    order_id        UUID NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    item_id         UUID NOT NULL REFERENCES menu_items(item_id) ON DELETE RESTRICT,
    quantity        INT NOT NULL CHECK (quantity > 0),
    unit_price      NUMERIC(8,2) NOT NULL CHECK (unit_price > 0),  -- price snapshot at order time
    PRIMARY KEY (order_id, item_id)
);

CREATE TABLE payments (
    payment_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    amount          NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    method          payment_method NOT NULL,
    status          payment_status NOT NULL DEFAULT 'unpaid',
    paid_at         TIMESTAMPTZ
);

-- ------------------------------------------------------------
-- DELIVERY
-- ------------------------------------------------------------
CREATE TABLE delivery_drivers (
    driver_id       UUID PRIMARY KEY REFERENCES staff(staff_id) ON DELETE CASCADE,
    vehicle_type    VARCHAR(40),
    license_plate   VARCHAR(20) UNIQUE
);

CREATE TABLE deliveries (
    delivery_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL UNIQUE REFERENCES orders(order_id) ON DELETE CASCADE,
    driver_id       UUID REFERENCES delivery_drivers(driver_id) ON DELETE SET NULL,
    address_id      UUID NOT NULL REFERENCES customer_addresses(address_id) ON DELETE RESTRICT,
    status          delivery_status NOT NULL DEFAULT 'assigned',
    dispatched_at   TIMESTAMPTZ,
    delivered_at    TIMESTAMPTZ,
    CHECK (delivered_at IS NULL OR dispatched_at IS NULL OR delivered_at >= dispatched_at)
);

-- ------------------------------------------------------------
-- LOYALTY PROGRAM
-- ------------------------------------------------------------
CREATE TABLE loyalty_accounts (
    customer_id     UUID PRIMARY KEY REFERENCES customers(customer_id) ON DELETE CASCADE,
    points_balance  INT NOT NULL DEFAULT 0 CHECK (points_balance >= 0),
    tier            VARCHAR(20) NOT NULL DEFAULT 'bronze'
);

CREATE TABLE loyalty_transactions (
    txn_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id     UUID NOT NULL REFERENCES loyalty_accounts(customer_id) ON DELETE CASCADE,
    order_id        UUID REFERENCES orders(order_id) ON DELETE SET NULL,
    points          INT NOT NULL,                       -- positive = earn, negative = redeem
    txn_type        loyalty_txn_type NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK ( (txn_type = 'earn' AND points > 0) OR (txn_type = 'redeem' AND points < 0)
            OR txn_type IN ('expire','adjustment') )
);

-- ------------------------------------------------------------
-- REVIEWS
-- ------------------------------------------------------------
CREATE TABLE reviews (
    review_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id     UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    order_id        UUID REFERENCES orders(order_id) ON DELETE SET NULL,
    item_id         UUID REFERENCES menu_items(item_id) ON DELETE SET NULL,
    rating          INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (customer_id, order_id, item_id)
);

-- ------------------------------------------------------------
-- AI BOT LOGS (customer-facing + admin-facing)
-- ------------------------------------------------------------
CREATE TABLE ai_conversations (
    conversation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel         bot_channel NOT NULL,
    customer_id     UUID REFERENCES customers(customer_id) ON DELETE SET NULL,
    staff_id        UUID REFERENCES staff(staff_id) ON DELETE SET NULL,
    started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK ( (channel = 'customer' AND staff_id IS NULL)
         OR (channel = 'admin'    AND customer_id IS NULL) )
);

CREATE TABLE ai_messages (
    message_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(conversation_id) ON DELETE CASCADE,
    sender          VARCHAR(10) NOT NULL CHECK (sender IN ('user','bot')),
    content         TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_messages_conv ON ai_messages(conversation_id, created_at);
