-- =============================================
-- BETEL BOUTTIQUE — Store Management Schema
-- =============================================

-- CATEGORÍAS DE PRODUCTO
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📦',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- PRODUCTOS
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT UNIQUE,
  image_url TEXT,
  cost_price NUMERIC(12,2) DEFAULT 0,
  sell_price NUMERIC(12,2) DEFAULT 0,
  status TEXT CHECK (status IN ('active', 'inactive', 'out_of_stock')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- VARIANTES DE PRODUCTO (Talles)
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  color TEXT,
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, size, color)
);

-- PROVEEDORES
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cuit TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  notes TEXT,
  payment_terms TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RELACIÓN PROVEEDOR-PRODUCTO
CREATE TABLE IF NOT EXISTS supplier_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid REFERENCES suppliers(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  unit_cost NUMERIC(12,2),
  last_purchase_date TIMESTAMPTZ,
  notes TEXT,
  UNIQUE(supplier_id, product_id)
);

-- CATEGORÍAS DE TRANSACCIÓN
CREATE TABLE IF NOT EXISTS transaction_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  icon TEXT DEFAULT '💰',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- TRANSACCIONES (Ingresos y Egresos)
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES transaction_categories(id) ON DELETE SET NULL,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  description TEXT,
  payment_method TEXT CHECK (payment_method IN ('cash', 'transfer', 'card', 'mercadopago', 'other')) DEFAULT 'cash',
  reference TEXT,
  date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insertar categorías de producto por defecto
INSERT INTO categories (name, description, icon) VALUES
  ('Remeras', 'Remeras con diseños cristianos', '👕'),
  ('Buzos', 'Buzos y hoodies', '🧥'),
  ('Gorras', 'Gorras y accesorios para la cabeza', '🧢'),
  ('Accesorios', 'Pulseras, collares, llaveros', '📿'),
  ('Libros', 'Biblias y libros cristianos', '📖'),
  ('Stickers', 'Calcomanías y stickers', '🏷️')
ON CONFLICT DO NOTHING;

-- Insertar categorías de transacción por defecto
INSERT INTO transaction_categories (name, type, icon) VALUES
  ('Ventas', 'income', '🛒'),
  ('Otros ingresos', 'income', '💵'),
  ('Mercadería', 'expense', '📦'),
  ('Envíos', 'expense', '🚚'),
  ('Publicidad', 'expense', '📢'),
  ('Alquiler', 'expense', '🏠'),
  ('Servicios', 'expense', '⚡'),
  ('Otros gastos', 'expense', '📋')
ON CONFLICT DO NOTHING;

-- RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_all" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON product_variants FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON suppliers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON supplier_products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON transaction_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE product_variants;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
