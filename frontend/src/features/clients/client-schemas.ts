// ABOUTME: Zod validation schemas for client data
// ABOUTME: Provides form validation and data sanitization for client profiles

import { z } from 'zod';

// Basic profile schema
export const clientProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Imię i nazwisko musi mieć co najmniej 2 znaki')
    .max(100, 'Imię i nazwisko nie może przekraczać 100 znaków')
    .regex(/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s\-'.]+$/, 'Nieprawidłowe znaki w imieniu i nazwisku'),
  email: z
    .string()
    .email('Wprowadź prawidłowy adres email')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .regex(/^[\d\s\-\+\(\)]+$/, 'Nieprawidłowy format numeru telefonu')
    .min(9, 'Numer telefonu musi mieć co najmniej 9 cyfr')
    .optional()
    .or(z.literal('')),
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data urodzenia musi być w formacie YYYY-MM-DD')
    .optional()
    .or(z.literal('')),
  address: z.object({
    street: z.string().max(200, 'Ulica nie może przekraczać 200 znaków').optional().or(z.literal('')),
    city: z.string().max(100, 'Miasto nie może przekraczać 100 znaków').optional().or(z.literal('')),
    postal_code: z.string().max(20, 'Kod pocztowy nie może przekraczać 20 znaków').optional().or(z.literal('')),
    country: z.string().max(100, 'Kraj nie może przekraczać 100 znaków').optional().or(z.literal('')),
  }).optional(),
  demographics: z.object({
    gender: z.string().max(50, 'Płeć nie może przekraczać 50 znaków').optional().or(z.literal('')),
    preferred_language: z.string().max(50, 'Preferowany język nie może przekraczać 50 znaków').optional().or(z.literal('')),
    occupation: z.string().max(100, 'Zawód nie może przekraczać 100 znaków').optional().or(z.literal('')),
    marital_status: z.string().max(50, 'Stan cywilny nie może przekraczać 50 znaków').optional().or(z.literal('')),
  }).optional(),
  notes: z
    .string()
    .max(1000, 'Notatki nie mogą przekraczać 1000 znaków')
    .optional()
    .or(z.literal('')),
});

// Health information schema
export const clientHealthInfoSchema = z.object({
  conditions: z.array(z.string().max(100, 'Każdy stan nie może przekraczać 100 znaków')).optional(),
  medications: z.array(z.string().max(100, 'Każdy lek nie może przekraczać 100 znaków')).optional(),
  allergies: z.array(z.string().max(100, 'Każda alergia nie może przekraczać 100 znaków')).optional(),
  medical_history: z
    .string()
    .max(2000, 'Historia medyczna nie może przekraczać 2000 znaków')
    .optional()
    .or(z.literal('')),
  therapy_goals: z.array(z.string().max(200, 'Każdy cel terapii nie może przekraczać 200 znaków')).optional(),
  previous_therapy: z
    .string()
    .max(1000, 'Poprzednia terapia nie może przekraczać 1000 znaków')
    .optional()
    .or(z.literal('')),
  risk_factors: z.array(z.string().max(100, 'Każdy czynnik ryzyka nie może przekraczać 100 znaków')).optional(),
  assessment_notes: z
    .string()
    .max(2000, 'Notatki oceny nie mogą przekraczać 2000 znaków')
    .optional()
    .or(z.literal('')),
});

// Emergency contact schema
export const emergencyContactSchema = z.object({
  id: z.string().uuid().optional(),
  name: z
    .string()
    .min(2, 'Imię i nazwisko musi mieć co najmniej 2 znaki')
    .max(100, 'Imię i nazwisko nie może przekraczać 100 znaków')
    .regex(/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s\-'.]+$/, 'Nieprawidłowe znaki w imieniu i nazwisku'),
  relationship: z
    .string()
    .min(2, 'Pokrewieństwo musi mieć co najmniej 2 znaki')
    .max(50, 'Pokrewieństwo nie może przekraczać 50 znaków'),
  phone: z
    .string()
    .regex(/^[\d\s\-\+\(\)]+$/, 'Nieprawidłowy format numeru telefonu')
    .min(9, 'Numer telefonu musi mieć co najmniej 9 cyfr'),
  email: z
    .string()
    .email('Wprowadź prawidłowy adres email')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .max(300, 'Adres nie może przekraczać 300 znaków')
    .optional()
    .or(z.literal('')),
  is_primary: z.boolean().optional(),
});

// Create client schema (combines all schemas)
export const createClientSchema = z.object({
  profile: clientProfileSchema,
  health_info: clientHealthInfoSchema.optional(),
  emergency_contacts: z.array(emergencyContactSchema).optional(),
  tags: z.array(z.string().max(50, 'Każdy tag nie może przekraczać 50 znaków')).optional(),
  status: z.enum(['active', 'inactive', 'archived']).default('active'),
});

// Update client schema (makes profile optional)
export const updateClientSchema = z.object({
  id: z.string().uuid('Nieprawidłowy identyfikator klienta'),
  profile: clientProfileSchema.partial().optional(),
  health_info: clientHealthInfoSchema.optional(),
  emergency_contacts: z.array(emergencyContactSchema).optional(),
  tags: z.array(z.string().max(50, 'Każdy tag nie może przekraczać 50 znaków')).optional(),
  status: z.enum(['active', 'inactive', 'archived']).optional(),
});

// Client search/filter schema
export const clientFilterSchema = z.object({
  status: z.enum(['active', 'inactive', 'archived']).optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().max(100, 'Wyszukiwanie nie może przekraczać 100 znaków').optional(),
});

// Helper validation functions
export const validateDateOfBirth = (dateString: string): boolean => {
  if (!dateString || dateString.trim() === '') return true;
  
  const date = new Date(dateString);
  const now = new Date();
  const minDate = new Date(now.getFullYear() - 120, 0, 1); // 120 years ago
  
  return date >= minDate && date <= now;
};

export const validatePhoneNumber = (phone: string): boolean => {
  if (!phone || phone.trim() === '') return true;
  
  // Remove spaces, dashes, and brackets
  const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
  
  // Should have 9-15 digits
  return /^\d{9,15}$/.test(cleanPhone);
};

export const validateEmergencyContactUniqueness = (contacts: any[]): boolean => {
  if (!contacts || contacts.length === 0) return true;
  
  const phoneNumbers = contacts.map(contact => contact.phone).filter(Boolean);
  const uniquePhones = new Set(phoneNumbers);
  
  return phoneNumbers.length === uniquePhones.size;
};

// Inferred types
export type ClientProfileFormData = z.infer<typeof clientProfileSchema>;
export type ClientHealthInfoFormData = z.infer<typeof clientHealthInfoSchema>;
export type EmergencyContactFormData = z.infer<typeof emergencyContactSchema>;
export type CreateClientFormData = z.infer<typeof createClientSchema>;
export type UpdateClientFormData = z.infer<typeof updateClientSchema>;
export type ClientFilterFormData = z.infer<typeof clientFilterSchema>;