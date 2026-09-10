# Vision2System 🚀

> **Design / Idea → Project Specification → Implementation Plan → Development**

Vision2System is a developer-focused MERN stack web application built for CSE portfolio presentations and software developer interviews. It helps developers organize UI designs, wireframe references, or website concepts, and transform them into structured, actionable full-stack implementation specifications.

---

## 🌟 Key Features

* **User Authentication**: Secure Signup, Login, Logout with `bcryptjs` password hashing, stateless `JWT` tokens, and `Google OAuth` integration.
* **Project Dashboard**: Developer workspace featuring project stats, real-time search filtering, and project cards.
* **Project Management (CRUD)**: Create, View, Edit, and Delete developer project specifications.
* **Design Reference Tracker**: Connect UI wireframes, Figma links, or screenshot URLs directly to target tech stack tags.
* **AI Implementation Plan**: Powered by Google Gemini AI API (`@google/generative-ai`) to generate structured implementation specifications:
  * Suggested Pages & Views
  * React Component Hierarchy
  * Frontend & Backend Requirements
  * Database Schema Collections
  * Step-by-Step Execution Roadmap
* **Export & Plan Viewer**: Interactive tabbed plan viewer with one-click JSON copy.

---

## 🛠️ Tech Stack

### Frontend
* **React 18** (Vite SPA)
* **Tailwind CSS** (Clean, developer-focused responsive styling)
* **React Router DOM v6** (Client-side routing)
* **Axios** (HTTP requests with JWT header interceptors)
* **@react-oauth/google** (Google OAuth client authentication)
* **Lucide React** (Modern clean icons)

### Backend
* **Node.js & Express.js** (REST API framework)
* **MongoDB & Mongoose** (Document database & ODM)
* **JWT & bcryptjs** (Authentication & password security)
* **google-auth-library** (Google ID token verification)
* **@google/generative-ai** (Google Gemini AI API SDK)

---

## 📐 Architecture Overview

```
React Frontend (Vite) ──[HTTP / Axios]──> Express REST API ──[Mongoose]──> MongoDB Database
                                                │
                                                └──[Gemini API]──> AI Plan Generation
```

### Data Request Lifecycle
`React UI → Axios Interceptor → Express Route → Auth Middleware → Controller → Mongoose → MongoDB → Response`

---

## 📁 Repository Directory Structure

```
vision2system/
├── backend/
│   ├── src/
│   │   ├── config/          # db.js (MongoDB connection)
│   │   ├── controllers/     # authController.js, projectController.js
│   │   ├── middleware/      # authMiddleware.js, errorMiddleware.js
│   │   ├── models/          # User.js, Project.js
│   │   ├── routes/          # authRoutes.js, projectRoutes.js
│   │   ├── utils/           # generateToken.js, aiService.js
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Server entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, ProtectedRoute, ProjectCard, PlanViewer
│   │   ├── context/         # AuthContext.jsx
│   │   ├── pages/           # Landing, Login, Register, Dashboard, CreateProject, ProjectDetails
│   │   ├── services/        # api.js
│   │   ├── App.jsx          # React Router & Providers
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   └── package.json
│
├── README.md
└── INTERVIEW_BOOKLET.md     # 📖 Complete 27-Section Interview Prep Booklet
```

---

## 🚦 Quick Start Guide

### 1. Prerequisites
* Node.js v18+ installed
* MongoDB running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas URI.

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```
Backend runs on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

---

## 🔑 Environment Variables

### Backend `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/vision2system
JWT_SECRET=vision2system_jwt_secret_key_2026
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_CLIENT_ID=your_google_client_id
```

### Frontend `.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 📖 Interview Booklet

For an exhaustive guide explaining every line of code, technical concepts, data flow, architecture diagrams, live demo checklists, and **50+ interview questions & answers**, please refer to:

👉 **[INTERVIEW_BOOKLET.md](./INTERVIEW_BOOKLET.md)**

---

## 🔮 Future Improvements

1. **Direct Screenshot Image Upload**: Support image uploads via Multer & Cloudinary/S3.
2. **Export Plan to PDF/Markdown**: Download implementation plans as `.md` or `.pdf` files.
3. **Public Share Links**: Generate read-only share links for project implementation plans.

---
*Created as a Senior CSE Portfolio Project.*
