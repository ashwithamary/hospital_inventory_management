const {
  locations,
  locationNames,
} = require('../config/locations');
const Inventory = require('../models/Inventory');
const { calculateDistance } = require('../utils/distance');

// Get all locations
exports.getLocations = async (req, res) => {
  try {
    res.json({
      success: true,
      locations: locationNames
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get location statistics
exports.getLocationStats = async (req, res) => {
  try {
    const inventoryStats = await Inventory.aggregate([
      {
        $group: {
          _id: '$hospitalLocation',
          totalItems: { $sum: '$quantity' },
          ventilators: {
            $sum: {
              $cond: [{ $eq: ['$isVentilator', true] }, '$quantity', 0]
            }
          }
        }
      }
    ]);

    const statsMap = inventoryStats.reduce((acc, stat) => {
      acc[stat._id] = {
        totalItems: stat.totalItems,
        ventilators: stat.ventilators
      };
      return acc;
    }, {});

    const locationStats = locations.map(location => ({
      id: location.id,
      name: location.name,
      type: location.type,
      region: location.region,
      capacity: location.capacity,
      ventilatorCapacity: location.ventilatorCapacity,
      alertThreshold: location.alertThreshold,
      coordinates: location.coordinates,
      totalItems: statsMap[location.name]?.totalItems || 0,
      ventilators: statsMap[location.name]?.ventilators || 0
    }));

    res.json({
      success: true,
      stats: locationStats
    });
  } catch (error) {
    console.error('Error getting location stats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getNearestHospitals = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    console.log('Received coordinates:', { lat, lng });

    // Validate coordinates
    if (lat === undefined || lng === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
        received: { lat, lng }
      });
    }

    // Ensure coordinates are numbers
    const latitude = Number(lat);
    const longitude = Number(lng);

    // Validate converted numbers
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates - must be numbers',
        received: { lat, lng }
      });
    }

    console.log('Processing coordinates:', { latitude, longitude });

    // Get all locations with their current stats
    const inventoryStats = await Inventory.aggregate([
      {
        $match: { isVentilator: true }
      },
      {
        $group: {
          _id: '$hospitalLocation',
          ventilators: { $sum: '$quantity' }
        }
      }
    ]);

    const ventilatorMap = inventoryStats.reduce((acc, stat) => {
      acc[stat._id] = stat.ventilators;
      return acc;
    }, {});

    // Calculate distances and prepare hospital data
    const hospitalsWithDistance = locations
      .map(hospital => {
        if (!hospital.coordinates) {
          console.log('Hospital missing coordinates:', hospital);
          return null;
        }
        
        return {
          id: hospital.id,
          name: hospital.name,
          type: hospital.type,
          region: hospital.region,
          capacity: hospital.capacity,
          coordinates: hospital.coordinates,
          ventilatorCapacity: hospital.ventilatorCapacity,
          ventilators: ventilatorMap[hospital.name] || 0,
          distance: calculateDistance(latitude, longitude, hospital)
        };
      })
      .filter(hospital => hospital !== null) 
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);

    console.log('Sending hospitals:', hospitalsWithDistance);

    return res.json({
      success: true,
      hospitals: hospitalsWithDistance
    });

  } catch (error) {
    console.error('Error in getNearestHospitals:', error);
    return res.status(500).json({
      success: false,
      message: 'Error finding nearest hospitals',
      error: error.message
    });
  }
};