import { ClientList } from '../../features/clients/components/ClientList'

export function ClientsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Zarządzanie klientami</h1>
      <ClientList />
    </div>
  )
}
