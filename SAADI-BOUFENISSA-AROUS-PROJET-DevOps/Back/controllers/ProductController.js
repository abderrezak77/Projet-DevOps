import db from '../config/db.js';

class ProductController {
  // Get all active products
  async getAllProducts(req, res) {
    try {
      const { rows: products } = await db.query(`
        SELECT 
          p.*,
          c.name as category_name,
          (SELECT MAX(amount) FROM bids WHERE product_id = p.id) as current_price,
          (SELECT COUNT(*) FROM bids WHERE product_id = p.id) as bids_count
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.active = TRUE
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
            endTime: new Date(product.end_time).getTime(),
            bids: [],
            bidsCount: parseInt(product.bids_count, 10) || 0,
            category: product.category_name || 'Autres',
            active: product.active,
          };
        })
      );

      res.json(productsWithImages);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  }

  // Get single product with bids
  async getProductById(req, res) {
    try {
      const productId = req.params.id;

      const { rows: products } = await db.query(
        `SELECT p.*, c.name as category_name 
         FROM products p 
         LEFT JOIN categories c ON p.category_id = c.id 
         WHERE p.id = $1`,
        [productId]
      );

      if (products.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const product = products[0];

      // Get images
      const { rows: images } = await db.query(
        'SELECT image_url FROM product_images WHERE product_id = $1 ORDER BY display_order',
        [productId]
      );

      // Get bids
      const { rows: bids } = await db.query(
        `SELECT id, bidder_firstname, bidder_lastname, phone_number, amount, is_anonymous, created_at 
         FROM bids 
         WHERE product_id = $1 
         ORDER BY amount DESC, created_at DESC`,
        [productId]
      );

      const formattedBids = bids.map(bid => ({
        id: bid.id,
        bidderName: `${bid.bidder_firstname} ${bid.bidder_lastname}`,
        phoneNumber: bid.phone_number,
        amount: parseFloat(bid.amount),
        isAnonymous: bid.is_anonymous,
        timestamp: new Date(bid.created_at).getTime(),
      }));

      const currentPrice = formattedBids.length > 0 
        ? formattedBids[0].amount 
        : parseFloat(product.starting_price);

      res.json({
        id: product.id,
        title: product.title,
        description: product.description,
        images: images.map(img => img.image_url),
        startingPrice: parseFloat(product.starting_price),
        currentPrice,
        endTime: new Date(product.end_time).getTime(),
        bids: formattedBids,
        category: product.category_name || 'Autres',
        active: product.active,
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ error: 'Failed to fetch product' });
    }
  }
}

export default new ProductController();
