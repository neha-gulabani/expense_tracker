import React from 'react';
import { FormikProps } from 'formik';
import { ExpenseFormValues,SelectOption } from '../../types';
import { useCreateExpenseMutation, useGetCategoriesQuery } from '../../api/baseApi';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { Label } from '../../components/Label/Label';
import { Select } from '../../components/Select/Select';
import { Textarea } from '../../components/ui/textarea';
import { Spinner } from '../../components/Spinner/Spinner';

interface AddExpensesProps {
  formik: FormikProps<ExpenseFormValues>;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  categoryOptions: SelectOption[];
  selectedExpense: any;
  setSelectedExpense: (expense: any) => void;
  setIsCategoryDialogOpen: (open: boolean) => void;
  newCategoryName: string;
  setNewCategoryName: (name: string) => void;
  newCategoryColor: string;
  setNewCategoryColor: (color: string) => void;
  isCategoryDialogOpen: boolean;
  handleCreateCategory: () => Promise<void>;
}

const AddExpenses: React.FC<AddExpensesProps> = (props) => {
  const { isLoading: isLoadingCategories } = useGetCategoriesQuery();
  const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createExpense({
        amount: Number(props.formik.values.amount),
        date: props.formik.values.date,
        description: props.formik.values.description,
        categoryName: props.formik.values.category
      });
      props.formik.resetForm();
      props.setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating expense:', error);
    }
  };

  const handleCategoryChange = (value: string) => {
    if (value === 'create') {
      props.setIsCategoryDialogOpen(true);
    } else {
      props.formik.setFieldValue('category', value);
    }
  };

  if (isLoadingCategories) {
    return <Spinner />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          value={props.formik.values.amount}
          onChange={props.formik.handleChange}
          onBlur={props.formik.handleBlur}
        />
      </div>

      <div>
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={props.formik.values.date}
          onChange={props.formik.handleChange}
          onBlur={props.formik.handleBlur}
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={props.formik.values.description}
          onChange={props.formik.handleChange}
          onBlur={props.formik.handleBlur}
        />
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Select
          options={props.categoryOptions}
          value={props.formik.values.category}
          onChange={handleCategoryChange}
          placeholder="Select a category"
          className="w-full"
        />
      </div>

      <Button type="submit" disabled={isCreating}>
        {isCreating ? <Spinner /> : 'Add Expense'}
      </Button>
    </form>
  );
};

export default AddExpenses;