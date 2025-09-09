import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'

export function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Klienci</CardTitle>
            <CardDescription>
              Zarządzaj swoimi klientami i ich profilami
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link to="/clients">Zarządzaj klientami</Link>
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
            <Button className="w-full" asChild>
              <Link to="/profile">Zarządzaj profilem</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}