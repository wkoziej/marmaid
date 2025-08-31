import { useAuth } from '../../features/auth/use-auth'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'

export function Dashboard() {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Marmaid Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {user?.email}
            </span>
            <Button variant="outline" onClick={handleSignOut}>
              Wyloguj się
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Klienci</CardTitle>
              <CardDescription>
                Zarządzaj swoimi klientami i ich profilami
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
        </div>
      </main>
    </div>
  )
}