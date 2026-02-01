import express from 'express';
import ProductController from '../controllers/ProductController.js';
import BidController from '../controllers/BidController.js';

const router = express.Router();

// Get all active products
router.get('/products', ProductController.getAllProducts.bind(ProductController));

// Get single product
router.get('/products/:id', ProductController.getProductById.bind(ProductController));

// Place a bid
router.post('/products/:id/bids', BidController.placeBid.bind(BidController));

export default router;
