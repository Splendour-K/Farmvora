/*
  # Optimize RLS Policies for Performance
  
  Replace auth.uid() with (SELECT auth.uid()) to prevent re-evaluation per row.
  This significantly improves query performance at scale.
*/

-- PROFILES
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- CART ITEMS
DROP POLICY IF EXISTS "Users can view own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can add to own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can update own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can delete from own cart" ON cart_items;

CREATE POLICY "Users can view own cart"
  ON cart_items FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can add to own cart"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own cart"
  ON cart_items FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete from own cart"
  ON cart_items FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- NOTIFICATIONS
DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- PROJECT FAVORITES
DROP POLICY IF EXISTS "Users can read own favorites" ON project_favorites;
DROP POLICY IF EXISTS "Users can create own favorites" ON project_favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON project_favorites;

CREATE POLICY "Users can read own favorites"
  ON project_favorites FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create own favorites"
  ON project_favorites FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own favorites"
  ON project_favorites FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ORDERS
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- ORDER ITEMS
DROP POLICY IF EXISTS "Users can create order items for own orders" ON order_items;
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;

CREATE POLICY "Users can create order items for own orders"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = (SELECT auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- PAYMENT TRANSACTIONS
DROP POLICY IF EXISTS "Users can view own payment transactions" ON payment_transactions;
DROP POLICY IF EXISTS "Users can create own payment transactions" ON payment_transactions;

CREATE POLICY "Users can view own payment transactions"
  ON payment_transactions FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can create own payment transactions"
  ON payment_transactions FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- PRODUCTS
DROP POLICY IF EXISTS "Admins can manage products" ON products;

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- PROJECTS
DROP POLICY IF EXISTS "Admins can create projects" ON projects;
DROP POLICY IF EXISTS "Admins can update projects" ON projects;

CREATE POLICY "Admins can create projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- WEEKLY UPDATES
DROP POLICY IF EXISTS "Admins can create updates" ON weekly_updates;
DROP POLICY IF EXISTS "Admins can update updates" ON weekly_updates;

CREATE POLICY "Admins can create updates"
  ON weekly_updates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update updates"
  ON weekly_updates FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );