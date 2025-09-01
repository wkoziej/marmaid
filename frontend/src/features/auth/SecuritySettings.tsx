// ABOUTME: SecuritySettings component for password and email management
// ABOUTME: Integrates with Supabase Auth for secure account operations

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { securitySettingsSchema, emailChangeSchema, type SecuritySettingsFormData, type EmailChangeFormData } from './auth-schemas'
import { supabase } from '../../lib/supabase'
import { useAuth } from './use-auth'

interface SecuritySettingsProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function SecuritySettings({ onSuccess, onCancel }: SecuritySettingsProps) {
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState<'password' | 'email' | null>(null)
  const [operationStatus, setOperationStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  // Password change form
  const passwordForm = useForm<SecuritySettingsFormData>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_new_password: '',
    },
  })

  // Email change form
  const emailForm = useForm<EmailChangeFormData>({
    resolver: zodResolver(emailChangeSchema),
    defaultValues: {
      new_email: '',
      password: '',
    },
  })

  const handlePasswordChange = async (data: SecuritySettingsFormData) => {
    try {
      setOperationStatus({ type: null, message: '' })

      // Update password using Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: data.new_password
      })

      if (error) {
        throw error
      }

      setOperationStatus({
        type: 'success',
        message: 'Hasło zostało pomyślnie zmienione'
      })

      passwordForm.reset()
      setActiveSection(null)
      onSuccess?.()

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Wystąpił błąd podczas zmiany hasła'
      setOperationStatus({
        type: 'error',
        message: errorMessage
      })
    }
  }

  const handleEmailChange = async (data: EmailChangeFormData) => {
    try {
      setOperationStatus({ type: null, message: '' })

      // Update email using Supabase Auth
      const { error } = await supabase.auth.updateUser({
        email: data.new_email
      })

      if (error) {
        throw error
      }

      setOperationStatus({
        type: 'success',
        message: 'Link potwierdzający został wysłany na nowy adres email'
      })

      emailForm.reset()
      setActiveSection(null)
      onSuccess?.()

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Wystąpił błąd podczas zmiany adresu email'
      setOperationStatus({
        type: 'error',
        message: errorMessage
      })
    }
  }

  const handleCancel = () => {
    passwordForm.reset()
    emailForm.reset()
    setActiveSection(null)
    setOperationStatus({ type: null, message: '' })
    onCancel?.()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ustawienia bezpieczeństwa</CardTitle>
        <CardDescription>
          Zarządzaj hasłem i adresem email swojego konta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current User Info */}
        <div className="rounded-md bg-gray-50 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Bieżące konto</h3>
          <p className="text-sm text-gray-600">
            <strong>Email:</strong> {user?.email}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Ostatnia aktualizacja: {user?.updated_at ? new Date(user.updated_at).toLocaleString('pl-PL') : 'Nieznana'}
          </p>
        </div>

        {/* Status Messages */}
        {operationStatus.type && (
          <div className={`rounded-md p-4 border ${
            operationStatus.type === 'success' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex">
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${
                  operationStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {operationStatus.type === 'success' ? 'Sukces' : 'Błąd'}
                </h3>
                <div className={`mt-2 text-sm ${
                  operationStatus.type === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  <p>{operationStatus.message}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Password Change Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Zmiana hasła</h3>
              <p className="text-sm text-muted-foreground">
                Aktualizuj hasło dostępu do swojego konta
              </p>
            </div>
            {activeSection !== 'password' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveSection('password')}
              >
                Zmień hasło
              </Button>
            )}
          </div>

          {activeSection === 'password' && (
            <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4 p-4 border rounded-md">
              <div className="space-y-2">
                <Label htmlFor="current_password">Obecne hasło</Label>
                <Input
                  id="current_password"
                  type="password"
                  {...passwordForm.register('current_password')}
                  className={passwordForm.formState.errors.current_password ? 'border-red-500' : ''}
                />
                {passwordForm.formState.errors.current_password && (
                  <p className="text-sm text-red-500">
                    {passwordForm.formState.errors.current_password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_password">Nowe hasło</Label>
                <Input
                  id="new_password"
                  type="password"
                  {...passwordForm.register('new_password')}
                  className={passwordForm.formState.errors.new_password ? 'border-red-500' : ''}
                />
                {passwordForm.formState.errors.new_password && (
                  <p className="text-sm text-red-500">
                    {passwordForm.formState.errors.new_password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_new_password">Potwierdź nowe hasło</Label>
                <Input
                  id="confirm_new_password"
                  type="password"
                  {...passwordForm.register('confirm_new_password')}
                  className={passwordForm.formState.errors.confirm_new_password ? 'border-red-500' : ''}
                />
                {passwordForm.formState.errors.confirm_new_password && (
                  <p className="text-sm text-red-500">
                    {passwordForm.formState.errors.confirm_new_password.message}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={passwordForm.formState.isSubmitting}
                  size="sm"
                >
                  {passwordForm.formState.isSubmitting ? 'Zapisywanie...' : 'Zapisz hasło'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveSection(null)}
                >
                  Anuluj
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Email Change Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Zmiana adresu email</h3>
              <p className="text-sm text-muted-foreground">
                Zaktualizuj adres email powiązany z Twoim kontem
              </p>
            </div>
            {activeSection !== 'email' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveSection('email')}
              >
                Zmień email
              </Button>
            )}
          </div>

          {activeSection === 'email' && (
            <form onSubmit={emailForm.handleSubmit(handleEmailChange)} className="space-y-4 p-4 border rounded-md">
              <div className="space-y-2">
                <Label htmlFor="new_email">Nowy adres email</Label>
                <Input
                  id="new_email"
                  type="email"
                  placeholder="nowy@email.com"
                  {...emailForm.register('new_email')}
                  className={emailForm.formState.errors.new_email ? 'border-red-500' : ''}
                />
                {emailForm.formState.errors.new_email && (
                  <p className="text-sm text-red-500">
                    {emailForm.formState.errors.new_email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Potwierdź hasłem</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Wprowadź obecne hasło"
                  {...emailForm.register('password')}
                  className={emailForm.formState.errors.password ? 'border-red-500' : ''}
                />
                {emailForm.formState.errors.password && (
                  <p className="text-sm text-red-500">
                    {emailForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="rounded-md bg-yellow-50 p-3 border border-yellow-200">
                <p className="text-xs text-yellow-700">
                  <strong>Uwaga:</strong> Na nowy adres email zostanie wysłany link potwierdzający. 
                  Zmiana zostanie aktywowana dopiero po kliknięciu w link.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={emailForm.formState.isSubmitting}
                  size="sm"
                >
                  {emailForm.formState.isSubmitting ? 'Wysyłanie...' : 'Wyślij link'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveSection(null)}
                >
                  Anuluj
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Main Actions */}
        {onCancel && (
          <div className="flex justify-end pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              Zamknij
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}