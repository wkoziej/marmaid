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
import type { RegisterFormData } from './auth-schemas'
import { registerSchema } from './auth-schemas'
import { useAuth } from './use-auth'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange', // Enable real-time validation
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error } = await signUp(data.email, data.password)
      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
      }
    } catch {
      setError('Wystąpił nieoczekiwany błąd')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Sprawdź swoją skrzynkę email</CardTitle>
          <CardDescription>
            Wysłaliśmy link weryfikacyjny na Twój adres email. Kliknij go, aby aktywować konto.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle data-testid="register-heading">Utwórz konto Marmaid</CardTitle>
        <CardDescription>
          Wprowadź swoje dane, aby utworzyć nowe konto
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
              data-testid="register-email-input"
              {...register('email')}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-destructive" data-testid="register-email-validation-error">{translateErrorCode(errors.email.message || '')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Hasło</Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimum 6 znaków"
              data-testid="register-password-input"
              {...register('password')}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-sm text-destructive" data-testid="register-password-validation-error">{translateErrorCode(errors.password.message || '')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Wprowadź hasło ponownie"
              data-testid="register-confirm-password-input"
              {...register('confirmPassword')}
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive" data-testid="register-confirm-password-validation-error">{translateErrorCode(errors.confirmPassword.message || '')}</p>
            )}
          </div>

          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md" data-testid="register-error-message">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading} data-testid="register-submit-button">
            {isLoading ? 'Tworzenie konta...' : 'Utwórz konto'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}