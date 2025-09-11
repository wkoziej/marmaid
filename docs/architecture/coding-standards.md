# Coding Standards — Marmaid

## TypeScript Standards

### Type Definitions

```typescript
// ✅ DO: Explicit types for interfaces
interface User {
  id: string;
  email: string;
  role: 'therapist' | 'client';
  createdAt: string;
}

// ✅ DO: Use type unions for constants
type Theme = 'light' | 'dark' | 'system';

// ❌ DON'T: Use any
const badData: any = getData();

// ✅ DO: Use unknown and type guards
const safeData: unknown = getData();
if (isUser(safeData)) {
  // Now safeData is User type
}
```

### Function Types

```typescript
// ✅ DO: Function with proper return types
const fetchUser = async (id: string): Promise<User | null> => {
  // implementation
};

// ✅ DO: Generic functions when needed
const createApiCall = <T>(url: string): Promise<T> => {
  // implementation
};
```

## React Standards

### Component Definition

```typescript
// ✅ DO: Functional components with TypeScript
interface LoginFormProps {
  onSubmit: (data: LoginData) => void;
  isLoading?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  // implementation
};
```

### Hooks Usage

```typescript
// ✅ DO: Custom hooks for business logic
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ... logic

  return { user, loading, login, logout };
};

// ✅ DO: Dependency arrays in effects
useEffect(() => {
  fetchData(userId);
}, [userId]); // Explicit dependency
```

### State Management (Zustand)

```typescript
// ✅ DO: Typed stores
interface AuthStore {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  login: async (email, password) => {
    // implementation
  },
  logout: () => set({ user: null }),
}));
```

## Form Standards (React Hook Form + Zod)

### Schema Definition

```typescript
// ✅ DO: Zod schemas with proper validation
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;
```

### Form Implementation

```typescript
// ✅ DO: Typed forms with validation
const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = (data: LoginFormData) => {
    // type-safe data handling
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
    </form>
  )
}
```

## Styling Standards (TailwindCSS + shadcn/ui)

### Component Styling

```typescript
// ✅ DO: Use cn() utility for conditional classes
import { cn } from '@/lib/utils'

const Button = ({ className, variant, ...props }) => {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-md font-medium",
        {
          "bg-blue-600 text-white": variant === 'primary',
          "bg-gray-200 text-gray-900": variant === 'secondary'
        },
        className
      )}
      {...props}
    />
  )
}
```

### CSS Organization

```css
/* ✅ DO: Use Tailwind layers */
@layer base {
  html {
    @apply h-full;
  }
}

@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700;
  }
}
```

## API & Data Fetching (TanStack Query + Supabase)

### Query Hooks

```typescript
// ✅ DO: Custom query hooks with proper typing
export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    enabled: !!userId,
  });
};

// ✅ DO: Mutation hooks with optimistic updates
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: data => {
      queryClient.setQueryData(['user', data.id], data);
    },
  });
};
```

### Supabase Client

```typescript
// ✅ DO: Typed Supabase client
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

export const supabase = createClient<Database>(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);
```

## Error Handling

### Error Boundaries

```typescript
// ✅ DO: Error boundaries for graceful failures
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />
    }
    return this.props.children
  }
}
```

### Async Error Handling

```typescript
// ✅ DO: Proper error handling in async functions
const handleLogin = async (data: LoginData) => {
  try {
    setLoading(true);
    await login(data);
    navigate('/dashboard');
  } catch (error) {
    if (error instanceof AuthError) {
      setError(error.message);
    } else {
      setError('An unexpected error occurred');
    }
  } finally {
    setLoading(false);
  }
};
```

## Testing Standards

### E2E Test Selector Standardization

#### Test Attribute Standards

```typescript
// ✅ DO: Use data-testid for stable selectors
<button
  data-testid="login-submit-button"
  className="btn-primary"
>
  Zaloguj się
</button>

<input
  data-testid="email-input"
  type="email"
  name="email"
/>

// ✅ DO: Use kebab-case for data-testid values
<div data-testid="client-management-section">
  <h2 data-testid="client-management-heading">Zarządzanie klientami</h2>
</div>
```

#### E2E Test Implementation

```typescript
// ✅ DO: Use getByTestId() for stable selectors
test('user can login with valid credentials', async ({ page }) => {
  await page.getByTestId('email-input').fill('test@example.com');
  await page.getByTestId('password-input').fill('password123');
  await page.getByTestId('login-submit-button').click();

  await expect(page.getByTestId('dashboard-heading')).toBeVisible();
});

// ❌ DON'T: Use language-dependent selectors
await page.getByRole('button', { name: 'Zaloguj się' }).click(); // Breaks with UI text changes
await page.getByText('Zarządzanie klientami').click(); // Language-dependent

// ✅ DO: Use stable data-testid selectors instead
await page.getByTestId('login-submit-button').click();
await page.getByTestId('client-management-link').click();
```

#### Data-TestId Naming Conventions

```typescript
// ✅ DO: Descriptive, semantic naming
data-testid="login-submit-button"        // Action + element type
data-testid="email-input"               // Field name + element type
data-testid="client-list-item"          // Context + element type
data-testid="add-client-form"           // Action + context + element type
data-testid="navigation-dashboard"      // Section + target

// ❌ DON'T: Generic or unclear naming
data-testid="button1"                   // Not descriptive
data-testid="loginBtn"                  // Use kebab-case, not camelCase
data-testid="email_input"               // Use kebab-case, not snake_case
```

#### Component Integration Rules

```typescript
// ✅ DO: Add data-testid to interactive elements used in E2E tests
interface ButtonProps {
  testId?: string
  children: React.ReactNode
  onClick: () => void
}

export const Button: React.FC<ButtonProps> = ({
  testId,
  children,
  onClick
}) => {
  return (
    <button
      data-testid={testId}
      onClick={onClick}
      className="btn-primary"
    >
      {children}
    </button>
  )
}

// Usage in forms
<Button testId="save-client-button" onClick={handleSave}>
  Zapisz klienta
</Button>
```

### Component Testing

```typescript
// ✅ DO: Test user interactions, not implementation
import { render, screen, userEvent } from '@testing-library/react'

test('allows user to login with valid credentials', async () => {
  render(<LoginForm onSubmit={mockSubmit} />)

  // ✅ PREFER: Use data-testid when available
  await userEvent.type(screen.getByTestId('email-input'), 'test@example.com')
  await userEvent.type(screen.getByTestId('password-input'), 'password123')
  await userEvent.click(screen.getByTestId('login-submit-button'))

  expect(mockSubmit).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password123'
  })
})

// ✅ FALLBACK: Use accessible queries when data-testid not available
test('displays validation errors', async () => {
  render(<LoginForm onSubmit={mockSubmit} />)

  await userEvent.click(screen.getByRole('button', { name: /login/i }))

  expect(screen.getByText(/email is required/i)).toBeInTheDocument()
})
```

## File Organization Rules

1. **One component per file** - każdy komponent w osobnym pliku
2. **Index files** - używaj `index.ts` do re-exportu w katalogach
3. **Feature isolation** - kod związany z feature'em trzymaj w jego katalogu
4. **Shared code** - wspólne utilities w `lib/`, komponenty w `components/`
5. **Absolute imports** - używaj `@/` dla importów z `src/`

## Git Commit Standards

```bash
# ✅ DO: Conventional commits
feat(auth): add login form validation
fix(ui): resolve button loading state
docs(readme): update installation steps
refactor(api): simplify user service

# ❌ DON'T: Vague messages
fix stuff
update code
changes
```
