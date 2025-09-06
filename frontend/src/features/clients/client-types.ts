// ABOUTME: Client-related type definitions and interfaces
// ABOUTME: Defines data structures for client profiles, health info, and API responses

export interface ClientProfile {
  name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  address?: {
    street?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  };
  demographics?: {
    gender?: string;
    preferred_language?: string;
    occupation?: string;
    marital_status?: string;
  };
  notes?: string;
}

export interface ClientHealthInfo {
  conditions?: string[];
  medications?: string[];
  allergies?: string[];
  medical_history?: string;
  therapy_goals?: string[];
  previous_therapy?: string;
  risk_factors?: string[];
  assessment_notes?: string;
}

export interface EmergencyContact {
  id?: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
  is_primary?: boolean;
}

export interface Client {
  id: string;
  therapist_id: string;
  profile: ClientProfile;
  health_info: ClientHealthInfo;
  emergency_contacts: EmergencyContact[];
  tags: string[];
  status: 'active' | 'inactive' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface ClientRow {
  id: string;
  therapist_id: string;
  profile: ClientProfile;
  health_info: ClientHealthInfo;
  emergency_contacts: EmergencyContact[];
  tags: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClientData {
  profile: Partial<ClientProfile>;
  health_info?: Partial<ClientHealthInfo>;
  emergency_contacts?: EmergencyContact[];
  tags?: string[];
  status?: 'active' | 'inactive' | 'archived';
}

export interface UpdateClientData extends Partial<CreateClientData> {
  id: string;
}

export interface ClientApiError extends Error {
  status?: number;
  code?: string;
}

export interface ClientApiResponse {
  data: Client | null;
  error: ClientApiError | null;
}

export interface ClientListResponse {
  data: Client[] | null;
  error: ClientApiError | null;
}

export interface DeleteClientResponse {
  error: ClientApiError | null;
}