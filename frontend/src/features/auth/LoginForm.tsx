import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Box, Button, TextField, Typography, Alert, CircularProgress } from '@mui/material';
import { useLoginMutation } from '../../api/authApi';
import { useNavigate } from 'react-router-dom';

const validationSchema = Yup.object({
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const LoginForm: React.FC = () => {
  const [login, { isLoading, error }] = useLoginMutation();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await login(values).unwrap();
        navigate('/dashboard');
      } catch (err) {
        // Error is handled by the RTK Query hook
      }
    },
  });

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: 400,
        mx: 'auto',
        p: 2,
      }}
    >
      <Typography component="h1" variant="h5">
        Sign In
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
          {('data' in error && error.data && typeof error.data === 'object' && 'message' in error.data) 
            ? error.data.message as string 
            : 'Login failed. Please try again.'}
        </Alert>
      )}
      
      <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1, width: '100%' }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
          value={formik.values.email}
          onChange={formik.handleChange}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          value={formik.values.password}
          onChange={formik.handleChange}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
        </Button>
      </Box>
    </Box>
  );
};

export default LoginForm;
