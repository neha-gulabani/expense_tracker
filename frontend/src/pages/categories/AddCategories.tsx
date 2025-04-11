import React from 'react';
import { FormikProps } from 'formik';
import { 
    Dialog, 
    DialogContent, 
    DialogFooter, 
    DialogTitle 
  } from '../../components/Dialog/Dialog';
import { Label } from '../../components/Label/Label';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import { Category } from '../../types';

interface AddCategoriesProps {
  openDialog: boolean;
  handleCloseDialog: () => void;
  selectedCategory: Category | null;
  formik: FormikProps<{
    name: string;
    color: string;
  }>;
  isCreating?: boolean;
  isUpdating?: boolean;
}

const AddCategories: React.FC<AddCategoriesProps> = ({
  openDialog, 
  handleCloseDialog, 
  selectedCategory, 
  formik,
  isCreating = false,
  isUpdating = false
}) => {
  return (
    <Dialog open={openDialog} onClose={handleCloseDialog}>
      <DialogContent>
        <DialogTitle>{selectedCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <form id="category-form" onSubmit={formik.handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" required>Name</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={!!(formik.touched.name && formik.errors.name)}
              fullWidth
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-red-500 text-sm">{formik.errors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Input
              type="color"
              id="color"
              name="color"
              value={formik.values.color}
              onChange={formik.handleChange}
              fullWidth
            />
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCloseDialog}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              isLoading={isCreating || isUpdating}
            >
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCategories;

