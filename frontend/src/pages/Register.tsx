import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import RegisterForm from '../features/auth/RegisterForm';
import { Button } from '../components/ui/button';

const Register: React.FC = () => {
  return (
    <div className="flex items-center justify-center flex flex-col ">
     
    
          <RegisterForm />
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Button variant="link" asChild className="p-0">
                <RouterLink to="/login">
                  Sign In
                </RouterLink>
              </Button>
            </p>
          </div>
   

    </div>
  );
};

export default Register;
