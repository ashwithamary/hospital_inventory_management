const Inventory = require('../models/Inventory');
const { locations: hospitalLocations } = require('../config/locations'); 

// Helper function to validate inventory data
const validateInventoryData = (data) => {
  const errors = [];
  
  if (!data.name) errors.push('Name is required');
  if (data.quantity === undefined || data.quantity < 0) errors.push('Valid quantity is required');
  if (!data.hospitalLocation) errors.push('Hospital location is required');
  
  return errors;
};

const emitInventoryUpdate = async (io) => {
  try {
    const ventilators = await Inventory.find({ isVentilator: true });
    io.emit('ventilatorUpdate', ventilators);
  } catch (error) {
    console.error('Error emitting inventory update:', error);
  }
};

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

    const { hospitalLocation, quantity, isVentilator } = req.body;

    const { locations: hospitalLocations } = require('../config/locations');
    const hospital = hospitalLocations.find(h => h.name === hospitalLocation);
    
    if (!hospital) {
      return res.status(400).json({
        success: false,
        message: 'Invalid hospital location'
      });
    }

    const currentInventory = await Inventory.find({ hospitalLocation });
    const currentTotal = currentInventory.reduce((sum, item) => sum + item.quantity, 0);

    // Validate against capacity
    if (isVentilator) {
      const currentVentilators = currentInventory
        .filter(item => item.isVentilator)
        .reduce((sum, item) => sum + item.quantity, 0);

      if (currentVentilators + quantity > hospital.ventilatorCapacity) {
        return res.status(400).json({
          success: false,
          message: `Cannot exceed ventilator capacity of ${hospital.ventilatorCapacity}`
        });
      }
    }

    // Validate against total capacity
    if (currentTotal + quantity > hospital.capacity) {
      return res.status(400).json({
        success: false,
        message: `Cannot exceed total capacity of ${hospital.capacity}`
      });
    }

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
    const { hospitalLocation, quantity, isVentilator } = req.body;
    const itemId = req.params.id;

    // Get existing item
    const existingItem = await Inventory.findById(itemId);
    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Get hospital data
    const hospital = hospitalLocations.find(h => h.name === hospitalLocation);
    if (!hospital) {
      return res.status(400).json({
        success: false,
        message: 'Invalid hospital location'
      });
    }

    // Check capacity excluding current item
    const otherItems = await Inventory.find({
      hospitalLocation,
      _id: { $ne: itemId }
    });

    const currentTotal = otherItems.reduce((sum, item) => sum + item.quantity, 0);

    if (isVentilator) {
      const currentVentilators = otherItems
        .filter(item => item.isVentilator)
        .reduce((sum, item) => sum + item.quantity, 0);

      if (currentVentilators + quantity > hospital.ventilatorCapacity) {
        return res.status(400).json({
          success: false,
          message: `Cannot exceed ventilator capacity of ${hospital.ventilatorCapacity}`
        });
      }
    }

    if (currentTotal + quantity > hospital.capacity) {
      return res.status(400).json({
        success: false,
        message: `Cannot exceed total capacity of ${hospital.capacity}`
      });
    }

    const updatedItem = await Inventory.findByIdAndUpdate(
      itemId,
      { ...req.body, lastUpdated: Date.now() },
      { new: true, runValidators: true }
    );

    if (updatedItem.isVentilator) {
      await emitInventoryUpdate(req.app.get('io'));
    }

    res.json({
      success: true,
      item: updatedItem
    });

  } catch (error) {
    console.error('Error updating inventory item:', error);
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

exports.getVentilatorStatus = async (req, res) => {
  try {
    const ventilators = await Inventory.find({
      isVentilator: true
    }).select('hospitalLocation status quantity');

    const hospitalStats = {};
    
    // Initialize stats with hospital configuration
    hospitalLocations.forEach(hospital => {
      if (hospital.ventilatorCapacity > 0) {
        hospitalStats[hospital.name] = {
          total: hospital.ventilatorCapacity,
          available: 0,
          inUse: 0,
          maintenance: 0,
          outOfOrder: 0,
          utilization: 0
        };
      }
    });

    // Update with actual ventilator data
    ventilators.forEach(vent => {
      if (hospitalStats[vent.hospitalLocation]) {
        switch (vent.status) {
          case 'Available':
            hospitalStats[vent.hospitalLocation].available += vent.quantity;
            break;
          case 'In Use':
            hospitalStats[vent.hospitalLocation].inUse += vent.quantity;
            break;
          case 'Maintenance':
            hospitalStats[vent.hospitalLocation].maintenance += vent.quantity;
            break;
          case 'Out of Order':
            hospitalStats[vent.hospitalLocation].outOfOrder += vent.quantity;
            break;
        }

        // Calculate utilization
        const stats = hospitalStats[vent.hospitalLocation];
        const totalInUse = stats.inUse + stats.maintenance + stats.outOfOrder;
        stats.utilization = Math.min((totalInUse / stats.total) * 100, 100);
      }
    });

    // Format response
    const formattedStatus = Object.entries(hospitalStats)
      .map(([name, stats]) => ({
        name,
        ...stats,
        utilization: Number(stats.utilization.toFixed(1))
      }))
      .filter(stat => stat.total > 0);

    res.json({
      success: true,
      ventilatorStatus: formattedStatus
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