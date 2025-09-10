import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'EMAIL_REQUIRED').email('EMAIL_INVALID'),
  password: z.string().min(1, 'PASSWORD_REQUIRED'),
})

export const registerSchema = z.object({
  email: z.string().min(1, 'EMAIL_REQUIRED').email('EMAIL_INVALID'),
  password: z
    .string()
    .min(6, 'PASSWORD_TOO_SHORT')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'PASSWORD_COMPLEXITY'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'PASSWORD_MISMATCH',
  path: ['confirmPassword'],
})

// Profile validation schemas for Story 1.2
export const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'Imię i nazwisko musi mieć co najmniej 2 znaki')
    .max(100, 'Imię i nazwisko nie może przekraczać 100 znaków')
    .regex(/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s\-'.]+$/, 'Nieprawidłowe znaki w imieniu i nazwisku'),
  credentials: z
    .string()
    .max(200, 'Kwalifikacje nie mogą przekraczać 200 znaków')
    .optional()
    .or(z.literal('')),
  practice_info: z
    .string()
    .max(500, 'Informacje o praktyce nie mogą przekraczać 500 znaków')
    .optional()
    .or(z.literal('')),
  therapy_school_id: z
    .string()
    .uuid('Nieprawidłowy identyfikator szkoły terapii')
    .optional()
    .or(z.literal('')),
})

export const securitySettingsSchema = z.object({
  current_password: z.string().min(1, 'Obecne hasło jest wymagane'),
  new_password: z
    .string()
    .min(6, 'Nowe hasło musi mieć co najmniej 6 znaków')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Hasło musi zawierać co najmniej jedną małą literę, wielką literę i cyfrę'
    ),
  confirm_new_password: z.string(),
}).refine((data) => data.new_password === data.confirm_new_password, {
  message: 'Nowe hasła nie są zgodne',
  path: ['confirm_new_password'],
})

export const emailChangeSchema = z.object({
  new_email: z.string().email('Wprowadź prawidłowy adres email'),
  password: z.string().min(1, 'Hasło jest wymagane do zmiany adresu email'),
})

export const uiPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system'], {
    message: 'Wybierz prawidłowy motyw',
  }),
  language: z.string().min(2, 'Kod języka musi mieć co najmniej 2 znaki').default('pl'),
})

// Helper validation functions
export const validateCredentialsFormat = (credentials: string): boolean => {
  if (!credentials || credentials.trim() === '') return true
  
  // Basic validation for professional credentials
  // Allows common formats: "Dr", "PhD", "MSc", "Lic.", "Mgr", etc.
  const credentialsPattern = /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s.,\-()]+$/
  return credentialsPattern.test(credentials.trim())
}

export const validateTherapySchoolId = (schoolId: string): boolean => {
  if (!schoolId || schoolId.trim() === '') return true
  
  // UUID v4 validation
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidPattern.test(schoolId)
}

// Inferred types
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
export type SecuritySettingsFormData = z.infer<typeof securitySettingsSchema>
export type EmailChangeFormData = z.infer<typeof emailChangeSchema>
export type UiPreferencesFormData = z.infer<typeof uiPreferencesSchema>