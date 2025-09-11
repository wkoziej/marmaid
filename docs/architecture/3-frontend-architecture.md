# 3. Frontend Architecture

**Struktura:**

```
src/
  app/               # routing, layout
  components/        # UI współdzielone (shadcn/ui)
  features/
    auth/            # logowanie, rejestracja, reset
    clients/         # listy, profil klienta, intake preview
    sessions/        # logowanie sesji, notatki, "what worked / next"
    planning/        # wybór szkoły, lista punktów, plan terapii
    viz3d/           # canvasy 3D, overlay punktów
    billing/         # Stripe checkout, status subskrypcji
    search/          # KB/RAG UI (wyszukiwarka punktów/objawów)
  lib/               # supabase client, helpers, auth guards
  styles/            # tailwind.css
```

**Wzorce:**

- **Protected routes** (guardy auth) – dostęp do danych tylko po zalogowaniu.
- **React Query** do synchronizacji z Supabase (useQuery/useMutation).
- **Formularze** RHF+Zod (schematy walidacji współdzielone z backendem tam gdzie możliwe).
- **Wizualizacja**:
  - 2D: SVG + warstwa adnotacji (nazwy, ID punktów, tooltipy).
  - 3D: react-three-fiber (GLTF/FBX model sylwetki), overlay punktów (XYZ, label, kolory wg szkoły).

---
