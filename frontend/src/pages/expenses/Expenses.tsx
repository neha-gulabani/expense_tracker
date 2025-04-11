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
import { toast } from 'react-hot-toast';

import { 
  Expense, 
  SelectOption,
  CreateExpenseDto,
  Category,
  UpdateExpenseDto
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
        if (selectedExpense) {
          const updateData: UpdateExpenseDto = {
            amount: Number(values.amount),
            date: values.date,
            description: values.description,
            categoryName: values.category
          };
          await updateExpense({
            id: selectedExpense._id,
            data: updateData
          }).unwrap();
          toast.success('Expense updated successfully');
        } else {
          const createExpenseData = {
            amount: Number(values.amount),
            date: values.date,
            description: values.description,
            categoryName: values.category
          };
          
          await createExpense(createExpenseData as CreateExpenseDto).unwrap();
          toast.success('Expense created successfully');
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
  }, [categories, formik.setValues]);

  useEffect(() => {
    if (selectedExpense) {
      updateFormValues(selectedExpense);
    } else {
      formik.resetForm();
    }
  }, [selectedExpense, updateFormValues]);

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDialogOpen(true);
    updateFormValues(expense);
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
    { header: 'Date', accessor: 'date', cell: (item: Expense) => format(new Date(item.date), 'MMM dd, yyyy') },
    { header: 'Description', accessor: 'description' },
    { header: 'Amount', accessor: 'amount', cell: (item: Expense) => `$${item.amount.toFixed(2)}` },
    { 
      header: 'Category', 
      accessor: 'category',
      cell: (item: Expense) => {
        let categoryData;
        
        if (typeof item.category === 'string') {
          // If category is just an ID, find the category object from our categories list
          categoryData = categories.find(c => c._id === item.category);
          console.log('Category from ID:', item.category, 'Found:', categoryData);
        } else {
          // If category is already populated, use it directly
          categoryData = item.category as Category;
          console.log('Populated category:', categoryData);
        }
        
        if (!categoryData) {
          return <Badge color="#888888">Uncategorized</Badge>;
        }

        return (
          <Badge color={categoryData.color || '#888888'}>
            {categoryData.name}
          </Badge>
        );
      }
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (item: Expense) => (
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => handleEdit(item)}>Edit</Button>
          <Button variant="destructive" onClick={() => handleDelete(item._id)}>Delete</Button>
        </div>
      )
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <Button onClick={() => setIsDialogOpen(true)}><Plus className="h-4 w-4" /> Add Expense</Button>
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
