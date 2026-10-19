# Vision2System 🚀
> **AI-Powered Product Idea to System Design Workspace**

Vision2System is an enterprise-grade, developer-focused MERN stack web application designed to turn product ideas, user stories, and wireframe concepts into rigorous, structured, and developer-ready software architectures.



---

## 🌟 Core System Capabilities

1. **Structured AI Architecture Generation (Phase 1)**:
   - Replaces unstructured AI text with strict JSON blueprints containing:
     - Executive Overview & Problem Statement
     - 3-Tier Architecture Topology & Node Mappings
     - Modular Service Breakdown with Responsibilities & File Paths
     - Exhaustive REST API Endpoint Suites (HTTP verbs, auth rules, headers, query params, request payloads, response contracts, possible errors)
     - Production Mongoose Database Schemas & Cardinality Relationships
     - Directory Trees & Synthesized File Manifest
     - Resilience & Error-Handling Strategy (HTTP codes, logging, retries)
     - Security & Access Control Policies
     - Phased Engineering Implementation Roadmap
   - Express backend validation using **Zod** (`ArchitectureBlueprintSchema`).
   - Dynamic domain-tailored fallback generator supporting Food Delivery, E-Commerce, Task Management, Healthcare/Booking, and custom applications.

2. **Interactive Software Architecture Visualizer (Phase 2)**:
   - Interactive diagram powered by **React Flow**.
   - Automatic conversion of validated architecture JSON into non-overlapping columnar layout nodes and edges.
   - Categorized node types (Client, API Server, Microservice, Database, External Service).
   - Zoom, pan, minimap, fit-to-screen, and deep-inspect slide-over drawer detailing endpoints, schemas, and source files.

3. **Architecture Consistency Validation & AI-Assisted Repair (Phase 3)**:
   - Consistency engine detecting critical errors, warnings, and informational suggestions:
     - Duplicate endpoints, missing HTTP methods, undefined models, broken foreign keys.
     - Potentially unprotected mutating routes, incomplete payloads, orphan connections.
   - Dedicated interactive **Consistency Panel** with error/warning counts and deep-links to diagram nodes.
   - Safe AI-assisted repair pipeline operating on staged in-memory clones.
   - Side-by-side before-and-after comparison modal requiring user confirmation before committing changes.

4. **Reliable Architecture Export (Phase 4)**:
   - Preview and export validated architectures as **RFC 8259 Standard JSON** and **GitHub Flavored Markdown (GFM)**.
   - Complete package bundles: metadata, modules, APIs, database schemas, directory trees, file descriptions, and validation findings.
   - Human-readable, sanitized slug filenames: `<project-slug>-architecture.json` / `.md`.
   - Safe JSON serializer with circular reference protection and parse verification (`JSON.parse`).
   - One-click copy to clipboard with visual feedback and safe browser downloads.
   - Backend download endpoint: `GET /api/projects/:id/export?download=true`.

5. **Automated Testing & AI Quality Dashboard (Phase 6)**:
   - Standardized 8-case evaluation dataset across Food Delivery, E-Commerce, Task Management, Healthcare Booking, and failure edge cases.
   - Measures real latency, structural Zod schema validation rate, and semantic domain fidelity.
   - Transparent API token and cost accounting (clear disclaimer when using deterministic mock runs).
   - Clear distinction between syntactic structural validity and semantic architectural correctness.
   - Interactive test runner with filtering and failure inspection.

6. **Authentication & Project Management**:
   - Secure local registration and login with `bcryptjs` password hashing and stateless `JWT` tokens.
   - Real Google OAuth integration via `@react-oauth/google` and server-side verification using `google-auth-library`.
   - Workspace project dashboard with instant search filtering, project deletion, and renaming.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 (Vite SPA)
- **Styling**: Tailwind CSS (dark mode `slate-950` / `slate-900`)
- **Diagrams**: React Flow (`reactflow` v11)
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios with JWT interceptors
- **Authentication**: `@react-oauth/google`
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js & Express.js (ES Modules)
- **Database**: MongoDB & Mongoose ODM
- **Schema Validation**: Zod
- **AI Engine**: Google Gemini 1.5 Flash (`@google/generative-ai`)
- **Security**: JWT (`jsonwebtoken`), Bcrypt (`bcryptjs`), Google Auth (`google-auth-library`), CORS
- **Testing**: Node.js native test runner (`node:assert`)

---

## 📐 Architecture & Data Flow

```
                      ┌─────────────────────────────────────────┐
                      │          React 18 SPA (Vite)            │
                      │  Dashboard | Visualizer | Export | AI   │
                      └────────────────────┬────────────────────┘
                                           │ HTTPS / Axios (Bearer JWT)
                                           ▼
                      ┌─────────────────────────────────────────┐
                      │          Express.js REST API            │
                      │  Auth | Projects | Export | Evaluation  │
                      └────────────┬───────────────┬────────────┘
                                   │               │
                 Mongoose ODM / DB │               │ Gemini SDK
                                   ▼               ▼
                      ┌──────────────────┐   ┌──────────────────┐
                      │  MongoDB Atlas   │   │  Google Gemini   │
                      │  Users, Projects │   │  1.5 Flash AI    │
                      └──────────────────┘   └──────────────────┘
```

---

## 📁 Repository Directory Structure

```
vision2system/
├── backend/
│   ├── src/
│   │   ├── config/              # db.js (MongoDB connection)
│   │   ├── controllers/         # authController, projectController, evaluationController
│   │   ├── middleware/          # authMiddleware, errorMiddleware
│   │   ├── models/              # User.js, Project.js
│   │   ├── routes/              # authRoutes, projectRoutes, evaluationRoutes
│   │   ├── services/            # aiService, consistencyValidator, architectureRepairService, exportService
│   │   ├── evaluation/          # evaluationDataset, evaluationRunner, semanticEvaluator, versionComparator
│   │   ├── validators/          # architectureSchema.js (Zod)
│   │   ├── app.js               # Express application configuration
│   │   └── server.js            # HTTP server startup
│   ├── tests/                   # aiValidation.test.js, consistencyValidator.test.js, export.test.js, evaluationSuite.test.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Navbar, ProtectedRoute, ProjectCard, ArchitectureDiagram,
│   │   │                        # ConsistencyValidationPanel, ArchitectureRepairModal, ExportPreviewPanel
│   │   ├── context/             # AuthContext.jsx
│   │   ├── pages/               # Landing, Login, Register, Dashboard, CreateProject, ProjectDetails, AiQualityDashboard
│   │   ├── services/            # api.js (Axios baseURL configuration)
│   │   ├── utils/               # diagramLayout, exportGenerator, markdownGenerator
│   │   ├── tests/               # diagramTransform.test.js, consistencyValidation.test.js, export.test.js, qualityDashboard.test.js
│   │   ├── App.jsx              # React Router & Providers
│   │   └── main.jsx
│   └── package.json
│
├── package.json                 # Monorepo workspaces definition and unified test/build scripts
└── README.md
```

---

## 🚦 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.x or v20.x+
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017/vision2system`) or MongoDB Atlas URI.
- **Gemini API Key**: (Optional for production generation; deterministic fallback generators run automatically if key is omitted).

### 2. Installation
From the repository root:
```bash
npm install
```

### 3. Backend Setup
1. Copy or create `backend/.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/vision2system
   JWT_SECRET=vision2system_production_secret_key_2026
   GEMINI_API_KEY=your_gemini_api_key_here
   GOOGLE_CLIENT_ID=your_google_client_id_here
   CLIENT_URL=http://localhost:5173
   ```
2. Start the backend:
   ```bash
   npm run dev:backend
   ```
   Backend listens at `http://localhost:5000`.

### 4. Frontend Setup
1. Copy or create `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   ```
2. Start the frontend:
   ```bash
   npm run dev:frontend
   ```
   Frontend opens at `http://localhost:5173`.

### 5. Running Full Development Environment Concurrently
```bash
npm run dev
```

---

## 🧪 Testing Instructions

Vision2System features a comprehensive, non-flaky test suite requiring zero external network calls:

### Run All Tests (Monorepo Root)
```bash
npm test
```

### Run Backend Tests Only (21 Tests)
```bash
npm run test:backend
# Or: npm test --prefix backend
```
- `aiValidation.test.js`: Schema validation, domain fallbacks, prompt divergence, markdown generation.
- `consistencyValidator.test.js`: Defect detection, safe repair copy immutability, repair re-validation.
- `export.test.js`: Filename slug generation, file manifest extraction, complete JSON bundle structure, strict parseability, markdown formatting with manifest and findings, graceful fallback on null input.
- `evaluationSuite.test.js`: Evaluation dataset integrity, semantic scoring, version comparator diff engine, end-to-end evaluation runner, cache retrieval.

### Run Frontend Tests Only (18 Tests)
```bash
npm run test:frontend
# Or: npm test --prefix frontend
```
- `diagramTransform.test.js`: Category mapping, non-overlapping columnar layout, metadata enrichment, orphan edge filtering, graceful empty synthesis.
- `consistencyValidation.test.js`: Severity classification, tab filtering, staged repair safety.
- `export.test.js`: Filenames, file manifest extraction (11+ documented files), live architecture mirroring, circular reference guard, 10-section markdown spec, non-browser download fallback.
- `qualityDashboard.test.js`: Real metric calculations, token transparency, structural vs semantic distinction, dashboard filtering mechanics.

### Run Production Builds
```bash
npm run build
```
- Compiles backend syntax check (`node --check src/server.js`).
- Compiles frontend production bundle with Vite (`vite build`).

---

## 🔑 Environment Variables Reference

| Variable | Scope | Purpose | Example |
| :--- | :--- | :--- | :--- |
| `PORT` | Backend | HTTP server port | `5000` |
| `MONGODB_URI` | Backend | MongoDB connection string | `mongodb://localhost:27017/vision2system` or Atlas URI |
| `JWT_SECRET` | Backend | HMAC secret for signing auth tokens | Long secure random string |
| `GEMINI_API_KEY` | Backend | Google Gemini API key | `AIzaSy...` (kept securely on backend) |
| `GOOGLE_CLIENT_ID` | Backend | Google ID token verification | `123456789.apps.googleusercontent.com` |
| `CLIENT_URL` | Backend | Allowed CORS origin for production | `https://your-app.vercel.app` |
| `VITE_API_URL` | Frontend | Backend API base URL | `https://your-api.onrender.com/api` (or `http://localhost:5000/api`) |
| `VITE_GOOGLE_CLIENT_ID`| Frontend | Google OAuth client ID | `123456789.apps.googleusercontent.com` |

> [!WARNING]
> Never expose `JWT_SECRET` or `GEMINI_API_KEY` in frontend `.env` or client code. Frontend only requires `VITE_API_URL` and `VITE_GOOGLE_CLIENT_ID`.

---

## ⚠️ Known Limitations & Design Boundaries

1. **Structural Validation vs. Semantic Production Readiness**:
   - Automated consistency validation and Zod schema verification guarantee syntactic and structural integrity.
   - Schema conformity does not automatically guarantee production-level business logic security or third-party uptime. Human architecture review remains recommended.
2. **Deterministic Mock vs. Live Gemini Calls**:
   - By default, evaluation runs and local unit tests operate in deterministic mock mode to prevent flakiness and unnecessary API costs.
   - When running live with `GEMINI_API_KEY`, API rate limits (15 RPM on free tier) apply.
3. **Download Execution Environment**:
   - Browser downloads use `Blob` and `URL.createObjectURL`. In non-browser (Node.js/headless) environments, the utility fails gracefully and returns `{ success: false }` with a clear explanation.

---

## 🌐 Manual Deployment Steps

### Backend (Render / Railway)
1. Create a Web Service pointing to the root or `backend` folder.
2. Build Command: `npm install && npm run build --workspace=backend` (or `cd backend && npm install`).
3. Start Command: `node src/server.js` (or `npm start`).
4. Set Environment Variables: `PORT`, `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `GOOGLE_CLIENT_ID`, `CLIENT_URL`.
5. Health Check Path: `/` or `/api/health`.

### Frontend (Vercel / Netlify)
1. Create a New Project pointing to `frontend` as the Root Directory.
2. Framework Preset: **Vite**.
3. Build Command: `npm run build` (`vite build`).
4. Output Directory: `dist`.
5. Set Environment Variables:
   - `VITE_API_URL`: Your deployed Render API URL ending in `/api` (e.g. `https://vision-2-system.onrender.com/api`).
   - `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID.
