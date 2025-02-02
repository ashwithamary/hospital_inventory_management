import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import InventoryForm from '../components/InventoryForm';

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sorting states
  const [sortConfig, setSortConfig] = useState({
    field: 'createdAt',
    order: 'desc'
  });

  // Fetch inventory data
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/inventory?page=${page}&limit=${itemsPerPage}&search=${searchTerm}&sortField=${sortConfig.field}&sortOrder=${sortConfig.order}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setInventory(data.items);
      setTotalPages(data.totalPages);
      setError('');
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('Failed to fetch inventory. Please try again later.');
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [page, itemsPerPage, searchTerm, sortConfig]);

  const handleSort = (field) => {
    setSortConfig((prevConfig) => ({
      field,
      order: prevConfig.field === field && prevConfig.order === 'asc' ? 'desc' : 'asc',
    }));
    setPage(1); // Reset to first page when sorting
  };

  // Table headers configuration
  const headers = [
    { id: 'name', label: 'Name', sortable: true },
    { id: 'quantity', label: 'Quantity', sortable: true },
    { id: 'category', label: 'Category', sortable: true },
    { id: 'hospitalLocation', label: 'Location', sortable: true },
    { id: 'status', label: 'Status', sortable: true },
    { id: 'actions', label: 'Actions', sortable: false },
  ];

  // Rest of your existing handlers...
  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/inventory/${id}`, { method: 'DELETE' });
      setSnackbar({ open: true, message: 'Item deleted successfully', severity: 'success' });
      fetchInventory();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete item', severity: 'error' });
      console.error('Error deleting item:', err);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true);
      console.log('Submitting form data:', formData); // Debug log
  
      const url = editingItem 
        ? `http://localhost:5000/api/inventory/${editingItem._id}`
        : 'http://localhost:5000/api/inventory';
  
      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity, 10), // Ensure quantity is a number
        })
      });
  
      const result = await response.json();
      console.log('Server response:', result); // Debug log
  
      if (!response.ok) {
        throw new Error(result.message || 'Operation failed');
      }
  
      setSnackbar({ 
        open: true, 
        message: `Item ${editingItem ? 'updated' : 'added'} successfully`, 
        severity: 'success' 
      });
      setIsFormOpen(false);
      setEditingItem(null);
      fetchInventory();
    } catch (err) {
      console.error('Error submitting form:', err);
      setSnackbar({ 
        open: true, 
        message: err.message || `Failed to ${editingItem ? 'update' : 'add'} item`, 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(event.target.value);
    setPage(1);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Inventory Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsFormOpen(true)}
        >
          Add Item
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search and Items Per Page */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          sx={{ flexGrow: 1 }}
          variant="outlined"
          placeholder="Search inventory..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Items per page</InputLabel>
          <Select
            value={itemsPerPage}
            label="Items per page"
            onChange={handleItemsPerPageChange}
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableCell key={header.id}>
                  {header.sortable ? (
                    <TableSortLabel
                      active={sortConfig.field === header.id}
                      direction={sortConfig.field === header.id ? sortConfig.order : 'asc'}
                      onClick={() => handleSort(header.id)}
                    >
                      {header.label}
                    </TableSortLabel>
                  ) : (
                    header.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {inventory.map((item) => (
              <TableRow key={item._id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.hospitalLocation}</TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(item)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(item._id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination 
          count={totalPages} 
          page={page} 
          onChange={handlePageChange}
          color="primary"
          size="large"
        />
      </Box>

      {/* Form Dialog */}
      <InventoryForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingItem}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Inventory;