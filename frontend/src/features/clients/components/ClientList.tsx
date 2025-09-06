// ABOUTME: ClientList component for displaying and managing client profiles
// ABOUTME: Provides search, filtering, tagging and CRUD operations

import React, { useState, useMemo } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { useClients, useDeleteClient, useClientStats } from '../client-hooks';
import { useAuth } from '../../auth/use-auth';
import type { Client } from '../client-types';

interface ClientListProps {
  onClientSelect?: (client: Client) => void;
  onCreateClient?: () => void;
  onEditClient?: (clientId: string) => void;
}

export function ClientList({ onClientSelect, onCreateClient, onEditClient }: ClientListProps) {
  const { user } = useAuth();
  const { data: clients = [], isLoading, error } = useClients(user?.id || null);
  const { data: stats } = useClientStats(user?.id || null);
  const deleteClient = useDeleteClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'archived'>('all');
  const [tagFilter, setTagFilter] = useState('');

  // Filter and search clients
  const filteredClients = useMemo(() => {
    let filtered = clients;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(client => client.status === statusFilter);
    }

    // Filter by search query (name, email, phone)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(client => 
        client.profile.name?.toLowerCase().includes(query) ||
        client.profile.email?.toLowerCase().includes(query) ||
        client.profile.phone?.includes(query)
      );
    }

    // Filter by tags
    if (tagFilter.trim()) {
      const tag = tagFilter.toLowerCase().trim();
      filtered = filtered.filter(client => 
        client.tags.some(t => t.toLowerCase().includes(tag))
      );
    }

    return filtered.sort((a, b) => {
      // Sort by name
      const nameA = a.profile.name || '';
      const nameB = b.profile.name || '';
      return nameA.localeCompare(nameB);
    });
  }, [clients, searchQuery, statusFilter, tagFilter]);

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    if (window.confirm(`Czy na pewno chcesz usunąć klienta "${clientName}"? Tej operacji nie można cofnąć.`)) {
      try {
        await deleteClient.mutateAsync(clientId);
      } catch (error) {
        console.error('Failed to delete client:', error);
        alert('Nie udało się usunąć klienta. Spróbuj ponownie.');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktywny';
      case 'inactive':
        return 'Nieaktywny';
      case 'archived':
        return 'Zarchiwizowany';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Klienci</CardTitle>
          <CardDescription>Zarządzaj listą swoich klientów</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Klienci</CardTitle>
          <CardDescription>Zarządzaj listą swoich klientów</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">Nie udało się wczytać listy klientów</p>
            <Button onClick={() => window.location.reload()}>
              Spróbuj ponownie
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Wszyscy klienci</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-muted-foreground">Aktywni</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.inactive}</div>
              <div className="text-sm text-muted-foreground">Nieaktywni</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-600">{stats.archived}</div>
              <div className="text-sm text-muted-foreground">Zarchiwizowani</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Client List Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Klienci ({filteredClients.length})</CardTitle>
              <CardDescription>Zarządzaj listą swoich klientów</CardDescription>
            </div>
            <Button onClick={onCreateClient}>
              Dodaj klienta
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters and Search */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm font-medium">Wyszukaj</Label>
              <Input
                id="search"
                type="text"
                placeholder="Nazwa, email, telefon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">Status</Label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">Wszystkie</option>
                <option value="active">Aktywni</option>
                <option value="inactive">Nieaktywni</option>
                <option value="archived">Zarchiwizowani</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tag" className="text-sm font-medium">Filtruj po tagach</Label>
              <Input
                id="tag"
                type="text"
                placeholder="Wpisz tag..."
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
              />
            </div>
          </div>

          {/* Client List */}
          {filteredClients.length === 0 ? (
            <div className="text-center py-8">
              {clients.length === 0 ? (
                <>
                  <p className="text-muted-foreground mb-4">Nie masz jeszcze żadnych klientów</p>
                  <Button onClick={onCreateClient}>
                    Dodaj pierwszego klienta
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground">
                  Nie znaleziono klientów pasujących do kryteriów wyszukiwania
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredClients.map((client) => (
                <Card key={client.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 
                            className="font-medium text-lg cursor-pointer hover:text-primary transition-colors"
                            onClick={() => onClientSelect?.(client)}
                          >
                            {client.profile.name || 'Bez nazwy'}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}
                          >
                            {getStatusLabel(client.status)}
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground mb-2">
                          {client.profile.email && (
                            <span>{client.profile.email}</span>
                          )}
                          {client.profile.phone && (
                            <span>{client.profile.phone}</span>
                          )}
                          {client.profile.date_of_birth && (
                            <span>Ur. {new Date(client.profile.date_of_birth).toLocaleDateString('pl-PL')}</span>
                          )}
                        </div>

                        {client.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {client.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground">
                          Utworzony: {new Date(client.created_at).toLocaleDateString('pl-PL')}
                          {client.updated_at !== client.created_at && (
                            <span className="ml-2">
                              Zaktualizowany: {new Date(client.updated_at).toLocaleDateString('pl-PL')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onClientSelect?.(client)}
                        >
                          Zobacz
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onEditClient?.(client.id)}
                        >
                          Edytuj
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteClient(client.id, client.profile.name || 'Bez nazwy')}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Usuń
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}