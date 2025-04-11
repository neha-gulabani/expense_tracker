import React from 'react';
import { FormikProps } from 'formik';
import { ExpenseFormValues,SelectOption } from '../../types';
import { useCreateExpenseMutation, useGetCategoriesQuery, useUpdateExpenseMutation } from '../../api/baseApi';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { Label } from '../../components/Label/Label';
import { Select } from '../../components/Select/Select';
import { Textarea } from '../../components/ui/textarea';
import { Spinner } from '../../components/Spinner/Spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { toast } from 'react-hot-toast';

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
  const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (props.selectedExpense) {
        const updateData = {
          amount: Number(props.formik.values.amount),
          date: props.formik.values.date,
          description: props.formik.values.description,
          categoryName: props.formik.values.category
        };
        await updateExpense({
          id: props.selectedExpense._id,
          data: updateData
        }).unwrap();
        toast.success('Expense updated successfully');
      } else {
        await createExpense({
          amount: Number(props.formik.values.amount),
          date: props.formik.values.date,
          description: props.formik.values.description,
          categoryName: props.formik.values.category
        }).unwrap();
        toast.success('Expense created successfully');
      }
      props.formik.resetForm();
      props.setIsDialogOpen(false);
      props.setSelectedExpense(null);
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error('Failed to save expense');
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
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className='flex flex-col gap-2'>
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            value={props.formik.values.amount}
            onChange={props.formik.handleChange}
            onBlur={props.formik.handleBlur}
          />
        </div>

        <div className='flex flex-col gap-2'>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={props.formik.values.date}
            onChange={props.formik.handleChange}
            onBlur={props.formik.handleBlur}
          />
        </div>

        <div className='flex flex-col gap-2'>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={props.formik.values.description}
            onChange={props.formik.handleChange}
            onBlur={props.formik.handleBlur}
          />
        </div>

        <div className='flex flex-col gap-2'>
          <Label htmlFor="category">Category</Label>
          <div className="flex gap-2">
            <Select
              options={props.categoryOptions}
              value={props.formik.values.category}
              onChange={handleCategoryChange}
              placeholder="Select a category"
              className="w-full"
            />
            <Button
              type="button"
              onClick={() => props.setIsCategoryDialogOpen(true)}
              variant="outline"
            >
              New
            </Button>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => props.setIsDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isCreating || isUpdating}
          >
            {isCreating || isUpdating ? (
              <Spinner className="mr-2" />
            ) : null}
            {props.selectedExpense ? 'Update Expense' : 'Add Expense'}
          </Button>
        </div>
      </form>

      {/* Create Category Dialog */}
      <Dialog open={props.isCategoryDialogOpen} onOpenChange={props.setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-4">
            <div className="space-y-4 flex flex-col gap-2">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                value={props.newCategoryName}
                onChange={(e) => props.setNewCategoryName(e.target.value)}
                placeholder="Enter category name"
              />
            </div>
            <div className="space-y-4 flex flex-col gap-2">
              <Label htmlFor="categoryColor">Category Color</Label>
              <Input
                id="categoryColor"
                type="color"
                value={props.newCategoryColor}
                onChange={(e) => props.setNewCategoryColor(e.target.value)}
                className="w-full h-10"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => props.setIsCategoryDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant='primary'
                onClick={props.handleCreateCategory}
                disabled={!props.newCategoryName.trim()}
              >
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddExpenses;