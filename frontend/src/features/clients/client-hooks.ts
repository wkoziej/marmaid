// ABOUTME: React Query hooks for client profile management
// ABOUTME: Provides useClients, useCreateClient, useUpdateClient and related hooks with caching

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientService } from './client-service';
import type { 
  Client, 
  CreateClientData, 
  UpdateClientData, 
  ClientApiError 
} from './client-types';

// Query keys for consistent caching
export const clientQueryKeys = {
  all: ['clients'] as const,
  lists: () => [...clientQueryKeys.all, 'list'] as const,
  list: (therapistId: string, filters?: any) => [...clientQueryKeys.lists(), therapistId, filters] as const,
  details: () => [...clientQueryKeys.all, 'detail'] as const,
  detail: (clientId: string) => [...clientQueryKeys.details(), clientId] as const,
  byStatus: (therapistId: string, status: string) => [...clientQueryKeys.all, 'status', therapistId, status] as const,
  search: (therapistId: string, query: string, tags?: string[]) => [...clientQueryKeys.all, 'search', therapistId, query, tags] as const,
};

/**
 * Hook to fetch all clients for a therapist
 */
export function useClients(therapistId: string | null) {
  return useQuery({
    queryKey: clientQueryKeys.list(therapistId || ''),
    queryFn: async () => {
      console.log('🔍 useClients: Fetching clients for therapist:', therapistId);
      if (!therapistId) {
        console.warn('🔍 useClients: No therapist ID provided');
        throw new Error('Therapist ID is required');
      }
      
      const response = await clientService.getClientsByTherapistId(therapistId);
      console.log('🔍 useClients: Response:', { 
        hasData: !!response.data, 
        dataLength: response.data?.length, 
        hasError: !!response.error 
      });
      
      if (response.error) {
        console.error('🔍 useClients: Error:', response.error);
        throw response.error;
      }
      
      return response.data || [];
    },
    enabled: !!therapistId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      const clientError = error as ClientApiError;
      if (clientError?.status === 403 || clientError?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook to fetch a single client by ID
 */
export function useClient(clientId: string | null) {
  return useQuery({
    queryKey: clientQueryKeys.detail(clientId || ''),
    queryFn: async () => {
      if (!clientId) throw new Error('Client ID is required');
      
      const response = await clientService.getClientById(clientId);
      if (response.error) throw response.error;
      
      return response.data;
    },
    enabled: !!clientId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      const clientError = error as ClientApiError;
      if (clientError?.status === 403 || clientError?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook to fetch clients by status
 */
export function useClientsByStatus(therapistId: string | null, status: 'active' | 'inactive' | 'archived') {
  return useQuery({
    queryKey: clientQueryKeys.byStatus(therapistId || '', status),
    queryFn: async () => {
      if (!therapistId) throw new Error('Therapist ID is required');
      
      const response = await clientService.getClientsByStatus(therapistId, status);
      if (response.error) throw response.error;
      
      return response.data || [];
    },
    enabled: !!therapistId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to search clients
 */
export function useSearchClients(therapistId: string | null, searchQuery: string, tags?: string[]) {
  return useQuery({
    queryKey: clientQueryKeys.search(therapistId || '', searchQuery, tags),
    queryFn: async () => {
      if (!therapistId) throw new Error('Therapist ID is required');
      
      const response = await clientService.searchClients(therapistId, searchQuery, tags);
      if (response.error) throw response.error;
      
      return response.data || [];
    },
    enabled: !!therapistId && (!!searchQuery.trim() || (tags && tags.length > 0)),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to create a new client
 */
export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ therapistId, clientData }: { therapistId: string; clientData: CreateClientData }) => {
      const response = await clientService.createClient(therapistId, clientData);
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (newClient, { therapistId }) => {
      // Invalidate clients list
      queryClient.invalidateQueries({
        queryKey: clientQueryKeys.list(therapistId)
      });
      
      // Invalidate status-specific queries
      queryClient.invalidateQueries({
        queryKey: clientQueryKeys.byStatus(therapistId, newClient?.status || 'active')
      });

      // Add the new client to the cache
      if (newClient) {
        queryClient.setQueryData(clientQueryKeys.detail(newClient.id), newClient);
      }
    },
    onError: (error) => {
      console.error('Failed to create client:', error);
    },
  });
}

/**
 * Hook to update an existing client
 */
export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updateData: UpdateClientData) => {
      const response = await clientService.updateClient(updateData);
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (updatedClient) => {
      if (!updatedClient) return;

      // Update the client in detail cache
      queryClient.setQueryData(clientQueryKeys.detail(updatedClient.id), updatedClient);

      // Invalidate all related queries
      queryClient.invalidateQueries({
        queryKey: clientQueryKeys.list(updatedClient.therapist_id)
      });

      queryClient.invalidateQueries({
        queryKey: clientQueryKeys.byStatus(updatedClient.therapist_id, updatedClient.status)
      });

      // Update the client in lists cache optimistically
      queryClient.setQueriesData(
        { queryKey: clientQueryKeys.lists() },
        (oldData: Client[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map(client => 
            client.id === updatedClient.id ? updatedClient : client
          );
        }
      );
    },
    onError: (error) => {
      console.error('Failed to update client:', error);
    },
  });
}

/**
 * Hook to delete a client
 */
export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientId: string) => {
      const response = await clientService.deleteClient(clientId);
      if (response.error) throw response.error;
      return clientId;
    },
    onSuccess: (clientId) => {
      // Remove from detail cache
      queryClient.removeQueries({
        queryKey: clientQueryKeys.detail(clientId)
      });

      // Invalidate all list queries
      queryClient.invalidateQueries({
        queryKey: clientQueryKeys.lists()
      });

      // Remove from lists cache optimistically  
      queryClient.setQueriesData(
        { queryKey: clientQueryKeys.lists() },
        (oldData: Client[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.filter(client => client.id !== clientId);
        }
      );
    },
    onError: (error) => {
      console.error('Failed to delete client:', error);
    },
  });
}

/**
 * Hook to get client statistics
 */
export function useClientStats(therapistId: string | null) {
  const { data: clients, isLoading } = useClients(therapistId);

  const stats = React.useMemo(() => {
    if (!clients) {
      return {
        total: 0,
        active: 0,
        inactive: 0,
        archived: 0,
        tags: [] as string[],
      };
    }

    const allTags = new Set<string>();
    const statusCounts = clients.reduce(
      (acc, client) => {
        acc[client.status] = (acc[client.status] || 0) + 1;
        client.tags.forEach(tag => allTags.add(tag));
        return acc;
      },
      { active: 0, inactive: 0, archived: 0 } as Record<string, number>
    );

    return {
      total: clients.length,
      active: statusCounts.active || 0,
      inactive: statusCounts.inactive || 0,
      archived: statusCounts.archived || 0,
      tags: Array.from(allTags).sort(),
    };
  }, [clients]);

  return {
    data: stats,
    isLoading,
  };
}

// Re-export React for the useMemo hook above
import React from 'react';