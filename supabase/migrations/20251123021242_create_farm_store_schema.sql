/*
  # Create Farm Store Schema

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text) - product name
      - `description` (text) - product description
      - `category` (text) - eggs, chickens, frozen_birds, etc.
      - `price_usd` (numeric) - price in USD
      - `price_ngn` (numeric) - price in NGN
      - `unit` (text) - kg, piece, crate, etc.
      - `stock_quantity` (integer) - available stock
      - `image_url` (text) - product image
      - `is_available` (boolean) - product availability
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `cart_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `product_id` (uuid, foreign key to products)
      - `quantity` (integer)
      - `created_at` (timestamptz)
    
    - `orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `total_amount_usd` (numeric)
      - `total_amount_ngn` (numeric)
      - `currency` (text) - USD or NGN
      - `status` (text) - pending, processing, shipped, delivered, cancelled
      - `delivery_address` (text)
      - `delivery_phone` (text)
      - `delivery_notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key to orders)
      - `product_id` (uuid, foreign key to products)
      - `quantity` (integer)
      - `unit_price_usd` (numeric)
      - `unit_price_ngn` (numeric)
      - `subtotal_usd` (numeric)
      - `subtotal_ngn` (numeric)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Products: Public read, admin write
    - Cart items: Users can manage their own cart
    - Orders: Users can view/create own orders, admins can view/update all
    - Order items: Users can view their own, admins can view all
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  price_usd numeric(10, 2) NOT NULL,
  price_ngn numeric(12, 2) NOT NULL,
  unit text NOT NULL DEFAULT 'piece',
  stock_quantity integer NOT NULL DEFAULT 0,
  image_url text,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total_amount_usd numeric(12, 2) NOT NULL DEFAULT 0,
  total_amount_ngn numeric(15, 2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'pending',
  delivery_address text NOT NULL,
  delivery_phone text NOT NULL,
  delivery_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  quantity integer NOT NULL,
  unit_price_usd numeric(10, 2) NOT NULL,
  unit_price_ngn numeric(12, 2) NOT NULL,
  subtotal_usd numeric(12, 2) NOT NULL,
  subtotal_ngn numeric(15, 2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Anyone can view available products"
  ON products FOR SELECT
  USING (is_available = true);

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Cart items policies
CREATE POLICY "Users can view own cart"
  ON cart_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to own cart"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from own cart"
  ON cart_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Order items policies
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can create order items for own orders"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Create function to update product updated_at
CREATE OR REPLACE FUNCTION update_product_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for product updates
DROP TRIGGER IF EXISTS trigger_update_product_timestamp ON products;
CREATE TRIGGER trigger_update_product_timestamp
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_product_updated_at();

-- Create function to update order updated_at
CREATE OR REPLACE FUNCTION update_order_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for order updates
DROP TRIGGER IF EXISTS trigger_update_order_timestamp ON orders;
CREATE TRIGGER trigger_update_order_timestamp
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_order_updated_at();