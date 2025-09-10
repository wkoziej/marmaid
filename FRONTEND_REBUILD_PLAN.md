# Frontend Rebuild Plan - Fresh Start

## Cel biznesowy
Przebudowa interfejsu użytkownika od podstaw w celu:
- **Naprawienia trudnych do namierzenia błędów** w obecnym kodzie
- **Implementacji pełnego testowania** od początku (TDD)
- **Uproszenia struktury** - przeniesienie z `frontend/` do root directory
- **Zapewnienia stabilności** przez proper CI/CD integration

## Architektura docelowa

### Struktura katalogów (root-based)
```
/
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── lib/
│   └── types/
├── public/
├── tests/
├── vite.config.ts
├── package.json
└── playwright.config.ts
```

### Tech Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: TailwindCSS 4
- **Testing**: Vitest (unit/integration) + Playwright (e2e)
- **Forms**: React Hook Form + Zod
- **State**: React Query + Context API
- **Database**: Supabase (bez zmian)

## Fazy implementacji

### FAZA 1: Fundament (1-2 dni)
**Cel**: Minimalna działająca aplikacja z informacjami systemowymi

#### Epic 1.1: Setup projektu
- Inicjalizacja Vite + React + TypeScript w root
- Konfiguracja TailwindCSS 4
- Setup ESLint + Prettier
- Podstawowy routing (React Router)

#### Epic 1.2: Build & Environment Info System
**User Story**: Jako developer chcę widzieć informacje o wersji i środowisku
- Build-time injection commit SHA, timestamp, branch
- Runtime environment detection (local/test/prod)
- Supabase endpoint detection i connection status
- Landing page wyświetlająca:
  - 🏷️ **Wersja aplikacji**: `commit-sha` + `build-timestamp`
  - 🌍 **Środowisko**: Local/Test/Production
  - 🗄️ **Baza danych**: URL + status połączenia + ping time

### FAZA 2: CI/CD Migration (1 dzień)
**Cel**: Zaktualizowane workflows działające z root structure

#### Epic 2.1: Workflow Updates
- Update `.github/workflows/multi-env-deploy.yml` dla root structure
- Zachowanie quality gates (lint, typecheck, tests, coverage)
- Build info injection w CI/CD pipeline
- Deploy verification z nową strukturą

### FAZA 3: Testing Infrastructure (1 dzień)
**Cel**: Kompletny setup testowy gotowy do TDD

#### Epic 3.1: Test Setup
- Vitest configuration (unit + integration)
- Playwright setup z proper selectors
- Coverage reporting (45% threshold)
- Test utils i helpers
- Pierwszy test: Landing page rendering

### FAZA 4: Supabase Integration (1 dzień)  
**Cel**: Podstawowa integracja z bazą danych

#### Epic 4.1: Database Connection
- Multi-environment Supabase client setup
- Connection health check component
- Error handling i retry logic
- Auth foundation (bez UI)

## Wartość biznesowa

### Immediate Benefits
1. **Debugging Capability**: Fresh codebase = easier error tracking
2. **Quality Assurance**: TDD from day 1 = fewer bugs
3. **Deployment Confidence**: Proper CI/CD = safe releases
4. **Monitoring**: Build info = better incident response

### Long-term Benefits
1. **Developer Productivity**: Clean architecture = faster development
2. **Maintainability**: Simple structure = easier changes
3. **Scalability**: Solid foundation = room for growth
4. **User Experience**: Stable app = happy users

## Strategie migracji

### Zero-Downtime Approach
1. **Parallel Development**: Nowa struktura w tym samym repo
2. **Feature Toggle**: Możliwość przełączania między old/new
3. **Gradual Migration**: Komponent po komponencie
4. **Rollback Ready**: Instant switch back jeśli problemy

### Data Continuity
- **Sessions**: Bez zmian (Supabase auth)
- **User Data**: Istniejące tabele bez modyfikacji
- **Migrations**: Zostawiamy obecne, nowe dodajemy po kolei

## Ryzyka i mitygacja

| Ryzyko | Prawdopodobieństwo | Impact | Mitygacja |
|--------|-------------------|--------|-----------|
| DNS/deployment disruption | Niskie | Wysokie | Parallel deploy + rollback plan |
| Quality gates failures | Średnie | Średnie | Careful workflow testing |
| User session loss | Niskie | Średnie | Supabase auth continuity |
| E2E test breakage | Wysokie | Niskie | New selector strategy |

## Success Metrics
- ✅ Landing page loading < 2s
- ✅ Build info accuracy 100%
- ✅ Environment detection 100%
- ✅ Database connection status real-time
- ✅ Test coverage > 45%
- ✅ Zero deployment failures
- ✅ CI/CD pipeline < 5 min

## Następne kroki
Po zakończeniu rebuildu fundamentu:
1. **Authentication UI** - Login/register forms
2. **User Management** - Profile, settings
3. **Core Features** - Stopniowa migracja z frontend/
4. **Advanced Testing** - Visual regression, performance
5. **Monitoring** - Error tracking, analytics

---

**Szacowany czas realizacji**: 4-6 dni roboczych
**Wymagane resources**: 1 Senior Frontend Developer
**Dependencies**: Obecne CI/CD secrets i environment variables