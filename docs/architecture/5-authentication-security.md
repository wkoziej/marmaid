# 5. Authentication & Security
- **Rejestracja / Logowanie**: Supabase Email/Password (opcjonalnie magic link/OAuth w przyszłości).  
- **Reset hasła**: wbudowany flow Supabase (e-mail + update hasła po tokenie), ekran w aplikacji do ustawienia nowego hasła.  
- **Role**: `therapist`, `client` (na przyszłość), `admin` (wewnętrzne).  
- **RLS + Policies**: rozdzielenie danych terapeuty i klienta; twarde ograniczenia zapytań.  
- **Szyfrowanie**: TLS w tranzycie (Supabase), rozważ **field-level encryption** dla szczególnie wrażliwych notatek.  
- **Region danych (RODO/GDPR)**: preferuj region UE w Supabase; polityka retencji i eksportu danych.

---
