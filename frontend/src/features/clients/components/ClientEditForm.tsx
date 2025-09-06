// ABOUTME: ClientEditForm component for editing existing client profiles
// ABOUTME: Uses React Hook Form + Zod for validation, pre-populates with existing data

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { updateClientSchema, type UpdateClientFormData } from '../client-schemas';
import { useClient, useUpdateClient } from '../client-hooks';
import type { Client } from '../client-types';

interface ClientEditFormProps {
  clientId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ClientEditForm({ clientId, onSuccess, onCancel }: ClientEditFormProps) {
  const { data: client, isLoading: clientLoading } = useClient(clientId);
  const updateClient = useUpdateClient();
  const [activeTab, setActiveTab] = useState<'profile' | 'health' | 'contacts'>('profile');

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    reset,
    control,
    setValue,
  } = useForm<UpdateClientFormData>({
    resolver: zodResolver(updateClientSchema),
    defaultValues: {
      id: clientId,
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

  // Populate form with existing client data
  useEffect(() => {
    if (client) {
      reset({
        id: client.id,
        profile: {
          name: client.profile.name || '',
          email: client.profile.email || '',
          phone: client.profile.phone || '',
          date_of_birth: client.profile.date_of_birth || '',
          address: {
            street: client.profile.address?.street || '',
            city: client.profile.address?.city || '',
            postal_code: client.profile.address?.postal_code || '',
            country: client.profile.address?.country || '',
          },
          demographics: {
            gender: client.profile.demographics?.gender || '',
            preferred_language: client.profile.demographics?.preferred_language || '',
            occupation: client.profile.demographics?.occupation || '',
            marital_status: client.profile.demographics?.marital_status || '',
          },
          notes: client.profile.notes || '',
        },
        health_info: {
          conditions: client.health_info.conditions || [],
          medications: client.health_info.medications || [],
          allergies: client.health_info.allergies || [],
          medical_history: client.health_info.medical_history || '',
          therapy_goals: client.health_info.therapy_goals || [],
          previous_therapy: client.health_info.previous_therapy || '',
          risk_factors: client.health_info.risk_factors || [],
          assessment_notes: client.health_info.assessment_notes || '',
        },
        emergency_contacts: client.emergency_contacts || [],
        tags: client.tags || [],
        status: client.status,
      });
    }
  }, [client, reset]);

  const onSubmit = async (data: UpdateClientFormData) => {
    try {
      // Clean up empty optional fields
      const cleanedData: UpdateClientFormData = {
        ...data,
        profile: data.profile ? {
          ...data.profile,
          email: data.profile.email?.trim() || undefined,
          phone: data.profile.phone?.trim() || undefined,
          date_of_birth: data.profile.date_of_birth?.trim() || undefined,
          notes: data.profile.notes?.trim() || undefined,
        } : undefined,
        health_info: data.health_info?.medical_history?.trim() ? data.health_info : undefined,
        emergency_contacts: data.emergency_contacts?.length ? data.emergency_contacts : undefined,
        tags: data.tags?.length ? data.tags : undefined,
      };

      await updateClient.mutateAsync(cleanedData);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to update client:', error);
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

  if (clientLoading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Edytuj klienta</CardTitle>
          <CardDescription>
            Wczytywanie danych klienta...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!client) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Błąd</CardTitle>
          <CardDescription>
            Nie można wczytać danych klienta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Klient o podanym ID nie istnieje lub nie masz uprawnień do jego edycji.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Edytuj klienta: {client.profile.name}</CardTitle>
        <CardDescription>
          Modyfikuj informacje o kliencie
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Status Badge */}
        <div className="mb-4">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              client.status === 'active'
                ? 'bg-green-100 text-green-800'
                : client.status === 'inactive'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {client.status === 'active' ? 'Aktywny' : 
             client.status === 'inactive' ? 'Nieaktywny' : 'Zarchiwizowany'}
          </span>
        </div>

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

              {/* Status Selection */}
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">
                  Status klienta
                </Label>
                <select
                  id="status"
                  {...register('status')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="active">Aktywny</option>
                  <option value="inactive">Nieaktywny</option>
                  <option value="archived">Zarchiwizowany</option>
                </select>
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
              {isSubmitting ? 'Zapisywanie...' : 'Zapisz zmiany'}
            </Button>
            
            {isDirty && (
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
                disabled={isSubmitting}
              >
                Cofnij zmiany
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