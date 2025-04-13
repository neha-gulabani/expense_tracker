import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle
} from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHeader,
  TableHead, 
  TableRow 
} from '../../components/Table/Table';
import AddCategories from './AddCategories';

import { Spinner } from '../../components/Spinner/Spinner';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useGetCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation } from '../../api/categoriesApi';
import { Category } from '../../types';
import { Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  color: Yup.string(),
});

const CategoriesPage: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const { data: categories, isLoading, refetch } = useGetCategoriesQuery();
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
          toast.success('Category updated successfully');
        } else {
          await createCategory({
            name: values.name,
            color: values.color,
          }).unwrap();
          toast.success('Category created successfully');
        }
        handleCloseDialog();
        refetch();
      } catch (error) {
        console.error('Failed to save category:', error);
        toast.error('Failed to save category');
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
        toast.success('Category deleted successfully');
        refetch();
      } catch (error) {
        console.error('Failed to delete category:', error);
        toast.error('Failed to delete category');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <Card className="max-w-full mx-auto">
      <CardHeader className='flex justify-between items-center'>
        <CardTitle>Categories</CardTitle>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories?.map((category) => (
              <TableRow key={category._id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>
                  <div 
                    className="w-6 h-6 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleOpenDialog(category)}
                      disabled={isUpdating}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDeleteCategory(category._id!)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <AddCategories
        openDialog={openDialog}
        handleCloseDialog={handleCloseDialog}
        selectedCategory={selectedCategory}
        formik={formik}
        isCreating={isCreating}
        isUpdating={isUpdating}
      />
    </Card>
  );
};

export default CategoriesPage;
