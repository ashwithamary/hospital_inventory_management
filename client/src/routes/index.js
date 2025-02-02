import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Inventory from '../pages/Inventory';
import VentilatorDashboard from '../pages/VentilatorDashboard';
import LocationDashboard from '../components/LocationDashboard';
import AmbulanceRouting from '../components/AmbulanceRouting';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/ventilators" element={<VentilatorDashboard />} />
      <Route path="/locations" element={<LocationDashboard />} />
      <Route path="/ambulance" element={<AmbulanceRouting />} />
    </Routes>
  );
}

export default AppRoutes;