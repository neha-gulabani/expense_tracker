import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useFormik } from 'formik';
import { 
  useGetExpensesQuery, 
  useCreateExpenseMutation, 
  useUpdateExpenseMutation, 
  useDeleteExpenseMutation,
} from '../api/expensesApi';
import { useGetCategoriesQuery } from '../api/categoriesApi';
import { FilterExpenseDto, Expense } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead,
  TableRow 
} from '../components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogTitle 
} from '../components/ui/dialog';
import { Spinner } from '../components/ui/spinner';
import { Calendar } from '../components/ui/calendar';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '../components/ui/popover';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';

const ExpensesPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<FilterExpenseDto>({});
  const [openDialog, setOpenDialog] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null);
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

  // Monitor for data changes and refresh when needed
  useEffect(() => {
    console.log('Expenses page - expensesData:', expensesData);
  }, [refetchExpenses, expensesData]);

  // Function to format date for display
  const formatDate = (date: Date | string): string => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'MMM dd, yyyy');
  };

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
    onSubmit: async (values: any) => {
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

  const handleOpenDialog = (expense: Expense | null = null) => {
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

  const handleDeleteExpense = async (expenseId: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(expenseId).unwrap();
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

  // Function to handle date selection in the filter
  const handleDateSelect = (date: Date | null | undefined, type: 'startDate' | 'endDate'): void => {
    if (date) {
      filterFormik.setFieldValue(type, format(date, 'yyyy-MM-dd'));
    }
  };

  // Function to handle date selection in the form
  const handleExpenseDateSelect = (date: Date | null | undefined): void => {
    if (date) {
      formik.setFieldValue('date', format(date, 'yyyy-MM-dd'));
    }
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
    <Card>
      <CardHeader>
        <CardTitle>Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filter Section */}
        <div className={cn("mb-4")}>
          <div className={cn("flex justify-between items-center mb-2")}>
            <h3 className={cn("text-lg font-medium")}>Manage Expenses</h3>
            <div className={cn("flex gap-2")}>
              <Button onClick={() => setShowFilters(!showFilters)} variant="outline">
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
              <Button onClick={() => handleOpenDialog()}>Add Expense</Button>
            </div>
          </div>

          {showFilters && (
            <div className={cn("p-4 border rounded-md bg-background mb-4")}>
            <form onSubmit={filterFormik.handleSubmit} className={cn("grid grid-cols-1 md:grid-cols-3 gap-4")}>
              <div className={cn("space-y-2")}>
                <Label htmlFor="startDate">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal")}
                    >
                      {filterFormik.values.startDate 
                        ? formatDate(filterFormik.values.startDate)
                        : <span>Pick a date</span>
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className={cn("w-auto p-0")}>
                    <Calendar
                      selected={filterFormik.values.startDate ? new Date(filterFormik.values.startDate) : undefined}
                      onSelect={(date: Date | undefined) => handleDateSelect(date, 'startDate')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className={cn("space-y-2")}>
                <Label htmlFor="endDate">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal")}
                    >
                      {filterFormik.values.endDate 
                        ? formatDate(filterFormik.values.endDate)
                        : <span>Pick a date</span>
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className={cn("w-auto p-0")}>
                    <Calendar
                      selected={filterFormik.values.endDate ? new Date(filterFormik.values.endDate) : undefined}
                      onSelect={(date: Date | undefined) => handleDateSelect(date, 'endDate')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className={cn("space-y-2")}>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={filterFormik.values.category}
                  onValueChange={(value) => filterFormik.setFieldValue('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category._id} value={category._id!}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className={cn("space-y-2")}>
                <Label htmlFor="minAmount">Min Amount</Label>
                <Input
                  id="minAmount"
                  name="minAmount"
                  type="number"
                  value={filterFormik.values.minAmount}
                  onChange={filterFormik.handleChange}
                />
              </div>

              <div className={cn("space-y-2")}>
                <Label htmlFor="maxAmount">Max Amount</Label>
                <Input
                  id="maxAmount"
                  name="maxAmount"
                  type="number"
                  value={filterFormik.values.maxAmount}
                  onChange={filterFormik.handleChange}
                />
              </div>

              <div className={cn("flex items-end gap-2")}>
                <Button type="submit">Apply Filters</Button>
                <Button type="button" variant="outline" onClick={handleResetFilters}>
                  Reset
                </Button>
              </div>
            </form>
          </div>
          )}
        </div>

        {/* Expenses Table */}
        {isLoadingExpenses ? (
          <div className={cn("flex justify-center items-center py-8")}>
            <Spinner />
          </div>
        ) : (
          <>
            <div className={cn("border rounded-md")}>
              <div className="w-full overflow-auto">
                <Table>
                  <TableHead>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold whitespace-nowrap px-6 py-3">Date</TableHead>
                      <TableHead className="font-semibold whitespace-nowrap px-6 py-3">Description</TableHead>
                      <TableHead className="font-semibold whitespace-nowrap px-6 py-3">Category</TableHead>
                      <TableHead className="font-semibold whitespace-nowrap px-6 py-3">Amount</TableHead>
                      <TableHead className="font-semibold whitespace-nowrap px-6 py-3">Actions</TableHead>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className={cn("text-center")}>
                          No expenses found
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedData.map((expense) => (
                        <TableRow key={expense._id}>
                          <TableCell className="px-3 py-4">{formatDate(expense.date)}</TableCell>
                          <TableCell className="px-3 py-4">{expense.description}</TableCell>
                          <TableCell className="px-3 py-4">
                            {expense.category ? (
                              <Badge 
                                style={{ backgroundColor: expense.category.color || '#e0e0e0' }}
                                className={cn("text-white")}
                              >
                                {expense.category.name}
                              </Badge>
                            ) : (
                              'Uncategorized'
                            )}
                          </TableCell>
                          <TableCell className="px-3 py-4">${expense.amount.toFixed(2)}</TableCell>
                          <TableCell className="px-3 py-4">
                            <div className={cn("flex gap-2")}>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenDialog(expense)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteExpense(expense._id!)}
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Pagination */}
            <div className={cn("flex items-center justify-between py-4")}>
              <div className={cn("flex-1 text-sm text-muted-foreground")}>
                Showing {paginatedData.length} of {totalItems} expenses
              </div>
              <div className={cn("flex items-center space-x-6 lg:space-x-8")}>
                <div className={cn("flex items-center space-x-2")}>
                  <p className={cn("text-sm font-medium")}>Rows per page</p>
                  <Select
                    value={limit.toString()}
                    onValueChange={(value) => handleChangeRowsPerPage({ target: { value } } as any)}
                  >
                    <SelectTrigger className={cn("h-8 w-[70px]")}>
                      <SelectValue placeholder={limit.toString()} />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 25, 50].map((pageSize) => (
                        <SelectItem key={pageSize} value={pageSize.toString()}>
                          {pageSize}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className={cn("flex w-[100px] items-center justify-center text-sm font-medium")}>
                  Page {page + 1} of {Math.max(1, Math.ceil(totalItems / limit))}
                </div>
                <div className={cn("flex items-center space-x-2")}>
                  <Button
                    variant="outline"
                    className={cn("h-8 w-8 p-0")}
                    onClick={() => handleChangePage(null, page - 1)}
                    disabled={page === 0}
                  >
                    <span className={cn("sr-only")}>Go to previous page</span>
                    &lt;
                  </Button>
                  <Button
                    variant="outline"
                    className={cn("h-8 w-8 p-0")}
                    onClick={() => handleChangePage(null, page + 1)}
                    disabled={page >= Math.ceil(totalItems / limit) - 1}
                  >
                    <span className={cn("sr-only")}>Go to next page</span>
                    &gt;
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Add/Edit Expense Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogContent>
            <DialogTitle>{currentExpense ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
            <form id="expense-form" onSubmit={formik.handleSubmit} className={cn("space-y-4 mt-4")}>
              <div className={cn("space-y-2")}>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={formik.values.amount}
                  onChange={formik.handleChange}
                  required
                />
              </div>
              
              <div className={cn("space-y-2")}>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  required
                />
              </div>
              
              <div className={cn("space-y-2")}>
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal")}
                    >
                      {formik.values.date 
                        ? formatDate(formik.values.date)
                        : <span>Pick a date</span>
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className={cn("w-auto p-0")}>
                    <Calendar
                      selected={formik.values.date ? new Date(formik.values.date) : undefined}
                      onSelect={(date: Date | undefined) => handleExpenseDateSelect(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className={cn("space-y-2")}>
                <Label htmlFor="categoryName">Category</Label>
                <Select
                  value={formik.values.categoryName}
                  onValueChange={(value) => formik.setFieldValue('categoryName', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Uncategorized</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category._id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </form>
            
            <DialogFooter className={cn("mt-4")}>
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                form="expense-form"
                disabled={isCreating || isUpdating}
              >
                {isCreating || isUpdating ? (
                  <>
                    <Spinner size="sm" className={cn("mr-2")} />
                    Loading...
                  </>
                ) : currentExpense ? (
                  'Update'
                ) : (
                  'Add'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ExpensesPage;
