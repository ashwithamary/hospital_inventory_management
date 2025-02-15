const calculateDistance = require('../utils/distance');

const hospitalLocations = [
    {
        id: 'central',
        name: 'Central Hospital',
        type: 'Major Hospital',
        region: 'Central',
        capacity: 1000,
        coordinates: { lat: 12.9716, lng: 77.5946 },
        ventilatorCapacity: 50,
        alertThreshold: 20
    },
    // Major Hospitals
    {
        id: 'city-general',
        name: 'City General Hospital',
        type: 'Major Hospital',
        region: 'North',
        coordinates: { lat: 12.9716, lng: 77.5946 },
        capacity: 800,
        ventilatorCapacity: 40,
        alertThreshold: 20
    },
    {
        id: 'metro-med',
        name: 'Metropolitan Medical Center',
        type: 'Major Hospital',
        region: 'South',
        coordinates: { lat: 12.9716, lng: 77.5946 },
        capacity: 900,
        ventilatorCapacity: 45,
        alertThreshold: 20
    },
  
    // Regional Centers
    {
        id: 'north-wing',
        name: 'North Wing Medical Center',
        type: 'Regional Center',
        region: 'North',
        capacity: 500,
        coordinates: { lat: 12.9716, lng: 77.5946 },
        ventilatorCapacity: 25,
        alertThreshold: 15
    },
    {
        id: 'south-district',
        name: 'South District Hospital',
        type: 'Regional Center',
        region: 'South',
        capacity: 500,
        coordinates: { lat: 12.9716, lng: 77.5946 },
        ventilatorCapacity: 25,
        alertThreshold: 15
    },
  
    // Emergency Centers
    {
        id: 'emergency-1',
        name: 'Emergency Care Unit 1',
        type: 'Emergency Center',
        region: 'Central',
        capacity: 200,
        coordinates: { lat: 12.9716, lng: 77.5946 },
        ventilatorCapacity: 20,
        alertThreshold: 25
    },
    {
        id: 'trauma-north',
        name: 'Trauma Center North',
        type: 'Emergency Center',
        region: 'North',
        capacity: 250,
        coordinates: { lat: 12.9716, lng: 77.5946 },
        ventilatorCapacity: 25,
        alertThreshold: 25
    },
  
    // Storage Facilities
    {
        id: 'storage-a',
        name: 'Central Storage A',
        type: 'Storage',
        region: 'Central',
        capacity: 5000,
        coordinates: { lat: 12.9716, lng: 77.5946 },
        ventilatorCapacity: 100,
        alertThreshold: 30
    },
    {
        id: 'storage-b',
        name: 'Central Storage B',
        type: 'Storage',
        region: 'Central',
        capacity: 5000,
        ventilatorCapacity: 100,
        coordinates: { lat: 12.9716, lng: 77.5946 },
        alertThreshold: 30
    },
  
    // ICU Centers
    {
        id: 'icu-complex',
        name: 'ICU Complex',
        type: 'Specialized Unit',
        region: 'Central',
        capacity: 300,
        coordinates: { lat: 12.9716, lng: 77.5946 },
        ventilatorCapacity: 50,
        alertThreshold: 20
    },
    // Central Region Major Hospitals
    {
        id: 'central-general',
        name: 'Central General Hospital',
        type: 'Major Hospital',
        region: 'Central',
        coordinates: { lat: 12.9716, lng: 77.5946 },
        capacity: 1000,
        ventilatorCapacity: 50,
        alertThreshold: 20
    },
    {
        id: 'city-central',
        name: 'City Central Medical Center',
        type: 'Major Hospital',
        region: 'Central',
        coordinates: { lat: 12.9766, lng: 77.5993 },
        capacity: 800,
        ventilatorCapacity: 40,
        alertThreshold: 20
    },
    {
        id: 'metro-central',
        name: 'Metro Central Hospital',
        type: 'Major Hospital',
        region: 'Central',
        coordinates: { lat: 12.9800, lng: 77.6020 },
        capacity: 700,
        ventilatorCapacity: 30,
        alertThreshold: 20
    },
    // North Region Major Hospitals
    {
        id: 'north-general',
        name: 'North General Hospital',
        type: 'Major Hospital',
        region: 'North',
        coordinates: { lat: 13.0416, lng: 77.5946 },
        capacity: 900,
        ventilatorCapacity: 45,
        alertThreshold: 20
    },
    {
        id: 'north-medical',
        name: 'North Medical Institute',
        type: 'Major Hospital',
        region: 'North',
        coordinates: { lat: 13.0516, lng: 77.5746 },
        capacity: 750,
        ventilatorCapacity: 35,
        alertThreshold: 20
    },
    {
        id: 'north-specialty',
        name: 'North Specialty Hospital',
        type: 'Major Hospital',
        region: 'North',
        coordinates: { lat: 13.0616, lng: 77.5546 },
        capacity: 650,
        ventilatorCapacity: 28,
        alertThreshold: 20
    },
    // South Region Major Hospitals
    {
        id: 'south-general',
        name: 'South General Hospital',
        type: 'Major Hospital',
        region: 'South',
        coordinates: { lat: 12.9116, lng: 77.5946 },
        capacity: 850,
        ventilatorCapacity: 42,
        alertThreshold: 20
    },
    {
        id: 'south-medical',
        name: 'South Medical Center',
        type: 'Major Hospital',
        region: 'South',
        coordinates: { lat: 12.9016, lng: 77.5846 },
        capacity: 780,
        ventilatorCapacity: 38,
        alertThreshold: 20
    },
    // Regional Centers - North
    {
        id: 'north-regional-1',
        name: 'North Regional Center 1',
        type: 'Regional Center',
        region: 'North',
        coordinates: { lat: 13.0616, lng: 77.5846 },
        capacity: 500,
        ventilatorCapacity: 25,
        alertThreshold: 15
    },
    {
        id: 'north-regional-2',
        name: 'North Regional Center 2',
        type: 'Regional Center',
        region: 'North',
        coordinates: { lat: 13.0716, lng: 77.5646 },
        capacity: 450,
        ventilatorCapacity: 22,
        alertThreshold: 15
    },
    {
        id: 'north-regional-3',
        name: 'North Regional Center 3',
        type: 'Regional Center',
        region: 'North',
        coordinates: { lat: 13.0816, lng: 77.5446 },
        capacity: 420,
        ventilatorCapacity: 20,
        alertThreshold: 15
    },
    // Regional Centers - South
    {
        id: 'south-regional-1',
        name: 'South Regional Center 1',
        type: 'Regional Center',
        region: 'South',
        coordinates: { lat: 12.8916, lng: 77.5946 },
        capacity: 480,
        ventilatorCapacity: 24,
        alertThreshold: 15
    },
    {
        id: 'south-regional-2',
        name: 'South Regional Center 2',
        type: 'Regional Center',
        region: 'South',
        coordinates: { lat: 12.8816, lng: 77.5846 },
        capacity: 460,
        ventilatorCapacity: 23,
        alertThreshold: 15
    },
    // Emergency Centers
    {
        id: 'emergency-central-1',
        name: 'Central Emergency Center 1',
        type: 'Emergency Center',
        region: 'Central',
        coordinates: { lat: 12.9716, lng: 77.6046 },
        capacity: 200,
        ventilatorCapacity: 20,
        alertThreshold: 25
    },
    {
        id: 'emergency-north-1',
        name: 'North Emergency Center 1',
        type: 'Emergency Center',
        region: 'North',
        coordinates: { lat: 13.0316, lng: 77.5946 },
        capacity: 220,
        ventilatorCapacity: 22,
        alertThreshold: 25
    },
    {
        id: 'emergency-south-1',
        name: 'South Emergency Center 1',
        type: 'Emergency Center',
        region: 'South',
        coordinates: { lat: 12.9016, lng: 77.5946 },
        capacity: 210,
        ventilatorCapacity: 21,
        alertThreshold: 25
    },
    // East Region Major Hospitals
    { id: 'east-general', name: 'East General Hospital', type: 'Major Hospital', region: 'East', coordinates: { lat: 12.9716, lng: 77.6846 }, capacity: 880, ventilatorCapacity: 38, alertThreshold: 20 },
    { id: 'east-medical', name: 'East Medical Center', type: 'Major Hospital', region: 'East', coordinates: { lat: 12.9616, lng: 77.6746 }, capacity: 760, ventilatorCapacity: 30, alertThreshold: 20 },
  
    // West Region Major Hospitals
    { id: 'west-general', name: 'West General Hospital', type: 'Major Hospital', region: 'West', coordinates: { lat: 12.9216, lng: 77.5046 }, capacity: 870, ventilatorCapacity: 36, alertThreshold: 20 },
    { id: 'west-medical', name: 'West Medical Center', type: 'Major Hospital', region: 'West', coordinates: { lat: 12.9316, lng: 77.5146 }, capacity: 750, ventilatorCapacity: 32, alertThreshold: 20 },
  
    { id: 'east-regional-1', name: 'East Regional Center 1', type: 'Regional Center', region: 'East', coordinates: { lat: 12.9516, lng: 77.6846 }, capacity: 470, ventilatorCapacity: 22, alertThreshold: 15 },
    { id: 'west-regional-1', name: 'West Regional Center 1', type: 'Regional Center', region: 'West', coordinates: { lat: 12.9416, lng: 77.5046 }, capacity: 490, ventilatorCapacity: 23, alertThreshold: 15 },
    // Northeast Region
    {
      id: 'northeast-general',
      name: 'Northeast General Hospital',
      type: 'Major Hospital',
      region: 'Northeast',
      coordinates: { lat: 13.0816, lng: 77.6446 },
      capacity: 850,
      ventilatorCapacity: 35,
      alertThreshold: 20
    },
    {
      id: 'northeast-medical',
      name: 'Northeast Medical Center',
      type: 'Major Hospital',
      region: 'Northeast',
      coordinates: { lat: 13.0916, lng: 77.6546 },
      capacity: 780,
      ventilatorCapacity: 32,
      alertThreshold: 20
    },
    {
      id: 'northeast-regional-1',
      name: 'Northeast Regional Center 1',
      type: 'Regional Center',
      region: 'Northeast',
      coordinates: { lat: 13.0716, lng: 77.6646 },
      capacity: 460,
      ventilatorCapacity: 20,
      alertThreshold: 15
    },
    
    // Southwest Region
    {
      id: 'southwest-general',
      name: 'Southwest General Hospital',
      type: 'Major Hospital',
      region: 'Southwest',
      coordinates: { lat: 12.8916, lng: 77.5246 },
      capacity: 890,
      ventilatorCapacity: 37,
      alertThreshold: 20
    },
    {
      id: 'southwest-medical',
      name: 'Southwest Medical Center',
      type: 'Major Hospital',
      region: 'Southwest',
      coordinates: { lat: 12.8816, lng: 77.5146 },
      capacity: 770,
      ventilatorCapacity: 31,
      alertThreshold: 20
    },
    {
      id: 'southwest-regional-1',
      name: 'Southwest Regional Center 1',
      type: 'Regional Center',
      region: 'Southwest',
      coordinates: { lat: 12.8716, lng: 77.5046 },
      capacity: 480,
      ventilatorCapacity: 21,
      alertThreshold: 15
    },
  
    // Emergency Centers
    {
      id: 'emergency-northeast-1',
      name: 'Northeast Emergency Center',
      type: 'Emergency Center',
      region: 'Northeast',
      coordinates: { lat: 13.0616, lng: 77.6346 },
      capacity: 230,
      ventilatorCapacity: 23,
      alertThreshold: 25
    },
    {
      id: 'emergency-southwest-1',
      name: 'Southwest Emergency Center',
      type: 'Emergency Center',
      region: 'Southwest',
      coordinates: { lat: 12.8616, lng: 77.4946 },
      capacity: 215,
      ventilatorCapacity: 22,
      alertThreshold: 25
    },
  
    // Specialized Centers
    {
      id: 'cardiac-center-1',
      name: 'Cardiac Specialty Center',
      type: 'Specialized Unit',
      region: 'Central',
      coordinates: { lat: 12.9816, lng: 77.5846 },
      capacity: 300,
      ventilatorCapacity: 45,
      alertThreshold: 30
    },
    {
      id: 'neuro-center-1',
      name: 'Neurology Specialty Center',
      type: 'Specialized Unit',
      region: 'North',
      coordinates: { lat: 13.0416, lng: 77.5746 },
      capacity: 280,
      ventilatorCapacity: 40,
      alertThreshold: 30
    },
  
    // Additional Regional Centers
    {
      id: 'north-regional-4',
      name: 'North Regional Center 4',
      type: 'Regional Center',
      region: 'North',
      coordinates: { lat: 13.0516, lng: 77.5846 },
      capacity: 440,
      ventilatorCapacity: 20,
      alertThreshold: 15
    },
    {
      id: 'south-regional-3',
      name: 'South Regional Center 3',
      type: 'Regional Center',
      region: 'South',
      coordinates: { lat: 12.8816, lng: 77.5846 },
      capacity: 450,
      ventilatorCapacity: 21,
      alertThreshold: 15
    },
  
    // Storage Facilities
    {
      id: 'storage-c',
      name: 'Central Storage C',
      type: 'Storage',
      region: 'Central',
      coordinates: { lat: 12.9716, lng: 77.5746 },
      capacity: 5000,
      ventilatorCapacity: 0,
      alertThreshold: 10
    },
    {
      id: 'storage-d',
      name: 'Central Storage D',
      type: 'Storage',
      region: 'Central',
      coordinates: { lat: 12.9816, lng: 77.5646 },
      capacity: 5000,
      ventilatorCapacity: 0,
      alertThreshold: 10
    },
  
    // Additional Major Hospitals
    {
      id: 'central-specialty',
      name: 'Central Specialty Hospital',
      type: 'Major Hospital',
      region: 'Central',
      coordinates: { lat: 12.9616, lng: 77.5846 },
      capacity: 920,
      ventilatorCapacity: 40,
      alertThreshold: 20
    },
    {
      id: 'north-advanced',
      name: 'North Advanced Care Hospital',
      type: 'Major Hospital',
      region: 'North',
      coordinates: { lat: 13.0216, lng: 77.5946 },
      capacity: 880,
      ventilatorCapacity: 38,
      alertThreshold: 20
    },
    {
      id: 'south-advanced',
      name: 'South Advanced Care Hospital',
      type: 'Major Hospital',
      region: 'South',
      coordinates: { lat: 12.9116, lng: 77.5946 },
      capacity: 860,
      ventilatorCapacity: 36,
      alertThreshold: 20
    },
    {
      id: 'east-advanced',
      name: 'East Advanced Care Hospital',
      type: 'Major Hospital',
      region: 'East',
      coordinates: { lat: 12.9716, lng: 77.6946 },
      capacity: 840,
      ventilatorCapacity: 35,
      alertThreshold: 20
    },
    {
      id: 'west-advanced',
      name: 'West Advanced Care Hospital',
      type: 'Major Hospital',
      region: 'West',
      coordinates: { lat: 12.9716, lng: 77.4946 },
      capacity: 830,
      ventilatorCapacity: 34,
      alertThreshold: 20
    },
    {
      id: 'central-research',
      name: 'Central Research Hospital',
      type: 'Specialized Unit',
      region: 'Central',
      coordinates: { lat: 12.9916, lng: 77.5946 },
      capacity: 400,
      ventilatorCapacity: 50,
      alertThreshold: 30
    }
  
  ];

const getLocationById = (id) => hospitalLocations.find(loc => loc.id === id);
const getLocationsByType = (type) => hospitalLocations.filter(loc => loc.type === type);
const getLocationsByRegion = (region) => hospitalLocations.filter(loc => loc.region === region);
const getAllRegions = () => [...new Set(hospitalLocations.map(loc => loc.region))];
const getAllTypes = () => [...new Set(hospitalLocations.map(loc => loc.type))];
const getNearestHospitals = (coordinates, count = 5) => {
  return hospitalLocations
    .map(hospital => ({
      ...hospital,
      distance: calculateDistance(coordinates, hospital.coordinates)
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count);
};

const locationNames = hospitalLocations.map(loc => loc.name);

module.exports = {
  locations: hospitalLocations,
  locationNames,
  getLocationById,
  getLocationsByType,
  getLocationsByRegion,
  getAllRegions,
  getAllTypes,
  getNearestHospitals,
  calculateDistance
};