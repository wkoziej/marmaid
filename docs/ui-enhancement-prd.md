# Marmaid UI Enhancement Brownfield PRD

## Intro Project Analysis and Context

### Analysis Source
✅ **Document-project output available**: Fresh brownfield analysis completed at `docs/brownfield-ui-architecture.md`

### Current Project State
**Extracted from "High Level Architecture" and "Technical Summary":**

Marmaid is a **Single Page Application (SPA)** built with React 19 + TypeScript, using Vite 7.1.2 as build tool. The frontend is a solid foundation with excellent development practices, featuring:

- **Working Systems**: Complete authentication module with Supabase integration, shadcn/ui component library, React Query for state management
- **Current State**: Dashboard contains 4 placeholder cards ("Klienci", "Sesje", "Wizualizacja", "Ustawienia") with only profile management functional
- **Architecture**: Feature-based organization with `features/auth/` fully implemented, but missing core therapy modules

### Available Documentation Analysis
✅ **Document-project analysis available** - using existing technical documentation

**Key documents created by document-project:**
- ✅ Tech Stack Documentation
- ✅ Source Tree/Architecture  
- ✅ API Documentation (Supabase integration)
- ✅ Technical Debt Documentation
- ✅ Brownfield UI Architecture Analysis

### Enhancement Scope Definition

#### Enhancement Type
- ✅ **UI/UX Overhaul** - Primary focus
- ✅ **New Feature Addition** - Client management, session planning, 3D visualization
- ✅ **Integration with New Systems** - 3D libraries (three.js, react-three-fiber)

#### Enhancement Description
Transform the current placeholder dashboard into a fully functional therapeutic application with tabbed navigation, enabling therapists to manage clients, plan therapy sessions, and visualize marma points through interactive 3D/2D models with a wellness-focused design system.

#### Impact Assessment  
- ✅ **Significant Impact** (substantial existing code changes)
  - Complete dashboard redesign from cards to tabs
  - New routing architecture (nested routes)
  - Three new feature modules implementation
  - Design system transformation from generic to wellness theme

### Goals and Background Context

#### Goals
- Transform placeholder dashboard into functional tabbed interface
- Enable therapists to manage client profiles and therapy history
- Provide interactive 3D/2D visualization of marma points by therapy school
- Implement session planning and tracking capabilities
- Establish wellness-focused design language replacing generic styling
- Maintain existing authentication and technical foundation

#### Background Context
The current Marmaid application has a solid technical foundation with working authentication, but the core therapy management functionality exists only as disabled placeholder cards. Therapists need a professional interface that supports their daily workflow: managing multiple clients, planning therapy sessions with specific marma points, and tracking progress over time. The enhancement will transform this foundation into a production-ready therapeutic application while preserving all existing functionality and architectural patterns.

### Change Log
| Change | Date | Version | Description | Author |
|--------|------|---------|-------------|---------|
| Initial | 2024-12-29 | 1.0 | UI Enhancement PRD Creation | BMad Master |

---

## Requirements

*These requirements are based on my understanding of your existing system (analyzed in docs/brownfield-ui-architecture.md) and your stated goals for tabbed navigation, client management, session planning, and interactive 3D visualization. Please review carefully and confirm they align with your project's reality.*

### Functional

**FR1**: The existing dashboard placeholder cards will be replaced with a tabbed navigation interface supporting "Klienci", "Sesje", "Wizualizacja", and "Ustawienia" sections without breaking current authentication flow.

**FR2**: A complete client management system will be implemented allowing therapists to create, edit, view, and search client profiles with therapy history integration.

**FR3**: Session planning interface will enable therapists to document therapy sessions, select marma points by therapy school, and track "what worked/what to try next" notes.

**FR4**: Interactive 3D visualization will display human body models with clickable marma points, allowing therapists to explore point definitions across different therapy schools.

**FR5**: 2D body diagram visualization will provide pan/zoom capabilities with overlay annotations for marma point identification and school variations.

**FR6**: Digital intake questionnaire system will allow therapists to send forms to clients and review completed responses within client profiles.

**FR7**: Nested routing system will support deep-linking to specific tabs (e.g., `/dashboard/clients`, `/dashboard/sessions/new`) while maintaining browser navigation functionality.

**FR8**: Design system will transform from generic gray theme to wellness-focused color palette with therapeutic visual language.

### Non Functional

**NFR1**: Enhancement must maintain existing authentication performance and not exceed current page load times by more than 500ms.

**NFR2**: 3D visualization must render smoothly on standard laptops with 60fps performance for models up to 10,000 vertices.

**NFR3**: New feature modules must follow existing architecture patterns established in `features/auth/` module including React Query integration and comprehensive test coverage.

**NFR4**: UI responsiveness must support desktop-first design with tablet compatibility (768px+) while maintaining touch-friendly interactions for therapy visualization.

**NFR5**: Code organization must maintain existing TypeScript strict mode, ESLint configuration, and Vitest testing standards.

**NFR6**: Bundle size increase must not exceed 500KB gzipped for new 3D dependencies and visualization features.

### Compatibility Requirements

**CR1: Existing API Compatibility**: All current Supabase integrations (authentication, profile management) must remain functional without modification to database schema or existing API calls.

**CR2: Component Library Compatibility**: New UI components must extend existing shadcn/ui patterns and Tailwind CSS configuration without breaking current styling system.

**CR3: UI/UX Consistency**: New tabbed interface must maintain current header layout, user information display, and logout functionality while integrating seamlessly with existing ProfileForm component.

**CR4: Build System Compatibility**: Enhancement must work with existing Vite configuration, TypeScript settings, and npm scripts without requiring changes to build pipeline.

---

## User Interface Enhancement Goals

### Integration with Existing UI

New tabbed navigation will extend the current dashboard layout by replacing the 2x2 card grid with a horizontal tab bar below the existing header. The header (containing "Marmaid Dashboard" title, user email, and logout button) will remain unchanged to maintain navigation consistency. All new components will utilize the established shadcn/ui component patterns and CSS variable system defined in `src/index.css`.

### Modified/New Screens and Views

**Modified Screens:**
- `src/app/pages/dashboard.tsx` - Transform from card layout to tabbed interface with route-based navigation

**New Screens:**
- `/dashboard/clients` - Client management interface with list view, detail view, and forms
- `/dashboard/sessions` - Session planning with marma point selection and note-taking
- `/dashboard/visualization` - 3D/2D marma point visualization interface  
- `/dashboard/settings` - Extended settings beyond current profile management

### UI Consistency Requirements

- All new interfaces must use existing Button, Card, Input, and form components from `src/components/ui/`
- Color scheme transformation must maintain CSS custom property architecture for theme switching capability
- Typography hierarchy must follow current heading and text size patterns established in Tailwind configuration
- Interactive elements must maintain current focus states and accessibility patterns
- Loading states must use existing spinner patterns from current dashboard loading screen

---

## Technical Constraints and Integration Requirements

### Existing Technology Stack

**Extracted from brownfield analysis "Actual Tech Stack" table:**

| Category | Technology | Version | Constraints |
|----------|------------|---------|-------------|
| Runtime | React | 19.1.1 | Latest React with concurrent features |
| Build | Vite | 7.1.2 | Port conflicts auto-resolve 5173→5174 |
| Styling | TailwindCSS | 4.1.12 | CSS @layer architecture must be preserved |
| UI Components | shadcn/ui | Custom | Extend existing Button/Card/Input patterns |
| State Management | @tanstack/react-query | 5.85.6 | Follow existing query patterns and error handling |
| Forms | react-hook-form + zod | 7.62.0 + 4.1.5 | Use established validation schemas |
| Routing | react-router-dom | 7.8.2 | Extend to nested routing architecture |
| Backend | @supabase/supabase-js | 2.56.1 | Maintain existing client configuration |

### Integration Approach

**Database Integration Strategy**: Extend existing Supabase client configuration without modification. New feature modules will follow React Query patterns established in `src/features/auth/profile-service.ts` for consistent error handling and caching.

**API Integration Strategy**: All new API calls will use the existing Supabase client from `src/lib/supabase.ts`. Database schemas will be additive-only to maintain compatibility with existing authentication and profile functionality.

**Frontend Integration Strategy**: New feature modules will follow the established `features/` architecture with components, hooks, services, and test files. Routing will extend existing React Router setup with nested route configuration.

**Testing Integration Strategy**: Each new feature module will include comprehensive test coverage following patterns in `src/features/auth/__tests__/`. Integration tests will verify new features work alongside existing authentication flow.

### Code Organization and Standards

**File Structure Approach**: Follow existing `features/{module}/` pattern with components/, hooks/, services/, schemas/, and __tests__/ subdirectories. UI components will extend `src/components/ui/` library.

**Naming Conventions**: Maintain existing PascalCase for components, camelCase for functions/variables, kebab-case for files. New feature modules will use consistent naming: `clients`, `sessions`, `visualization`.

**Coding Standards**: Preserve existing TypeScript strict mode, ESLint configuration, and Prettier formatting. All new code must pass current lint rules without configuration changes.

**Documentation Standards**: Follow existing JSDoc patterns for complex functions. Component props must include TypeScript interfaces with descriptive comments for therapy-specific terminology.

### Deployment and Operations

**Build Process Integration**: Enhancement must work with existing `npm run build` process. New 3D dependencies will be analyzed for bundle impact and lazy-loaded if necessary to maintain performance.

**Deployment Strategy**: Maintain GitHub Pages deployment target. Static assets for 3D models will be stored in `public/` directory following existing asset organization.

**Monitoring and Logging**: Extend existing error boundary patterns to new feature modules. 3D visualization errors will be caught and gracefully degraded to 2D mode when necessary.

**Configuration Management**: Supabase configuration will remain in existing `src/lib/supabase.ts`. New feature-specific configuration will use environment variables following established patterns.

### Risk Assessment and Mitigation

**Technical Risks**: 
- 3D performance on lower-end devices - Mitigation: Implement fallback to 2D mode and lazy loading
- Bundle size increase from three.js - Mitigation: Code splitting and selective imports
- Routing complexity with nested routes - Mitigation: Gradual migration and comprehensive testing

**Integration Risks**:
- Breaking existing authentication flow - Mitigation: Comprehensive integration tests and auth flow verification
- Profile management conflicts - Mitigation: Extend existing ProfileForm without modification
- Supabase schema evolution - Mitigation: Additive-only database changes

**Deployment Risks**:
- GitHub Pages static hosting limitations - Mitigation: Ensure all 3D assets are properly bundled
- Port conflicts in development - Mitigation: Document port switching behavior and update scripts

**Mitigation Strategies**: 
- Feature flags for gradual rollout of new UI components
- Comprehensive test coverage before each integration step
- Regular verification that existing auth and profile functionality remains intact

---

## Epic and Story Structure

### Epic Approach

**Epic Structure Decision**: Single comprehensive epic with rationale: This UI enhancement represents a cohesive transformation of the dashboard interface and core therapy functionality. While it involves multiple features (clients, sessions, visualization), they are tightly integrated and share common navigation/design patterns. A single epic ensures consistency in design implementation and allows for coordinated testing of the complete user workflow from authentication through therapy management.

*Based on my analysis of your existing project, I believe this enhancement should be structured as a single epic because the tabbed interface, feature modules, and design system transformation are interdependent and need coordinated implementation to deliver a cohesive therapeutic application. Does this align with your understanding of the work required?*

---

## Epic 1: Dashboard UI Transformation and Core Therapy Features

**Epic Goal**: Transform placeholder dashboard into functional therapeutic application with tabbed navigation, client management, session planning, and interactive marma point visualization while maintaining existing authentication foundation.

**Integration Requirements**: Preserve all existing Supabase integration, authentication flow, and profile management functionality. Ensure seamless integration between new tabbed navigation and current header/logout system.

*This story sequence is designed to minimize risk to your existing system by implementing foundational changes first, then building features incrementally. Does this order make sense given your project's architecture and constraints?*

### Story 1.1: Navigation Architecture Foundation

As a **therapist using the application**,  
I want **a tabbed navigation interface replacing the current card layout**,  
so that **I can easily switch between client management, session planning, and visualization features**.

#### Acceptance Criteria
1. Dashboard header remains unchanged with existing "Marmaid Dashboard", user email, and logout functionality
2. Card grid is replaced with horizontal tab navigation containing "Klienci", "Sesje", "Wizualizacja", "Ustawienia" tabs
3. Browser URL updates to reflect active tab (e.g., `/dashboard/clients`) with proper routing support
4. Tab navigation is responsive and maintains accessibility standards
5. Profile management functionality migrates seamlessly to "Ustawienia" tab

#### Integration Verification  
- **IV1: Existing Authentication Flow**: Login/logout and user session management continue to work without modification
- **IV2: Profile Management Integration**: Existing ProfileForm component renders correctly within new "Ustawienia" tab
- **IV3: Performance Impact**: Tab switching occurs within 100ms without impacting page load performance

### Story 1.2: Design System Wellness Transformation  

As a **therapist expecting professional therapeutic software**,  
I want **a wellness-focused design theme instead of generic gray styling**,  
so that **the application feels appropriate for therapeutic practice**.

#### Acceptance Criteria
1. CSS custom properties updated to wellness color palette (soft greens, warm beiges, calming blues)
2. Button, Card, and Input components reflect therapeutic/wellness aesthetic
3. Typography hierarchy enhanced for professional readability  
4. Dark mode support maintained with wellness color adaptations
5. Accessibility contrast ratios preserved or improved

#### Integration Verification
- **IV1: Component Compatibility**: All existing UI components (auth forms, profile management) render correctly with new styling
- **IV2: CSS Architecture Preservation**: Tailwind CSS configuration and CSS variable system remain functional
- **IV3: Cross-browser Consistency**: New styling works across Chrome, Firefox, Safari without regression

### Story 1.3: Client Management Core Implementation

As a **therapist managing multiple clients**,  
I want **a complete client management interface in the "Klienci" tab**,  
so that **I can create, edit, and track client profiles and therapy history**.

#### Acceptance Criteria  
1. Client list view with search/filter capabilities and responsive layout
2. Client detail view with comprehensive profile information and therapy history
3. Add/edit client forms using existing form patterns (react-hook-form + zod)
4. Client data persistence through Supabase following existing API patterns
5. Integration point for future intake questionnaire responses

#### Integration Verification
- **IV1: Database Schema Compatibility**: New client tables integrate with existing Supabase setup without affecting auth tables
- **IV2: Form Pattern Consistency**: Client forms follow established validation and error handling from ProfileForm
- **IV3: React Query Integration**: Client data fetching uses established caching and error retry patterns

### Story 1.4: Session Planning Interface

As a **therapist planning therapy sessions**,  
I want **session planning tools in the "Sesje" tab**,  
so that **I can document sessions, select marma points, and track therapy progress**.

#### Acceptance Criteria
1. Session creation form with client selection, date/time, and notes fields
2. Marma point selection interface with therapy school variations
3. Session history view integrated with client profiles  
4. "What worked/what to try next" note-taking functionality
5. Session data persistence and relationship with client records

#### Integration Verification
- **IV1: Client Integration**: Session creation properly links to existing client records
- **IV2: Data Consistency**: Session data follows established TypeScript patterns and validation schemas
- **IV3: Performance Optimization**: Session lists render efficiently with proper pagination/virtualization

### Story 1.5: 3D Visualization Core Implementation

As a **therapist exploring marma point locations**,  
I want **interactive 3D body visualization in the "Wizualizacja" tab**,  
so that **I can explore point locations and variations across therapy schools**.

#### Acceptance Criteria
1. Three.js integration with react-three-fiber for 3D human body model
2. Clickable marma points with hover states and information overlays
3. Therapy school selection to display different point variations
4. Smooth 3D model rotation, zoom, and pan interactions
5. Fallback to 2D mode for performance-constrained devices

#### Integration Verification  
- **IV1: Bundle Size Impact**: 3D libraries are code-split and don't impact initial page load beyond 500KB
- **IV2: Performance Compatibility**: 3D rendering doesn't interfere with existing React Query and form functionality
- **IV3: Error Boundary Integration**: 3D visualization errors are caught and handled gracefully without breaking the application

### Story 1.6: Enhanced Settings and Configuration

As a **therapist customizing the application**,  
I want **expanded settings beyond profile management**,  
so that **I can configure therapy preferences and application behavior**.

#### Acceptance Criteria
1. Existing profile management integrated into comprehensive settings interface
2. Therapy school preference selection affecting visualization defaults
3. Application preferences (theme toggle, default views, notification settings)
4. Settings data persistence integrated with user profile system
5. Export/import functionality for client data backup

#### Integration Verification
- **IV1: Profile Management Preservation**: Existing ProfileForm functionality works identically within new settings structure
- **IV2: Preference Application**: Settings changes properly affect other feature modules (visualization, session planning)
- **IV3: Data Migration Safety**: Settings expansion doesn't impact existing user profile data or authentication 