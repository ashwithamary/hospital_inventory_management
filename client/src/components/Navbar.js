import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const buttonStyle = (path) => ({
    color: 'white',
    backgroundColor: isActive(path) ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
  });

  return (
    <AppBar position="static" sx={{ mb: 4 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Hospital Inventory
        </Typography>
        <Box>
          <Button 
            component={Link} 
            to="/"
            sx={buttonStyle('/')}
          >
            Dashboard
          </Button>
          <Button 
            component={Link} 
            to="/inventory"
            sx={buttonStyle('/inventory')}
          >
            Inventory
          </Button>
          <Button 
            component={Link} 
            to="/ventilators"
            sx={buttonStyle('/ventilators')}
          >
            Ventilators
          </Button>
          <Button 
            component={Link} 
            to="/locations"
            sx={buttonStyle('/locations')}
          >
            Locations
          </Button>
          <Button 
            component={Link} 
            to="/ambulance"
            sx={buttonStyle('/ambulance')}
          >
            Ambulance
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;