// ABOUTME: ProfileForm component for therapist profile editing with validation
// ABOUTME: Uses React Hook Form + Zod for validation and follows shadcn/ui patterns

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { profileSchema, type ProfileFormData } from './auth-schemas'
import { useAuth } from './use-auth'
import { useProfile, useUpdateProfile } from './profile-hooks'

interface ProfileFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function ProfileForm({ onSuccess, onCancel }: ProfileFormProps) {
  const { user } = useAuth()
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id || null)
  const updateProfile = useUpdateProfile(user?.id || null)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.profile?.name || '',
      credentials: profile?.profile?.credentials || '',
      practice_info: profile?.profile?.practice_info || '',
      therapy_school_id: profile?.profile?.therapy_school_id || '',
    },
    values: profile?.profile ? {
      name: profile.profile.name || '',
      credentials: profile.profile.credentials || '',
      practice_info: profile.profile.practice_info || '',
      therapy_school_id: profile.profile.therapy_school_id || '',
    } : undefined,
  })

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile.mutateAsync(data)
      onSuccess?.()
    } catch (error) {
      console.error('Profile update failed:', error)
    }
  }

  const handleReset = () => {
    reset()
  }

  const handleCancel = () => {
    reset()
    onCancel?.()
  }

  if (profileLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profil zawodowy</CardTitle>
          <CardDescription>
            Zarządzaj swoimi danymi zawodowymi i preferencjami
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil zawodowy</CardTitle>
        <CardDescription>
          Uzupełnij swoje dane zawodowe, aby spersonalizować doświadczenie korzystania z aplikacji
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Imię i nazwisko <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="np. Dr Anna Kowalska"
              {...register('name')}
              className={errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Credentials Field */}
          <div className="space-y-2">
            <Label htmlFor="credentials" className="text-sm font-medium">
              Kwalifikacje zawodowe
            </Label>
            <Input
              id="credentials"
              type="text"
              placeholder="np. Dr hab. psychologii, psychoterapeuta"
              {...register('credentials')}
              className={errors.credentials ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {errors.credentials && (
              <p className="text-sm text-red-500">{errors.credentials.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Podaj swoje wykształcenie, certyfikaty i uprawnienia zawodowe
            </p>
          </div>

          {/* Practice Info Field */}
          <div className="space-y-2">
            <Label htmlFor="practice_info" className="text-sm font-medium">
              Informacje o praktyce
            </Label>
            <Textarea
              id="practice_info"
              placeholder="Opisz swoją praktykę terapeutyczną, specjalizacje, metody pracy..."
              rows={4}
              {...register('practice_info')}
              className={errors.practice_info ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {errors.practice_info && (
              <p className="text-sm text-red-500">{errors.practice_info.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Informacje o Twojej praktyce, specjalizacjach i metodach pracy
            </p>
          </div>

          {/* Therapy School ID Field - Currently hidden as we don't have schools data */}
          <input
            type="hidden"
            {...register('therapy_school_id')}
          />

          {/* Error Display */}
          {updateProfile.isError && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Błąd podczas zapisywania profilu
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      Wystąpił błąd podczas zapisywania Twojego profilu. 
                      Spróbuj ponownie lub skontaktuj się z pomocą techniczną.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success Display */}
          {updateProfile.isSuccess && (
            <div className="rounded-md bg-green-50 p-4 border border-green-200">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Profil został zaktualizowany
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Twoje dane zawodowe zostały pomyślnie zapisane.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <Button
              type="submit"
              disabled={isSubmitting || updateProfile.isPending || !isDirty}
              className="flex-1 sm:flex-none"
            >
              {isSubmitting || updateProfile.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Zapisywanie...
                </>
              ) : (
                'Zapisz profil'
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isSubmitting || updateProfile.isPending || !isDirty}
              className="flex-1 sm:flex-none"
            >
              Przywróć
            </Button>

            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting || updateProfile.isPending}
                className="flex-1 sm:flex-none"
              >
                Anuluj
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}