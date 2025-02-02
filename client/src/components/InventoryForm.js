import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  FormControlLabel,
  Checkbox,
  Typography,
  Alert,
} from '@mui/material';

const categories = ['Equipment', 'PPE', 'Supplies', 'Medicine'];
const locations = [
  'Central Hospital',
  'City General Hospital',
  'Metropolitan Medical Center',
  'North Wing Medical Center',
  'South District Hospital',
  'Emergency Care Unit 1',
  'Trauma Center North',
  'Central Storage A',
  'Central Storage B',
  'ICU Complex'
];
const statuses = ['Available', 'In Use', 'Maintenance', 'Out of Order'];

function InventoryForm({ open, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    category: '',
    hospitalLocation: '',
    isVentilator: false,
    status: 'Available',
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (initialData) {
      // Convert initialData to proper format
      setFormData({
        ...initialData,
        quantity: initialData.quantity?.toString() || '',
      });
    } else {
      // Reset form
      setFormData({
        name: '',
        quantity: '',
        category: '',
        hospitalLocation: '',
        isVentilator: false,
        status: 'Available',
      });
    }
    // Clear errors when form opens/closes
    setErrors({});
    setSubmitError('');
  }, [initialData, open]);

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    // Quantity validation
    if (!formData.quantity) {
      newErrors.quantity = 'Quantity is required';
    } else if (parseInt(formData.quantity) < 0) {
      newErrors.quantity = 'Quantity cannot be negative';
    } else if (!Number.isInteger(Number(formData.quantity))) {
      newErrors.quantity = 'Quantity must be a whole number';
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    // Location validation
    if (!formData.hospitalLocation) {
      newErrors.hospitalLocation = 'Hospital location is required';
    }

    // Status validation
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    // Validate form
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Format data before submission
      const submitData = {
        ...formData,
        quantity: parseInt(formData.quantity, 10),
      };

      console.log('Submitting inventory data:', submitData);
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError(error.message || 'Failed to submit form. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '50vh' }
      }}
    >
      <DialogTitle>
        <Typography variant="h5">
          {initialData ? 'Edit Inventory Item' : 'Add New Inventory Item'}
        </Typography>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              name="name"
              label="Item Name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              required
              fullWidth
              autoFocus
              inputProps={{ maxLength: 100 }}
            />

            <TextField
              name="quantity"
              label="Quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              error={!!errors.quantity}
              helperText={errors.quantity}
              required
              fullWidth
              InputProps={{ 
                inputProps: { 
                  min: 0,
                  step: 1
                }
              }}
            />

            <TextField
              name="category"
              select
              label="Category"
              value={formData.category}
              onChange={handleChange}
              error={!!errors.category}
              helperText={errors.category}
              required
              fullWidth
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              name="hospitalLocation"
              select
              label="Hospital Location"
              value={formData.hospitalLocation}
              onChange={handleChange}
              error={!!errors.hospitalLocation}
              helperText={errors.hospitalLocation}
              required
              fullWidth
            >
              {locations.map((location) => (
                <MenuItem key={location} value={location}>
                  {location}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              name="status"
              select
              label="Status"
              value={formData.status}
              onChange={handleChange}
              error={!!errors.status}
              helperText={errors.status}
              required
              fullWidth
            >
              {statuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>

            <FormControlLabel
              control={
                <Checkbox
                  name="isVentilator"
                  checked={formData.isVentilator}
                  onChange={handleChange}
                />
              }
              label="Is this a ventilator?"
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={onClose}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={Object.keys(errors).length > 0}
          >
            {initialData ? 'Save Changes' : 'Add Item'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default InventoryForm;