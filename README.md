# Focusify 🚀

Focusify is a comprehensive, full-stack productivity web application designed to help users manage their focus sessions, track distraction metrics, and build consistent work habits. Combining a sleek user interface, real-time audio ambient engines, and detailed analytics, Focusify empowers users to achieve their daily goals effectively.

---

## 📋 Table of Contents

1. [Features](#-features)
2. [Tech Stack](#-tech-stack)
3. [Project Directory Structure](#-project-directory-structure)
4. [Getting Started](#-getting-started)
   - [Prerequisites](#prerequisites)
   - [Backend Setup](#1-backend-setup)
   - [Frontend Setup](#2-frontend-setup)
5. [API Documentation](#-api-documentation)
6. [Deployment](#-deployment)
7. [License](#-license)

---

## ✨ Features

- **🔒 Authentication**: Secure user registration, login, token-based verification (JWT), and profile customization.
- **⏱️ Interactive Timer & Sessions**:
  - Customizable session name, duration, and target focus modes.
  - Real-time active focus timer with pause, resume, and stop controls.
  - Distraction logging to measure focus quality.
- **🎵 Ambient Sound Integration**: Built-in audio engine supporting various background soundtracks (e.g., Lo-fi, Rain, Cafe) to aid concentration.
- **📊 Progress & Analytics**:
  - Interactive history log showing past session outcomes.
  - Detailed statistics and performance scorecards (productivity ratings, focus trends, total focus time).
- **🌐 Internationalization (i18n)**: Full language support for both **English (EN)** and **Indonesian (ID)**.
- **⚙️ Advanced Settings**: Dark/light theme customization, notification and sound alerts toggle, and secure account deletion.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (built with Vite)
- **Routing**: React Router 7 (`BrowserRouter` for clean, modern URLs)
- **State Management**: React Context API (`AuthContext` & `LanguageContext`)
- **Styling**: Vanilla CSS (Responsive & Modern Layouts)
- **Utilities**: Axios (API Client)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas (via Mongoose ODM)
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs for password hashing
- **Middleware**: CORS, Express Validator (input validation)

---

## 📂 Project Directory Structure

```text
focusify-improve/
├── focusify-backend/          # Backend Node.js/Express Server
│   ├── src/
│   │   ├── config/            # Database Connection Setup
│   │   ├── controllers/       # Route Logic Handlers (auth, sessions, user)
│   │   ├── middleware/        # Authentication & Error Middleware
│   │   ├── models/            # Mongoose Schemas (User, Session, Settings)
│   │   ├── routes/            # REST API Endpoint Declarations
│   │   ├── utils/             # Helper Functions (JWT facade, DB operations)
│   │   └── server.js          # Backend Entry Point
│   ├── .env.example           # Example Backend Environment Config
│   ├── vercel.json            # Vercel Serverless Function Config
│   └── package.json           # Backend Dependencies & Scripts
│
├── src/                       # Frontend React Application
│   ├── assets/                # Images, Logos, and Static Media
│   ├── components/            # Reusable UI Components (Navbar, ProtectedRoute)
│   ├── contexts/              # Authentication & Internationalization Contexts
│   ├── hooks/                 # Custom React Hooks
│   ├── locales/               # Translations for Multi-language Support (EN & ID)
│   ├── pages/                 # Full Page Components (Dashboard, ActiveSession, Settings, etc.)
│   ├── services/              # API Client Interceptors & Data Migrators
│   ├── styles/                # CSS Styling Sheets
│   ├── utils/                 # Audio Engine & Utility Functions
│   ├── App.jsx                # Router Configurations & Page Layout Mapping
│   └── main.jsx               # Application Entry Point & Global Provider Setup
│
├── index.html                 # Main Single Page App Entry HTML
├── vercel.json                # Frontend Vercel Deploy & Rewrite Rules
└── package.json               # Frontend Dependencies & Scripts
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18.x or higher recommended)
- [npm](https://www.npmjs.com/) (bundled with Node.js)
- A running [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) Cluster or local MongoDB instance.

---

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd focusify-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   Copy the example file to a new `.env` file:
   ```bash
   cp .env.example .env
   ```
   Fill in the required fields inside `.env`:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   FRONTEND_URL=http://localhost:5173
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:5000` (or the configured `PORT`).

---

### 2. Frontend Setup

1. Return to the root folder:
   ```bash
   cd ..
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   Create a `.env` file in the root folder (or rename `.env.example`):
   ```env
   VITE_API_URL=http://localhost:5000
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser to view the application.

---

## 🔌 API Documentation

Detailed descriptions of the API endpoints can be found in the [focusify-backend/README.md](file:///c:/Users/Rafie%20Zaidan%20U/Downloads/focusify-improve/focusify-backend/README.md).

Here is a quick overview:
- **Authentication**: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`
- **Sessions**: `GET /api/sessions`, `POST /api/sessions`, `GET /api/sessions/stats`
- **User Settings**: `GET /api/user/settings`, `PUT /api/user/settings`

---

## 🌐 Deployment

### Frontend (Vercel)
The frontend uses the routing rewrite rule inside [vercel.json](file:///c:/Users/Rafie%20Zaidan%20U/Downloads/focusify-improve/vercel.json) to redirect all page routes directly to `index.html`. This ensures React Router navigates correctly without `404 Not Found` page errors:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Backend
The backend can be deployed to Vercel (using the provided serverless configurations), Railway, Heroku, or any VPS solution. Make sure to update the backend environment variables (`MONGO_URI`, `JWT_SECRET`, and `FRONTEND_URL`) to reflect production values.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
