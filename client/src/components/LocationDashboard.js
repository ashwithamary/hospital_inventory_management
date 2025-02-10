import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

function LocationDashboard() {
  const [locationData, setLocationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [regions, setRegions] = useState(['']);
  const [types, setTypes] = useState(['']);
  const [tabValue, setTabValue] = useState(0);

  const calculateCapacityUtilization = (location) => {
    return Math.round((location.totalItems / location.capacity) * 100);
  };

  const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';


  useEffect(() => {
    fetchLocationData();
  }, [selectedRegion, selectedType]);

  const fetchLocationData = async () => {
    try {
      setLoading(true);
      const response = await fetch('${BASE_URL}/api/locations/stats', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'omit'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received location data:', data);
      
      let filteredData = data.stats || [];
      if (selectedRegion !== '') {
        filteredData = filteredData.filter(loc => loc.region === selectedRegion);
      }
      if (selectedType !== '') {
        filteredData = filteredData.filter(loc => loc.type === selectedType);
      }

      setLocationData(filteredData);
      setRegions(['', ...new Set(data.stats.map(loc => loc.region))]);
      setTypes(['', ...new Set(data.stats.map(loc => loc.type))]);
      setError('');
    } catch (err) {
      console.error('Error fetching location data:', err);
      setError('Failed to fetch location data');
      setLocationData([]);
    } finally {
      setLoading(false);
    }
  };

  const renderUtilizationChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={locationData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis label={{ value: 'Capacity Utilization (%)', angle: -90, position: 'insideLeft' }} />
        <Tooltip formatter={(value) => `${value}%`} />
        <Legend />
        <Bar 
          dataKey={(loc) => calculateCapacityUtilization(loc)}
          name="Capacity Utilization" 
          fill="#8884d8" 
        />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderVentilatorChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={locationData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis label={{ value: 'Ventilators', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="ventilatorCapacity" name="Total Capacity" fill="#82ca9d" />
        <Bar dataKey="ventilators" name="In Use" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderAlerts = () => {
    const alertLocations = locationData.filter(loc => 
      calculateCapacityUtilization(loc) > loc.alertThreshold
    );

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Capacity Alerts ({alertLocations.length})
        </Typography>
        {alertLocations.length === 0 ? (
          <Alert severity="success">No capacity alerts at this time.</Alert>
        ) : (
          alertLocations.map(loc => (
            <Alert 
              key={loc.id} 
              severity={calculateCapacityUtilization(loc) > 90 ? 'error' : 'warning'}
              sx={{ mb: 1 }}
            >
              {loc.name}: {calculateCapacityUtilization(loc)}% capacity used
            </Alert>
          ))
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Location Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Region</InputLabel>
            <Select
              value={selectedRegion}
              label="Region"
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              {regions.map(region => (
                <MenuItem key={region} value={region}>
                  {region || 'All Regions'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={selectedType}
              label="Type"
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {types.map(type => (
                <MenuItem key={type} value={type}>
                  {type || 'All Types'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Tabs
        value={tabValue}
        onChange={(e, newValue) => setTabValue(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Capacity Utilization" />
        <Tab label="Ventilator Status" />
        <Tab label="Alerts" />
      </Tabs>

      <Card>
        <CardContent>
          {tabValue === 0 && (
            <>
              <Typography variant="h6" gutterBottom>
                Capacity Utilization by Location
              </Typography>
              {renderUtilizationChart()}
            </>
          )}
          {tabValue === 1 && (
            <>
              <Typography variant="h6" gutterBottom>
                Ventilator Status by Location
              </Typography>
              {renderVentilatorChart()}
            </>
          )}
          {tabValue === 2 && renderAlerts()}
        </CardContent>
      </Card>
    </Box>
  );
}

export default LocationDashboard;