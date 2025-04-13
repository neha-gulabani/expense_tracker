import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import LoginForm from '../features/auth/LoginForm';
import { Button } from '../components/ui/button';


const Login: React.FC = () => {
  return (

      <>
   
          <LoginForm />
         
            <p className="text-sm text-center text-muted-foreground">
              Don't have an account?{' '}
              <Button variant="link" asChild className="p-0">
                <RouterLink to="/register">
                  Sign Up
                </RouterLink>
              </Button>
            </p>

            </>
     
  
  
 
  );
};

export default Login;
