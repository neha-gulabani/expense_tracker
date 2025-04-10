import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Typography, Link, Box } from '@mui/material';
import RegisterForm from '../features/auth/RegisterForm';

const Register: React.FC = () => {
  return (
    <Box>
      <RegisterForm />
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2">
          Already have an account?{' '}
          <Link component={RouterLink} to="/login" variant="body2">
            Sign In
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Register;
