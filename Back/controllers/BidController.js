import db from '../config/db.js';

class BidController {
  async placeBid(req, res) {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');

      const productId = req.params.id;
      const { bidderName, phoneNumber, amount, isAnonymous } = req.body;

      // Validate input
      if (!bidderName || !phoneNumber || !amount) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Split bidder name
      const nameParts = bidderName.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      // Get current highest bid
      const { rows: currentBids } = await client.query(
        'SELECT MAX(amount) as max_amount FROM bids WHERE product_id = $1',
        [productId]
      );

      const { rows: product } = await client.query(
        'SELECT starting_price FROM products WHERE id = $1',
        [productId]
      );

      if (product.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Product not found' });
      }

      const currentPrice = currentBids[0].max_amount || product[0].starting_price;

      if (amount <= currentPrice) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Bid must be higher than current price' });
      }

      // Insert bid
      await client.query(
        `INSERT INTO bids (product_id, bidder_firstname, bidder_lastname, phone_number, amount, is_anonymous) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [productId, firstName, lastName, phoneNumber, amount, isAnonymous]
      );

      await client.query('COMMIT');

      // Return updated product
      const { rows: updatedProduct } = await db.query(
        `SELECT p.*, c.name as category_name 
         FROM products p 
         LEFT JOIN categories c ON p.category_id = c.id 
         WHERE p.id = $1`,
        [productId]
      );

      const { rows: images } = await db.query(
        'SELECT image_url FROM product_images WHERE product_id = $1 ORDER BY display_order',
        [productId]
      );

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

      res.json({
        id: updatedProduct[0].id,
        title: updatedProduct[0].title,
        description: updatedProduct[0].description,
        images: images.map(img => img.image_url),
        startingPrice: parseFloat(updatedProduct[0].starting_price),
        currentPrice: parseFloat(amount),
        endTime: new Date(updatedProduct[0].end_time).getTime(),
        bids: formattedBids,
        category: updatedProduct[0].category_name || 'Autres',
        active: updatedProduct[0].active,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error placing bid:', error);
      res.status(500).json({ error: 'Failed to place bid' });
    } finally {
      client.release();
    }
  }
}

export default new BidController();
