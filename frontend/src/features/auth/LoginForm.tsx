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
        console.log(err);
      }
    },
  });

  return (
   <>
     
        <p className="text-lg text-center ">Sign In</p>
     
      
  
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
          <div className="space-y-4">
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
          
          <div className="space-y-4">
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

        </>

   
  );
};

export default LoginForm;
