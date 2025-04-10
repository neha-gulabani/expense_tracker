import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO } from 'date-fns';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  useGetRecurringExpensesQuery,
  useCreateRecurringExpenseMutation,
  useUpdateRecurringExpenseMutation,
  useDeleteRecurringExpenseMutation,
} from '../api/recurringExpensesApi';
import { useGetCategoriesQuery } from '../api/categoriesApi';
import { RecurringExpense, RecurringInterval, Category } from '../types';

const validationSchema = Yup.object({
  amount: Yup.number().required('Amount is required').positive('Amount must be positive'),
  description: Yup.string().required('Description is required'),
  interval: Yup.string().required('Interval is required'),
  startDate: Yup.date().required('Start date is required'),
  endDate: Yup.date().nullable(),
  categoryName: Yup.string(),
  isActive: Yup.boolean(),
});

const RecurringExpensesPage: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<RecurringExpense | null>(null);

  // API hooks
  const { data: recurringExpenses, isLoading } = useGetRecurringExpensesQuery();
  const { data: categories } = useGetCategoriesQuery();
  const [createRecurringExpense, { isLoading: isCreating }] = useCreateRecurringExpenseMutation();
  const [updateRecurringExpense, { isLoading: isUpdating }] = useUpdateRecurringExpenseMutation();
  const [deleteRecurringExpense, { isLoading: isDeleting }] = useDeleteRecurringExpenseMutation();

  // Recurring expense form
  const formik = useFormik({
    initialValues: {
      amount: '',
      description: '',
      interval: RecurringInterval.MONTHLY,
      startDate: new Date(),
      endDate: null as Date | null,
      categoryName: '',
      isActive: true,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const expenseData = {
          ...values,
          amount: Number(values.amount),
          startDate: format(values.startDate, 'yyyy-MM-dd'),
          endDate: values.endDate ? format(values.endDate, 'yyyy-MM-dd') : undefined,
        };

        if (selectedExpense) {
          await updateRecurringExpense({
            id: selectedExpense._id!,
            recurringExpense: expenseData,
          }).unwrap();
        } else {
          await createRecurringExpense(expenseData).unwrap();
        }

        handleCloseDialog();
      } catch (error) {
        console.error('Failed to save recurring expense:', error);
      }
    },
  });

  const handleOpenDialog = (expense?: RecurringExpense) => {
    if (expense) {
      setSelectedExpense(expense);
      formik.setValues({
        amount: expense.amount.toString(),
        description: expense.description,
        interval: expense.interval,
        startDate: parseISO(expense.startDate),
        endDate: expense.endDate ? parseISO(expense.endDate) : null,
        categoryName: expense.category?.name || '',
        isActive: expense.isActive,
      });
    } else {
      setSelectedExpense(null);
      formik.resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedExpense(null);
    formik.resetForm();
  };

  const handleDeleteRecurringExpense = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this recurring expense?')) {
      try {
        await deleteRecurringExpense(id).unwrap();
      } catch (error) {
        console.error('Failed to delete recurring expense:', error);
      }
    }
  };

  const getIntervalLabel = (interval: RecurringInterval) => {
    switch (interval) {
      case RecurringInterval.DAILY:
        return 'Daily';
      case RecurringInterval.WEEKLY:
        return 'Weekly';
      case RecurringInterval.MONTHLY:
        return 'Monthly';
      default:
        return interval;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Recurring Expenses
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Recurring Expense
        </Button>
      </Stack>

      {/* Recurring Expenses Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Description</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Interval</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : recurringExpenses?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No recurring expenses found
                </TableCell>
              </TableRow>
            ) : (
              recurringExpenses?.map((expense) => (
                <TableRow key={expense._id}>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>${expense.amount.toFixed(2)}</TableCell>
                  <TableCell>{getIntervalLabel(expense.interval)}</TableCell>
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
                  <TableCell>{format(new Date(expense.startDate), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    {expense.endDate
                      ? format(new Date(expense.endDate), 'MMM dd, yyyy')
                      : 'No end date'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={expense.isActive ? 'Active' : 'Inactive'}
                      color={expense.isActive ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
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
                      onClick={() => handleDeleteRecurringExpense(expense._id!)}
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
      </TableContainer>

      {/* Add/Edit Recurring Expense Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedExpense ? 'Edit Recurring Expense' : 'Add Recurring Expense'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="amount"
              label="Amount"
              name="amount"
              type="number"
              value={formik.values.amount}
              onChange={formik.handleChange}
              error={formik.touched.amount && Boolean(formik.errors.amount)}
              helperText={formik.touched.amount && formik.errors.amount}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="description"
              label="Description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="interval-label">Interval</InputLabel>
              <Select
                labelId="interval-label"
                id="interval"
                name="interval"
                value={formik.values.interval}
                onChange={formik.handleChange}
                label="Interval"
              >
                <MenuItem value={RecurringInterval.DAILY}>Daily</MenuItem>
                <MenuItem value={RecurringInterval.WEEKLY}>Weekly</MenuItem>
                <MenuItem value={RecurringInterval.MONTHLY}>Monthly</MenuItem>
              </Select>
            </FormControl>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={formik.values.startDate}
                onChange={(newValue) => {
                  formik.setFieldValue('startDate', newValue);
                }}
                sx={{ mt: 2, width: '100%' }}
              />
              <DatePicker
                label="End Date (Optional)"
                value={formik.values.endDate}
                onChange={(newValue) => {
                  formik.setFieldValue('endDate', newValue);
                }}
                sx={{ mt: 2, width: '100%' }}
              />
            </LocalizationProvider>
            <FormControl fullWidth margin="normal">
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                id="categoryName"
                name="categoryName"
                value={formik.values.categoryName}
                onChange={formik.handleChange}
                label="Category"
              >
                <MenuItem value="">None</MenuItem>
                {categories?.map((category) => (
                  <MenuItem key={category._id} value={category.name}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {selectedExpense && (
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.isActive}
                    onChange={(e) => formik.setFieldValue('isActive', e.target.checked)}
                    name="isActive"
                  />
                }
                label="Active"
                sx={{ mt: 2 }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={() => formik.handleSubmit()}
            variant="contained"
            disabled={isCreating || isUpdating}
          >
            {isCreating || isUpdating ? (
              <CircularProgress size={24} />
            ) : selectedExpense ? (
              'Update'
            ) : (
              'Add'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RecurringExpensesPage;
