import { useState } from 'react'
import { LoginForm } from '../../features/auth/login-form'
import { RegisterForm } from '../../features/auth/register-form'
import { Button } from '../../components/ui/button'

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-4">
        {mode === 'login' ? <LoginForm /> : <RegisterForm />}
        
        <div className="text-center">
          {mode === 'login' ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Nie masz jeszcze konta?
              </p>
              <Button 
                variant="outline" 
                onClick={() => setMode('register')}
                className="w-full"
              >
                Utwórz konto
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Masz już konto?
              </p>
              <Button 
                variant="outline" 
                onClick={() => setMode('login')}
                className="w-full"
              >
                Zaloguj się
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}