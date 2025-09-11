// ABOUTME: TypeScript type definitions for Database schema and global application types
// ABOUTME: Includes Supabase Database types, User types, and authentication-related interfaces

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: 'therapist' | 'client';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role?: 'therapist' | 'client';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'therapist' | 'client';
          created_at?: string;
          updated_at?: string;
        };
      };
      // Add more tables as needed
    };
    Views: {
      // Database views will be added here
      [key: string]: unknown;
    };
    Functions: {
      check_table_rls_enabled: {
        Args: {
          table_name: string;
        };
        Returns: boolean;
      };
      [key: string]: unknown;
    };
    Enums: {
      user_role: 'therapist' | 'client';
    };
  };
}

// Authentication types
export interface User {
  id: string;
  email: string;
  role: 'therapist' | 'client';
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (
    email: string,
    password: string,
    role?: 'therapist' | 'client'
  ) => Promise<void>;
}

// Router types
export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  protected?: boolean;
  roles?: Array<'therapist' | 'client'>;
}
