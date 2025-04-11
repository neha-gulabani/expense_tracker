import React, { useState } from 'react';
import { FormikProps } from 'formik';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle,
  DialogFooter 
} from '../../components/Dialog/Dialog';
import { Button } from '../../components/Button/Button';
import { Select } from '../../components/Select/Select';
import { DatePicker } from '../../components/DatePicker/DatePicker';
import { RecurringExpense, RecurringInterval, Category } from '../../types';

interface AddRecurringProps {
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
  selectedExpense: RecurringExpense | null;
  formik: FormikProps<{
    amount: string;
    description: string;
    frequency: string;
    startDate: string;
    endDate?: string;
    category: string;
    isActive?: boolean;
  }>;
  categoryOptions: Array<{ value: string; label: string }>;
  handleCreateCategory: () => void;
}

const AddRecurring: React.FC<AddRecurringProps> = ({
  openDialog,
  setOpenDialog,
  selectedExpense,
  formik,
  categoryOptions,
  handleCreateCategory
}) => {
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#888888');

  return (
    <>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogContent>
          <DialogTitle>
            {selectedExpense ? 'Edit Recurring Expense' : 'Add Recurring Expense'}
          </DialogTitle>
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">
                Amount
              </label>
              <input
                id="amount"
                type="number"
                {...formik.getFieldProps('amount')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {formik.touched.amount && formik.errors.amount && (
                <div className="text-sm text-red-500">{formik.errors.amount}</div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <input
                id="description"
                type="text"
                {...formik.getFieldProps('description')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {formik.touched.description && formik.errors.description && (
                <div className="text-sm text-red-500">{formik.errors.description}</div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="frequency" className="text-sm font-medium">
                Frequency
              </label>
              <Select
                value={formik.values.frequency}
                onChange={(value: string) => formik.setFieldValue('frequency', value)}
                options={[
                  { value: RecurringInterval.DAILY, label: 'Daily' },
                  { value: RecurringInterval.WEEKLY, label: 'Weekly' },
                  { value: RecurringInterval.MONTHLY, label: 'Monthly' }
                ]}
                placeholder="Select frequency"
              />
              {formik.touched.frequency && formik.errors.frequency && (
                <div className="text-sm text-red-500">{formik.errors.frequency}</div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="startDate" className="text-sm font-medium">
                Start Date
              </label>
              <DatePicker
                value={formik.values.startDate}
                onChange={(date: string) => formik.setFieldValue('startDate', date)}
                placeholder="Select start date"
              />
              {formik.touched.startDate && formik.errors.startDate && (
                <div className="text-sm text-red-500">{formik.errors.startDate}</div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="endDate" className="text-sm font-medium">
                End Date (Optional)
              </label>
              <DatePicker
                value={formik.values.endDate}
                onChange={(date: string) => formik.setFieldValue('endDate', date)}
                placeholder="Select end date"
              />
              {formik.touched.endDate && formik.errors.endDate && (
                <div className="text-sm text-red-500">{formik.errors.endDate}</div>
              )}
            </div>

            <div className="relative z-50">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <div className="flex gap-2">
                <Select
                  options={categoryOptions}
                  value={formik.values.category}
                  onChange={(value: string) => {
                    if (value === 'create') {
                      setIsCategoryDialogOpen(true);
                    } else {
                      formik.setFieldValue('category', value);
                    }
                  }}
                  placeholder="Select Category"
                  className="w-full"
                />
                <button
                  type="button"
                  onClick={() => setIsCategoryDialogOpen(true)}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  New
                </button>
              </div>
              {formik.touched.category && formik.errors.category && (
                <div className="text-red-500 text-sm mt-1">{formik.errors.category}</div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="isActive"
                type="checkbox"
                {...formik.getFieldProps('isActive')}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                Active
              </label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={formik.isSubmitting}>
                {selectedExpense ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Category Dialog */}
      <Dialog
        open={isCategoryDialogOpen}
        onClose={() => {
          setIsCategoryDialogOpen(false);
          setNewCategoryName('');
          setNewCategoryColor('#888888');
        }}
      >
        <DialogContent>
          <DialogTitle>Create New Category</DialogTitle>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  id="categoryName"
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter category name"
                />
              </div>
              <div>
                <label htmlFor="categoryColor" className="block text-sm font-medium text-gray-700 mb-1">
                  Category Color
                </label>
                <input
                  id="categoryColor"
                  type="color"
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  className="w-full h-10"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setIsCategoryDialogOpen(false);
                  setNewCategoryName('');
                  setNewCategoryColor('#888888');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateCategory}
                disabled={!newCategoryName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddRecurring;

