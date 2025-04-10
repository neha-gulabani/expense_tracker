import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useLoginMutation } from '../../api/authApi';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Loader2 } from 'lucide-react';
import { Label } from '../../components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';

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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center font-bold">Sign In</CardTitle>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              {('data' in error && error.data && typeof error.data === 'object' && 'message' in error.data) 
                ? error.data.message as string 
                : 'Login failed. Please try again.'}
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formik.values.email}
              onChange={formik.handleChange}
              className={formik.touched.email && formik.errors.email ? "border-red-500" : ""}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-sm text-red-500">{formik.errors.email}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formik.values.password}
              onChange={formik.handleChange}
              className={formik.touched.password && formik.errors.password ? "border-red-500" : ""}
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-sm text-red-500">{formik.errors.password}</p>
            )}
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
