import { useState } from 'react'

// Error code to message translator
const translateErrorCode = (code: string): string => {
  const errorMessages: Record<string, string> = {
    EMAIL_REQUIRED: 'Email jest wymagany',
    EMAIL_INVALID: 'Wprowadź prawidłowy adres email',
    PASSWORD_REQUIRED: 'Hasło jest wymagane',
    PASSWORD_TOO_SHORT: 'Hasło musi mieć co najmniej 6 znaków',
    PASSWORD_COMPLEXITY: 'Hasło musi zawierać co najmniej jedną małą literę, wielką literę i cyfrę',
    PASSWORD_MISMATCH: 'Hasła nie są zgodne'
  }
  return errorMessages[code] || code
}
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { LoginFormData } from './auth-schemas'
import { loginSchema } from './auth-schemas'
import { useAuth } from './use-auth'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signIn } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange', // Enable real-time validation
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await signIn(data.email, data.password)
      if (error) {
        setError(error.message)
      }
    } catch {
      setError('Wystąpił nieoczekiwany błąd')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle data-testid="login-heading">Zaloguj się do Marmaid</CardTitle>
        <CardDescription>
          Wprowadź swoje dane, aby uzyskać dostęp do konta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="twoj@email.com"
              data-testid="email-input"
              {...register('email')}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-destructive" data-testid="email-validation-error">{translateErrorCode(errors.email.message || '')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Hasło</Label>
            <Input
              id="password"
              type="password"
              placeholder="Wprowadź hasło"
              data-testid="password-input"
              {...register('password')}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-sm text-destructive" data-testid="password-validation-error">{translateErrorCode(errors.password.message || '')}</p>
            )}
          </div>

          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md" data-testid="login-error-message">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading} data-testid="login-submit-button">
            {isLoading ? 'Logowanie...' : 'Zaloguj się'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}