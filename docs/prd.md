# Product Requirements Document (PRD) – Marmaid

## Introduction & Background

This project aims to deliver a **web-based application called _Marmaid_** that supports marma point therapists in managing clients, planning therapies, and tracking progress. The application addresses the common problem of therapists relying on memory or paper notes, which leads to inefficiencies and missed opportunities in treatment.

_Marmaid_ will allow therapists to maintain structured client records, adapt therapy plans according to different schools of marma therapy, and collect intake data digitally. In addition, the application will provide therapists with **access to information about marma points along with their visualization on the human body**, ensuring more accurate and professional therapy planning.

By doing so, _Marmaid_ reduces cognitive load, improves session continuity, and enhances the professional presentation of therapy practices. Over time, the app can also evolve into a communication bridge between therapist and client.

---

## Objectives & Goals

1. **Improve Client Management** – Provide therapists with a structured way to store and retrieve client information, session history, and therapy outcomes.
2. **Enhance Therapy Planning** – Enable planning and tracking of marma therapies across different schools, with point references and visualizations.
3. **Reduce Reliance on Memory** – Minimize the cognitive burden on therapists by offering digital recall of “what was done, what worked, and what remains to be tried.”
4. **Increase Professionalism** – Present therapists with modern digital tools, elevating the perception of their practice.
5. **Lay Groundwork for Therapist–Client Communication** – Create a foundation for future features, including secure communication and shared progress tracking.

---

## User Stories & Requirements

### Functional Requirements (User Stories)

- _As a therapist_, I want to **create and update client profiles** so I can track each client’s therapy journey.
- _As a therapist_, I want to **view a client’s full therapy history** so I can quickly recall what was done and what worked.
- _As a therapist_, I want to **record which marma points were worked on in a session** so I can avoid repetition and plan the next steps.
- _As a therapist_, I want to **see visualizations of marma points on the human body** so I can plan therapies more effectively.
- _As a therapist_, I want to **switch between different schools of marma therapy** so I can apply the approach that fits my training.
- _As a therapist_, I want to **send intake questionnaires to new clients** so I can gather health information systematically.
- _As a client_, I want to **fill out an intake questionnaire online** so my therapist has all my details before the first session.
- _As a therapist_, I want to **log in securely** so that client data is protected.
- _As a therapist_, I want to **access the app via a web browser** so I don’t need special software installed.

### Non-Functional Requirements

- **Performance**: The app should load within **3 seconds** on a standard broadband connection.
- **Usability**: Therapists should be able to **create a client profile and log a session in under 2 minutes**.
- **Data Security**: Client data must be **stored securely** in Supabase with authentication.
- **Scalability**: The app should support at least **20 active therapists** in the MVP, with easy scaling to 100+.
- **Reliability**: The app should achieve **>95% uptime** (Supabase/GitHub Pages baseline).

---

## MVP Definition

### MVP Inclusions (Must-Have Features)

1. **Client Management** – Create, edit, and view client profiles; store therapy history.
2. **Therapy Planning & Tracking** – Record marma points per session, access **custom graphics/3D models** of points on the human body, switch between therapy schools.
3. **Intake Questionnaire** – Therapist can send digital form, client completes online, responses stored in client profile.
4. **Hosting & Data Layer** – Frontend hosted on GitHub Pages; database and authentication via **Supabase Free Tier**.

### Deferred Features (Post-MVP)

- Therapist–Client communication (messaging, progress sharing)
- Analytics dashboard with client progress insights
- Scheduling & reminders
- Multi-language support
- Enhanced compliance & certifications (HIPAA-equivalent)

### MVP Success Criteria

- At least **5 therapists** able to use the system for real client management.
- Therapists can **log and review session data** without relying on memory.
- Therapists report at least **30% less time spent** on manual client tracking.

---

## Open Questions & Dependencies

### Open Questions

1. **Database Choice (Long-Term)**: Supabase confirmed for MVP. Should we later commit to **Supabase Pro** for stability, or explore alternatives (PocketBase, self-hosted Postgres)?
2. **Visualization Source**: Decided to use **custom graphics / 3D models** for marma points visualization.
3. **Therapist–Client Interaction**: What would client access involve? → Likely requires additional authentication layers, secure client portal, and clearer privacy rules.
4. **Intake Questionnaire Format**: For faster rollout, integrate with an external service (e.g., Google Forms/Typeform) initially, migrate to in-app forms later.
5. **Regulatory Needs**: Data compliance (e.g., HIPAA) postponed to later phases.

### Dependencies

- GitHub Pages + Supabase availability and free plan limits.
- Access to quality visuals/3D models of marma points.
- Willingness of early therapists to test MVP and provide feedback.
- UX clarity for switching between marma schools and visual point mapping.
