import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
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
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  // Category form
  const formik = useFormik({
    initialValues: {
      name: '',
      color: '#3f51b5', // Default color
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (selectedCategory) {
          await updateCategory({
            id: selectedCategory._id!,
            category: values,
          }).unwrap();
        } else {
          await createCategory(values).unwrap();
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
        color: category.color || '#3f51b5',
      });
    } else {
      setSelectedCategory(null);
      formik.resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCategory(null);
    formik.resetForm();
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category? This may affect expenses that use this category.')) {
      try {
        await deleteCategory(id).unwrap();
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Categories
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Category
        </Button>
      </Stack>

      {/* Categories Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Color</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : categories?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No categories found
                </TableCell>
              </TableRow>
            ) : (
              categories?.map((category) => (
                <TableRow key={category._id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={category.name}
                      size="small"
                      sx={{
                        backgroundColor: category.color || '#e0e0e0',
                        color: '#fff',
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(category)}
                      aria-label="edit"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteCategory(category._id!)}
                      aria-label="delete"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Category Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
            <TextField
              margin="normal"
              fullWidth
              id="color"
              label="Color"
              name="color"
              type="color"
              value={formik.values.color}
              onChange={formik.handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={() => formik.handleSubmit()}
            variant="contained"
            disabled={isCreating || isUpdating}
          >
            {isCreating || isUpdating ? (
              <CircularProgress size={24} />
            ) : selectedCategory ? (
              'Update'
            ) : (
              'Add'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoriesPage;
