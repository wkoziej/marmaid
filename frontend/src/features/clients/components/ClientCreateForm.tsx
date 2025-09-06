// ABOUTME: ClientCreateForm component for creating new client profiles
// ABOUTME: Uses React Hook Form + Zod for validation and follows existing patterns

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { createClientSchema, type CreateClientFormData } from '../client-schemas';
import { useCreateClient } from '../client-hooks';
import { useAuth } from '../../auth/use-auth';

interface ClientCreateFormProps {
  onSuccess?: (clientId: string) => void;
  onCancel?: () => void;
}

export function ClientCreateForm({ onSuccess, onCancel }: ClientCreateFormProps) {
  const { user } = useAuth();
  const createClient = useCreateClient();
  const [activeTab, setActiveTab] = useState<'profile' | 'health' | 'contacts'>('profile');

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    reset,
    control,
    watch,
  } = useForm<CreateClientFormData>({
    resolver: zodResolver(createClientSchema) as any,
    defaultValues: {
      profile: {
        name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        address: {
          street: '',
          city: '',
          postal_code: '',
          country: '',
        },
        demographics: {
          gender: '',
          preferred_language: '',
          occupation: '',
          marital_status: '',
        },
        notes: '',
      },
      health_info: {
        conditions: [],
        medications: [],
        allergies: [],
        medical_history: '',
        therapy_goals: [],
        previous_therapy: '',
        risk_factors: [],
        assessment_notes: '',
      },
      emergency_contacts: [],
      tags: [],
      status: 'active',
    },
  });

  const { fields: emergencyContacts, append: appendContact, remove: removeContact } = useFieldArray({
    control,
    name: 'emergency_contacts',
  });

  // For simple array of strings like tags, use watch instead of useFieldArray
  const watchedTags = watch('tags') || [];
  const [tagInput, setTagInput] = useState('');

  const onSubmit = async (data: CreateClientFormData) => {
    if (!user?.id) {
      console.error('User not authenticated');
      return;
    }

    try {
      // Clean up empty optional fields
      const cleanedData = {
        ...data,
        profile: {
          ...data.profile,
          email: data.profile.email?.trim() || undefined,
          phone: data.profile.phone?.trim() || undefined,
          date_of_birth: data.profile.date_of_birth?.trim() || undefined,
          notes: data.profile.notes?.trim() || undefined,
        },
        health_info: data.health_info?.medical_history?.trim() ? data.health_info : undefined,
        emergency_contacts: data.emergency_contacts?.length ? data.emergency_contacts : undefined,
        tags: data.tags?.length ? data.tags : undefined,
      };

      const newClient = await createClient.mutateAsync({
        therapistId: user.id,
        clientData: cleanedData,
      });

      if (newClient) {
        onSuccess?.(newClient.id);
      }
    } catch (error) {
      console.error('Failed to create client:', error);
    }
  };

  const handleCancel = () => {
    reset();
    onCancel?.();
  };

  const addEmergencyContact = () => {
    appendContact({
      name: '',
      relationship: '',
      phone: '',
      email: '',
      address: '',
      is_primary: false,
    });
  };

  const addTag = (tagValue: string) => {
    if (tagValue.trim() && !watchedTags.includes(tagValue.trim())) {
      const currentTags = watch('tags') || [];
      // Update the form with new tags array
      const updatedTags = [...currentTags, tagValue.trim()];
      reset({ ...watch(), tags: updatedTags });
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    const currentTags = watch('tags') || [];
    const updatedTags = currentTags.filter((_, i) => i !== index);
    reset({ ...watch(), tags: updatedTags });
  };

  const TabButton = ({ tab, label }: { tab: string; label: string }) => (
    <button
      type="button"
      onClick={() => setActiveTab(tab as any)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        activeTab === tab
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
      }`}
    >
      {label}
    </button>
  );

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Dodaj nowego klienta</CardTitle>
        <CardDescription>
          Wprowadź podstawowe informacje o kliencie
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6">
          <TabButton tab="profile" label="Profil" />
          <TabButton tab="health" label="Informacje zdrowotne" />
          <TabButton tab="contacts" label="Kontakty awaryjne" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Imię i nazwisko <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="np. Jan Kowalski"
                    {...register('profile.name')}
                    className={errors.profile?.name ? 'border-red-500' : ''}
                  />
                  {errors.profile?.name && (
                    <p className="text-sm text-red-500">{errors.profile.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jan.kowalski@example.com"
                    {...register('profile.email')}
                    className={errors.profile?.email ? 'border-red-500' : ''}
                  />
                  {errors.profile?.email && (
                    <p className="text-sm text-red-500">{errors.profile.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Telefon
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+48 123 456 789"
                    {...register('profile.phone')}
                    className={errors.profile?.phone ? 'border-red-500' : ''}
                  />
                  {errors.profile?.phone && (
                    <p className="text-sm text-red-500">{errors.profile.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_of_birth" className="text-sm font-medium">
                    Data urodzenia
                  </Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    {...register('profile.date_of_birth')}
                    className={errors.profile?.date_of_birth ? 'border-red-500' : ''}
                  />
                  {errors.profile?.date_of_birth && (
                    <p className="text-sm text-red-500">{errors.profile.date_of_birth.message}</p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Adres</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="street" className="text-sm font-medium">Ulica</Label>
                    <Input
                      id="street"
                      type="text"
                      placeholder="ul. Przykładowa 123"
                      {...register('profile.address.street')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium">Miasto</Label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="Warszawa"
                      {...register('profile.address.city')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postal_code" className="text-sm font-medium">Kod pocztowy</Label>
                    <Input
                      id="postal_code"
                      type="text"
                      placeholder="00-000"
                      {...register('profile.address.postal_code')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm font-medium">Kraj</Label>
                    <Input
                      id="country"
                      type="text"
                      placeholder="Polska"
                      {...register('profile.address.country')}
                    />
                  </div>
                </div>
              </div>

              {/* Demographics */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Dane demograficzne</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-medium">Płeć</Label>
                    <Input
                      id="gender"
                      type="text"
                      placeholder="Kobieta/Mężczyzna/Inne"
                      {...register('profile.demographics.gender')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferred_language" className="text-sm font-medium">Preferowany język</Label>
                    <Input
                      id="preferred_language"
                      type="text"
                      placeholder="Polski"
                      {...register('profile.demographics.preferred_language')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="occupation" className="text-sm font-medium">Zawód</Label>
                    <Input
                      id="occupation"
                      type="text"
                      placeholder="Programista"
                      {...register('profile.demographics.occupation')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="marital_status" className="text-sm font-medium">Stan cywilny</Label>
                    <Input
                      id="marital_status"
                      type="text"
                      placeholder="Kawaler/Panna/Żonaty/Zamężna"
                      {...register('profile.demographics.marital_status')}
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">Notatki</Label>
                <Textarea
                  id="notes"
                  rows={4}
                  placeholder="Dodatkowe informacje o kliencie..."
                  {...register('profile.notes')}
                  className={errors.profile?.notes ? 'border-red-500' : ''}
                />
                {errors.profile?.notes && (
                  <p className="text-sm text-red-500">{errors.profile.notes.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Health Tab */}
          {activeTab === 'health' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="medical_history" className="text-sm font-medium">Historia medyczna</Label>
                <Textarea
                  id="medical_history"
                  rows={4}
                  placeholder="Opis historii medycznej klienta..."
                  {...register('health_info.medical_history')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="previous_therapy" className="text-sm font-medium">Poprzednia terapia</Label>
                <Textarea
                  id="previous_therapy"
                  rows={3}
                  placeholder="Informacje o poprzednich terapiach..."
                  {...register('health_info.previous_therapy')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assessment_notes" className="text-sm font-medium">Notatki z oceny</Label>
                <Textarea
                  id="assessment_notes"
                  rows={4}
                  placeholder="Notatki z wstępnej oceny klienta..."
                  {...register('health_info.assessment_notes')}
                />
              </div>
            </div>
          )}

          {/* Contacts Tab */}
          {activeTab === 'contacts' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Kontakty awaryjne</h3>
                <Button type="button" variant="outline" onClick={addEmergencyContact}>
                  Dodaj kontakt
                </Button>
              </div>

              {emergencyContacts.map((contact, index) => (
                <div key={contact.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Kontakt {index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeContact(index)}
                    >
                      Usuń
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`contact_name_${index}`} className="text-sm font-medium">
                        Imię i nazwisko <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`contact_name_${index}`}
                        type="text"
                        placeholder="Anna Kowalska"
                        {...register(`emergency_contacts.${index}.name` as const)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`contact_relationship_${index}`} className="text-sm font-medium">
                        Pokrewieństwo <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`contact_relationship_${index}`}
                        type="text"
                        placeholder="Matka"
                        {...register(`emergency_contacts.${index}.relationship` as const)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`contact_phone_${index}`} className="text-sm font-medium">
                        Telefon <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`contact_phone_${index}`}
                        type="tel"
                        placeholder="+48 123 456 789"
                        {...register(`emergency_contacts.${index}.phone` as const)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`contact_email_${index}`} className="text-sm font-medium">Email</Label>
                      <Input
                        id={`contact_email_${index}`}
                        type="email"
                        placeholder="anna@example.com"
                        {...register(`emergency_contacts.${index}.email` as const)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial"
            >
              {isSubmitting ? 'Zapisywanie...' : 'Utwórz klienta'}
            </Button>
            
            {isDirty && (
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
                disabled={isSubmitting}
              >
                Resetuj
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Anuluj
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}