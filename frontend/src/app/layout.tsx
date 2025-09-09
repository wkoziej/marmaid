import { NavLink, Outlet } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { useAuth } from '../features/auth/use-auth'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/clients', label: 'Klienci' },
  { to: '/profile', label: 'Profil' },
]

export function DashboardLayout() {
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen w-full flex">
      <aside className="w-64 bg-background border-r p-4 flex flex-col">
        <h2 className="text-2xl font-bold mb-6">Marmaid</h2>
        <nav className="flex-1">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end
                  className={({ isActive }) =>
                    `block w-full text-left p-2 rounded-md ${
                      isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto">
          <Button variant="outline" className="w-full" onClick={signOut}>
            Wyloguj się
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-8 bg-muted/40">
        <Outlet />
      </main>
    </div>
  )
}
