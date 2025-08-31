# Project Brief – Marma Therapy Support Web Application

## Executive Summary
This project introduces a **web application designed specifically for marma point therapists**. It helps practitioners **organize client information, plan therapy sessions, and track progress over time**. The app recognizes that different schools of marma therapy define points differently, so it allows therapists to **view and adapt therapy plans according to their preferred approach**.  

Therapists can also **collect intake data** from clients via digital questionnaires, making it easier to personalize treatment. Over time, the platform can evolve into a **communication tool between therapist and client**, strengthening trust and engagement.  

For therapists, the core value is **time saved, better client management, and more professional presentation of therapy plans**.  

---

## Problem Statement
Marma point therapists often rely on **memory, paper notes, or scattered spreadsheets** to keep track of client histories and therapy sessions. This creates a major challenge: therapists must remember **which marma points were worked on, what approaches proved effective, and which options remain unexplored** for each individual client.  

Without a structured tool, it is easy to lose continuity between sessions. Therapists risk either **repeating the same approaches unnecessarily** or **missing opportunities** to try new therapeutic points and methods. This lack of systematic record-keeping leads to inefficiencies, inconsistent client experiences, and reduced professional confidence.  

Existing solutions — such as generic note-taking apps or basic scheduling tools — fail to meet the **specific needs of marma therapy**, especially when accommodating differences between therapy schools. As a result, therapists face a growing need for a **dedicated digital platform** that supports therapy planning and client management in a way that reflects the realities of their daily practice.  

---

## Proposed Solution
We propose developing a **web-based application tailored for marma point therapists** that addresses the core challenges of client management and therapy planning. The solution will provide:  

- **Structured client records**  
- **Flexible therapy planning** across different schools of marma therapy  
- **Digital intake questionnaires**  
- **Session tracking** (what was done, what worked, what to try next)  
- **Future communication features** between therapist and client  

This solution will succeed where generic tools fall short because it is **purpose-built for marma therapy practice**. By combining structured data collection with flexible planning and tracking, the application will reduce therapist stress, improve continuity of care, and elevate the professional standard of therapy delivery.  

---

## Target Users

### Primary User Segment: Marma Point Therapists
- Manage multiple clients, often track progress informally  
- Need reliable recall of history, therapy plans, and variations by school  
- Goals: deliver more effective therapy, reduce cognitive load, and improve professionalism  

### Secondary User Segment: Therapy Clients
- Rely on therapist guidance, limited involvement in planning  
- Need confidence in therapist’s memory & professionalism  
- Goals: personalized care, clear sense of therapy progress  

---

## Goals & Success Metrics

**Business Objectives**  
- Reduce manual client management effort by 50%  
- Adoption by 10–20 therapists in first 6 months  
- Establish credibility as go-to marma therapy tool  

**User Metrics**  
- Instant recall of client history  
- 80% of sessions recorded digitally  
- >8/10 usability rating from therapists  

**KPIs**  
- Weekly Active Users (WAU)  
- Number of session logs per month  
- Client intake completion rate  
- Therapist retention at 3 months  

---

## MVP Scope

**Must-Have Features**  
1. Client Management (profiles, history)  
2. Therapy Planning & Tracking (points worked, results, next steps)  
3. Intake Questionnaire  
4. Hosting on GitHub Pages + Supabase Free Tier for database and auth  

**Deferred Features**  
- Therapist–Client communication  
- Analytics dashboard  
- Scheduling & reminders  
- Multi-language support  
- Advanced compliance/security  

---

## Technology Stack (MVP)

**Frontend**: React, TailwindCSS, hosted on GitHub Pages  
**Backend/Database**: Supabase Free Tier (Postgres, Auth, 500MB storage, 10k MAUs, realtime API)  
**Auth**: Supabase Auth (email login)  
**Scalability**: Upgrade path to Supabase Pro or migrate to self-hosted Postgres/PocketBase  

---

## Risks & Mitigations

- **Technical**: Free plan limits → plan upgrade path  
- **Security**: Sensitive client data → Supabase Auth + minimal data storage, privacy policy  
- **Adoption**: Resistance to change → focus on simplicity, clear benefits  
- **Market**: Small niche → start with core therapists, expand to adjacent wellness  

