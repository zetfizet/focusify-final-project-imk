# 🔒 Focusify Security & Production Deployment Guide

## ✅ Current Security Status

### ✅ ALREADY IMPLEMENTED
- [x] Password hashing with bcryptjs (10 salt rounds)
- [x] JWT token authentication (access + refresh tokens)
- [x] CORS configured for frontend origin only
- [x] Input validation (email, password length, username)
- [x] Protected routes with auth middleware
- [x] Error handling middleware
- [x] Token refresh on 401 (auto in frontend)
- [x] Rate limiting (5 attempts per 15 min for auth endpoints)
- [x] Security headers with Helmet
- [x] Request size limits (10KB)

### ⚠️ CRITICAL BEFORE PRODUCTION
- [ ] 1. **Update JWT_SECRET** - Use secure random string
- [ ] 2. **Setup MongoDB Atlas** - Switch from localhost
- [ ] 3. **Environment Variables** - Configure for production
- [ ] 4. **Update FRONTEND_URL** - Use production domain
- [ ] 5. **Enable HTTPS** - Vercel auto-enables
- [ ] 6. **Test all endpoints** - Before deployment

---

## 🚀 Step-by-Step Production Deployment

### STEP 1: Update Backend .env for Production

**Before (Development):**
```env
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/focusify
JWT_SECRET=focusify_super_secret_key_change_in_production_12345
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
FRONTEND_URL=http://localhost:5174
```

**After (Production):**
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/focusify?retryWrites=true&w=majority
JWT_SECRET=<GENERATE_SECURE_RANDOM_STRING>
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
FRONTEND_URL=https://focusify.vercel.app
LOG_LEVEL=info
```

### Generate Secure JWT_SECRET

Run this in Node.js:
```javascript
require('crypto').randomBytes(32).toString('hex')
// Output: 3a5f8b2c9e1d4a7f6b2c5e8a1f4d7a9c3b6e1f4a7d2c5e8a1b4f7a0d3c6e9f2
```

Or use online: https://generate-random.org/crypto-random-string-generator

### STEP 2: Setup MongoDB Atlas

1. **Create Free Account:**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up (free tier available)

2. **Create Cluster:**
   - Click "Build a Database"
   - Select "Free Tier" (shared)
   - Choose region close to users
   - Wait 5-10 minutes for creation

3. **Get Connection String:**
   - Click "Databases" → Click cluster
   - Click "Connect" button
   - Select "Drivers"
   - Copy connection string
   - Replace `<username>` and `<password>`
   - Add `/focusify` at end for database name

4. **Whitelist IP (Security):**
   - In MongoDB Atlas → Network Access
   - Add IP Access List
   - For Vercel: Add `0.0.0.0/0` (allow all, but JWT protects)

### STEP 3: Create Environment Variables on Vercel

1. **Deploy Backend to Vercel:**
   ```bash
   cd focusify-backend
   npm install -g vercel
   vercel
   ```

2. **Set Environment Variables:**
   - Go to Vercel Dashboard
   - Select backend project
   - Settings → Environment Variables
   - Add all production env vars from Step 1
   - Redeploy

3. **Get Backend URL:**
   - Vercel assigns: `https://focusify-backend.vercel.app`
   - This is your `BACKEND_URL` for frontend

### STEP 4: Update Frontend .env

Create `.env.production`:
```env
VITE_API_URL=https://focusify-backend.vercel.app
VITE_ENVIRONMENT=production
```

### STEP 5: Deploy Frontend to Vercel

```bash
cd focusify-improve
vercel
```

Vercel automatically:
- ✅ Builds with Vite
- ✅ Enables HTTPS/SSL
- ✅ Sets security headers
- ✅ Enables compression
- ✅ Provides CDN

---

## 🔐 Security Checklist for Production

### Backend Security
- [x] Rate limiting on auth endpoints (5 per 15 min)
- [x] Helmet security headers installed
- [x] Password hashing with bcryptjs
- [x] JWT validation on protected routes
- [x] CORS restricted to frontend domain
- [x] Error messages hide sensitive info
- [x] Request body size limited (10KB)
- [ ] MongoDB Atlas SSL connection enabled (auto)
- [ ] Secure JWT_SECRET configured
- [ ] NODE_ENV=production set

### Frontend Security  
- [x] Tokens stored in localStorage (XSS risk, but standard for SPAs)
- [x] Auto redirect to login on 401
- [x] Tokens cleared on logout
- [x] Auto token refresh before expiry
- [ ] Production .env configured
- [ ] CSP headers reviewed (handled by backend)

### Database Security
- [ ] MongoDB Atlas whitelisting configured
- [ ] Database backups enabled
- [ ] MongoDB encryption enabled (Atlas auto)
- [ ] Admin credentials secured

### Network Security
- [x] HTTPS/SSL (Vercel auto-enables)
- [x] CORS properly configured
- [ ] Backend & Frontend on same auth origin

---

## 🚨 Common Production Issues & Fixes

### Issue #1: "Invalid Token" on Production
**Cause:** Different JWT_SECRET on deploy
**Fix:** Ensure same JWT_SECRET in all deployments
```bash
vercel env list  # Check env vars
```

### Issue #2: "CORS Error" on Login
**Cause:** Frontend URL in CORS doesn't match
**Fix:** Update `FRONTEND_URL` in backend .env
```env
FRONTEND_URL=https://focusify.vercel.app
```

### Issue #3: "Cannot connect to MongoDB"
**Cause:** IP not whitelisted or connection string wrong
**Fix:** 
1. MongoDB Atlas → Network Access → Add IP
2. Check connection string format
3. Verify username/password

### Issue #4: "Rate Limited" immediately
**Cause:** Rate limiter too strict or IP detection wrong
**Fix:** Adjust in `src/middleware/rateLimiter.js`
```javascript
max: 10  // Increase from 5
```

---

## ✅ Post-Deployment Testing

### Test 1: Registration Flow
```bash
curl -X POST https://focusify-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "TestPassword123"
  }'
```
Expected: `201 Created` with tokens

### Test 2: Login Flow
```bash
curl -X POST https://focusify-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```
Expected: `200 OK` with tokens

### Test 3: Protected Endpoint
```bash
curl -X GET https://focusify-backend.vercel.app/api/user/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
Expected: `200 OK` with user profile

### Test 4: Cross-Device Login
1. Login on Device A → Copy token
2. Login on Device B with same account → Should work
3. Create session on Device A
4. Check session appears on Device B → Data migration working

---

## 📊 Security Headers Added (Helmet)

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

---

## 🔄 Future Security Improvements

1. **Email Verification:** Verify email before account active
2. **Password Reset:** Secure password recovery flow
3. **Refresh Token Rotation:** Rotate on each refresh
4. **Session Management:** Track active sessions, revoke from other devices
5. **2FA:** Two-factor authentication support
6. **Audit Logging:** Log all auth events
7. **IP Whitelisting:** Optional per-account IP restrictions

---

## 📝 Summary: Is it Production Ready?

| Aspect | Status | Notes |
|--------|--------|-------|
| Auth System | ✅ Ready | JWT + bcryptjs implemented |
| Database | ⚠️ Needs Setup | MongoDB Atlas required |
| Security | ✅ Good | Rate limit + Helmet added |
| HTTPS | ✅ Vercel Auto | No config needed |
| Environment | ⚠️ Needs Config | Update env vars |
| Monitoring | ❌ Missing | Consider: Sentry, LogRocket |
| Backups | ❌ Missing | Setup MongoDB Atlas backups |

**Estimated Time to Production:** 30-60 minutes
- Setup MongoDB Atlas: 10 min
- Deploy backend: 10 min
- Update env vars: 5 min
- Deploy frontend: 5 min
- Testing: 10-20 min

---

## ⚠️ IMPORTANT REMINDERS

1. **NEVER** commit JWT_SECRET to GitHub (use .gitignore)
2. **ALWAYS** use HTTPS in production (Vercel auto-enables)
3. **NEVER** store passwords in plain text (bcryptjs required)
4. **ALWAYS** validate input on backend (already done)
5. **NEVER** expose database credentials (use env vars)
6. **ALWAYS** use strong JWT_SECRET (32+ characters)
7. **ALWAYS** test login/register before going live
8. **NEVER** disable CORS in production

---

For questions: Check MongoDB Atlas docs or Vercel deployment guide
