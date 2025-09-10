# Marmaid Frontend

Frontend aplikacji Marmaid - narzędzie do wizualizacji punktów Marma dla terapeutów.

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS + shadcn/ui
- **Backend**: Supabase (Auth + Database)
- **Testing**: Vitest + Testing Library

## Development Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Supabase**:
   - Copy `.env.example` to `.env.local`
   - Create a Supabase project in EU region
   - Add your Supabase URL and anon key to `.env.local`:
     ```
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
  app/               # routing, layout
  components/        # shared UI components (shadcn/ui)
  features/
    auth/            # authentication logic and components
  lib/               # supabase client, utilities, helpers
  styles/            # additional styles (if needed)
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests with Vitest

## Development Standards

**IMPORTANT**: All code must follow our [Coding Standards](../docs/architecture/coding-standards.md), including:

- **E2E Test Selectors**: Use `data-testid` attributes with kebab-case naming for all interactive elements in E2E tests
- **Component Testing**: Prefer `getByTestId()` for stable test selectors
- **TypeScript**: Explicit typing, proper error handling, no `any` types
- **React**: Functional components, custom hooks, proper dependency arrays
- **Forms**: React Hook Form + Zod validation schemas