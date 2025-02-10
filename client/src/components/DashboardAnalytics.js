import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, PieChart, Pie, ResponsiveContainer, Cell, Label
} from 'recharts';
import {
  Box, Card, CardContent, Grid, Typography, CircularProgress, Alert
} from '@mui/material';

console.log('Environment Variables:', {
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  NODE_ENV: process.env.NODE_ENV
});

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
console.log('API URL being used:', BASE_URL);

const HOSPITAL_NAMES = {
  0: 'Central Hospital',
  1: 'City General Hospital',
  2: 'Metropolitan Medical Center',
  3: 'North Wing Medical Center',
  4: 'South District Hospital',
  5: 'Emergency Care Unit 1',
  6: 'Trauma Center North',
  7: 'Central Storage A',
  8: 'Central Storage B',
  9: 'ICU Complex',
  10: 'Central General Hospital',
  11: 'City Central Medical Center',
  12: 'Metro Central Hospital',
  13: 'North General Hospital',
  14: 'North Medical Institute',
  15: 'North Specialty Hospital',
  16: 'South General Hospital',
  17: 'South Medical Center',
  18: 'North Regional Center 1',
  19: 'North Regional Center 2',
  20: 'North Regional Center 3',
  21: 'South Regional Center 1',
  22: 'South Regional Center 2',
  23: 'Central Emergency Center 1',
  24: 'North Emergency Center 1',
  25: 'South Emergency Center 1',
  26: 'East General Hospital',
  27: 'East Medical Center',
  28: 'West General Hospital',
  29: 'West Medical Center',
  30: 'East Regional Center 1',
  31: 'West Regional Center 1',
  32: 'Northeast General Hospital',
  33: 'Northeast Medical Center',
  34: 'Northeast Regional Center 1',
  35: 'Southwest General Hospital',
  36: 'Southwest Medical Center',
  37: 'Southwest Regional Center 1',
  38: 'Northeast Emergency Center',
  39: 'Southwest Emergency Center',
  40: 'Cardiac Specialty Center',
  41: 'Neurology Specialty Center',
  42: 'North Regional Center 4',
  43: 'South Regional Center 3',
  44: 'Central Storage C',
  45: 'Central Storage D',
  46: 'Central Specialty Hospital',
  47: 'North Advanced Care Hospital',
  48: 'South Advanced Care Hospital',
  49: 'Central Research Hospital'
};

function DashboardAnalytics() {
  const [data, setData] = useState({
    categoryData: [],
    locationData: [],
    ventilatorStatus: [],
    stockTrends: [],
    capacityData: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const processVentilatorData = (ventData) => {
    const statusData = [
      { name: 'Available', value: 0 },
      { name: 'In Use', value: 0 },
      { name: 'Maintenance', value: 0 },
      { name: 'Out of Order', value: 0 }
    ];

    if (ventData && Array.isArray(ventData)) {
      ventData.forEach(hospital => {
        statusData[0].value += hospital.available || 0;
        statusData[1].value += hospital.inUse || 0;
        statusData[2].value += hospital.maintenance || 0;
        statusData[3].value += hospital.outOfOrder || 0;
      });
    }

    return statusData.filter(item => item.value > 0);
  };

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      console.log('Starting analytics fetch...');

      // Fetch ventilator status first
      const ventResponse = await fetch('${BASE_URL}/api/inventory/ventilators');
      if (!ventResponse.ok) throw new Error('Failed to fetch ventilator data');
      const ventData = await ventResponse.json();

      // Process capacity data directly from ventilator status
      const capacityData = Object.entries(ventData.ventilatorStatus).map(([locationId, data]) => {
        const utilizationPercentage = data.total > 0
          ? ((data.total - data.available) / data.total) * 100
          : 0;

        return {
          name: HOSPITAL_NAMES[locationId] || `Location ${locationId}`,
          utilization: Number(utilizationPercentage.toFixed(1)),
          totalItems: data.total,
          available: data.available,
          capacity: data.total,
          percentage: `${utilizationPercentage.toFixed(1)}%`
        };
      });

      // Fetch inventory items
      const response = await fetch('${BASE_URL}/api/inventory');
      if (!response.ok) throw new Error('Failed to fetch inventory data');
      const { items } = await response.json();
      console.log('Inventory items received:', items.length);

      // Process ventilator status for pie chart
      const ventilatorStatus = processVentilatorData(ventData.ventilatorStatus);

      // Process category data
      const categoryCount = items.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + Number(item.quantity);
        return acc;
      }, {});

      const categoryData = Object.entries(categoryCount).map(([name, value]) => ({
        name,
        value
      }));

      // Fetch hospital locations
      const locResponse = await fetch('${BASE_URL}/api/locations/stats');
      if (!locResponse.ok) throw new Error('Failed to fetch location data');
      const { stats: locations } = await locResponse.json();
      console.log('Locations received:', locations);

      // Get location totals
      const locationTotals = {};
      items.forEach(item => {
        if (!locationTotals[item.hospitalLocation]) {
          locationTotals[item.hospitalLocation] = 0;
        }
        locationTotals[item.hospitalLocation] += Number(item.quantity);
      });

      // Process location data - using ventilator data instead of general inventory
      const locationData = Object.entries(ventData.ventilatorStatus).map(([locationId, data]) => ({
        name: HOSPITAL_NAMES[locationId],
        count: data.total, 
        capacity: data.total
      }));

      // Process stock trends - focus on ventilator numbers by location
      const stockTrends = Object.entries(ventData.ventilatorStatus)
        .map(([locationId, data]) => ({
          name: HOSPITAL_NAMES[locationId],
          quantity: data.total
        }))
        .sort((a, b) => b.quantity - a.quantity)  
        .slice(0, 10);  

      // Update all data in state
      setData({
        categoryData,
        locationData: locationData.sort((a, b) => b.count - a.count),  
        ventilatorStatus,
        stockTrends,
        capacityData
      });

      setError('');
      console.log('Analytics data fetch complete');

    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(`Failed to load analytics data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    let interval;

    const fetchData = async () => {
      if (!mounted) return;
      await fetchAnalyticsData();
    };

    fetchData();

    interval = setInterval(fetchData, 30000);

    return () => {
      mounted = false;
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

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
        Inventory Analytics Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>

        {/* Category Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Category Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} units`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Ventilator Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ventilator Status Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.ventilatorStatus}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.ventilatorStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} units`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Ventilators by Location */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ventilators by Location
              </Typography>
              <Box sx={{ height: 600 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.locationData.sort((a, b) => b.count - a.count)}
                    layout="vertical"
                    margin={{
                      top: 20,
                      right: 40,
                      left: 20,
                      bottom: 20
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number">
                      <Label value="Number of Ventilators" offset={-10} position="insideBottom" />
                    </XAxis>
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={180}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(value) => [`${value} ventilators`, 'Total Ventilators']}
                      labelFormatter={(label) => `Location: ${label}`}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar
                      dataKey="count"
                      name="Total Ventilators"
                      fill="#8884d8"  
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top 10 Locations */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top 10 Locations by Ventilator Count
              </Typography>
              <Box sx={{ height: 500 }}>  
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.stockTrends}
                    margin={{
                      top: 20,
                      right: 20,
                      left: 20,  
                      bottom: 20  
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={120}  
                      interval={0}
                      fontSize={12}
                      tick={{ dy: 40 }}  
                    />
                    <YAxis>
                      <Label
                        value="Number of Ventilators"
                        angle={-90}
                        position="insideLeft"
                        offset={-40}
                        style={{ textAnchor: 'middle' }}
                      />
                    </YAxis>
                    <Tooltip formatter={(value) => [`${value} ventilators`, 'Total Ventilators']} />
                    <Legend wrapperStyle={{ paddingTop: '50px' }} />
                    <Bar
                      dataKey="quantity"
                      name="Total Ventilators"
                      fill="#8884d8"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Capacity Utilization */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Capacity Utilization by Location
              </Typography>
              <Box sx={{ height: 500 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.capacityData} 
                    margin={{
                      top: 20,
                      right: 20,
                      left: 20,
                      bottom: 20
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={120}
                      interval={0}
                      fontSize={12}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tickFormatter={(value) => `${Math.round(value)}%`}
                      label={{
                        value: 'Utilization (%)',
                        angle: -90,
                        position: 'insideLeft',
                        offset: -5,
                        fontSize: 12
                      }}
                    />
                    <Tooltip
                      formatter={(value) => [`${Math.round(value)}%`, 'Utilization']}
                      labelFormatter={(label) => `Location: ${label}`}
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
                    />
                    <Legend />
                    <Bar
                      dataKey="utilization"
                      name="Utilization %"
                    >
                      {data.capacityData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.utilization >= 80 ? '#ff4d4d' : 
                              entry.utilization >= 60 ? '#ffa64d' :  
                                entry.utilization >= 40 ? '#ffdd4d' :  
                                  entry.utilization > 0 ? '#82ca9d' :   
                                    '#e0e0e0'                            
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
}

export default DashboardAnalytics;