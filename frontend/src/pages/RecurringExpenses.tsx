import React, { useState } from 'react';
import { format } from 'date-fns';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  useGetRecurringExpensesQuery,
  useCreateRecurringExpenseMutation,
  useUpdateRecurringExpenseMutation,
  useDeleteRecurringExpenseMutation,
} from '../api/recurringExpensesApi';
import { useGetCategoriesQuery } from '../api/categoriesApi';
import { RecurringExpense, RecurringInterval } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { DatePicker } from '../components/ui/date-picker';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Spinner } from '../components/ui/spinner';

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
  const [deleteRecurringExpense] = useDeleteRecurringExpenseMutation();

  // Recurring expense form
  const formik = useFormik({
    initialValues: {
      amount: '',
      description: '',
      interval: RecurringInterval.MONTHLY,
      startDate: new Date(),
      endDate: undefined as Date | undefined,
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
        startDate: new Date(expense.startDate),
        endDate: expense.endDate ? new Date(expense.endDate) : undefined,
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

  const getIntervalLabel = (interval: string) => {
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
    <Card>
      <CardHeader>
        <CardTitle>Recurring Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Button onClick={() => handleOpenDialog()} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Add Recurring Expense
          </Button>
        </div>

        {/* Recurring Expenses Table */}
        <div className="w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 flex flex-row">
                <TableHeader className="font-semibold whitespace-nowrap px-4 py-3">Description</TableHeader>
                <TableHeader className="font-semibold whitespace-nowrap px-4 py-3">Amount</TableHeader>
                <TableHeader className="font-semibold whitespace-nowrap px-4 py-3">Interval</TableHeader>
                <TableHeader className="font-semibold whitespace-nowrap px-4 py-3">Category</TableHeader>
                <TableHeader className="font-semibold whitespace-nowrap px-4 py-3">Start Date</TableHeader>
                <TableHeader className="font-semibold whitespace-nowrap px-4 py-3">End Date</TableHeader>
                <TableHeader className="font-semibold whitespace-nowrap px-4 py-3">Status</TableHeader>
                <TableHeader className="font-semibold whitespace-nowrap px-4 py-3 text-right">Actions</TableHeader>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    <Spinner />
                  </TableCell>
                </TableRow>
              ) : recurringExpenses?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">No recurring expenses found</TableCell>
                </TableRow>
              ) : (
                recurringExpenses?.map((expense: RecurringExpense) => (
                  <TableRow key={expense._id}>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>${expense.amount.toFixed(2)}</TableCell>
                    <TableCell>{getIntervalLabel(expense.interval)}</TableCell>
                    <TableCell>
                      {expense.category ? (
                        <Badge 
                          variant="outline"
                          style={{ backgroundColor: expense.category.color || '#e0e0e0', color: '#fff' }}
                        >
                          {expense.category.name}
                        </Badge>
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
                      <Badge 
                        variant={expense.isActive ? "default" : "destructive"}
                      >
                        {expense.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(expense)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRecurringExpense(expense._id!)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Add/Edit Recurring Expense Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedExpense ? 'Edit Recurring Expense' : 'Add Recurring Expense'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={formik.handleSubmit} id="recurring-expense-form" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                name="amount"
                value={formik.values.amount}
                onChange={formik.handleChange}
                className={formik.touched.amount && formik.errors.amount ? "border-red-500" : ""}
              />
              {formik.touched.amount && formik.errors.amount && (
                <p className="text-sm text-red-500">{formik.errors.amount as string}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                type="text"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                className={formik.touched.description && formik.errors.description ? "border-red-500" : ""}
              />
              {formik.touched.description && formik.errors.description && (
                <p className="text-sm text-red-500">{formik.errors.description as string}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="interval">Interval</Label>
              <Select 
                defaultValue={formik.values.interval}
                onValueChange={(value) => formik.setFieldValue('interval', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={RecurringInterval.DAILY}>Daily</SelectItem>
                  <SelectItem value={RecurringInterval.WEEKLY}>Weekly</SelectItem>
                  <SelectItem value={RecurringInterval.MONTHLY}>Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <DatePicker
                date={formik.values.startDate}
                setDate={(date) => formik.setFieldValue('startDate', date)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <DatePicker
                date={formik.values.endDate}
                setDate={(date) => formik.setFieldValue('endDate', date)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="categoryName">Category</Label>
              <Select 
                defaultValue={formik.values.categoryName}
                onValueChange={(value) => formik.setFieldValue('categoryName', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category._id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedExpense && (
              <div className="flex items-center space-x-2">
                <Label htmlFor="isActive">Active</Label>
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formik.values.isActive}
                  onChange={formik.handleChange}
                  className="h-4 w-4"
                />
              </div>
            )}
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="recurring-expense-form"
              disabled={isCreating || isUpdating}
            >
              {isCreating || isUpdating ? (
                <div className="flex items-center">
                  <Spinner size="sm" className="mr-2" />
                  <span>{selectedExpense ? 'Updating...' : 'Adding...'}</span>
                </div>
              ) : selectedExpense ? (
                'Update'
              ) : (
                'Add'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default RecurringExpensesPage;
