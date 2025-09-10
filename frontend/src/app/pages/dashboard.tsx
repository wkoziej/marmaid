import { useState } from 'react'
import { useAuth } from '../../features/auth/use-auth'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { ProfileForm } from '../../features/auth/ProfileForm'
import { ClientList } from '../../features/clients/components/ClientList'
import { ClientCreateForm } from '../../features/clients/components/ClientCreateForm'
import { useNavigate } from 'react-router-dom'

export function Dashboard() {
  const { user, signOut, loggingOut } = useAuth()
  const navigate = useNavigate()
  const [showProfile, setShowProfile] = useState(false)
  const [showClients, setShowClients] = useState(false)
  const [showCreateClient, setShowCreateClient] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [editingClientId, setEditingClientId] = useState<string | null>(null)
  const [logoutError, setLogoutError] = useState<string | null>(null)
  const handleSignOut = async () => {
    if (loggingOut) return // Prevent multiple clicks
    
    try {
      setLogoutError(null)
      await signOut()
      // Navigation handled automatically by AppRoutes when user becomes null
    } catch (error) {
      console.error('Logout failed:', error)
      setLogoutError('Wystąpił błąd podczas wylogowywania. Spróbuj ponownie.')
    }
  }

  const handleProfileOpen = () => {
    setShowProfile(true)
  }

  const handleProfileClose = () => {
    setShowProfile(false)
  }

  const handleClientsOpen = () => {
    setShowClients(true)
  }

  const handleClientsClose = () => {
    setShowClients(false)
    setShowCreateClient(false)
    setSelectedClientId(null)
    setEditingClientId(null)
  }

  const handleCreateClient = () => {
    setShowCreateClient(true)
  }

  const handleClientSelect = (client: any) => {
    setSelectedClientId(client.id)
  }

  const handleEditClient = (clientId: string) => {
    setEditingClientId(clientId)
  }

  // Component for logout button with loading state
  const LogoutButton = ({ className }: { className?: string }) => (
    <div className="flex flex-col items-end">
      <Button 
        variant="outline" 
        onClick={handleSignOut} 
        disabled={loggingOut}
        data-testid="logout-button"
        className={className}
        aria-label={loggingOut ? 'Wylogowywanie...' : 'Wyloguj się'}
      >
        {loggingOut ? 'Wylogowywanie...' : 'Wyloguj się'}
      </Button>
      {logoutError && (
        <div className="text-sm text-red-600 mt-1 max-w-xs text-right">
          {logoutError}
        </div>
      )}
    </div>
  )

  if (showProfile) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Profil terapeuty</h1>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={handleProfileClose}>
                Powrót do Dashboard
              </Button>
              <LogoutButton />
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProfileForm 
            onSuccess={handleProfileClose} 
            onCancel={handleProfileClose} 
          />
        </main>
      </div>
    )
  }

  if (showClients) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold" data-testid="client-management-heading">
              {showCreateClient ? 'Dodaj nowego klienta' : 'Zarządzanie klientami'}
            </h1>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={handleClientsClose}>
                Powrót do Dashboard
              </Button>
              <LogoutButton />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {showCreateClient ? (
            <ClientCreateForm 
              onSuccess={() => setShowCreateClient(false)}
              onCancel={() => setShowCreateClient(false)}
            />
          ) : (
            <ClientList 
              onCreateClient={handleCreateClient}
              onClientSelect={handleClientSelect}
              onEditClient={handleEditClient}
            />
          )}
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold" data-testid="dashboard-heading">Marmaid Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground" data-testid="user-email">
              {user?.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Klienci</CardTitle>
              <CardDescription>
                Zarządzaj swoimi klientami i ich profilami
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={handleClientsOpen} data-testid="manage-clients-button">
                Zarządzaj klientami
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sesje</CardTitle>
              <CardDescription>
                Planuj i dokumentuj sesje terapeutyczne
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Wkrótce dostępne
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Wizualizacja</CardTitle>
              <CardDescription>
                Eksploruj punkty Marma w 3D
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Wkrótce dostępne
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ustawienia</CardTitle>
              <CardDescription>
                Zarządzaj profilem i preferencjami
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={handleProfileOpen}>
                Zarządzaj profilem
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}