import { 
  loginSchema, 
  registerSchema, 
  profileSchema, 
  securitySettingsSchema, 
  emailChangeSchema,
  uiPreferencesSchema,
  validateCredentialsFormat,
  validateTherapySchoolId
} from './auth-schemas'

describe('Auth Schemas', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      }

      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123'
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Wprowadź prawidłowy adres email')
      }
    })

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: ''
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Hasło jest wymagane')
      }
    })
  })

  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123'
      }

      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'Password123',
        confirmPassword: 'Password123'
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Wprowadź prawidłowy adres email')
      }
    })

    it('should reject password shorter than 6 characters', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Pass1',
        confirmPassword: 'Pass1'
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Hasło musi mieć co najmniej 6 znaków')
      }
    })

    it('should reject password without uppercase letter', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Hasło musi zawierać co najmniej jedną małą literę, wielką literę i cyfrę')
      }
    })

    it('should reject password without lowercase letter', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'PASSWORD123',
        confirmPassword: 'PASSWORD123'
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Hasło musi zawierać co najmniej jedną małą literę, wielką literę i cyfrę')
      }
    })

    it('should reject password without number', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password',
        confirmPassword: 'Password'
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Hasło musi zawierać co najmniej jedną małą literę, wielką literę i cyfrę')
      }
    })

    it('should reject mismatched passwords', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'DifferentPassword123'
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Hasła nie są zgodne')
      }
    })
  })

  describe('profileSchema', () => {
    it('should validate correct profile data', () => {
      const validData = {
        name: 'Anna Kowalska',
        credentials: 'Dr hab. psychologii',
        practice_info: 'Gabinet psychoterapeutyczny w Warszawie',
        therapy_school_id: '550e8400-e29b-41d4-a716-446655440000'
      }

      const result = profileSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate minimal profile data', () => {
      const validData = {
        name: 'Jan Nowak'
      }

      const result = profileSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject name shorter than 2 characters', () => {
      const invalidData = {
        name: 'A'
      }

      const result = profileSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Imię i nazwisko musi mieć co najmniej 2 znaki')
      }
    })

    it('should reject name longer than 100 characters', () => {
      const invalidData = {
        name: 'A'.repeat(101)
      }

      const result = profileSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Imię i nazwisko nie może przekraczać 100 znaków')
      }
    })

    it('should reject name with invalid characters', () => {
      const invalidData = {
        name: 'John@123'
      }

      const result = profileSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Nieprawidłowe znaki w imieniu i nazwisku')
      }
    })

    it('should reject credentials longer than 200 characters', () => {
      const invalidData = {
        name: 'Anna Kowalska',
        credentials: 'A'.repeat(201)
      }

      const result = profileSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Kwalifikacje nie mogą przekraczać 200 znaków')
      }
    })

    it('should reject practice_info longer than 500 characters', () => {
      const invalidData = {
        name: 'Anna Kowalska',
        practice_info: 'A'.repeat(501)
      }

      const result = profileSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Informacje o praktyce nie mogą przekraczać 500 znaków')
      }
    })

    it('should reject invalid therapy_school_id format', () => {
      const invalidData = {
        name: 'Anna Kowalska',
        therapy_school_id: 'invalid-uuid'
      }

      const result = profileSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Nieprawidłowy identyfikator szkoły terapii')
      }
    })
  })

  describe('securitySettingsSchema', () => {
    it('should validate correct security settings data', () => {
      const validData = {
        current_password: 'OldPassword123',
        new_password: 'NewPassword123',
        confirm_new_password: 'NewPassword123'
      }

      const result = securitySettingsSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject empty current password', () => {
      const invalidData = {
        current_password: '',
        new_password: 'NewPassword123',
        confirm_new_password: 'NewPassword123'
      }

      const result = securitySettingsSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Obecne hasło jest wymagane')
      }
    })

    it('should reject mismatched new passwords', () => {
      const invalidData = {
        current_password: 'OldPassword123',
        new_password: 'NewPassword123',
        confirm_new_password: 'DifferentPassword123'
      }

      const result = securitySettingsSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Nowe hasła nie są zgodne')
      }
    })
  })

  describe('emailChangeSchema', () => {
    it('should validate correct email change data', () => {
      const validData = {
        new_email: 'newemail@example.com',
        password: 'Password123'
      }

      const result = emailChangeSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email format', () => {
      const invalidData = {
        new_email: 'invalid-email',
        password: 'Password123'
      }

      const result = emailChangeSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Wprowadź prawidłowy adres email')
      }
    })
  })

  describe('uiPreferencesSchema', () => {
    it('should validate correct UI preferences', () => {
      const validData = {
        theme: 'dark' as const,
        language: 'pl'
      }

      const result = uiPreferencesSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid theme', () => {
      const invalidData = {
        theme: 'invalid-theme',
        language: 'pl'
      }

      const result = uiPreferencesSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('expected one of')
      }
    })
  })

  describe('validateCredentialsFormat', () => {
    it('should accept valid credentials', () => {
      expect(validateCredentialsFormat('Dr hab. psychologii')).toBe(true)
      expect(validateCredentialsFormat('MSc, PhD')).toBe(true)
      expect(validateCredentialsFormat('Lic. psycholog')).toBe(true)
      expect(validateCredentialsFormat('')).toBe(true)
    })

    it('should reject invalid credentials', () => {
      expect(validateCredentialsFormat('Dr@123')).toBe(false)
      expect(validateCredentialsFormat('PhD#invalid')).toBe(false)
    })
  })

  describe('validateTherapySchoolId', () => {
    it('should accept valid UUIDs', () => {
      expect(validateTherapySchoolId('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
      expect(validateTherapySchoolId('')).toBe(true)
    })

    it('should reject invalid UUIDs', () => {
      expect(validateTherapySchoolId('invalid-uuid')).toBe(false)
      expect(validateTherapySchoolId('550e8400-e29b-41d4-a716')).toBe(false)
    })
  })
})