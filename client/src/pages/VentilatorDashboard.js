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
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function VentilatorDashboard() {
  const [ventilatorData, setVentilatorData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
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


  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      transports: ['websocket'],
      withCredentials: true
    });
    
        
    fetchVentilatorStatus();

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
      const response = await fetch(`${BASE_URL}/api/inventory/ventilators`);
      if (!response.ok) {
        throw new Error('Failed to fetch ventilator data');
      }
      const data = await response.json();
      
      if (data.success && data.ventilatorStatus) {
        setVentilatorData(data.ventilatorStatus);
      } else {
        throw new Error(data.message || 'Invalid data format');
      }
      setError('');
    } catch (err) {
      console.error('Error fetching ventilator status:', err);
      setError('Failed to fetch ventilator data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (available, total) => {
    if (total === 0) return '#757575'; 
    const ratio = available / total;
    if (ratio >= 0.5) return '#4caf50';
    if (ratio >= 0.2) return '#ff9800'; 
    return '#f44336'; 
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
        {Object.entries(ventilatorData).map(([locationId, data]) => (
          <Grid item xs={12} sm={6} md={4} key={locationId}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {HOSPITAL_NAMES[locationId] || `Location ${locationId}`}
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