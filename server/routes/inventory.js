const express = require('express');
const router = express.Router();
const {
  getInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getVentilatorStatus
} = require('../controllers/inventory');

// Wrapper for async route handlers
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Add logging middleware for inventory routes
router.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - Inventory Route: ${req.method} ${req.url}`);
  next();
});

router.get('/', asyncHandler(async (req, res) => {
  console.log('Getting inventory list');
  const result = await getInventory(req, res);
  return result;
}));

router.get('/ventilators', asyncHandler(async (req, res) => {
  console.log('Getting ventilator status');
  const result = await getVentilatorStatus(req, res);
  return result;
}));

router.get('/:id', asyncHandler(async (req, res) => {
  console.log(`Getting inventory item: ${req.params.id}`);
  const result = await getInventoryItem(req, res);
  return result;
}));

router.post('/', asyncHandler(async (req, res) => {
  console.log('Creating inventory item:', req.body);
  const result = await createInventoryItem(req, res);
  return result;
}));

router.put('/:id', asyncHandler(async (req, res) => {
  console.log(`Updating inventory item: ${req.params.id}`, req.body);
  const result = await updateInventoryItem(req, res);
  return result;
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  console.log(`Deleting inventory item: ${req.params.id}`);
  const result = await deleteInventoryItem(req, res);
  return result;
}));

module.exports = router;