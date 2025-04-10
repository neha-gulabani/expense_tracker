import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHeader,
  TableHead, 
  TableRow 
} from '../components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogTitle 
} from '../components/ui/dialog';
import { Spinner } from '../components/ui/spinner';
import { cn } from '../lib/utils';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useGetCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation } from '../api/categoriesApi';
import { Category } from '../types';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  color: Yup.string(),
});

const CategoriesPage: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // API hooks
  const { data: categories, isLoading } = useGetCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const formik = useFormik({
    initialValues: {
      name: '',
      color: '#1976d2',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (selectedCategory) {
          await updateCategory({
            id: selectedCategory._id!,
            category: {
              name: values.name,
              color: values.color,
            },
          }).unwrap();
        } else {
          await createCategory({
            name: values.name,
            color: values.color,
          }).unwrap();
        }
        handleCloseDialog();
      } catch (error) {
        console.error('Failed to save category:', error);
      }
    },
  });

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setSelectedCategory(category);
      formik.setValues({
        name: category.name,
        color: category.color || '#1976d2',
      });
    } else {
      setSelectedCategory(null);
      formik.resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    formik.resetForm();
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id).unwrap();
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={() => handleOpenDialog()} className={cn("mb-4")}>Add Category</Button>

        {/* Categories Table */}
        <div className="w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold whitespace-nowrap px-6 py-3">Name</TableHead>
                <TableHead className="font-semibold whitespace-nowrap px-6 py-3">Color</TableHead>
                <TableHead className="font-semibold whitespace-nowrap px-6 py-3">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Spinner />
                  </TableCell>
                </TableRow>
              ) : categories?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No categories found
                  </TableCell>
                </TableRow>
              ) : (
                categories?.map((category: Category) => (
                  <TableRow key={category._id}>
                    <TableCell className="px-6 py-4">{category.name}</TableCell>
                    <TableCell className="px-6 py-4">
                      <div 
                        className="h-6 w-6 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className={cn("flex gap-2")}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDialog(category)}
                          aria-label="edit"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteCategory(category._id!)}
                          aria-label="delete"
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
      </CardContent>

      {/* Add/Edit Category Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogContent>
          <DialogTitle>{selectedCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
          <form id="category-form" onSubmit={formik.handleSubmit} className={cn("space-y-4 mt-4")}>
            <div className={cn("space-y-2")}>
              <Label htmlFor="name">Name</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                className={cn(formik.touched.name && formik.errors.name ? "border-red-500" : "")}
              />
              {formik.touched.name && formik.errors.name && (
                <p className={cn("text-red-500 text-sm")}>{formik.errors.name}</p>
              )}
            </div>
            <div className={cn("space-y-2")}>
              <Label htmlFor="color">Color</Label>
              <Input
                type="color"
                id="color"
                name="color"
                value={formik.values.color}
                onChange={formik.handleChange}
              />
            </div>
          </form>
          <DialogFooter className={cn("mt-4")}>
            <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
            <Button
              type="submit"
              form="category-form"
              disabled={isCreating || isUpdating}
            >
              {isCreating || isUpdating ? (
                <>
                  <Spinner size="sm" className={cn("mr-2")} />
                  Loading...
                </>
              ) : selectedCategory ? (
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

export default CategoriesPage;
