// ABOUTME: Forgot password form component for password reset functionality
// ABOUTME: Allows users to request password reset emails through Supabase auth
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
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
import { resetPassword } from '@/lib/auth';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '../schemas/auth';

export const ForgotPasswordForm = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const { error: authError } = await resetPassword(data.email);

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div
        className='flex items-center justify-center min-h-screen bg-background'
        data-testid='forgot-password-page'
      >
        <Card className='w-full max-w-md'>
          <CardHeader className='text-center'>
            <CardTitle className='text-2xl font-bold'>
              Check Your Email
            </CardTitle>
            <CardDescription>
              We've sent a password reset link to your email address
            </CardDescription>
          </CardHeader>
          <CardContent className='text-center'>
            <p
              className='text-sm text-muted-foreground mb-4'
              data-testid='success-message'
            >
              If an account with that email exists, you'll receive a password
              reset link shortly.
            </p>
            <Link
              to='/login'
              className='text-primary hover:underline'
              data-testid='back-to-login-link'
            >
              Back to Sign In
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className='flex items-center justify-center min-h-screen bg-background'
      data-testid='forgot-password-page'
    >
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl font-bold'>Reset Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4'
              data-testid='forgot-password-form'
            >
              {error && (
                <div
                  className='p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md'
                  data-testid='forgot-password-error'
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

              <Button
                type='submit'
                className='w-full'
                disabled={loading}
                data-testid='reset-button'
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>

              <div className='text-center'>
                <Link
                  to='/login'
                  className='text-sm text-primary hover:underline'
                  data-testid='back-to-login-link'
                >
                  Back to Sign In
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
