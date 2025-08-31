# Source Tree Structure — Marmaid

## Frontend Project Structure

```
frontend/
├── public/                     # Static assets
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── app/                    # Routing, layout
│   │   ├── router.tsx          # React Router setup
│   │   ├── layout.tsx          # App layout wrapper
│   │   └── providers.tsx       # Context providers
│   ├── components/             # UI współdzielone (shadcn/ui)
│   │   ├── ui/                 # shadcn/ui base components
│   │   ├── forms/              # Form components
│   │   ├── navigation/         # Nav, breadcrumbs
│   │   └── layouts/            # Layout components
│   ├── features/               # Feature modules
│   │   ├── auth/               # Logowanie, rejestracja, reset
│   │   │   ├── components/     # Auth-specific components
│   │   │   ├── hooks/          # useAuth, useLogin, etc.
│   │   │   ├── services/       # Auth API calls
│   │   │   └── types.ts        # Auth type definitions
│   │   ├── clients/            # Listy, profil klienta, intake preview
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types.ts
│   │   ├── sessions/           # Logowanie sesji, notatki
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types.ts
│   │   ├── planning/           # Wybór szkoły, lista punktów, plan terapii
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types.ts
│   │   ├── viz3d/              # Canvasy 3D, overlay punktów
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── models/         # 3D models, geometries
│   │   │   └── utils.ts
│   │   ├── billing/            # Stripe checkout, status subskrypcji
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types.ts
│   │   └── search/             # KB/RAG UI (wyszukiwarka punktów)
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── services/
│   │       └── types.ts
│   ├── lib/                    # Utilities, helpers
│   │   ├── supabase.ts         # Supabase client
│   │   ├── auth-guards.ts      # Route protection
│   │   ├── utils.ts            # General utilities
│   │   ├── constants.ts        # App constants
│   │   ├── validations.ts      # Zod schemas
│   │   └── types.ts            # Global types
│   ├── hooks/                  # Global/shared hooks
│   │   ├── useLocalStorage.ts
│   │   └── useDebounce.ts
│   ├── styles/                 # Styling
│   │   ├── globals.css         # Global styles + Tailwind imports
│   │   └── components.css      # Component-specific styles
│   ├── assets/                 # Static assets
│   │   ├── images/
│   │   ├── icons/
│   │   └── models/             # 3D models (GLTF/FBX)
│   └── main.tsx               # App entry point
├── index.html                  # Vite HTML template
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── tailwind.config.js
├── vite.config.ts
├── postcss.config.js
└── README.md
```

## Organizational Patterns

### Feature Module Structure
Każdy moduł w `features/` zawiera:
- `components/` - React components
- `hooks/` - Custom hooks
- `services/` - API calls, data fetching
- `types.ts` - TypeScript definitions

### Import Conventions
```typescript
// Absolute imports from src root
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { supabase } from '@/lib/supabase'

// Relative imports within same feature
import { LoginForm } from './components/LoginForm'
```

### File Naming
- **Components**: PascalCase (`LoginForm.tsx`)
- **Hooks**: camelCase z prefixem `use` (`useAuth.ts`)
- **Services**: camelCase (`authService.ts`)
- **Types**: camelCase (`userTypes.ts`)
- **Utils**: camelCase (`formatDate.ts`)

### Backend Structure (Supabase)
```
supabase/
├── migrations/                 # Database migrations
├── functions/                  # Edge Functions
│   ├── stripe-webhook/
│   ├── rag-search/
│   └── import-data/
├── seed.sql                   # Initial data
└── config.toml               # Supabase config
``` 