import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Wprowadź prawidłowy adres email'),
  password: z.string().min(1, 'Hasło jest wymagane'),
})

export const registerSchema = z.object({
  email: z.string().email('Wprowadź prawidłowy adres email'),
  password: z
    .string()
    .min(6, 'Hasło musi mieć co najmniej 6 znaków')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Hasło musi zawierać co najmniej jedną małą literę, wielką literę i cyfrę'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Hasła nie są zgodne',
  path: ['confirmPassword'],
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>