# 🚀 FOCUSIFY - PRODUCTION DEPLOYMENT GUIDE

**Status:** Ready for Vercel Deployment  
**Date:** May 12, 2026  
**Environment:** Production

---

## 📋 CREDENTIALS & CONFIGURATION

### MongoDB Atlas Setup ✅
```
Connection String:
mongodb+srv://rafzdfizet_db_user:L3ZAjNyZGCshsxt0@focusify.lh7ipm1.mongodb.net/focusify?retryWrites=true&w=majority

Database Name: focusify
Username: rafzdfizet_db_user
Password: L3ZAjNyZGCshsxt0
```

### Backend Security ✅
```
JWT_SECRET: 5b4b9bd79f77d4453a8abbc4db321603ce03983389dfe1a2ef54ce9ea40a0ad9
NODE_ENV: production
PORT: 5000
```

---

## 🔐 ENVIRONMENT VARIABLES FOR VERCEL

### Backend Environment Variables (Copy to Vercel)

**Variable 1: MONGO_URI**
```
Name: MONGO_URI
Value: mongodb+srv://rafzdfizet_db_user:L3ZAjNyZGCshsxt0@focusify.lh7ipm1.mongodb.net/focusify?retryWrites=true&w=majority
```

**Variable 2: JWT_SECRET**
```
Name: JWT_SECRET
Value: 5b4b9bd79f77d4453a8abbc4db321603ce03983389dfe1a2ef54ce9ea40a0ad9
```

**Variable 3: NODE_ENV**
```
Name: NODE_ENV
Value: production
```

**Variable 4: FRONTEND_URL**
```
Name: FRONTEND_URL
Value: https://focusify.vercel.app
(Update this after frontend deployment with actual URL)
```

**Variable 5: LOG_LEVEL**
```
Name: LOG_LEVEL
Value: info
```

---

## 🔄 DEPLOYMENT STEPS

### Step 1: Check GitHub is Ready
```bash
# Go to backend folder
cd focusify-backend

# Check git status
git status

# Commit any changes
git add .
git commit -m "Add production security configuration"

# Push to GitHub
git push origin main
```

### Step 2: Deploy Backend to Vercel

**Option A: Using Vercel CLI**
```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd focusify-backend
vercel --prod
```

When prompted:
```
? Set up and deploy "focusify-backend"? [Y/n] → Y
? Link to existing project? [y/N] → N (unless you already deployed)
? What's your project's name? → focusify-backend
? In which directory is your code located? → .
? Want to modify these settings? [y/N] → N
```

**Option B: Using Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Click "Import Project"
3. Connect GitHub repository
4. Select "focusify-backend" folder as root
5. Add Environment Variables (see section above)
6. Click "Deploy"

### Step 3: Get Backend URL

After deployment, Vercel will show:
```
✅ Production: https://focusify-backend-XXXXX.vercel.app
```

**Save this URL!** You'll need it for frontend deployment.

### Step 4: Test Backend Production

```bash
# Test health endpoint
curl https://focusify-backend-XXXXX.vercel.app/api/health

# Should return:
{"status":"Backend is running! 🚀"}
```

### Step 5: Update Frontend Configuration

Edit frontend `.env.production`:
```env
VITE_API_URL=https://focusify-backend-XXXXX.vercel.app
VITE_ENVIRONMENT=production
```

Replace `focusify-backend-XXXXX.vercel.app` with actual URL from Step 3.

### Step 6: Deploy Frontend to Vercel

```bash
# Go to frontend folder
cd focusify-improve

# Push changes to GitHub
git add .
git commit -m "Update backend API URL for production"
git push origin main

# Deploy
vercel --prod
```

When prompted, select same Vercel team/account.

### Step 7: Get Frontend URL

After deployment:
```
✅ Production: https://focusify-XXXXX.vercel.app
```

**Save this URL!** Update backend FRONTEND_URL.

### Step 8: Update Backend FRONTEND_URL

1. Go to https://vercel.com/dashboard
2. Select "focusify-backend" project
3. Click "Settings" → "Environment Variables"
4. Edit "FRONTEND_URL"
5. Change to: `https://focusify-XXXXX.vercel.app`
6. Click "Redeploy" tab
7. Redeploy to apply new environment variable

---

## ✅ PRODUCTION TESTING

### Test 1: Backend Health
```bash
curl https://focusify-backend-XXXXX.vercel.app/api/health
```
Expected: `{"status":"Backend is running! 🚀"}`

### Test 2: MongoDB Connection
Check Vercel logs:
```
✅ Backend connected to MongoDB Atlas
```

### Test 3: Register User (Production)
```bash
curl -X POST https://focusify-backend-XXXXX.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "prod@focusify.com",
    "username": "produser",
    "password": "TestPassword123"
  }'
```

Expected:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "email": "prod@focusify.com",
    "username": "produser"
  }
}
```

### Test 4: Frontend Production
1. Open https://focusify-XXXXX.vercel.app
2. Register new account
3. Login successfully
4. Create focus session
5. Verify data saved to MongoDB

### Test 5: Cross-Device Sync
1. Open on Desktop → Register & Login
2. Open on Mobile/Different Browser → Login with same account
3. Create session on Desktop
4. Refresh Mobile → Session appears (data migration working!)

---

## 🔍 MONITORING PRODUCTION

### Check Backend Logs
```
Vercel Dashboard → focusify-backend → Logs
```

Look for:
```
✅ MongoDB connected to: focusify.lh7ipm1.mongodb.net
✅ Focusify Backend running on port 5000
✅ Frontend CORS: https://focusify.vercel.app
```

### Check Frontend Logs
```
Vercel Dashboard → focusify → Logs
```

Look for:
```
✅ Build successful
✅ API calls to backend working
```

### Monitor Database
```
MongoDB Atlas Dashboard → focusify cluster → Metrics
```

Monitor:
- Active connections
- Database operations
- Network I/O

---

## 🚨 TROUBLESHOOTING

### Issue: "CORS Error" on Frontend
**Solution:**
1. Backend FRONTEND_URL must match frontend domain
2. Check Vercel environment variables
3. Redeploy backend

### Issue: "Cannot Connect to MongoDB"
**Solution:**
1. Check MONGO_URI is correct
2. Verify MongoDB Atlas IP whitelist includes Vercel
3. Check database credentials

### Issue: "Invalid Token" Errors
**Solution:**
1. Verify JWT_SECRET is same on all deployments
2. Check no extra spaces in JWT_SECRET
3. Redeploy backend

### Issue: "Rate Limited" Immediately
**Solution:**
1. This is expected for development IPs
2. Wait 15 minutes or increase rate limit in code

### Quick Debug Checklist
- [ ] Backend health check responds
- [ ] MongoDB connection successful (check logs)
- [ ] Frontend can reach backend (check network tab)
- [ ] JWT_SECRET is exact match (no extra spaces)
- [ ] FRONTEND_URL in backend is correct
- [ ] VITE_API_URL in frontend is correct

---

## 📊 POST-DEPLOYMENT CHECKLIST

### Backend Deployment
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] All environment variables added:
  - [ ] MONGO_URI
  - [ ] JWT_SECRET
  - [ ] NODE_ENV=production
  - [ ] FRONTEND_URL
- [ ] Deployment successful (no build errors)
- [ ] Health endpoint responds
- [ ] Backend URL noted

### Frontend Deployment
- [ ] .env.production updated with backend URL
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Deployment successful
- [ ] Frontend URL noted
- [ ] Can access production website

### Backend Configuration Update
- [ ] Backend FRONTEND_URL updated to production frontend URL
- [ ] Backend redeployed with new environment variable
- [ ] CORS working (no errors in console)

### Production Testing
- [ ] Register new user works
- [ ] Login works
- [ ] Can create focus session
- [ ] Session data saved to MongoDB
- [ ] Can login from different device
- [ ] Data syncs across devices

### Security Verification
- [ ] HTTPS enabled (auto on Vercel)
- [ ] Rate limiting working (5 attempts/15 min)
- [ ] Passwords hashed in database
- [ ] Tokens not exposed in logs
- [ ] Error messages don't expose sensitive info

---

## 📞 QUICK REFERENCE

### URLs After Deployment
```
Backend: https://focusify-backend-XXXXX.vercel.app
Frontend: https://focusify-XXXXX.vercel.app
Database: MongoDB Atlas (focusify cluster)
```

### Database Credentials
```
MongoDB URL: mongodb+srv://rafzdfizet_db_user:L3ZAjNyZGCshsxt0@focusify.lh7ipm1.mongodb.net/focusify
Username: rafzdfizet_db_user
Password: L3ZAjNyZGCshsxt0
```

### Security Keys
```
JWT_SECRET: 5b4b9bd79f77d4453a8abbc4db321603ce03983389dfe1a2ef54ce9ea40a0ad9
(KEEP THIS SECRET - DO NOT COMMIT TO GIT)
```

---

## ✨ AFTER GOING LIVE

1. Monitor error rates for first 24 hours
2. Test user registration & login flows
3. Gather feedback from early users
4. Monitor database performance
5. Setup alerts for errors

---

**Ready to deploy? Start with Step 1 in DEPLOYMENT STEPS section above!** 🚀
