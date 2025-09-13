// ABOUTME: Email verification landing page component for handling email confirmation
// ABOUTME: Processes email verification tokens and provides user feedback on verification status
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/auth-store';

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>(
    'verifying'
  );
  const [message, setMessage] = useState<string>('Verifying your email...');
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        const type = searchParams.get('type');

        if (!token || type !== 'signup') {
          setStatus('error');
          setMessage(
            'Invalid verification link. Please try registering again.'
          );
          return;
        }

        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'signup',
        });

        if (error) {
          setStatus('error');
          setMessage(`Verification failed: ${error.message}`);
          return;
        }

        if (data.user) {
          // Set user in store
          const user = {
            id: data.user.id,
            email: data.user.email || '',
            role:
              (data.user.user_metadata?.role as 'therapist' | 'client') ||
              'therapist',
            createdAt: data.user.created_at || '',
            updatedAt: data.user.updated_at || '',
          };

          setUser(user);
          setStatus('success');
          setMessage(
            'Email verified successfully! You can now access your account.'
          );

          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        } else {
          setStatus('error');
          setMessage('Verification completed but no user data received.');
        }
      } catch {
        setStatus('error');
        setMessage('An unexpected error occurred during verification.');
      }
    };

    verifyEmail();
  }, [searchParams, navigate, setUser]);

  return (
    <div
      className='flex items-center justify-center min-h-screen bg-background'
      data-testid='verify-email-page'
    >
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl font-bold'>
            Email Verification
          </CardTitle>
        </CardHeader>
        <CardContent className='text-center'>
          {status === 'verifying' && (
            <div data-testid='verification-loading'>
              <div className='animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4'></div>
              <p className='text-muted-foreground'>{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div data-testid='verification-success'>
              <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg
                  className='w-8 h-8 text-green-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
              </div>
              <p className='text-green-800 mb-4'>{message}</p>
              <p className='text-sm text-muted-foreground mb-4'>
                You will be redirected to your dashboard in a few seconds...
              </p>
              <Button
                onClick={() => navigate('/dashboard')}
                data-testid='go-to-dashboard-button'
              >
                Go to Dashboard
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div data-testid='verification-error'>
              <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg
                  className='w-8 h-8 text-red-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </div>
              <p className='text-red-800 mb-4'>{message}</p>
              <div className='space-y-2'>
                <Link to='/register'>
                  <Button
                    variant='outline'
                    className='w-full'
                    data-testid='register-again-button'
                  >
                    Try Registering Again
                  </Button>
                </Link>
                <Link to='/login'>
                  <Button
                    variant='outline'
                    className='w-full'
                    data-testid='login-button'
                  >
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
