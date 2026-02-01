import express from 'express';
import AdminController from '../controllers/AdminController.js';

const router = express.Router();

// Get all products (including inactive)
router.get('/admin/products', AdminController.getAllProducts.bind(AdminController));

// Create product
router.post('/admin/products', AdminController.createProduct.bind(AdminController));

// Update product
router.put('/admin/products/:id', AdminController.updateProduct.bind(AdminController));

// Delete product
router.delete('/admin/products/:id', AdminController.deleteProduct.bind(AdminController));

// Get categories
router.get('/categories', AdminController.getCategories.bind(AdminController));

export default router;
