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
const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  color: Yup.string(),
});

const CategoriesPage: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

 
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
    <Card className="max-w-full mx-auto">
      <CardHeader className='flex justify-between items-center'>
        <CardTitle>Categories</CardTitle>
        <Button 
          variant="primary" 
          onClick={() => handleOpenDialog()} 
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </CardHeader>
      <CardContent>
        

        
        <div className="w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Name</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <div className="flex justify-center py-4">
                      <Spinner />
                    </div>
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
                    <TableCell>{category.name}</TableCell>
                    <TableCell>
                      <div 
                        className="h-6 w-6 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
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
