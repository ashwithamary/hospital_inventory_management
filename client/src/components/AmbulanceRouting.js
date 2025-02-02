import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { LocalHospital, DirectionsRun } from '@mui/icons-material';

function AmbulanceRouting() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [nearestHospitals, setNearestHospitals] = useState([]);
  const [manualCoords, setManualCoords] = useState({ lat: '12.9716', lng: '77.5946' });
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const validateCoordinates = (coords) => {
    const lat = parseFloat(coords.lat);
    const lng = parseFloat(coords.lng);
    
    if (isNaN(lat) || isNaN(lng)) {
      throw new Error('Invalid coordinates format');
    }
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new Error('Coordinates out of valid range');
    }
    
    return { lat, lng };
  };

  const fetchNearestHospitals = async (coords) => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Sending coordinates:', coords); // Debug log
  
      const response = await fetch('http://localhost:5000/api/locations/nearest', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lat: Number(coords.lat),
          lng: Number(coords.lng)
        })
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Server error');
      }
  
      console.log('Received response:', data); // Debug log
  
      if (!data.hospitals || !Array.isArray(data.hospitals)) {
        throw new Error('Invalid response format from server');
      }
  
      setNearestHospitals(data.hospitals);
      setError('');
      
    } catch (err) {
      console.error('Error fetching nearest hospitals:', err);
      setError(`Failed to find nearest hospitals: ${err.message}`);
      setNearestHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(coords);
          fetchNearestHospitals(coords);
        },
        (error) => {
          console.log('Geolocation error:', error.message);
          setError('Using default location. Enter coordinates manually if needed.');
          const defaultCoords = { lat: 12.9716, lng: 77.5946 };
          setCurrentLocation(defaultCoords);
          fetchNearestHospitals(defaultCoords);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      setError('Geolocation is not supported. Please enter coordinates manually.');
    }
  }, []);

  const handleManualLocation = () => {
    try {
      const coords = validateCoordinates(manualCoords);
      setCurrentLocation(coords);
      fetchNearestHospitals(coords);
    } catch (err) {
      setError(err.message);
    }
  };

  const getEstimatedTime = (distance) => {
    const timeInHours = distance / 40;
    return Math.round(timeInHours * 60);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Ambulance Routing
      </Typography>

      {error && (
        <Alert 
          severity={error.includes('Retrying') ? "info" : "error"} 
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Location
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                label="Latitude"
                value={manualCoords.lat}
                onChange={(e) => setManualCoords(prev => ({ ...prev, lat: e.target.value }))}
                fullWidth
                error={!!error && error.includes('coordinates')}
                helperText="Valid range: -90 to 90"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Longitude"
                value={manualCoords.lng}
                onChange={(e) => setManualCoords(prev => ({ ...prev, lng: e.target.value }))}
                fullWidth
                error={!!error && error.includes('coordinates')}
                helperText="Valid range: -180 to 180"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant="contained"
                onClick={handleManualLocation}
                fullWidth
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Location'}
              </Button>
            </Grid>
          </Grid>

          {currentLocation && (
            <Typography sx={{ mt: 2 }} color="textSecondary">
              Current: Lat {Number(currentLocation.lat).toFixed(4)}, 
              Lng {Number(currentLocation.lng).toFixed(4)}
            </Typography>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : nearestHospitals.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Hospital</TableCell>
                <TableCell>Distance</TableCell>
                <TableCell>Est. Time</TableCell>
                <TableCell>Available Ventilators</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {nearestHospitals.map((hospital) => (
                <TableRow key={hospital.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocalHospital sx={{ mr: 1 }} />
                      {hospital.name}
                    </Box>
                  </TableCell>
                  <TableCell>{hospital.distance?.toFixed(2) ?? 'N/A'} km</TableCell>
                  <TableCell>{getEstimatedTime(hospital.distance)} mins</TableCell>
                  <TableCell>
                    {hospital.ventilatorCapacity - (hospital.ventilators ?? 0)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<DirectionsRun />}
                      href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.coordinates?.lat},${hospital.coordinates?.lng}`}
                      target="_blank"
                      disabled={!hospital.coordinates}
                    >
                      Route
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Alert severity="info">No hospitals found. Try updating your location.</Alert>
      )}
    </Box>
  );
}

export default AmbulanceRouting;