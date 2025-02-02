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

// Remove the errorHandler wrapper and use the route handlers directly
router.get('/', getInventory);
router.get('/ventilators', getVentilatorStatus);
router.get('/:id', getInventoryItem);
router.post('/', createInventoryItem);
router.put('/:id', updateInventoryItem);
router.delete('/:id', deleteInventoryItem);

module.exports = router;