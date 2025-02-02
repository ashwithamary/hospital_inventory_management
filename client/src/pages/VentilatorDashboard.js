import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import io from 'socket.io-client';

function VentilatorDashboard() {
  const [ventilatorData, setVentilatorData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000');
    
    // Fetch initial data
    fetchVentilatorStatus();

    // Socket event listeners
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setSocketConnected(true);
      setError('');
    });

    newSocket.on('disconnect', () => {
      setSocketConnected(false);
      setError('Lost connection to server');
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setSocketConnected(false);
      setError('Connection to real-time updates failed');
    });

    newSocket.on('ventilatorUpdate', (data) => {
      console.log('Received ventilator update:', data);
      if (Array.isArray(data)) {
        const processedData = processVentilatorData(data);
        setVentilatorData(processedData);
      }
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const processVentilatorData = (ventilators) => {
    return ventilators.reduce((acc, curr) => {
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
  };

  const fetchVentilatorStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/inventory/ventilators');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Received ventilator data:', data);

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch ventilator data');
      }

      setVentilatorData(data.ventilatorStatus || {});
      setError('');
    } catch (err) {
      console.error('Error fetching ventilator status:', err);
      setError(err.message || 'Failed to fetch ventilator data');
      setVentilatorData({});
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (available, total) => {
    if (total === 0) return '#757575'; // Gray for no ventilators
    const ratio = available / total;
    if (ratio >= 0.5) return '#4caf50'; // Green
    if (ratio >= 0.2) return '#ff9800'; // Orange
    return '#f44336'; // Red
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
        Real-time Ventilator Status
        {socketConnected && (
          <Typography component="span" color="success.main" sx={{ ml: 2, fontSize: '0.8em' }}>
            (Live)
          </Typography>
        )}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {Object.entries(ventilatorData).map(([location, data]) => (
          <Grid item xs={12} sm={6} md={4} key={location}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {location}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: getStatusColor(data.available, data.total),
                      mr: 1,
                    }}
                  />
                  <Typography>
                    {data.available} available out of {data.total}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color={data.available === 0 ? 'error' : 'textSecondary'}
                >
                  {data.total > 0 
                    ? `${Math.round((data.available / data.total) * 100)}% Available`
                    : 'No ventilators assigned'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {Object.keys(ventilatorData).length === 0 && !loading && !error && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">
            No ventilator data available. Please check if there are any ventilators registered in the system.
          </Typography>
        </Paper>
      )}

      {socketConnected ? (
        <Alert severity="success" sx={{ mt: 3 }}>
          Real-time updates are active
        </Alert>
      ) : (
        <Alert severity="warning" sx={{ mt: 3 }}>
          Real-time updates are currently unavailable. Data may not be current.
        </Alert>
      )}
    </Box>
  );
}

export default VentilatorDashboard;