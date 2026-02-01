-- PostgreSQL Database Schema for Enchères Royale

-- Drop existing tables if they exist
DROP TABLE IF EXISTS bids CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Create categories table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  starting_price DECIMAL(10, 2) NOT NULL,
  end_time TIMESTAMP NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create product_images table
CREATE TABLE product_images (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bids table
CREATE TABLE bids (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  bidder_firstname VARCHAR(100) NOT NULL,
  bidder_lastname VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_bids_product_id ON bids(product_id);
CREATE INDEX idx_bids_amount ON bids(product_id, amount DESC);
CREATE INDEX idx_bids_created_at ON bids(created_at DESC);

-- Insert default categories
INSERT INTO categories (name) VALUES 
  ('Électronique'),
  ('Bijoux'),
  ('Art'),
  ('Véhicules'),
  ('Immobilier'),
  ('Mode'),
  ('Antiquités'),
  ('Autres');

-- Insert sample products
INSERT INTO products (title, description, starting_price, end_time, category_id) VALUES
  ('Montre de luxe Rolex Submariner', 'Montre Rolex Submariner en excellent état, avec certificat d''authenticité et boîte d''origine. Modèle classique recherché par les collectionneurs.', 5000, NOW() + INTERVAL '7 days', 2),
  ('iPhone 15 Pro Max 256GB', 'iPhone 15 Pro Max neuf, couleur titane naturel, 256GB de stockage. Encore sous garantie Apple.', 800, NOW() + INTERVAL '3 days', 1),
  ('Tableau original signé', 'Œuvre d''art contemporaine signée, huile sur toile 80x120cm. Artiste reconnu avec certificat d''authenticité.', 2500, NOW() + INTERVAL '10 days', 3);

-- Insert sample images
INSERT INTO product_images (product_id, image_url, display_order) VALUES
  (1, 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800', 0),
  (1, 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800', 1),
  (2, 'https://images.unsplash.com/photo-1678652197950-d4b91f0eef32?w=800', 0),
  (2, 'https://images.unsplash.com/photo-1592286927505-ed6d0686d302?w=800', 1),
  (3, 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800', 0),
  (3, 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800', 1);

-- Insert sample bids
INSERT INTO bids (product_id, bidder_firstname, bidder_lastname, phone_number, amount, is_anonymous) VALUES
  (1, 'Pierre', 'Dubois', '0612345678', 5500, FALSE),
  (1, 'Marie', 'Martin', '0623456789', 6000, FALSE),
  (2, 'Jean', 'Lefebvre', '0634567890', 850, FALSE),
  (3, 'Sophie', 'Bernard', '0645678901', 2700, TRUE);
