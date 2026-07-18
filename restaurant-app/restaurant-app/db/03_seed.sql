-- ============================================================
-- SEED DATA — enough to exercise every relationship
-- ============================================================

-- Staff (owner has no manager; manager reports to owner; waiter reports to manager)
INSERT INTO staff (staff_id, manager_id, full_name, email, phone, role, hourly_rate)
VALUES
  ('11111111-1111-1111-1111-111111111111', NULL, 'Ama Owusu', 'ama@restaurant.test', '+233200000001', 'owner', 0),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Kofi Mensah', 'kofi@restaurant.test', '+233200000002', 'manager', 15),
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Efua Boateng', 'efua@restaurant.test', '+233200000003', 'waiter', 8),
  ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Yaw Darko', 'yaw@restaurant.test', '+233200000004', 'delivery_driver', 8);

INSERT INTO delivery_drivers (driver_id, vehicle_type, license_plate)
VALUES ('44444444-4444-4444-4444-444444444444', 'motorbike', 'GR-1234-24');

-- Customer
INSERT INTO customers (customer_id, full_name, email, phone, password_hash)
VALUES ('55555555-5555-5555-5555-555555555555', 'SK Test Customer', 'sk@example.com', '+233200000099', 'bcrypt$fakehash');

INSERT INTO customer_addresses (address_id, customer_id, label, line1, city, is_default)
VALUES ('66666666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555', 'home', '12 Independence Ave', 'Accra', TRUE);

-- Menu
INSERT INTO menu_categories (category_id, name, display_order) VALUES (1, 'Mains', 1), (2, 'Drinks', 2);

INSERT INTO menu_items (item_id, category_id, name, description, price)
VALUES
  ('77777777-7777-7777-7777-777777777777', 1, 'Jollof Rice with Chicken', 'Classic jollof, grilled chicken', 45.00),
  ('88888888-8888-8888-8888-888888888888', 2, 'Sobolo', 'Hibiscus drink', 12.00);

-- Ingredients + recipe links
INSERT INTO ingredients (ingredient_id, name, unit, reorder_level, stock_quantity)
VALUES
  ('99999999-9999-9999-9999-999999999999', 'Rice', 'kg', 5, 50),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Chicken', 'kg', 3, 20);

INSERT INTO menu_item_ingredients (item_id, ingredient_id, quantity_needed)
VALUES
  ('77777777-7777-7777-7777-777777777777', '99999999-9999-9999-9999-999999999999', 0.3),
  ('77777777-7777-7777-7777-777777777777', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 0.25);

INSERT INTO suppliers (supplier_id, name, contact_email)
VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Accra Fresh Foods', 'sales@accrafresh.test');

INSERT INTO ingredient_suppliers (ingredient_id, supplier_id, unit_cost, lead_time_days)
VALUES ('99999999-9999-9999-9999-999999999999', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 6.50, 2);

-- Table + reservation
INSERT INTO restaurant_tables (table_id, table_number, capacity) VALUES (1, 5, 4);

INSERT INTO reservations (reservation_id, customer_id, table_id, party_size, reservation_time)
VALUES ('cccccccc-cccc-cccc-cccc-cccccccccccc', '55555555-5555-5555-5555-555555555555', 1, 2, now() + INTERVAL '2 days');

-- Order + items (this is the flow we'll test triggers against)
INSERT INTO orders (order_id, customer_id, staff_id, channel, status)
VALUES ('dddddddd-dddd-dddd-dddd-dddddddddddd', '55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 'dine_in', 'pending');

INSERT INTO order_items (order_id, item_id, quantity, unit_price)
VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '77777777-7777-7777-7777-777777777777', 2, 45.00),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '88888888-8888-8888-8888-888888888888', 2, 12.00);
