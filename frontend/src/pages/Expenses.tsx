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
  TablePagination,
  TextField,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useFormik } from 'formik';
import { format } from 'date-fns';
import {
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} from '../api/expensesApi';
import { useGetCategoriesQuery } from '../api/categoriesApi';
import { FilterExpenseDto } from '../types';

const ExpensesPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<FilterExpenseDto>({});
  const [openDialog, setOpenDialog] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Updated to match the new API signature
  const {
    data: expensesData,
    isLoading: isLoadingExpenses,
    refetch: refetchExpenses,
  } = useGetExpensesQuery();
  
  const { data: categories } = useGetCategoriesQuery();
  const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();
  const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation();
  const [deleteExpense] = useDeleteExpenseMutation();

  // Refetch expenses on component mount
  useEffect(() => {
    refetchExpenses();
    console.log('Expenses page - expensesData:', expensesData);
  }, [refetchExpenses]);

  // Filter form
  const filterFormik = useFormik({
    initialValues: {
      startDate: '',
      endDate: '',
      category: '',
      minAmount: '',
      maxAmount: '',
    },
    onSubmit: (values) => {
      const newFilters: FilterExpenseDto = {};
      if (values.startDate) newFilters.startDate = values.startDate;
      if (values.endDate) newFilters.endDate = values.endDate;
      if (values.category) newFilters.category = values.category;
      if (values.minAmount) newFilters.minAmount = Number(values.minAmount);
      if (values.maxAmount) newFilters.maxAmount = Number(values.maxAmount);
      setFilters(newFilters);
      setPage(0); // Reset to first page when applying filters
      
      // Since we can't pass filters to the API anymore, just refetch
      refetchExpenses();
    },
  });

  // Create/Edit form
  const formik = useFormik({
    initialValues: {
      amount: '',
      description: '',
      date: new Date(),
      categoryName: '',
    },
    onSubmit: async (values) => {
      const expenseData = {
        ...values,
        amount: Number(values.amount),
        date: format(values.date, 'yyyy-MM-dd'),
      };

      try {
        if (currentExpense) {
          await updateExpense({
            id: currentExpense._id!,
            expense: expenseData,
          }).unwrap();
        } else {
          await createExpense(expenseData).unwrap();
        }
        handleCloseDialog();
        // Manually refetch to ensure the table is updated
        refetchExpenses();
      } catch (error) {
        console.error('Failed to save expense:', error);
      }
    },
  });

  const handleChangePage = (_: any, newPage: number) => {
    setPage(newPage);
    // Since we can't pass pagination to the API anymore, just update the local state
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(0);
    // Since we can't pass pagination to the API anymore, just update the local state
  };

  const handleOpenDialog = (expense: any = null) => {
    if (expense) {
      setCurrentExpense(expense);
      formik.setValues({
        amount: expense.amount.toString(),
        description: expense.description,
        date: new Date(expense.date),
        categoryName: expense.category ? expense.category.name : '',
      });
    } else {
      setCurrentExpense(null);
      formik.resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    formik.resetForm();
  };

  const handleDeleteExpense = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id).unwrap();
        // Manually refetch to ensure the table is updated
        refetchExpenses();
      } catch (error) {
        console.error('Failed to delete expense:', error);
      }
    }
  };

  const handleResetFilters = () => {
    filterFormik.resetForm();
    setFilters({});
    refetchExpenses();
  };

  // Apply client-side filtering and pagination since we can't do it on the server
  const filteredData = expensesData?.data.filter(expense => {
    if (filters.startDate && new Date(expense.date) < new Date(filters.startDate)) return false;
    if (filters.endDate && new Date(expense.date) > new Date(filters.endDate)) return false;
    if (filters.category && expense.category?._id !== filters.category) return false;
    if (filters.minAmount && expense.amount < filters.minAmount) return false;
    if (filters.maxAmount && expense.amount > filters.maxAmount) return false;
    return true;
  }) || [];

  // Apply client-side pagination
  const paginatedData = filteredData.slice(page * limit, (page + 1) * limit);
  const totalItems = filteredData.length;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Expenses
      </Typography>

      {/* Filter Section */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Expenses</Typography>
          <Button
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
            color="primary"
            variant="outlined"
            size="small"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </Box>

        {showFilters && (
          <Box component="form" onSubmit={filterFormik.handleSubmit} sx={{ mt: 2 }}>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  id="startDate"
                  name="startDate"
                  label="Start Date"
                  type="date"
                  value={filterFormik.values.startDate}
                  onChange={filterFormik.handleChange}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  id="endDate"
                  name="endDate"
                  label="End Date"
                  type="date"
                  value={filterFormik.values.endDate}
                  onChange={filterFormik.handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl fullWidth>
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    id="category"
                    name="category"
                    value={filterFormik.values.category}
                    onChange={filterFormik.handleChange}
                    label="Category"
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories?.map((category) => (
                      <MenuItem key={category._id} value={category._id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  id="minAmount"
                  name="minAmount"
                  label="Min Amount"
                  type="number"
                  value={filterFormik.values.minAmount}
                  onChange={filterFormik.handleChange}
                />
                <TextField
                  fullWidth
                  id="maxAmount"
                  name="maxAmount"
                  label="Max Amount"
                  type="number"
                  value={filterFormik.values.maxAmount}
                  onChange={filterFormik.handleChange}
                />
              </Stack>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Stack direction="row" spacing={1}>
                  <Button type="submit" variant="contained" color="primary">
                    Apply
                  </Button>
                  <Button variant="outlined" onClick={handleResetFilters}>
                    Reset
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Box>
        )}
      </Paper>

      {/* Expenses Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoadingExpenses ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No expenses found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((expense) => (
                <TableRow key={expense._id}>
                  <TableCell>{format(new Date(expense.date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>
                    {expense.category ? (
                      <Chip
                        label={expense.category.name}
                        size="small"
                        sx={{
                          backgroundColor: expense.category.color || '#e0e0e0',
                          color: '#fff',
                        }}
                      />
                    ) : (
                      'Uncategorized'
                    )}
                  </TableCell>
                  <TableCell align="right">${expense.amount.toFixed(2)}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(expense)}
                      aria-label="edit"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteExpense(expense._id!)}
                      aria-label="delete"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {expensesData && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalItems}
            rowsPerPage={limit}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{currentExpense ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 2 }}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  id="amount"
                  name="amount"
                  label="Amount"
                  type="number"
                  value={formik.values.amount}
                  onChange={formik.handleChange}
                  required
                />
                <TextField
                  fullWidth
                  id="description"
                  name="description"
                  label="Description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  required
                />
                <DatePicker
                  label="Date"
                  value={formik.values.date}
                  onChange={(newValue) => {
                    formik.setFieldValue('date', newValue);
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
                />
                <FormControl fullWidth>
                  <InputLabel id="categoryName-label">Category</InputLabel>
                  <Select
                    labelId="categoryName-label"
                    id="categoryName"
                    name="categoryName"
                    value={formik.values.categoryName}
                    onChange={formik.handleChange}
                    label="Category"
                  >
                    <MenuItem value="">Uncategorized</MenuItem>
                    {categories?.map((category) => (
                      <MenuItem key={category._id} value={category.name}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Box>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={() => formik.handleSubmit()}
            variant="contained"
            color="primary"
            disabled={isCreating || isUpdating}
          >
            {isCreating || isUpdating ? (
              <CircularProgress size={24} />
            ) : currentExpense ? (
              'Update'
            ) : (
              'Create'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExpensesPage;
