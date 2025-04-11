import React, { useState, useEffect, useCallback } from 'react';
import { useFormik, FormikErrors } from 'formik';
import { format } from 'date-fns';
import { 
  useGetExpensesQuery, 
  useCreateExpenseMutation, 
  useUpdateExpenseMutation, 
  useDeleteExpenseMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation
} from '../../api/baseApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Table } from '../../components/Table/Table';
import { Badge } from '../../components/Badge/Badge';
import { Spinner } from '../../components/Spinner/Spinner';
import { Pagination } from '../../components/Pagination/Pagination';

import { 
  Expense, 
  SelectOption,
  CreateExpenseDto,
} from '../../types';
import AddExpenses from './AddExpenses';
import FilterExpenses from './FilterExpenses';
import { Button } from '../../components/Button/Button';
import { Plus } from 'lucide-react';
interface FilterValues {
  startDate: string;
  endDate: string;
  category: string;
  minAmount: string;
  maxAmount: string;
}

interface ExpenseFormValues {
  amount: string;
  date: string;
  description: string;
  category: string;
}

const ExpensesPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [filterValues, setFilterValues] = useState<FilterValues>({
    startDate: '',
    endDate: '',
    category: '',
    minAmount: '',
    maxAmount: '',
  });
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#888888');

  // Convert page to backend format (1-based instead of 0-based)
  const backendPage = page + 1;

  // Get expenses with pagination and filters
  const { data: expensesData, isLoading, refetch } = useGetExpensesQuery({
    page: backendPage,
    limit,
    startDate: filterValues.startDate || undefined,
    endDate: filterValues.endDate || undefined,
    category: filterValues.category || undefined,
    minAmount: filterValues.minAmount ? parseFloat(filterValues.minAmount) : undefined,
    maxAmount: filterValues.maxAmount ? parseFloat(filterValues.maxAmount) : undefined
  });

  const { data: categoriesData, refetch: refetchCategories } = useGetCategoriesQuery();
  const [createExpense] = useCreateExpenseMutation();
  const [updateExpense] = useUpdateExpenseMutation();
  const [deleteExpense] = useDeleteExpenseMutation();
  const [createCategory] = useCreateCategoryMutation();

  const expenses = expensesData?.data || [];
  const totalExpenses = expensesData?.total || 0;
  const categories = categoriesData || [];

  const handleCreateCategory = async () => {
    try {
      const newCategory = await createCategory({
        name: newCategoryName,
        color: newCategoryColor
      }).unwrap();
      
      // Reset the form and close the dialog
      setNewCategoryName('');
      setNewCategoryColor('#888888');
      setIsCategoryDialogOpen(false);
      
      // Refetch categories to update the list
      refetchCategories();
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  // Format categories for the Select component
  const categoryOptions: SelectOption[] = [
    { value: 'all', label: 'All Categories' },

    ...(categories || []).map((category) => ({
      value: category._id,
      label: category.name,
      color: category.color || '#888888'
    }))
  ];

  const formik = useFormik<ExpenseFormValues>({
    initialValues: {
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      category: '',
    },
    onSubmit: async (values, { resetForm }) => {
      try {
        // Find the category name from the selected category ID
        const selectedCategory = categories.find(c => c._id === values.category);
        const categoryName = selectedCategory?.name || values.category;

        if (selectedExpense) {
          await updateExpense({
            id: selectedExpense._id,
            data: {
              amount: Number(values.amount),
              date: values.date,
              description: values.description,
              categoryName: categoryName
            }
          }).unwrap();
        } else {
          const createExpenseData = {
            amount: Number(values.amount),
            date: values.date,
            description: values.description,
            categoryName: categoryName
          };
          
          console.log('Creating expense with data:', createExpenseData);
          
          await createExpense(createExpenseData as CreateExpenseDto).unwrap();
        }
        resetForm();
        setIsDialogOpen(false);
        setSelectedExpense(null);
        refetch();
      } catch (error) {
        console.error('Error saving expense:', error);
        if (error && typeof error === 'object' && 'data' in error) {
          console.error('Server error details:', error.data);
        }
      }
    },
    validate: (values) => {
      const errors: FormikErrors<{
        amount: string;
        date: string;
        description: string;
        category: string;
      }> = {};

      if (!values.amount) {
        errors.amount = 'Amount is required';
      } else if (isNaN(Number(values.amount))) {
        errors.amount = 'Amount must be a number';
      } else if (Number(values.amount) <= 0) {
        errors.amount = 'Amount must be greater than 0';
      }

      if (!values.date) {
        errors.date = 'Date is required';
      }

      if (!values.description) {
        errors.description = 'Description is required';
      }

      if (!values.category) {
        errors.category = 'Category is required';
      }

      return errors;
    },
  });

  const updateFormValues = useCallback((expense: Expense) => {
    const categoryName = typeof expense.category === 'string'
      ? categories.find(c => c._id === expense.category)?.name || ''
      : expense.category?.name || '';
    
    formik.setValues({
      amount: expense.amount.toString(),
      date: expense.date,
      description: expense.description,
      category: categoryName
    });
  }, [formik.setValues, categories]);

  useEffect(() => {
    if (selectedExpense) {
      updateFormValues(selectedExpense);
    } else {
      formik.resetForm();
    }
  }, [selectedExpense, updateFormValues, formik.resetForm]);

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id).unwrap();
        refetch();
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const handleFilterChange = async (key: keyof FilterValues, value: string) => {
    const newFilterValues = { ...filterValues, [key]: value };
    setFilterValues(newFilterValues);
    
    // Reset to first page when filter changes
    setPage(0);
  };

  const resetFilters = () => {
    setFilterValues({
      startDate: '',
      endDate: '',
      category: '',
      minAmount: '',
      maxAmount: '',
    });
    setPage(0);
  };

  const handleCategoryChange = (value: string) => {
    if (value === 'create') {
      setIsCategoryDialogOpen(true);
    } else if (value === 'all') {
      handleFilterChange('category', '');
    } else {
      handleFilterChange('category', value);
    }
  };

  const columns = [
    {
      header: 'Date',
      accessor: 'date',
      cell: (expense: Expense) => format(new Date(expense.date), 'MMM dd, yyyy')
    },
    {
      header: 'Description',
      accessor: 'description'
    },
    {
      header: 'Category',
      accessor: 'category',
      cell: (expense: Expense) => {
        if (!expense || !expense.category) {
          return <Badge text="Unknown" color="#888888" />;
        }

        // Handle both string and object formats
        let categoryName = '';
        let categoryColor = '#888888';

        if (typeof expense.category === 'string') {
          // If it's a string, try to find the category in our list
          const foundCategory = categories.find(c => c._id === expense.category);
          categoryName = foundCategory?.name || 'Unknown';
          categoryColor = foundCategory?.color || '#888888';
        } else if (expense.category && typeof expense.category === 'object') {
          // If it's an object (populated category), use its properties directly
          categoryName = expense.category.name || 'Unknown';
          categoryColor = expense.category.color || '#888888';
        }

        return (
          <Badge 
            text={categoryName} 
            color={categoryColor} 
          />
        );
      }
    },
    {
      header: 'Amount',
      accessor: 'amount',
      cell: (expense: Expense) => `$${expense.amount.toFixed(2)}`
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (expense: Expense) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(expense)}
            className="text-blue-600 hover:text-blue-800"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(expense._id)}
            className="text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <Button><Plus className="h-4 w-4" /> Add Expense</Button>
      </div>

      {/* Filters */}
      <FilterExpenses
        filterValues={filterValues}
        handleFilterChange={handleFilterChange}
        resetFilters={resetFilters}
        categoryOptions={categoryOptions}
        handleCategoryChange={handleCategoryChange}
      />

      {/* Expenses Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Spinner />
          </div>
        ) : (
          <>
            <Table 
              data={expenses} 
              columns={columns} 
              className='p-4'
            />
            <Pagination
              count={totalExpenses}
              page={page}
              rowsPerPage={limit}
              onChangePage={(newPage) => setPage(newPage)}
              onChangeRowsPerPage={(newLimit) => {
                setLimit(newLimit);
                setPage(0);
              }}
            />
          </>
        )}
      </div>

      {/* Add/Edit Expense Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedExpense ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
          </DialogHeader>
          <AddExpenses
            formik={formik}
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
            categoryOptions={categoryOptions}
            selectedExpense={selectedExpense}
            setSelectedExpense={setSelectedExpense}
            setIsCategoryDialogOpen={setIsCategoryDialogOpen}
            newCategoryName={newCategoryName}
            setNewCategoryName={setNewCategoryName}
            newCategoryColor={newCategoryColor}
            setNewCategoryColor={setNewCategoryColor}
            isCategoryDialogOpen={isCategoryDialogOpen}
            handleCreateCategory={handleCreateCategory}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpensesPage;
