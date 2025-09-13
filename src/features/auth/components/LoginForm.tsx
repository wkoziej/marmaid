// ABOUTME: Login form component with validation using React Hook Form and Zod
// ABOUTME: Provides user authentication interface with proper error handling and loading states
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuthStore } from '@/lib/auth-store';
import { loginSchema, type LoginFormData } from '../schemas/auth';

export const LoginForm = () => {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { login, loading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination, or default to dashboard
  const from = (location.state as { from?: string })?.from || '/dashboard';

  const onSubmit = async (data: LoginFormData) => {
    setError(null);

    const { user, error: authError } = await login(data.email, data.password);

    if (authError) {
      setError(authError);
      return;
    }

    if (user) {
      // Successful login - navigate to intended destination
      navigate(from, { replace: true });
    }
  };

  return (
    <div
      className='flex items-center justify-center min-h-screen bg-background'
      data-testid='login-page'
    >
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl font-bold'>Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your therapy practice management account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4'
              data-testid='login-form'
            >
              {error && (
                <div
                  className='p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md'
                  data-testid='login-error'
                >
                  {error}
                </div>
              )}

              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='your@email.com'
                        disabled={loading}
                        data-testid='email-input'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        placeholder='Enter your password'
                        disabled={loading}
                        data-testid='password-input'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type='submit'
                className='w-full'
                disabled={loading}
                data-testid='login-button'
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              <div className='text-center space-y-2'>
                <Link
                  to='/forgot-password'
                  className='text-sm text-primary hover:underline'
                  data-testid='forgot-password-link'
                >
                  Forgot your password?
                </Link>

                <div className='text-sm text-muted-foreground'>
                  Don't have an account?{' '}
                  <Link
                    to='/register'
                    className='text-primary hover:underline'
                    data-testid='register-link'
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
