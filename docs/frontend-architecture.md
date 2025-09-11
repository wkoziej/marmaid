# Marmaid Brownfield Frontend Enhancement Architecture

## Introduction

This document outlines the architectural approach for enhancing Marmaid with a complete UI transformation from placeholder dashboard to functional therapeutic application. Its primary goal is to serve as the guiding architectural blueprint for AI-driven development of new frontend features while ensuring seamless integration with the existing React/TypeScript foundation.

**Relationship to Existing Architecture:**
This document supplements the existing brownfield analysis (`docs/brownfield-ui-architecture.md`) by defining specific technical implementation strategies. Where new patterns are introduced, they extend rather than replace existing shadcn/ui and React Query foundations.

### Existing Project Analysis

#### Current Project State

**Based on comprehensive brownfield analysis validation:**

- **Primary Purpose:** Web application for marma point therapists enabling client management, session planning, and therapy visualization
- **Current Tech Stack:** React 19 + TypeScript, Vite 7.1.2, shadcn/ui, TailwindCSS 4.1.12, Supabase 2.56.1, React Query 5.85.6
- **Architecture Style:** Feature-based SPA with authentication foundation, placeholder dashboard awaiting core therapy modules
- **Deployment Method:** GitHub Pages (configured), Supabase backend integration

#### Available Documentation

- ✅ **Comprehensive Brownfield Analysis** - `docs/brownfield-ui-architecture.md` with tech debt and integration points
- ✅ **UI Enhancement PRD** - `docs/ui-enhancement-prd.md` with 6-story implementation sequence
- ✅ **Frontend UX Specification** - `docs/front-end-spec.md` with wellness design system and user flows
- ✅ **Tech Stack Documentation** - Existing dependencies and build configuration analyzed
- ✅ **Authentication Implementation** - Complete working module with test coverage

#### Identified Constraints

- **Navigation Architecture Limitation** - Current dashboard uses local state instead of routing, preventing deep linking
- **Missing 3D Dependencies** - three.js ecosystem not installed despite being in tech requirements
- **Generic Design System** - Current styling lacks therapeutic/wellness focus required for professional use
- **Feature Module Gap** - Only `auth/` module exists, missing `clients/`, `sessions/`, `visualization/`
- **Bundle Size Sensitivity** - GitHub Pages deployment requires careful 3D asset management

### Change Log

| Change  | Date       | Version | Description                              | Author      |
| ------- | ---------- | ------- | ---------------------------------------- | ----------- |
| Initial | 2024-12-29 | 1.0     | Frontend architecture for UI enhancement | BMad Master |

---

## Enhancement Scope and Integration Strategy

### Enhancement Overview

**Enhancement Type:** UI/UX Overhaul with Major Feature Addition
**Scope:** Transform placeholder dashboard to functional tabbed interface with client management, session planning, and 3D visualization
**Integration Impact:** Significant (substantial existing code changes while preserving authentication foundation)

### Integration Approach

**Code Integration Strategy:** Feature-based architecture extension following established `features/auth/` patterns. New modules (`clients/`, `sessions/`, `visualization/`) integrate alongside existing auth without modification to core authentication flow.

**Database Integration:** Additive-only schema changes through Supabase migrations. New tables (clients, sessions, marma_points) with foreign key relationships to existing auth.users table. Zero impact on existing authentication data.

**API Integration:** Extend existing Supabase client configuration (`src/lib/supabase.ts`) without modification. New feature modules follow React Query patterns established in `src/features/auth/profile-service.ts` for consistent error handling and caching.

**UI Integration:** Transform dashboard component from card-based to tabbed navigation while preserving header (title, user email, logout). Extend shadcn/ui component system with wellness-themed variants. Maintain CSS variable architecture for theme consistency.

### Compatibility Requirements

- **Existing API Compatibility:** All current Supabase auth integration remains untouched. Profile management continues using existing `ProfileForm` component within new "Ustawienia" tab.
- **Database Schema Compatibility:** Additive-only migrations. Existing `auth.users` and profile tables unchanged. New therapy-specific tables reference existing user IDs.
- **UI/UX Consistency:** New wellness color palette implemented via CSS custom property updates. Existing shadcn/ui components extended, not replaced. Header layout and logout functionality preserved exactly.
- **Performance Impact:** 3D visualization lazy-loaded to maintain existing dashboard performance. Initial bundle size increase < 500KB through code splitting.

---

## Tech Stack Alignment

### Existing Technology Stack

| Category             | Current Technology       | Version        | Usage in Enhancement                     | Notes                                      |
| -------------------- | ------------------------ | -------------- | ---------------------------------------- | ------------------------------------------ |
| **Framework**        | React                    | 19.1.1         | Foundation for all new components        | Concurrent features utilized               |
| **Build Tool**       | Vite                     | 7.1.2          | Development and production builds        | Port auto-switching (5173→5174)            |
| **Styling**          | TailwindCSS              | 4.1.12         | Wellness theme via CSS custom properties | v4 @layer architecture preserved           |
| **UI Components**    | shadcn/ui                | Custom         | Extended with wellness variants          | Button, Card, Input patterns maintained    |
| **State Management** | @tanstack/react-query    | 5.85.6         | All new API interactions                 | Existing retry/cache patterns followed     |
| **Forms**            | react-hook-form + zod    | 7.62.0 + 4.1.5 | Client and session forms                 | Validation schemas following auth patterns |
| **Routing**          | react-router-dom         | 7.8.2          | Extended to nested tabbed navigation     | Upgrade from flat to nested routes         |
| **Backend**          | @supabase/supabase-js    | 2.56.1         | All database operations                  | Client configuration unchanged             |
| **Icons**            | lucide-react             | 0.542.0        | Therapy-specific iconography             | Medical/wellness icon additions            |
| **Testing**          | Vitest + Testing Library | 3.2.4 + 16.3.0 | Feature module test coverage             | Following auth module patterns             |

### New Technology Additions

| Technology               | Version  | Purpose                   | Rationale                                      | Integration Method              |
| ------------------------ | -------- | ------------------------- | ---------------------------------------------- | ------------------------------- |
| **three**                | ^0.168.0 | 3D human body models      | Core requirement for marma point visualization | Lazy-loaded, code-split module  |
| **@react-three/fiber**   | ^8.15.0  | React 3D integration      | Seamless React component integration           | Wrapped in React.Suspense       |
| **@react-three/drei**    | ^9.88.0  | 3D UI components          | Pre-built 3D controls and helpers              | Performance-optimized imports   |
| **@radix-ui/react-tabs** | ^1.0.4   | Accessible tab navigation | WCAG compliance for dashboard tabs             | Extends existing Radix patterns |

---

## Data Models and Schema Changes

### New Data Models

#### Client Model

**Purpose:** Store client/patient information for therapy management
**Integration:** Links to existing auth.users via therapist_id foreign key

**Key Attributes:**

- `id`: UUID (primary key) - Unique client identifier
- `therapist_id`: UUID (foreign key) - References auth.users.id
- `name`: TEXT - Client full name
- `email`: TEXT (optional) - For intake questionnaire delivery
- `phone`: TEXT (optional) - Contact information
- `created_at`: TIMESTAMP - Record creation
- `updated_at`: TIMESTAMP - Last modification
- `status`: ENUM ['active', 'inactive', 'archived'] - Client status
- `intake_data`: JSONB - Flexible intake questionnaire responses

**Relationships:**

- **With Existing:** therapist_id → auth.users.id (many-to-one)
- **With New:** One-to-many with Session model

#### Session Model

**Purpose:** Document therapy sessions with marma points and notes
**Integration:** Links clients with specific therapy sessions and point usage

**Key Attributes:**

- `id`: UUID (primary key) - Session identifier
- `client_id`: UUID (foreign key) - References Client.id
- `therapist_id`: UUID (foreign key) - References auth.users.id (denormalized for queries)
- `session_date`: TIMESTAMP - When session occurred
- `duration_minutes`: INTEGER - Session length
- `marma_points_used`: TEXT[] - Array of point identifiers
- `therapy_school`: TEXT - School variation used ('ayurvedic', 'thai', 'chinese')
- `session_notes`: TEXT - Therapist observations
- `effectiveness_rating`: INTEGER - 1-5 scale per point
- `next_session_notes`: TEXT - Planning for future sessions

**Relationships:**

- **With Existing:** therapist_id → auth.users.id
- **With New:** client_id → Client.id (many-to-one)

#### MarmaPoint Model

**Purpose:** Reference data for marma point definitions across therapy schools
**Integration:** Static reference data, not user-specific

**Key Attributes:**

- `id`: TEXT (primary key) - Point identifier (e.g., 'marma_001')
- `name`: TEXT - Common point name
- `therapy_school`: TEXT - School variation
- `location_description`: TEXT - Anatomical location
- `purpose`: TEXT[] - Therapeutic purposes
- `contraindications`: TEXT[] - When not to use
- `model_coordinates`: JSONB - 3D model position data

**Relationships:**

- **With Existing:** None (reference data)
- **With New:** Referenced by Session.marma_points_used array

### Schema Integration Strategy

**Database Changes Required:**

- **New Tables:** `clients`, `sessions`, `marma_points` (3 tables)
- **Modified Tables:** None (existing tables untouched)
- **New Indexes:** `clients.therapist_id`, `sessions.client_id`, `sessions.therapist_id`, `marma_points.therapy_school`
- **Migration Strategy:** Sequential Supabase migrations with rollback capability

**Backward Compatibility:**

- All existing auth.users data and relationships preserved
- Existing profile management functionality unaffected
- New tables isolated from existing authentication schema
- Migration scripts include rollback procedures for safe deployment

---

## Component Architecture

_The new components I'm proposing follow the existing architectural patterns I identified in your codebase: feature-based organization with components/, hooks/, services/, and **tests**/ subdirectories, React Query integration for API calls, and shadcn/ui component extension patterns. The integration interfaces respect your current component structure and communication patterns. Does this match your project's reality?_

### New Components

#### DashboardLayout Component

**Responsibility:** Replace current card-based dashboard with tabbed navigation interface
**Integration Points:** Preserves existing header, integrates with React Router for nested routing

**Key Interfaces:**

- `<DashboardLayout />` - Main wrapper with tab navigation
- `<TabContent />` - Dynamic content area based on active route

**Dependencies:**

- **Existing Components:** Header layout from current dashboard, AuthGuard patterns
- **New Components:** All feature tab components (ClientsTab, SessionsTab, etc.)

**Technology Stack:** React Router v7 nested routes, @radix-ui/react-tabs for accessibility

#### ClientManagement Component

**Responsibility:** Complete CRUD interface for client management with search and filtering
**Integration Points:** Uses existing form patterns, integrates with session planning

**Key Interfaces:**

- `<ClientList />` - Grid/list view with search and filters
- `<ClientForm />` - Add/edit forms following ProfileForm patterns
- `<ClientDetail />` - Individual client view with session history

**Dependencies:**

- **Existing Components:** Button, Card, Input from shadcn/ui, form validation patterns
- **New Components:** SessionList for integrated history display

**Technology Stack:** React Hook Form + Zod (matching auth patterns), React Query for data management

#### SessionPlanning Component

**Responsibility:** Session creation and documentation with marma point selection
**Integration Points:** Client selection integration, visualization tab integration for point reference

**Key Interfaces:**

- `<SessionForm />` - Main session documentation interface
- `<MarmaPointSelector />` - Visual point selection with therapy school switching
- `<SessionHistory />` - Historical session data display

**Dependencies:**

- **Existing Components:** Form components, date pickers, text areas from shadcn/ui
- **New Components:** VisualizationEmbed for point selection, ClientSelector for quick selection

**Technology Stack:** React Hook Form for complex forms, React Query for autosave functionality

#### Visualization3D Component

**Responsibility:** Interactive 3D marma point visualization with educational capabilities
**Integration Points:** Loads independently, provides point selection interface for session planning

**Key Interfaces:**

- `<BodyModel3D />` - Main 3D model with point interactions
- `<PointInfoPanel />` - Detailed point information with school comparisons
- `<SchoolSelector />` - Therapy school switching interface

**Dependencies:**

- **Existing Components:** Card, Button for UI controls, loading states from current patterns
- **New Components:** None (isolated 3D system)

**Technology Stack:** three.js + @react-three/fiber with React.Suspense for loading states

### Component Interaction Diagram

```mermaid
graph TD
    A[DashboardLayout] --> B[ClientsTab]
    A --> C[SessionsTab]
    A --> D[VisualizationTab]
    A --> E[SettingsTab]

    B --> F[ClientList]
    B --> G[ClientForm]
    B --> H[ClientDetail]

    C --> I[SessionForm]
    C --> J[SessionHistory]
    C --> K[MarmaPointSelector]

    D --> L[BodyModel3D]
    D --> M[PointInfoPanel]
    D --> N[SchoolSelector]

    E --> O[ProfileForm] // Existing
    E --> P[PreferencesForm]

    I -.-> M // Session planning can reference point info
    K -.-> L // Point selector can embed 3D view
    H -.-> J // Client detail shows session history

    style O fill:#90EE90 // Existing component
    style A fill:#FFE4B5 // Modified component
```

---

## API Design and Integration

### API Integration Strategy

**API Integration Strategy:** Extend existing Supabase patterns without modification to core client setup. All new endpoints follow React Query integration established in `auth/profile-service.ts`.

**Authentication:** Leverage existing Supabase Auth session management. All new API calls automatically include user authentication via existing `src/lib/supabase.ts` client.

**Versioning:** No API versioning required (Supabase handles schema evolution). Database migrations handle schema changes with backward compatibility.

### New API Endpoints

#### Client Management API

- **Method:** GET
- **Endpoint:** `supabase.from('clients').select()`
- **Purpose:** Retrieve therapist's client list with filtering and search
- **Integration:** Uses existing Supabase client, follows React Query caching patterns

**Request:**

```typescript
// Via React Query hook
const { data: clients } = useQuery({
  queryKey: ['clients', therapistId],
  queryFn: () => clientService.getClients(),
});
```

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Client Name",
      "email": "client@example.com",
      "status": "active",
      "created_at": "2024-12-29T10:00:00Z",
      "last_session": "2024-12-20T14:30:00Z"
    }
  ],
  "count": 1
}
```

#### Session Documentation API

- **Method:** POST
- **Endpoint:** `supabase.from('sessions').insert()`
- **Purpose:** Create new therapy session records with marma point tracking
- **Integration:** Follows existing mutation patterns with optimistic updates

**Request:**

```typescript
// Via React Query mutation
const createSession = useMutation({
  mutationFn: sessionService.createSession,
  onSuccess: () => queryClient.invalidateQueries(['sessions']),
});
```

**Response:**

```json
{
  "data": {
    "id": "uuid",
    "client_id": "uuid",
    "session_date": "2024-12-29T15:00:00Z",
    "marma_points_used": ["marma_001", "marma_015"],
    "therapy_school": "ayurvedic",
    "session_notes": "Client responded well to treatment"
  }
}
```

---

## Source Tree Integration

### Existing Project Structure

```plaintext
frontend/src/
├── app/                    # Application routing and pages
│   └── pages/              # Route components
├── components/             # Shared UI components
│   └── ui/                 # shadcn/ui components
├── features/               # Feature modules
│   └── auth/               # Authentication (existing)
├── lib/                    # Utilities and configuration
└── __tests__/              # App-level tests
```

### New File Organization

```plaintext
frontend/src/
├── app/
│   ├── pages/
│   │   ├── dashboard.tsx           # Modified: tabbed navigation
│   │   └── dashboard/              # New: nested route components
│   │       ├── clients.tsx
│   │       ├── sessions.tsx
│   │       ├── visualization.tsx
│   │       └── settings.tsx
├── components/
│   ├── ui/                         # Existing shadcn/ui components
│   ├── navigation/                 # New: navigation components
│   │   ├── dashboard-tabs.tsx
│   │   └── tab-content.tsx
│   └── visualization/              # New: 3D specific components
│       ├── body-model-3d.tsx
│       ├── point-info-panel.tsx
│       └── school-selector.tsx
├── features/
│   ├── auth/                       # Existing authentication module
│   ├── clients/                    # New: client management
│   │   ├── components/
│   │   │   ├── client-list.tsx
│   │   │   ├── client-form.tsx
│   │   │   └── client-detail.tsx
│   │   ├── hooks/
│   │   │   └── use-clients.ts
│   │   ├── services/
│   │   │   └── client-service.ts
│   │   ├── schemas/
│   │   │   └── client-schemas.ts
│   │   └── __tests__/
│   ├── sessions/                   # New: session management
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── schemas/
│   │   └── __tests__/
│   └── visualization/              # New: 3D visualization
│       ├── components/
│       ├── hooks/
│       ├── services/
│       ├── assets/                 # 3D models and textures
│       └── __tests__/
└── types/                          # New: shared TypeScript definitions
    ├── client.ts
    ├── session.ts
    └── marma-point.ts
```

### Integration Guidelines

- **File Naming:** Maintain kebab-case for files, PascalCase for components, following existing `auth/` patterns
- **Folder Organization:** Each feature module mirrors `auth/` structure with components/, hooks/, services/, schemas/, **tests**/
- **Import/Export Patterns:** Barrel exports from feature modules, absolute imports from `src/` via existing path mapping

---

## Infrastructure and Deployment Integration

### Existing Infrastructure

**Current Deployment:** GitHub Pages static hosting with Vite production builds. Supabase provides backend services (database, auth, storage) via CDN.
**Infrastructure Tools:** GitHub Actions for CI/CD, Vite for bundling, npm for package management
**Environments:** Local development (port 5174), GitHub Pages production, Supabase test/production instances

### Enhancement Deployment Strategy

**Deployment Approach:** Maintain existing GitHub Pages deployment. 3D assets bundled with application and served as static files. No infrastructure changes required.

**Infrastructure Changes:** None required. 3D models stored in `public/models/` directory, served directly by GitHub Pages CDN.

**Pipeline Integration:** Existing `npm run build` process extended to optimize 3D assets. Bundle size monitoring added to CI pipeline to ensure < 500KB increase.

### Rollback Strategy

**Rollback Method:** Git-based rollback to previous commit. Feature flags for gradual rollout of tabbed interface enable quick disabling if issues arise.

**Risk Mitigation:** Database migrations include down-migration scripts. 3D visualization failures automatically fall back to 2D mode.

**Monitoring:** Browser error tracking for 3D rendering issues. Performance monitoring for bundle size and load times on GitHub Pages.

---

## Coding Standards and Conventions

### Existing Standards Compliance

**Code Style:** TypeScript strict mode, Prettier formatting, consistent with existing `auth/` module patterns
**Linting Rules:** ESLint configuration preserved. All new code must pass existing lint rules without configuration changes.
**Testing Patterns:** Vitest + Testing Library following `src/features/auth/__tests__/` patterns. Unit tests for components, integration tests for workflows.
**Documentation Style:** JSDoc for complex functions, TypeScript interfaces with descriptive comments, especially for therapy-specific terminology.

### Enhancement-Specific Standards

- **3D Component Standards:** All three.js components wrapped in React.Suspense with fallback loading states. Error boundaries for 3D rendering failures.
- **Wellness Component Standards:** All new UI components include wellness color variants and accessibility enhancements for therapeutic use.
- **Form Standards:** Session and client forms follow react-hook-form + zod patterns established in ProfileForm. Auto-save implemented for session documentation.

### Critical Integration Rules

- **Existing API Compatibility:** All Supabase client usage follows patterns in `src/lib/supabase.ts`. No modification to existing client configuration.
- **Database Integration:** Only additive schema changes. All migrations include rollback scripts and maintain foreign key relationships.
- **Error Handling:** 3D visualization errors caught and gracefully degraded. Network errors follow existing React Query retry patterns.
- **Logging Consistency:** Client-side error logging follows existing patterns. No console.log statements in production builds.

---

## Testing Strategy

### Integration with Existing Tests

**Existing Test Framework:** Vitest 3.2.4 with @testing-library/react 16.3.0. Jest DOM matchers for assertion enhancements.
**Test Organization:** Feature-based testing mirroring `src/features/auth/__tests__/` structure. Integration tests separate from unit tests.
**Coverage Requirements:** Maintain existing coverage standards. New feature modules require comprehensive test coverage matching auth module (~90%).

### New Testing Requirements

#### Unit Tests for New Components

- **Framework:** Vitest (existing)
- **Location:** Each feature module `__tests__/` directory following auth patterns
- **Coverage Target:** 90% minimum for new components, matching existing auth module standards
- **Integration with Existing:** Shared test utilities from `src/test-utils.tsx`, mock patterns from auth tests

#### Integration Tests

- **Scope:** Full user workflows (client creation → session planning → 3D point selection)
- **Existing System Verification:** All integration tests verify auth flow remains intact
- **New Feature Testing:** End-to-end testing of tabbed navigation, form submissions, 3D visualization loading

#### Regression Testing

- **Existing Feature Verification:** Automated tests ensure dashboard transformation doesn't break authentication, profile management
- **Automated Regression Suite:** CI pipeline runs full test suite on every commit. Performance regression tests for bundle size.
- **Manual Testing Requirements:** 3D visualization testing across browsers and devices. Accessibility testing with screen readers.

---

## Security Integration

### Existing Security Measures

**Authentication:** Supabase Auth with JWT tokens, session management via existing `useAuth` hook
**Authorization:** Row Level Security (RLS) on existing tables, user-scoped data access patterns established
**Data Protection:** HTTPS via GitHub Pages, secure headers configured, sensitive data stored in Supabase with encryption
**Security Tools:** ESLint security rules, Dependabot for dependency updates, no custom security implementations

### Enhancement Security Requirements

**New Security Measures:**

- RLS policies for new tables (clients, sessions) ensuring therapists only access their own data
- Input sanitization for therapy notes and client data using existing zod schemas
- 3D asset integrity validation to prevent malicious model loading

**Integration Points:**

- All new API calls use existing authenticated Supabase client
- Client and session data scoped to authenticated therapist via foreign key constraints
- File upload validation for future 3D model customization

**Compliance Requirements:**

- HIPAA considerations for client data storage (handled by Supabase compliance)
- GDPR compliance for EU therapists via Supabase data processing agreements
- Audit logging for client data access via Supabase built-in logging

### Security Testing

**Existing Security Tests:** Dependency vulnerability scanning, ESLint security rule enforcement
**New Security Test Requirements:**

- RLS policy testing for data isolation between therapists
- Input validation testing for therapy-specific data fields
- 3D asset loading security testing for malformed files

**Penetration Testing:** Third-party security assessment recommended for client data handling compliance

---

## Next Steps

### Story Manager Handoff

**For Story Manager Implementation:**

This frontend architecture provides the technical foundation for implementing the 6-story sequence defined in `docs/ui-enhancement-prd.md`. Key integration requirements validated:

- **Tabbed Navigation (Story 1.1)** - DashboardLayout component replaces card-based dashboard while preserving header and auth flow
- **Wellness Design System (Story 1.2)** - CSS custom property transformation maintains existing architecture while introducing therapeutic color palette
- **Feature Modules (Stories 1.3-1.5)** - `clients/`, `sessions/`, `visualization/` modules follow established `auth/` patterns for consistency

**First Story Priority:** Begin with Navigation Architecture Foundation (Story 1.1) as it provides the structural foundation for all subsequent feature implementations.

**Integration Checkpoints:** Each story includes verification that existing authentication and profile management remain functional throughout implementation.

### Developer Handoff

**For Implementation Team:**

Architecture based on comprehensive analysis of existing codebase patterns:

- **React Query Integration** - Follow patterns in `src/features/auth/profile-service.ts` for consistent error handling and caching
- **Component Patterns** - Extend shadcn/ui components following existing Button/Card/Input implementations
- **Form Validation** - Use react-hook-form + zod patterns established in ProfileForm for consistency

**Existing System Compatibility:**

- Authentication flow via `useAuth` hook must remain untouched
- Supabase client configuration in `src/lib/supabase.ts` requires no modification
- Profile management component must integrate seamlessly into new "Ustawienia" tab

**Implementation Sequencing:**

1. DashboardLayout with tab navigation (preserves existing functionality)
2. Database migrations (additive-only, with rollback scripts)
3. Feature module implementation (isolated development, parallel development possible)
4. 3D visualization (lazy-loaded, graceful degradation implemented)

**Risk Mitigation:** Each implementation phase includes comprehensive testing of existing functionality to ensure zero regression in authentication and profile management systems.

---

_This architecture ensures the transformation of Marmaid from placeholder interface to professional therapeutic application while maintaining the solid technical foundation and excellent development practices already established. The focus on incremental enhancement and compatibility preservation enables confident implementation of complex new features._
