const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locations');
const { getNearestHospitals } = require('../controllers/locations');


// Get all locations
router.get('/', locationController.getLocations);

// Get location statistics
router.get('/stats', locationController.getLocationStats);

// Find nearest hospitals with available ventilators
router.post('/nearest',getNearestHospitals);

const DEBUG = true;

router.post('/nearest', async (req, res) => {
    try {
      if (DEBUG) {
        console.log('Received coordinates:', req.body);
      }
  
      const { lat, lng } = req.body;
  
      // Validate coordinates
      if (!lat || !lng || isNaN(Number(lat)) || isNaN(Number(lng))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coordinates provided'
        });
      }
  
      // Convert to numbers
      const latitude = Number(lat);
      const longitude = Number(lng);
  
      // Mock data for testing (replace this with your actual data source)
      const hospitals = [
        {
          id: 'central',
          name: 'Central Hospital',
          coordinates: { lat: 12.9716, lng: 77.5946 },
          ventilatorCapacity: 100,
          ventilators: 80,
          distance: 0
        },
        // Add more mock hospitals if needed
      ];
  
      // Calculate distances
      const hospitalsWithDistance = hospitals.map(hospital => ({
        ...hospital,
        distance: calculateDistance(
          latitude,
          longitude,
          hospital.coordinates.lat,
          hospital.coordinates.lng
        )
      }));
  
      // Sort by distance
      const sortedHospitals = hospitalsWithDistance.sort((a, b) => a.distance - b.distance);
  
      if (DEBUG) {
        console.log('Sending response:', {
          success: true,
          hospitals: sortedHospitals
        });
      }
  
      return res.json({
        success: true,
        hospitals: sortedHospitals
      });
  
    } catch (error) {
      console.error('Server error in /nearest:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while finding nearest hospitals',
        error: DEBUG ? error.message : undefined
      });
    }
  });
  
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  }
  
  function deg2rad(deg) {
    return deg * (Math.PI/180);
  }
  
  module.exports = router;
  
  