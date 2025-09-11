# Marmaid Brownfield UI Architecture Document

## Introduction

Ten dokument opisuje **OBECNY STAN** frontend'u aplikacji Marmaid, włączając technical debt, workaround'y i rzeczywiste wzorce. Służy jako referencja dla AI agents pracujących nad ulepszeniami UI.

### Document Scope

Focused na obszarach istotnych dla: **Enhancement UI - transformacja z placeholder dashboard'u na funkcjonalną aplikację terapeutyczną z zakładkami, zarządzaniem klientami, planowaniem sesji i wizualizacją 3D/2D**

### Change Log

| Date       | Version | Description                 | Author      |
| ---------- | ------- | --------------------------- | ----------- |
| 2024-12-29 | 1.0     | Initial brownfield analysis | BMad Master |

## Quick Reference - Key Files and Entry Points

### Critical Files for Understanding the System

- **Main Entry**: `frontend/src/main.tsx`
- **App Root**: `frontend/src/App.tsx` - React Router setup, QueryClient config
- **Dashboard**: `frontend/src/app/pages/dashboard.tsx` - Current placeholder cards layout
- **Auth System**: `frontend/src/features/auth/` - Complete authentication module
- **UI Components**: `frontend/src/components/ui/` - shadcn/ui based components
- **Config**: `frontend/tailwind.config.js`, `frontend/vite.config.ts`
- **Supabase**: `frontend/src/lib/supabase.ts` - Database integration

### Enhancement Impact Areas

Based on planned UI transformation, these areas will be heavily modified:

- **Navigation**: Need to add tab-based navigation component
- **Dashboard**: Complete redesign from cards to tabbed interface
- **New Features**: `features/clients/`, `features/sessions/`, `features/visualization/`
- **Routing**: Add sub-routes: `/dashboard/clients`, `/dashboard/sessions`, `/dashboard/viz`

## High Level Architecture

### Technical Summary

**Type**: Single Page Application (SPA)  
**Framework**: React 19 + TypeScript  
**Build Tool**: Vite 7.1.2  
**Deployment**: GitHub Pages (planned)

### Actual Tech Stack (from package.json)

| Category         | Technology            | Version        | Notes                                 |
| ---------------- | --------------------- | -------------- | ------------------------------------- |
| Runtime          | React                 | 19.1.1         | Latest React with concurrent features |
| Build            | Vite                  | 7.1.2          | Fast dev server, runs on port 5174    |
| Styling          | TailwindCSS           | 4.1.12         | Latest v4 with CSS @layer             |
| UI Components    | shadcn/ui             | Custom         | Card, Button, Input, Label, Textarea  |
| Icons            | lucide-react          | 0.542.0        | React icon library                    |
| State Management | @tanstack/react-query | 5.85.6         | Server state management               |
| Forms            | react-hook-form + zod | 7.62.0 + 4.1.5 | Form handling + validation            |
| Routing          | react-router-dom      | 7.8.2          | Client-side routing                   |
| Backend          | @supabase/supabase-js | 2.56.1         | Database and auth                     |
| Testing          | Vitest                | 3.2.4          | Unit and integration tests            |

### Repository Structure Reality Check

- **Type**: Monorepo with separate frontend/ folder
- **Package Manager**: npm
- **Notable**: Frontend isolated in `frontend/` subfolder, sibling to `docs/`, `supabase/`

## Source Tree and Module Organization

### Project Structure (Actual)

```text
marmaid/
├── frontend/
│   ├── src/
│   │   ├── app/                 # Application-level components
│   │   │   └── pages/           # Route components (auth-page, dashboard)
│   │   ├── components/          # Shared UI components
│   │   │   ├── ui/              # shadcn/ui components (button, card, input, etc.)
│   │   │   └── error-boundary.tsx
│   │   ├── features/            # Feature modules
│   │   │   └── auth/            # ✅ Complete auth system
│   │   │       ├── components/, hooks/, services/, schemas/
│   │   │       └── __tests__/   # Good test coverage
│   │   ├── lib/                 # Utilities and integrations
│   │   │   ├── supabase.ts     # Supabase client config
│   │   │   ├── utils.ts        # Tailwind merge utilities
│   │   │   └── auth-guard.tsx  # Route protection
│   │   ├── __tests__/          # App-level integration tests
│   │   ├── App.tsx             # Router and providers setup
│   │   ├── main.tsx            # React root
│   │   └── index.css           # Tailwind + CSS variables
│   ├── package.json            # Dependencies and scripts
│   ├── tailwind.config.js      # Tailwind configuration
│   ├── vite.config.ts          # Vite build configuration
│   └── tsconfig.json           # TypeScript configuration
├── docs/                       # Project documentation
├── supabase/                   # Database migrations
└── scripts/                    # Environment management scripts
```

### Key Modules and Their Purpose

#### ✅ **Existing & Working**

- **Authentication**: `src/features/auth/` - Complete module with login, register, profile
- **UI System**: `src/components/ui/` - shadcn/ui components with consistent styling
- **Route Protection**: `src/lib/auth-guard.tsx` - Working auth guards
- **State Management**: React Query setup with proper error handling and retry logic

#### ❌ **Missing/Placeholder Features**

- **Client Management**: Feature not implemented (needs `src/features/clients/`)
- **Session Planning**: Feature not implemented (needs `src/features/sessions/`)
- **3D Visualization**: Feature not implemented (needs `src/features/visualization/`)
- **Navigation System**: No tab navigation component exists

## Data Models and APIs

### Current Data Models

- **Authentication**: Handled by Supabase Auth - see `src/features/auth/auth-types.ts`
- **User Profiles**: Therapist profiles - see `src/features/auth/ProfileForm.tsx`

### Missing Models (Will Need Implementation)

Based on PRD requirements:

- **Client** model (patient profiles, intake responses)
- **Session** model (therapy sessions, marma points used)
- **MarmaPoint** model (point definitions by school)
- **TherapyPlan** model (treatment plans)

### API Integration

- **Supabase Client**: `src/lib/supabase.ts` - Configured and working
- **React Query**: Properly configured with retry logic and error handling
- **Auth API**: Complete integration via `src/features/auth/profile-service.ts`

## Current UI/UX State and Design System

### Design System (Existing)

**Color Palette**:

- Based on CSS custom properties in `src/index.css`
- Neutral grays with dark mode support
- **Assessment**: Currently generic - not wellness/therapeutic focused

**Components**:

- Button (default, secondary, outline variants)
- Card system (header, content, footer)
- Form inputs (Input, Textarea, Label)
- **Assessment**: Basic set, missing specialized components for therapy use

### Current Navigation Pattern

**Problem**: Dashboard uses `useState` for navigation instead of proper routing:

```typescript
const [showProfile, setShowProfile] = useState(false)
if (showProfile) return <ProfileForm />
return <Dashboard />
```

**Assessment**: This doesn't scale for multiple features and breaks browser back/forward.

### Dashboard Current State

**Layout**: 2x2 grid of cards on desktop (4 cards total)

- "Klienci" - disabled placeholder
- "Sesje" - disabled placeholder
- "Wizualizacja" - disabled placeholder
- "Ustawienia" - only working button (profile management)

**Assessment**: Card-based entry point works for initial version but needs transformation to proper tabbed interface for production use.

## Technical Debt and Known Issues

### Critical Technical Debt

1. **Navigation Architecture**: Dashboard uses local state instead of routing
2. **Missing Feature Modules**: Only `auth/` exists, need `clients/`, `sessions/`, `visualization/`
3. **3D Dependencies Missing**: three.js, react-three-fiber not installed despite being in tech-stack.md
4. **Design System Incomplete**: Generic colors, missing therapeutic/wellness design language
5. **Route Structure**: Flat routing (/dashboard) instead of nested routes

### Workarounds and Gotchas

- **Port Conflicts**: Vite dev server auto-switches ports (5173→5174) when port busy
- **Profile Navigation**: Uses conditional rendering instead of routing - works but not scalable
- **TypeScript Config**: Multiple tsconfig files (app, node) - standard Vite pattern
- **CSS Variables**: Dark mode implemented but not UI toggle exists

### Performance Considerations

- **React Query**: Properly configured with stale time and garbage collection
- **Bundle Size**: Clean - no unused dependencies detected
- **Testing**: Good test setup but only auth module has comprehensive tests

## Integration Points and External Dependencies

### External Services

| Service      | Purpose         | Integration Type | Key Files             |
| ------------ | --------------- | ---------------- | --------------------- |
| Supabase     | Database + Auth | SDK              | `src/lib/supabase.ts` |
| Tailwind     | Styling         | Build-time       | `tailwind.config.js`  |
| React Router | Client routing  | Runtime          | `src/App.tsx`         |

### Missing Integrations (Per Tech Stack)

| Service            | Purpose          | Status           | Needed For                |
| ------------------ | ---------------- | ---------------- | ------------------------- |
| three.js           | 3D Visualization | ❌ Not installed | Marma point visualization |
| react-three-fiber  | React 3D         | ❌ Not installed | Interactive 3D models     |
| @react-three/drei  | 3D Helpers       | ❌ Not installed | 3D UI components          |
| react-svg-pan-zoom | 2D Pan/Zoom      | ❌ Not installed | 2D body diagrams          |

## Development and Deployment

### Local Development Setup

**Working Setup**:

```bash
cd frontend && npm run dev  # Starts on http://localhost:5174/
```

**Known Issues**:

- Port 5173 often occupied, auto-switches to 5174
- No hot reload issues detected
- TypeScript compilation works correctly

### Build and Deployment Process

- **Build Command**: `npm run build` (TypeScript compilation + Vite build)
- **Deployment Target**: GitHub Pages (configured but not yet deployed)
- **Environment**: Uses environment scripts in `../scripts/` for environment switching

### Available Scripts

```bash
npm run dev              # Development server
npm run build            # Production build
npm run test             # Run all tests
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
npm run lint             # ESLint
npm run preview          # Preview production build
```

## Testing Reality

### Current Test Coverage

- **Auth Module**: ✅ Good coverage (unit + integration tests)
- **App Integration**: ✅ Basic app-level tests exist
- **UI Components**: ❌ No dedicated component tests
- **Feature Modules**: ❌ Only auth has tests

### Test Infrastructure

- **Framework**: Vitest (fast, Vite-native)
- **Testing Library**: @testing-library/react + user-event
- **Mocking**: Auth service mocking implemented
- **Coverage**: Available via `npm run test:coverage`

## Enhancement Impact Analysis

### Files That Will Need Major Modification

#### Navigation Architecture

- `src/App.tsx` - Add nested routing for dashboard tabs
- `src/app/pages/dashboard.tsx` - Complete redesign from cards to tabs
- **New File**: `src/components/navigation/` - Tab navigation component

#### New Feature Implementation

- **New**: `src/features/clients/` - Complete client management module
- **New**: `src/features/sessions/` - Session planning and tracking
- **New**: `src/features/visualization/` - 3D/2D marma point visualization

#### Routing Changes

```typescript
// Current: Flat routing
<Route path="/dashboard" element={<Dashboard />} />

// Needed: Nested routing
<Route path="/dashboard" element={<DashboardLayout />}>
  <Route index element={<DashboardHome />} />
  <Route path="clients" element={<ClientsPage />} />
  <Route path="sessions" element={<SessionsPage />} />
  <Route path="visualization" element={<VisualizationPage />} />
</Route>
```

### New Dependencies Required

#### 3D Visualization Stack

```bash
npm install three @types/three @react-three/fiber @react-three/drei
```

#### Enhanced UI Components

```bash
npm install @radix-ui/react-tabs @radix-ui/react-navigation-menu
```

#### 2D Visualization (Optional)

```bash
npm install react-svg-pan-zoom
```

### Integration Considerations

- **Design System**: Transform from generic to wellness/therapeutic theme
- **State Management**: Each feature module will need React Query integration
- **Type Safety**: Establish shared types for Client, Session, MarmaPoint models
- **Testing Strategy**: Each new feature module needs comprehensive test coverage
- **Performance**: 3D visualization will need lazy loading and performance optimization

## Appendix - Useful Commands and Scripts

### Development Workflow

```bash
# Start development
cd frontend && npm run dev

# Run tests while developing
npm run test:watch

# Check types and lint
npm run build  # This runs tsc check
npm run lint

# Test specific patterns
npm run test:unit          # Skip integration tests
npm run test:integration   # Only integration tests
```

### Environment Management

```bash
# From project root
./scripts/use-local.sh     # Use local Supabase
./scripts/use-test.sh      # Use test environment
./scripts/use-production.sh # Use production environment
```

### Debugging and Troubleshooting

- **React DevTools**: Works correctly in development
- **Browser Console**: No console errors in current implementation
- **Network Tab**: Supabase API calls visible and working
- **Common Issue**: Port conflicts → Check npm run dev output for actual port

---

## Summary for AI Agents

This Marmaid frontend is a **solid foundation** with excellent development practices but requires **major feature implementation**. The authentication system is production-ready, but the core therapy management features (clients, sessions, 3D visualization) exist only as placeholder cards.

**Immediate UI Enhancement Path**:

1. **Navigation**: Transform dashboard from cards to tabbed interface
2. **Client Management**: Build complete CRUD for patient management
3. **Session Planning**: Create therapy session planning UI
4. **3D Visualization**: Implement interactive marma point models
5. **Design System**: Evolve from generic to wellness-focused theme

The codebase follows React best practices and has excellent tooling. New features should follow the established patterns in the `auth/` module.
