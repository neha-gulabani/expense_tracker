import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRegisterMutation } from '../../api/authApi';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Loader2 } from 'lucide-react';
import { Label } from '../../components/ui/label';
import { CardContent } from '../../components/Card/Card';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password should be of minimum 6 characters length')
    .required('Password is required'),
});

const RegisterForm: React.FC = () => {
  const [register, { isLoading, error }] = useRegisterMutation();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await register(values).unwrap();
        navigate('/dashboard');
      } catch (err) {
        
      }
    },
  });

  return (
 <>
      
        <h3 className="text-lg text-center">Create Account</h3>
    
      
      <CardContent className="space-y-4 w-full">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              {('data' in error && error.data && typeof error.data === 'object' && 'message' in error.data) 
                ? error.data.message as string 
                : 'Registration failed. Please try again.'}
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              autoFocus
              value={formik.values.name}
              onChange={formik.handleChange}
              className={formik.touched.name && formik.errors.name ? "border-destructive" : ""}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-sm text-destructive">{formik.errors.name}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              className={formik.touched.email && formik.errors.email ? "border-destructive" : ""}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-sm text-destructive">{formik.errors.email}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              className={formik.touched.password && formik.errors.password ? "border-destructive" : ""}
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-sm text-destructive">{formik.errors.password}</p>
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
                Creating account...
              </>
            ) : (
              'Sign Up'
            )}
          </Button>
        </form>
      </CardContent>
   </>
  );
};

export default RegisterForm;
