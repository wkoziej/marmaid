// ABOUTME: Registration form component with validation for new user signup
// ABOUTME: Handles user registration with role selection and proper error handling
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
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
import { registerSchema, type RegisterFormData } from '../schemas/auth';

export const RegisterForm = () => {
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      role: 'therapist',
    },
  });

  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    setSuccessMessage(null);

    const { user, error: authError } = await register(
      data.email,
      data.password,
      data.role
    );

    if (authError) {
      // Check if it's an email verification message (not actually an error)
      if (authError.includes('check your email')) {
        setSuccessMessage(authError);
        // Reset form after successful registration
        form.reset();
      } else {
        setError(authError);
      }
      return;
    }

    if (user) {
      // Successful registration with confirmed email - navigate to dashboard
      navigate('/dashboard');
    }
  };

  return (
    <div
      className='flex items-center justify-center min-h-screen bg-background'
      data-testid='register-page'
    >
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl font-bold'>Create Account</CardTitle>
          <CardDescription>
            Join our therapy practice management platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4'
              data-testid='register-form'
            >
              {error && (
                <div
                  className='p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md'
                  data-testid='register-error'
                >
                  {error}
                </div>
              )}

              {successMessage && (
                <div
                  className='p-3 text-sm text-green-800 bg-green-100 border border-green-200 rounded-md'
                  data-testid='register-success'
                >
                  {successMessage}
                  {window.location.hostname === '127.0.0.1' ||
                  window.location.hostname === 'localhost' ? (
                    <div className='mt-2 pt-2 border-t border-green-200'>
                      <p className='text-xs text-green-700'>
                        <strong>Development Mode:</strong> Check emails at{' '}
                        <a
                          href='http://127.0.0.1:54324'
                          target='_blank'
                          rel='noopener noreferrer'
                          className='underline hover:text-green-900'
                        >
                          Mailpit (127.0.0.1:54324)
                        </a>
                      </p>
                    </div>
                  ) : null}
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
                        placeholder='Create a password (min 6 characters)'
                        disabled={loading}
                        data-testid='password-input'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        placeholder='Confirm your password'
                        disabled={loading}
                        data-testid='confirm-password-input'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='role'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <select
                        disabled={loading}
                        className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                        data-testid='role-select'
                        {...field}
                      >
                        <option value='therapist'>Therapist</option>
                        <option value='client'>Client</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type='submit'
                className='w-full'
                disabled={loading}
                data-testid='register-button'
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>

              <div className='text-center'>
                <div className='text-sm text-muted-foreground'>
                  Already have an account?{' '}
                  <Link
                    to='/login'
                    className='text-primary hover:underline'
                    data-testid='login-link'
                  >
                    Sign in
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
