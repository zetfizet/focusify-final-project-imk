# Focusify Backend API

Node.js + Express + MongoDB backend server untuk aplikasi Focusify.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Copy `.env.example` ke `.env` dan update nilai:

```bash
cp .env.example .env
```

Edit `.env`:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/focusify
JWT_SECRET=your_super_secret_key_here
PORT=5000
FRONTEND_URL=http://localhost:5174
```

### 3. Setup MongoDB Atlas

1. Buat account di [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster (free tier)
3. Create database user
4. Whitelist IP address
5. Get connection string
6. Paste ke `MONGO_URI` di `.env`

### 4. Start Server

```bash
# Development (dengan auto-reload)
npm run dev

# Production
npm start
```

Server akan running di `http://localhost:5000`

## API Documentation

### Authentication Routes

#### Register User
```
POST /api/auth/register
Body: { email, username, password }
Response: { token, refreshToken, user }
```

#### Login
```
POST /api/auth/login
Body: { email, password }
Response: { token, refreshToken, user }
```

#### Logout
```
POST /api/auth/logout
Headers: { Authorization: Bearer <token> }
```

#### Verify Token
```
POST /api/auth/verify
Headers: { Authorization: Bearer <token> }
```

#### Refresh Access Token
```
POST /api/auth/refresh-token
Body: { refreshToken }
Response: { token }
```

### Sessions Routes (Authenticated)

#### Get All Sessions
```
GET /api/sessions
Headers: { Authorization: Bearer <token> }
```

#### Get Single Session
```
GET /api/sessions/:id
Headers: { Authorization: Bearer <token> }
```

#### Create Session
```
POST /api/sessions
Headers: { Authorization: Bearer <token> }
Body: { name, duration, totalDuration, type, ambience, focusMode, startTime, endTime, timeLabel, distractions, status, score }
```

#### Update Session
```
PUT /api/sessions/:id
Headers: { Authorization: Bearer <token> }
Body: { ...fields_to_update }
```

#### Delete Session
```
DELETE /api/sessions/:id
Headers: { Authorization: Bearer <token> }
```

#### Bulk Create Sessions
```
POST /api/sessions/bulk/create
Headers: { Authorization: Bearer <token> }
Body: { sessions: [...] }
```

#### Get Session Stats
```
GET /api/sessions/stats?period=week
Headers: { Authorization: Bearer <token> }
Query: period = 'day' | 'week' | 'month' | 'all'
```

### User Routes (Authenticated)

#### Get Profile
```
GET /api/user/profile
Headers: { Authorization: Bearer <token> }
```

#### Update Profile
```
PUT /api/user/profile
Headers: { Authorization: Bearer <token> }
Body: { username, avatar, bio }
```

#### Get Settings
```
GET /api/user/settings
Headers: { Authorization: Bearer <token> }
```

#### Update Settings
```
PUT /api/user/settings
Headers: { Authorization: Bearer <token> }
Body: { theme, notifications_enabled, sound_enabled, ... }
```

#### Delete Account
```
DELETE /api/user/account
Headers: { Authorization: Bearer <token> }
Body: { password }
```

## Project Structure

```
focusify-backend/
├── src/
│   ├── config/
│   │   └── database.js (MongoDB connection)
│   ├── models/
│   │   ├── User.js
│   │   ├── Session.js
│   │   └── UserSettings.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── sessionController.js
│   │   └── userController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── sessions.js
│   │   └── user.js
│   ├── middleware/
│   │   ├── auth.js (JWT verification)
│   │   └── errorHandler.js
│   ├── utils/
│   │   └── jwt.js (Token generation/verification)
│   └── server.js (Entry point)
├── package.json
├── .env
└── .env.example
```

## Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **jsonwebtoken**: JWT token handling
- **bcryptjs**: Password hashing
- **cors**: Cross-Origin Resource Sharing
- **dotenv**: Environment variables
- **express-validator**: Input validation
- **nodemon**: Development auto-reload

## Deployment

### Option 1: Railway

1. Push code ke GitHub
2. Connect repository ke Railway
3. Add MongoDB Atlas connection string
4. Deploy!

### Option 2: Heroku

1. Create Heroku account
2. Install Heroku CLI
3. Run `heroku create`
4. Add environment variables: `heroku config:set MONGO_URI=...`
5. Deploy: `git push heroku main`

### Option 3: Self-hosted (AWS/DigitalOcean)

1. Setup VPS
2. Install Node.js
3. Install MongoDB
4. Clone repo
5. Setup environment variables
6. Use PM2 untuk manage process

## Security Best Practices

✅ Passwords hashed dengan bcryptjs (10 rounds)
✅ JWT tokens dengan expiry (15 min access, 7 days refresh)
✅ CORS configured untuk frontend only
✅ Input validation pada semua endpoints
✅ Error messages tidak expose sensitive info
✅ Unique indexes untuk email & username

## Environment Variables Checklist

- [ ] MONGO_URI (MongoDB connection string)
- [ ] JWT_SECRET (Random secure string)
- [ ] JWT_EXPIRY (15m untuk access token)
- [ ] REFRESH_TOKEN_EXPIRY (7d)
- [ ] PORT (5000 default)
- [ ] FRONTEND_URL (http://localhost:5174 untuk dev)
- [ ] NODE_ENV (development/production)

## Testing

Gunakan Postman atau Thunder Client untuk test APIs:

```json
// Register
POST http://localhost:5000/api/auth/register
{
  "email": "user@example.com",
  "username": "john_doe",
  "password": "SecurePass123"
}

// Login
POST http://localhost:5000/api/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123"
}

// Get Sessions (authenticated)
GET http://localhost:5000/api/sessions
Headers:
  Authorization: Bearer <token>
```

## Troubleshooting

### MongoDB Connection Error
- Check MONGO_URI is correct
- Verify IP whitelist in MongoDB Atlas
- Ensure username/password are URL encoded

### JWT Errors
- Check JWT_SECRET is set
- Verify token is not expired
- Ensure Bearer token format is correct

### CORS Errors
- Check FRONTEND_URL matches your frontend URL
- Verify credentials: true if needed

## Support

Untuk bantuan, buat issue di repository atau hubungi tim developer.

---

Happy coding! 🚀
