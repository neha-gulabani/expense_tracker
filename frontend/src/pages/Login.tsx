import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import LoginForm from '../features/auth/LoginForm';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

const Login: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md p-6">
        <CardContent>
          <LoginForm />
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Button variant="link" asChild className="p-0">
                <RouterLink to="/register">
                  Sign Up
                </RouterLink>
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
