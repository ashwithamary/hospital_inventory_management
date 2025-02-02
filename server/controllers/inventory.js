const Inventory = require('../models/Inventory');

// Helper function to validate inventory data
const validateInventoryData = (data) => {
  const errors = [];
  
  if (!data.name) errors.push('Name is required');
  if (data.quantity === undefined || data.quantity < 0) errors.push('Valid quantity is required');
  if (!data.hospitalLocation) errors.push('Hospital location is required');
  
  return errors;
};

// Helper function to emit inventory updates
const emitInventoryUpdate = async (io) => {
  try {
    const ventilators = await Inventory.find({ isVentilator: true });
    io.emit('ventilatorUpdate', ventilators);
  } catch (error) {
    console.error('Error emitting inventory update:', error);
  }
};

// Get all inventory items with pagination
exports.getInventory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchTerm = req.query.search || '';
    const sortField = req.query.sortField || 'createdAt';
    const sortOrder = req.query.sortOrder || 'desc';
    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery = searchTerm ? {
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { category: { $regex: searchTerm, $options: 'i' } },
        { hospitalLocation: { $regex: searchTerm, $options: 'i' } }
      ]
    } : {};

    // Create sort object
    const sortObject = { [sortField]: sortOrder === 'asc' ? 1 : -1 };

    // Get filtered and sorted items with pagination
    const items = await Inventory.find(searchQuery)
      .sort(sortObject)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Inventory.countDocuments(searchQuery);

    res.json({
      success: true,
      items,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit
    });
  } catch (error) {
    console.error('Error in getInventory:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get a single inventory item
exports.getInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    res.json({
      success: true,
      item
    });
  } catch (error) {
    console.error('Error getting inventory item:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create a new inventory item
exports.createInventoryItem = async (req, res) => {
  try {
    console.log('Create request received:', req.body);

    // Validate request data
    const validationErrors = validateInventoryData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    const newItem = new Inventory(req.body);
    const savedItem = await newItem.save();
    
    console.log('Item created successfully:', savedItem);

    // Emit update if it's a ventilator
    if (savedItem.isVentilator) {
      await emitInventoryUpdate(req.app.get('io'));
    }

    res.status(201).json({
      success: true,
      item: savedItem
    });

  } catch (error) {
    console.error('Error creating inventory item:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating inventory item',
      error: error.message
    });
  }
};

// Update an inventory item
exports.updateInventoryItem = async (req, res) => {
  try {
    console.log('Update request received:', {
      id: req.params.id,
      body: req.body
    });

    // Validate request data
    const validationErrors = validateInventoryData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Check if item exists before update
    const existingItem = await Inventory.findById(req.params.id);
    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Prepare update data
    const updateData = {
      ...req.body,
      lastUpdated: Date.now()
    };

    // Perform update with error handling
    const updatedItem = await Inventory.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true, 
        runValidators: true,
        context: 'query'
      }
    );

    console.log('Item updated successfully:', updatedItem);

    // Emit update if it's a ventilator
    if (updatedItem.isVentilator) {
      await emitInventoryUpdate(req.app.get('io'));
    }

    res.json({
      success: true,
      item: updatedItem
    });

  } catch (error) {
    console.error('Error updating inventory item:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating inventory item',
      error: error.message
    });
  }
};

// Delete an inventory item
exports.deleteInventoryItem = async (req, res) => {
  try {
    const deletedItem = await Inventory.findById(req.params.id);
    
    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    const isVentilator = deletedItem.isVentilator;
    await deletedItem.remove();

    // Emit update if it was a ventilator
    if (isVentilator) {
      await emitInventoryUpdate(req.app.get('io'));
    }

    res.json({
      success: true,
      message: 'Item deleted successfully',
      item: deletedItem
    });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error deleting inventory item',
      error: error.message
    });
  }
};

// Get ventilator status
exports.getVentilatorStatus = async (req, res) => {
  try {
    const ventilators = await Inventory.find({
      isVentilator: true
    }).select('hospitalLocation status quantity');

    const statusByLocation = ventilators.reduce((acc, curr) => {
      if (!acc[curr.hospitalLocation]) {
        acc[curr.hospitalLocation] = {
          total: 0,
          available: 0
        };
      }
      acc[curr.hospitalLocation].total += curr.quantity;
      if (curr.status === 'Available') {
        acc[curr.hospitalLocation].available += curr.quantity;
      }
      return acc;
    }, {});

    res.json({
      success: true,
      ventilatorStatus: statusByLocation
    });
  } catch (error) {
    console.error('Error getting ventilator status:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving ventilator status',
      error: error.message
    });
  }
};