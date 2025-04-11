import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  useGetRecurringExpensesQuery,
  useCreateRecurringExpenseMutation,
  useUpdateRecurringExpenseMutation,
  useDeleteRecurringExpenseMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation
} from '../../api/baseApi';
import { 
  RecurringExpense, 
  RecurringInterval,
  Category,
  UpdateRecurringExpenseDto,
  FilterExpenseDto
} from '../../types';
import { Button } from '../../components/Button/Button';
import  FilterRecurring  from './FilterRecurring';
import { Table } from '../../components/Table/Table';
import { Badge } from '../../components/Badge/Badge';
import { Spinner } from '../../components/ui/spinner';
import { Pagination } from '../../components/Pagination/Pagination';
import { toast } from 'react-hot-toast';
import AddRecurring from './AddRecurring';

interface FormValues {
  amount: string;
  description: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  category: string;
  isActive?: boolean;
}

const validationSchema = Yup.object().shape({
  amount: Yup.number()
    .required('Amount is required')
    .min(0, 'Amount must be greater than 0'),
  description: Yup.string().required('Description is required'),
  frequency: Yup.string().required('Frequency is required'),
  startDate: Yup.date().required('Start date is required'),
  endDate: Yup.date()
    .min(Yup.ref('startDate'), 'End date must be after start date')
    .nullable(),
  category: Yup.string().required('Category is required'),
});

const RecurringExpensesPage: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<RecurringExpense | null>(null);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState({
    category: '',
    minAmount: '',
    maxAmount: '',
    isActive: undefined as boolean | undefined
  });
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#888888');


  const backendPage = page + 1;

 
  const { data: recurringExpensesData, isLoading, refetch } = useGetRecurringExpensesQuery({
    page: backendPage,
    limit,
    category: filters.category || undefined,
    minAmount: filters.minAmount ? Number(filters.minAmount) : undefined,
    maxAmount: filters.maxAmount ? Number(filters.maxAmount) : undefined,
    isActive: filters.isActive
  } as FilterExpenseDto);
  const { data: categories, refetch: refetchCategories } = useGetCategoriesQuery();
  const [createRecurringExpense, { isLoading: isCreating }] = useCreateRecurringExpenseMutation();
  const [updateRecurringExpense, { isLoading: isUpdating }] = useUpdateRecurringExpenseMutation();
  const [deleteRecurringExpense] = useDeleteRecurringExpenseMutation();
  const [createCategory] = useCreateCategoryMutation();

  console.log('Recurring Expenses Data:', recurringExpensesData);
  console.log('Filters:', filters);

  const recurringExpenses = recurringExpensesData?.data || [];
  const total = recurringExpensesData?.total || 0;

  console.log('Processed Recurring Expenses:', recurringExpenses);
  console.log('Total:', total);

 
  const initialValues: FormValues = {
    amount: '',
    description: '',
    frequency: RecurringInterval.MONTHLY,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    category: '',
    isActive: undefined,
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const recurringExpenseData = {
          amount: Number(values.amount),
          description: values.description,
          frequency: values.frequency,
          startDate: values.startDate,
          endDate: values.endDate || undefined,
          categoryId: values.category,
          isActive: values.isActive,
        };

        if (selectedExpense) {
          await updateRecurringExpense({
            id: selectedExpense._id,
            data: recurringExpenseData,
          }).unwrap();
        } else {
          await createRecurringExpense(recurringExpenseData).unwrap();
        }
        resetForm();
        setOpenDialog(false);
        setSelectedExpense(null);
        refetch();
      } catch (error) {
        console.error('Error saving recurring expense:', error);
        toast.error('Failed to save recurring expense');
      }
    },
  });

  useEffect(() => {
    if (selectedExpense) {
      const formValues: FormValues = {
        amount: selectedExpense.amount.toString(),
        description: selectedExpense.description,
        frequency: selectedExpense.frequency,
        startDate: selectedExpense.startDate,
        endDate: selectedExpense.endDate,
        category: typeof selectedExpense.category === 'string' 
          ? selectedExpense.category 
          : selectedExpense.category?.name || '',
        isActive: selectedExpense.isActive,
      };
      formik.setValues(formValues);
    } else {
      formik.resetForm();
    }
  }, [selectedExpense]);

  const handleOpenDialog = (expense?: RecurringExpense) => {
    if (expense) {
      setSelectedExpense(expense);
    } else {
      setSelectedExpense(null);
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
        refetch();
      } catch (error) {
        console.error('Failed to delete recurring expense:', error);
      }
    }
  };

  const handleToggleActive = async (expense: RecurringExpense) => {
    try {
      const updateData: UpdateRecurringExpenseDto = {
        amount: expense.amount,
        description: expense.description,
        frequency: expense.frequency,
        startDate: expense.startDate,
        endDate: expense.endDate,
        categoryId: typeof expense.category === 'string' 
          ? expense.category 
          : expense.category?._id || '',
        isActive: !expense.isActive
      };

      await updateRecurringExpense({
        id: expense._id!,
        data: updateData
      }).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to toggle expense status:', error);
      toast.error('Failed to toggle expense status');
    }
  };

  const getIntervalLabel = (frequency: string) => {
    switch (frequency) {
      case RecurringInterval.DAILY:
        return 'Daily';
      case RecurringInterval.WEEKLY:
        return 'Weekly';
      case RecurringInterval.MONTHLY:
        return 'Monthly';
      default:
        return frequency;
    }
  };

  const getCategoryName = (category: Category | string | undefined): string => {
    if (!category) return 'none';
    if (typeof category === 'string') {
      const foundCategory = categories?.find(c => c._id === category);
      return foundCategory?.name || 'none';
    }
    return category.name;
  };

  const getCategoryColor = (category: Category | string | undefined): string => {
    if (!category) return '#888888';
    if (typeof category === 'string') return '#888888';
    return category.color || '#888888';
  };

  const getStatusBadge = (expense: RecurringExpense) => {
    if (!expense.isActive) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  const handleFilterChange = (key: string, value: string | boolean | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0); 
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      minAmount: '',
      maxAmount: '',
      isActive: undefined
    });
    setPage(0);
  };

  const columns = [
    {
      header: 'Description',
      accessor: 'description'
    },
    {
      header: 'Amount',
      accessor: 'amount',
      cell: (expense: RecurringExpense) => `$${expense.amount.toFixed(2)}`
    },
    {
      header: 'Interval',
      accessor: 'frequency',
      cell: (expense: RecurringExpense) => getIntervalLabel(expense.frequency)
    },
    {
      header: 'Category',
      accessor: 'category',
      cell: (expense: RecurringExpense) => {
        if (!expense.category) return 'Uncategorized';
        return (
          <Badge 
            variant="outline"
            style={{ backgroundColor: getCategoryColor(expense.category), color: '#fff' }}
          >
            {getCategoryName(expense.category)}
          </Badge>
        );
      }
    },
    {
      header: 'Start Date',
      accessor: 'startDate',
      cell: (expense: RecurringExpense) => format(new Date(expense.startDate), 'MMM dd, yyyy')
    },
    {
      header: 'End Date',
      accessor: 'endDate',
      cell: (expense: RecurringExpense) => 
        expense.endDate ? format(new Date(expense.endDate), 'MMM dd, yyyy') : 'No end date'
    },
    {
      header: 'Status',
      accessor: 'isActive',
      cell: (expense: RecurringExpense) => getStatusBadge(expense)
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (expense: RecurringExpense) => (
        <div className="flex space-x-2">
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
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleToggleActive(expense)}
           
          >
            {expense.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      )
    }
  ];

  const categoryOptions = [
    ...(categories || []).map((category) => ({
      value: category._id,
      label: category.name
    })),
    { value: 'create', label: 'Create New Category' }
  ];

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Recurring Expenses</h1>
        <Button onClick={() => handleOpenDialog()} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Add Recurring Expense
        </Button>
      </div>
      <FilterRecurring
        filters={filters}
        categories={categories || []}
        handleFilterChange={handleFilterChange}
        resetFilters={resetFilters}
      />

     
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Spinner />
          </div>
        ) : (
          <>
            <Table 
              data={recurringExpenses} 
              columns={columns} 
            />
            <Pagination
              count={total}
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

      <AddRecurring
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        selectedExpense={selectedExpense}
        formik={formik}
        categoryOptions={categoryOptions}
        handleCreateCategory={handleCreateCategory}
      />

  
    
    </div>
  );
};

export default RecurringExpensesPage;
