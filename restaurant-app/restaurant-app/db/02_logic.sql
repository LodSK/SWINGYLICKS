-- ============================================================
-- TRIGGERS, FUNCTIONS & VIEWS
-- ============================================================

-- ------------------------------------------------------------
-- 1. Generic updated_at stamper
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orders_touch
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ------------------------------------------------------------
-- 2. Prevent staff management loops (self-referencing FK guard)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION prevent_manager_cycle() RETURNS TRIGGER AS $$
DECLARE
    current_id UUID;
BEGIN
    current_id := NEW.manager_id;
    WHILE current_id IS NOT NULL LOOP
        IF current_id = NEW.staff_id THEN
            RAISE EXCEPTION 'Circular management chain detected for staff %', NEW.staff_id;
        END IF;
        SELECT manager_id INTO current_id FROM staff WHERE staff_id = current_id;
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_staff_no_cycle
BEFORE INSERT OR UPDATE OF manager_id ON staff
FOR EACH ROW EXECUTE FUNCTION prevent_manager_cycle();

-- ------------------------------------------------------------
-- 3. Deduct ingredient stock when an order is confirmed
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION deduct_inventory_on_confirm() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'confirmed' AND OLD.status IS DISTINCT FROM 'confirmed' THEN
        UPDATE ingredients i
        SET stock_quantity = stock_quantity - (oi.quantity * mii.quantity_needed)
        FROM order_items oi
        JOIN menu_item_ingredients mii ON mii.item_id = oi.item_id
        WHERE oi.order_id = NEW.order_id
          AND i.ingredient_id = mii.ingredient_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orders_deduct_stock
AFTER UPDATE OF status ON orders
FOR EACH ROW EXECUTE FUNCTION deduct_inventory_on_confirm();

-- ------------------------------------------------------------
-- 4. Award loyalty points when a payment is marked paid
--    (1 point per whole currency unit spent)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION award_loyalty_on_payment() RETURNS TRIGGER AS $$
DECLARE
    cust UUID;
    pts  INT;
BEGIN
    IF NEW.status = 'paid' AND OLD.status IS DISTINCT FROM 'paid' THEN
        SELECT customer_id INTO cust FROM orders WHERE order_id = NEW.order_id;
        IF cust IS NOT NULL THEN
            pts := FLOOR(NEW.amount);
            INSERT INTO loyalty_accounts (customer_id, points_balance)
            VALUES (cust, 0)
            ON CONFLICT (customer_id) DO NOTHING;

            UPDATE loyalty_accounts
            SET points_balance = points_balance + pts
            WHERE customer_id = cust;

            INSERT INTO loyalty_transactions (customer_id, order_id, points, txn_type)
            VALUES (cust, NEW.order_id, pts, 'earn');
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_payments_award_points
AFTER UPDATE OF status ON payments
FOR EACH ROW EXECUTE FUNCTION award_loyalty_on_payment();

-- ------------------------------------------------------------
-- 5. Function: recalc order totals from order_items
--    (call after inserting/updating/deleting order_items)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION recalc_order_totals(p_order_id UUID) RETURNS VOID AS $$
DECLARE
    v_subtotal NUMERIC(10,2);
    v_tax_rate NUMERIC(4,3) := 0.125; -- example VAT rate
BEGIN
    SELECT COALESCE(SUM(quantity * unit_price), 0) INTO v_subtotal
    FROM order_items WHERE order_id = p_order_id;

    UPDATE orders
    SET subtotal    = v_subtotal,
        tax_total   = ROUND(v_subtotal * v_tax_rate, 2),
        grand_total = v_subtotal + ROUND(v_subtotal * v_tax_rate, 2) - discount_total
    WHERE order_id = p_order_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trg_recalc_totals_wrapper() RETURNS TRIGGER AS $$
BEGIN
    PERFORM recalc_order_totals(COALESCE(NEW.order_id, OLD.order_id));
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_items_recalc
AFTER INSERT OR UPDATE OR DELETE ON order_items
FOR EACH ROW EXECUTE FUNCTION trg_recalc_totals_wrapper();

-- ------------------------------------------------------------
-- 6. Function: redeem loyalty points safely (transactional)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION redeem_loyalty_points(p_customer_id UUID, p_points INT, p_order_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_balance INT;
BEGIN
    SELECT points_balance INTO v_balance FROM loyalty_accounts WHERE customer_id = p_customer_id FOR UPDATE;

    IF v_balance IS NULL OR v_balance < p_points THEN
        RETURN FALSE; -- insufficient points
    END IF;

    UPDATE loyalty_accounts SET points_balance = points_balance - p_points WHERE customer_id = p_customer_id;
    INSERT INTO loyalty_transactions (customer_id, order_id, points, txn_type)
    VALUES (p_customer_id, p_order_id, -p_points, 'redeem');

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------
-- VIEWS
-- ------------------------------------------------------------

-- Active reservations coming up
CREATE OR REPLACE VIEW active_reservations AS
SELECT r.reservation_id, c.full_name AS customer_name, t.table_number,
       r.party_size, r.reservation_time, r.status
FROM reservations r
JOIN customers c ON c.customer_id = r.customer_id
JOIN restaurant_tables t ON t.table_id = r.table_id
WHERE r.status IN ('booked','seated')
ORDER BY r.reservation_time;

-- Top-selling items (last 30 days)
CREATE OR REPLACE VIEW top_selling_items AS
SELECT mi.item_id, mi.name, SUM(oi.quantity) AS units_sold,
       SUM(oi.quantity * oi.unit_price) AS revenue
FROM order_items oi
JOIN menu_items mi ON mi.item_id = oi.item_id
JOIN orders o ON o.order_id = oi.order_id
WHERE o.created_at >= now() - INTERVAL '30 days'
  AND o.status <> 'cancelled'
GROUP BY mi.item_id, mi.name
ORDER BY units_sold DESC;

-- Ingredients that need reordering
CREATE OR REPLACE VIEW low_stock_ingredients AS
SELECT ingredient_id, name, stock_quantity, reorder_level
FROM ingredients
WHERE stock_quantity <= reorder_level;

-- Daily sales summary, useful for the admin AI bot
CREATE OR REPLACE VIEW daily_sales_summary AS
SELECT DATE(created_at) AS sales_date,
       COUNT(*) AS order_count,
       SUM(grand_total) AS total_revenue
FROM orders
WHERE status = 'completed'
GROUP BY DATE(created_at)
ORDER BY sales_date DESC;
