# Tesseract: Civic Hazard Intelligence & Municipal Dispatch System
**Hyper-Local Urban Defect Surveillance, 3D GIS Radar, and AI Photo-Verified Remediation**

---

## 1. Executive Summary

**Tesseract** is a hyper-local civic infrastructure intelligence network designed to identify, triage, dispatch, and forensic-audit public road hazards across urban transit corridors. By uniting commuter ground intelligence with municipal public works squads, Tesseract mitigates dangerous urban hazards (e.g., uncovered drainage manholes, dangling live cables, deep road craters, and severe waterlogging) before fatal accidents occur.

### Key Innovations:
- **Interactive 3D Tesseract Hypercube Terminal:** Real-time 4D-to-3D stereographic projection engine built on Three.js and WebGL for role-based authentication (Citizens & Municipal Officers).
- **Dual-Engine Mapping (Google Maps & Tactical GIS Sonar Radar):** High-precision geospatial hazard tracking with automated quota defense and offline fallback plotting.
- **Multimodal AI Vision & Forensic Audit (Gemini 3.8 Flash):** Instant photo severity scoring upon hazard reporting and cryptographic photo comparison before closing public work tickets.
- **Municipal Priority Triage Queue:** Real-time priority ranking based on severity score (0–100), commuter traffic exposure, and emergency containment response times.
- **Public Proof of Fix Ledger:** Immutable before-and-after audit logs proving every repair was completed with permanent municipal-grade materials.
- **Voice Dictation & Speech Parsing:** Hands-free spoken field hazard logging via Gemini audio intelligence.

---

## 2. System Architecture & Tech Stack

### 2.1 Technology Stack Matrix

| Layer | Technologies | Purpose |
|---|---|---|
| **Frontend Framework** | React 19, TypeScript, Vite 8 | Single Page Application (SPA) architecture |
| **Styling & UI Design** | Tailwind CSS v4, Plus Jakarta Sans, Syne, JetBrains Mono | Editorial high-density municipal dispatch interface |
| **3D Graphics & Math** | Three.js (r186), WebGL | 4D hypercube stereographic projection & interactive login portal |
| **Geospatial & Mapping** | Google Maps Platform (`@vis.gl/react-google-maps`) | Live GIS map pins, directional heading pointer, Tactical Radar grid |
| **Backend & Middleware** | Express 4.21, Node.js / tsx | REST API, static asset proxying, Gemini server proxy |
| **Multimodal Vision & AI** | Google GenAI SDK (`@google/genai`, `gemini-3.8-flash`) | Photo hazard classification, severity scoring, forensic repair auditing |
| **Voice Processing** | Web Speech API, Gemini Speech Analysis | Real-time spoken hazard transcription & structured data extraction |

---

## 3. Core API Endpoints

### 3.1 Civic Hazard Endpoints

- `GET /api/hazards`: Retrieve all active and resolved hazards with optional filters for category and status.
- `POST /api/hazards`: Submit a new road hazard with photo and GPS coordinates.
- `POST /api/hazards/:id/confirm`: Commuter verification (+1 vote) boosting priority score.
- `PATCH /api/hazards/:id/status`: Municipal officer dispatch assignment and status updates.
- `POST /api/hazards/:id/verify-repair`: Finalize ticket resolution with contractor repair photo and forensic audit.

### 3.2 AI Vision & Audio Endpoints

- `POST /api/hazard/analyze-photo`: Gemini 3.8 Flash analysis of uploaded defect photo returning structured JSON (category, severity 0–100, danger factors, recommended actions).
- `POST /api/hazard/verify-fix`: Forensic comparison of before-and-after photos assessing repair permanence and municipal compliance.
- `POST /api/hazard/transcribe-voice`: Natural language voice note transcription and structured parameter extraction.

### 3.3 Municipal Ward Analytics

- `GET /api/ward-stats`: Public works performance KPIs, active hazard counts, response velocity, and photo verification compliance rates.

---

## 4. Security & Privacy

- Client-side credentials remain protected; all Gemini SDK invocations run through server-side Express proxies with sanitization.
- Clean JSON extraction handles potential markdown fences gracefully.
- Dual-role authentication segregates citizen reporting permissions from municipal dispatch and inspector authorization.
