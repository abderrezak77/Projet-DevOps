import db from '../config/db.js';

class AdminController {
  // Get all products (including inactive)
  async getAllProducts(req, res) {
    try {
      const { rows: products } = await db.query(`
        SELECT 
          p.*,
          c.name as category_name,
          c.id as category_id,
          (SELECT MAX(amount) FROM bids WHERE product_id = p.id) as current_price,
          (SELECT COUNT(*) FROM bids WHERE product_id = p.id) as bids_count
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.created_at DESC
      `);

      const productsWithImages = await Promise.all(
        products.map(async (product) => {
          const { rows: images } = await db.query(
            'SELECT image_url FROM product_images WHERE product_id = $1 ORDER BY display_order',
            [product.id]
          );
          
          return {
            id: product.id,
            title: product.title,
            description: product.description,
            images: images.map(img => img.image_url),
            startingPrice: parseFloat(product.starting_price),
            currentPrice: product.current_price ? parseFloat(product.current_price) : parseFloat(product.starting_price),
            endTime: new Date(product.end_time).toISOString(),
            category: product.category_name || 'Autres',
            categoryId: product.category_id || null,
            active: product.active,
            bidsCount: parseInt(product.bids_count),
          };
        })
      );

      res.json(productsWithImages);
    } catch (error) {
      console.error('Error fetching admin products:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  }

  // Create new product
  async createProduct(req, res) {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');

      const { title, description, startingPrice, endTime, categoryId, images } = req.body;

      if (!title || !description || !startingPrice || !endTime) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const { rows } = await client.query(
        'INSERT INTO products (title, description, starting_price, end_time, category_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [title, description, startingPrice, endTime, categoryId || null]
      );

      const productId = rows[0].id;

      // Insert images
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          await client.query(
            'INSERT INTO product_images (product_id, image_url, display_order) VALUES ($1, $2, $3)',
            [productId, images[i], i]
          );
        }
      }

      await client.query('COMMIT');

      res.status(201).json({ id: productId, message: 'Product created successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating product:', error);
      res.status(500).json({ error: 'Failed to create product' });
    } finally {
      client.release();
    }
  }

  // Update product
  async updateProduct(req, res) {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');

      const productId = req.params.id;
      const { title, description, startingPrice, endTime, categoryId, images, active } = req.body;

      await client.query(
        'UPDATE products SET title = $1, description = $2, starting_price = $3, end_time = $4, category_id = $5, active = $6 WHERE id = $7',
        [title, description, startingPrice, endTime, categoryId || null, active, productId]
      );

      // Update images if provided
      if (images) {
        await client.query('DELETE FROM product_images WHERE product_id = $1', [productId]);
        
        if (images.length > 0) {
          for (let i = 0; i < images.length; i++) {
            await client.query(
              'INSERT INTO product_images (product_id, image_url, display_order) VALUES ($1, $2, $3)',
              [productId, images[i], i]
            );
          }
        }
      }

      await client.query('COMMIT');

      res.json({ message: 'Product updated successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating product:', error);
      res.status(500).json({ error: 'Failed to update product' });
    } finally {
      client.release();
    }
  }

  // Delete product
  async deleteProduct(req, res) {
    try {
      const productId = req.params.id;
      await db.query('DELETE FROM products WHERE id = $1', [productId]);
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: 'Failed to delete product' });
    }
  }

  // Get all categories
  async getCategories(req, res) {
    try {
      const { rows: categories } = await db.query('SELECT * FROM categories ORDER BY name');
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  }
}

export default new AdminController();
