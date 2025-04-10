import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Typography, Link, Box } from '@mui/material';
import LoginForm from '../features/auth/LoginForm';

const Login: React.FC = () => {
  return (
    <Box>
      <LoginForm />
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2">
          Don't have an account?{' '}
          <Link component={RouterLink} to="/register" variant="body2">
            Sign Up
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
