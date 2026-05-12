# Focusify Backend Architecture & Authentication System

## Overview

Sistem dengan 2 fase user:
1. **Guest Mode** (Tanpa Login) - Data temporary di localStorage
2. **Authenticated Mode** (Login/Register) - Data persistent di backend

---

## 1. Data Storage Strategy

### Guest User (Tidak Login)
```
Browser LocalStorage
├── focusify_sessions: []
├── focusify_active_session: {}
├── focusify_last_session: {}
└── focusify_user_settings: {}

⏰ Lifetime: Session browser saja
🔄 Clear saat: Browser ditutup/localStorage dihapus
📱 Sync: Hanya di device itu, tidak sync ke device lain
```

### Authenticated User (Login/Register)
```
Backend Database
├── User Collection/Table
│   ├── user_id (UUID)
│   ├── email (unique)
│   ├── password_hash
│   ├── username
│   ├── created_at
│   └── updated_at
│
├── Session Collection/Table
│   ├── session_id (UUID)
│   ├── user_id (FK)
│   ├── name
│   ├── duration
│   ├── totalDuration
│   ├── type (Pomodoro/Custom)
│   ├── ambience
│   ├── focusMode
│   ├── startTime
│   ├── endTime
│   ├── timeLabel
│   ├── distractions
│   ├── status (done/partial)
│   ├── score (0-100)
│   └── created_at
│
├── User Settings Collection/Table
│   ├── user_id (FK)
│   ├── theme (light/dark)
│   ├── notifications_enabled
│   ├── sound_enabled
│   └── updated_at

⏰ Lifetime: Permanent (sampai user delete account)
🔄 Clear saat: User delete account atau logout
📱 Sync: Accessible dari any device setelah login
```

---

## 2. Backend Technology Stack (Recommended)

### Option A: Firebase (Easiest for startup)
```
Frontend ↔ Firebase Authentication ↔ Firestore Database
                                   ↔ Cloud Functions (optional)

Pros:
- No backend server needed
- Built-in authentication
- Real-time database
- Auto-scaling
- Easy to setup

Cons:
- Vendor lock-in
- Pricing based on usage
- Limited customization
```

### Option B: Node.js + Express + MongoDB (Most flexible)
```
Frontend ↔ API Server (Express.js) ↔ MongoDB
                                  ↔ Redis (cache)
                                  ↔ JWT Auth

Pros:
- Full control
- Scalable
- Open source
- Standard tech stack

Cons:
- Need to manage server
- More infrastructure needed
- More code to write
```

### Option C: Supabase (Firebase alternative)
```
Frontend ↔ Supabase Auth ↔ PostgreSQL Database
                       ↔ REST/GraphQL API

Pros:
- Open source Firebase
- PostreSQL power
- Built-in auth
- Easy to deploy

Cons:
- Smaller community than Firebase
- Less UI polish than Firebase
```

---

## 3. Recommended: Node.js + Express + MongoDB Setup

### 3.1 Backend Project Structure
```
focusify-backend/
├── src/
│   ├── config/
│   │   ├── database.js (MongoDB connection)
│   │   ├── environment.js (env variables)
│   │   └── auth.js (JWT configuration)
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Session.js
│   │   └── UserSettings.js
│   │
│   ├── routes/
│   │   ├── auth.js (login, register, logout)
│   │   ├── sessions.js (CRUD operations)
│   │   ├── profile.js (user profile)
│   │   └── analytics.js (statistics)
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── sessionController.js
│   │   └── userController.js
│   │
│   ├── middleware/
│   │   ├── auth.js (JWT verification)
│   │   ├── errorHandler.js
│   │   └── validation.js
│   │
│   ├── utils/
│   │   ├── jwt.js (generate/verify tokens)
│   │   ├── passwordHash.js (bcrypt)
│   │   └── validators.js
│   │
│   └── server.js (main entry)
│
├── package.json
├── .env
└── .env.example
```

### 3.2 API Endpoints

#### Authentication
```
POST   /api/auth/register
       Body: { email, password, username }
       Response: { token, user: { id, email, username } }

POST   /api/auth/login
       Body: { email, password }
       Response: { token, user: { id, email, username } }

POST   /api/auth/logout
       Headers: { Authorization: Bearer <token> }
       Response: { success: true }

POST   /api/auth/refresh-token
       Body: { refreshToken }
       Response: { token }

POST   /api/auth/verify
       Headers: { Authorization: Bearer <token> }
       Response: { valid: true, user: {...} }
```

#### Sessions Management
```
GET    /api/sessions
       Headers: { Authorization: Bearer <token> }
       Response: [ {...session1}, {...session2}, ... ]

POST   /api/sessions
       Headers: { Authorization: Bearer <token> }
       Body: { name, duration, type, ambience, ... }
       Response: { session_id, ...session_data }

GET    /api/sessions/:id
       Headers: { Authorization: Bearer <token> }
       Response: {...session_data}

PUT    /api/sessions/:id
       Headers: { Authorization: Bearer <token> }
       Body: { ...updated_fields }
       Response: {...updated_session}

DELETE /api/sessions/:id
       Headers: { Authorization: Bearer <token> }
       Response: { success: true }

GET    /api/sessions/analytics/daily
       Headers: { Authorization: Bearer <token> }
       Query: { date: 'YYYY-MM-DD' }
       Response: { sessions_count, total_duration, avg_score }

GET    /api/sessions/analytics/weekly
       Headers: { Authorization: Bearer <token> }
       Response: { week_data: {...}, monthly_data: {...} }
```

#### User Profile
```
GET    /api/user/profile
       Headers: { Authorization: Bearer <token> }
       Response: { id, email, username, created_at, stats }

PUT    /api/user/profile
       Headers: { Authorization: Bearer <token> }
       Body: { username, email, ... }
       Response: { ...updated_user }

PUT    /api/user/settings
       Headers: { Authorization: Bearer <token> }
       Body: { theme, notifications_enabled, ... }
       Response: { ...updated_settings }

DELETE /api/user/account
       Headers: { Authorization: Bearer <token> }
       Response: { success: true }
```

### 3.3 Database Models (MongoDB)

#### User Model
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  username: String,
  password: String (bcrypt hashed),
  avatar: String (optional),
  bio: String (optional),
  created_at: Date,
  updated_at: Date,
  last_login: Date,
  is_active: Boolean,
  plan: String (free/pro/premium)
}
```

#### Session Model
```javascript
{
  _id: ObjectId,
  user_id: ObjectId (FK to User),
  name: String,
  duration: Number (minutes),
  totalDuration: Number (minutes),
  type: String (Pomodoro/Custom),
  ambience: String,
  focusMode: Boolean,
  startTime: Date (ISO),
  endTime: Date (ISO),
  timeLabel: String (HH:MM),
  distractions: Number,
  status: String (done/partial),
  score: Number (0-100),
  tags: [String] (optional),
  notes: String (optional),
  created_at: Date,
  updated_at: Date
}
```

#### UserSettings Model
```javascript
{
  _id: ObjectId,
  user_id: ObjectId (FK to User, unique),
  theme: String (light/dark),
  notifications_enabled: Boolean,
  sound_enabled: Boolean,
  break_reminder: Boolean,
  distraction_warning: Boolean,
  daily_target: Number (default: 4),
  language: String (en/id),
  created_at: Date,
  updated_at: Date
}
```

---

## 4. Frontend + Backend Sync Strategy

### 4.1 Registration Flow
```
User Input Registration Form
↓
Frontend: POST /api/auth/register
         { email, password, username }
↓
Backend: Hash password → Create user → Generate JWT token
↓
Response: { token, user: {...} }
↓
Frontend: Store token in:
         - localStorage: jwt_token
         - sessionStorage: jwt_token (optional)
         - httpOnly cookie (recommended)
↓
Set Authorization header:
- All future requests: Headers: { Authorization: "Bearer <token>" }
```

### 4.2 Login Flow
```
User Input Login Form
↓
Frontend: POST /api/auth/login
         { email, password }
↓
Backend: Verify password → Generate JWT token
↓
Response: { token, user: {...}, sessions: [...] }
↓
Frontend: Store token (same as registration)
↓
Migrate localStorage data to backend:
1. Get current localStorage sessions
2. POST /api/sessions/bulk with all local sessions
3. Clear localStorage (optional: keep for offline)
4. Fetch fresh data from backend
5. Update UI with server data
```

### 4.3 Data Sync Strategy

**Option A: Full Sync (Clear Local, Use Server)**
```
After Login:
1. ✅ Backup localStorage data
2. ✅ Fetch all sessions from backend
3. ✅ Replace localStorage with backend data
4. ✅ Clear backup
5. ✅ UI updates from server data

Pros: Single source of truth
Cons: Local data might be overwritten
```

**Option B: Merge Sync (Merge Local + Server)**
```
After Login:
1. ✅ Get localStorage sessions
2. ✅ Get backend sessions
3. ✅ Merge by date (newer wins)
4. ✅ POST missing sessions to backend
5. ✅ Update localStorage with merged data
6. ✅ UI shows complete history

Pros: No data loss
Cons: Complex logic, conflict resolution needed
```

**Option C: Hybrid (Recommended)**
```
localStorage behavior:
- Always keep copy of data locally for offline support
- Use as cache
- Verify with backend on load

After Login:
1. ✅ Check if localStorage has sessions not in backend
2. ✅ Sync new local sessions to backend
3. ✅ Fetch latest from backend
4. ✅ Update localStorage with server as source of truth
5. ✅ During session: save locally + queue for backend
6. ✅ On sync: send all to backend, get response

Offline Support:
- User can create sessions offline
- When online: sync to backend
- Backend returns processed data (timestamps, scoring)
```

---

## 5. Implementation Steps

### Phase 1: Setup Backend (Week 1)
- [ ] Initialize Node.js project
- [ ] Setup Express server
- [ ] Connect MongoDB
- [ ] Create User & Session models
- [ ] Implement authentication (JWT)
- [ ] Create API endpoints
- [ ] Add input validation
- [ ] Add error handling

### Phase 2: Frontend Auth Integration (Week 1-2)
- [ ] Create Login page
- [ ] Create Register page
- [ ] Add auth context/state management
- [ ] Implement localStorage for tokens
- [ ] Add logout functionality
- [ ] Protect routes (authenticated only)
- [ ] Add 404/redirect for unauthenticated users

### Phase 3: Data Sync (Week 2-3)
- [ ] Create sync service
- [ ] Implement localStorage → Backend migration
- [ ] Add offline support
- [ ] Queue failed requests
- [ ] Retry logic for failed syncs
- [ ] Conflict resolution

### Phase 4: Testing & Deployment (Week 3-4)
- [ ] Unit tests (backend APIs)
- [ ] Integration tests (auth flow)
- [ ] E2E tests (full user journey)
- [ ] Deploy backend (Heroku/Railway/Render)
- [ ] Update frontend API endpoints
- [ ] Test production flow

---

## 6. Security Considerations

```
✅ Password Security
   - Hash with bcrypt (rounds: 10-12)
   - Validate password strength
   - Min 8 chars, special chars, numbers

✅ JWT Security
   - Use RS256 (asymmetric) for production
   - Short expiry (15 min access token)
   - Refresh tokens (7 days)
   - httpOnly cookies (prevent XSS)
   - CSRF protection

✅ API Security
   - CORS properly configured
   - Rate limiting on auth endpoints
   - Input validation
   - SQL injection prevention (Mongoose helps)
   - HTTPS only in production

✅ Data Privacy
   - Encrypt sensitive fields (password hashed already)
   - PII protection
   - GDPR compliance (data export, deletion)

✅ Authentication Flow
   - Secure logout (invalidate tokens)
   - Session management
   - Device tracking (optional)
   - Login notifications (optional)
```

---

## 7. Environment Variables (.env)

```
# Database
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/focusify

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5174

# Optional
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

---

## 8. Deployment Options

### Option 1: Firebase (Easiest)
- Frontend: Vercel/Netlify (free)
- Backend: Firebase (pay-as-you-go)
- Setup time: 30 minutes

### Option 2: Heroku + MongoDB Atlas
- Frontend: Vercel/Netlify (free)
- Backend: Heroku (free tier available)
- Database: MongoDB Atlas (free tier)
- Setup time: 1-2 hours

### Option 3: Railway + MongoDB Atlas
- Frontend: Vercel/Netlify (free)
- Backend: Railway ($5/month minimum)
- Database: MongoDB Atlas (free tier)
- Setup time: 1-2 hours

### Option 4: Render + PostgreSQL
- Frontend: Vercel/Netlify (free)
- Backend: Render (free tier available)
- Database: PostgreSQL (free tier)
- Setup time: 1-2 hours

---

## 9. State Management Changes

### Before (Guest User)
```javascript
// useContext/Redux
const [sessions, setSessions] = useState([])
// Read/Write from localStorage
// No authentication needed
```

### After (With Backend)
```javascript
// useContext/Redux + API calls
const [sessions, setSessions] = useState([])
const [user, setUser] = useState(null)
const [isAuthenticated, setIsAuthenticated] = useState(false)
const [isLoading, setIsLoading] = useState(false)

// Functions:
- login(email, password) → POST /api/auth/login
- register(email, username, password) → POST /api/auth/register
- logout() → POST /api/auth/logout
- fetchSessions() → GET /api/sessions
- createSession(sessionData) → POST /api/sessions
- updateSession(id, data) → PUT /api/sessions/:id
- deleteSession(id) → DELETE /api/sessions/:id
```

---

## 10. Next Steps

1. **Choose Backend Technology**: Firebase, Node+MongoDB, atau Supabase
2. **Create Backend Project**: Setup dengan struktur di atas
3. **Implement Auth APIs**: Login, Register, Token Refresh
4. **Create Frontend Auth Pages**: Login & Register components
5. **Add State Management**: Auth context untuk manage user state
6. **Implement Data Sync**: Migration dari localStorage ke backend
7. **Test Integration**: End-to-end testing
8. **Deploy**: Backend dulu, kemudian frontend

---

## 11. Quick Start: Recommended Stack

**Use Firebase** jika:
- Ingin cepat, minimal setup
- Tidak punya budget infrastructure
- Fokus pada frontend development

**Use Node+Express+MongoDB** jika:
- Ingin kontrol penuh
- Rencana fitur complex
- Ingin scalable dari awal
- Punya tim backend

---

**Siap lanjut dengan yang mana?** 
