const mongoose = require('mongoose');
const { locationNames } = require('../config/locations');

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Equipment', 'PPE', 'Supplies', 'Medicine']
  },
  hospitalLocation: {
    type: String,
    required: true,
    enum: locationNames,
    index: true
  },
  isVentilator: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Available', 'In Use', 'Maintenance', 'Out of Order'],
    default: 'Available'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add index for faster location-based queries
inventorySchema.index({ hospitalLocation: 1, isVentilator: 1 });

module.exports = mongoose.model('Inventory', inventorySchema);