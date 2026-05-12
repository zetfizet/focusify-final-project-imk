# 🚀 DEPLOYMENT COMMAND GUIDE

Copy-paste commands for quick deployment!

---

## 1️⃣ GENERATE JWT_SECRET ✅ (Already Done)

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Output:
```
53b5f6019919c590dffe0fe6519a7230e20e299ae9587ec9e62ebfa30ea1792a
```

**Save this!** ⬆️

---

## 2️⃣ SETUP MONGODB ATLAS (Manual - Browser)

### Step 1: Create Account
```
URL: https://www.mongodb.com/cloud/atlas
Click: Sign Up → Create Account → Verify Email
```

### Step 2: Create Cluster
```
Click: Build a Database
Select: Free Tier (Shared)
Region: Singapore (M1)
Cluster Name: focusify
Click: Create Deployment (wait 5-10 min)
```

### Step 3: Create Database User
```
Sidebar: Database Access
Click: Add New Database User
Username: focusify_user
Password: <generate strong password>
Click: Add User
```

### Step 4: Get Connection String
```
Sidebar: Databases
Click: Connect Button
Select: Drivers
Copy: Connection string
Replace: <password> with your password
```

Result:
```
mongodb+srv://focusify_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/focusify?retryWrites=true&w=majority
```

### Step 5: Whitelist IPs
```
Sidebar: Network Access
Click: Add IP Address
Select: Allow access from anywhere
Confirm
```

---

## 3️⃣ DEPLOY BACKEND TO VERCEL

### Install Vercel CLI (if not already)
```bash
npm install -g vercel
```

### Login to Vercel
```bash
vercel login
```

### Deploy Backend
```bash
cd focusify-backend
vercel
```

When prompted:
```
? Set up and deploy "focusify-backend"? → Y
? Link to existing project? → N
? Project name? → focusify-backend
? Directory? → .
? Modify settings? → N
```

**Save backend URL:**
```
https://focusify-backend-XXXXX.vercel.app
```

---

## 4️⃣ ADD ENVIRONMENT VARIABLES TO BACKEND

### Via Vercel Dashboard
```
1. Go: https://vercel.com/dashboard
2. Click: focusify-backend project
3. Click: Settings tab
4. Click: Environment Variables
5. Add each variable:
```

**Add these variables one by one:**

```
Name: JWT_SECRET
Value: 53b5f6019919c590dffe0fe6519a7230e20e299ae9587ec9e62ebfa30ea1792a
```

```
Name: MONGO_URI
Value: mongodb+srv://focusify_user:PASSWORD@cluster0.xxxxx.mongodb.net/focusify?retryWrites=true&w=majority
(Replace PASSWORD with your MongoDB password)
```

```
Name: NODE_ENV
Value: production
```

```
Name: FRONTEND_URL
Value: https://focusify.vercel.app
(We'll update this after deploying frontend)
```

```
Name: PORT
Value: 5000
```

---

## 5️⃣ REDEPLOY BACKEND

```bash
# Redeploy via CLI to apply environment variables
cd focusify-backend
vercel --prod
```

Or via dashboard:
```
1. Click: Deployments tab
2. Click: ⋮ menu on latest deployment
3. Click: Redeploy
```

### Test Backend
```bash
curl https://focusify-backend-XXXXX.vercel.app/api/health
```

Expected:
```json
{"status":"Backend is running! 🚀"}
```

---

## 6️⃣ UPDATE FRONTEND .ENV.PRODUCTION

Edit file: `focusify-improve/.env.production`

```env
VITE_API_URL=https://focusify-backend-XXXXX.vercel.app
VITE_ENVIRONMENT=production
```

Replace `focusify-backend-XXXXX` with your actual backend URL!

---

## 7️⃣ DEPLOY FRONTEND TO VERCEL

```bash
cd focusify-improve
vercel
```

When prompted:
```
? Set up and deploy "focusify-improve"? → Y
? Link to existing project? → N
? Project name? → focusify
? Directory? → .
? Modify settings? → N
```

**Save frontend URL:**
```
https://focusify-XXXXX.vercel.app
```

---

## 8️⃣ UPDATE BACKEND FRONTEND_URL

Go back to backend environment variables and update:

```
Name: FRONTEND_URL
Value: https://focusify-XXXXX.vercel.app
(Use the frontend URL from Step 7)
```

Then redeploy backend:
```bash
cd focusify-backend
vercel --prod
```

---

## 9️⃣ TEST PRODUCTION

### Test 1: Health Check
```bash
curl https://focusify-backend-XXXXX.vercel.app/api/health
```

### Test 2: Register User (via curl)
```bash
curl -X POST https://focusify-backend-XXXXX.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@production.com",
    "username": "produser",
    "password": "TestPassword123"
  }'
```

Expected: `201 Created` with tokens

### Test 3: Login User (via curl)
```bash
curl -X POST https://focusify-backend-XXXXX.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@production.com",
    "password": "TestPassword123"
  }'
```

Expected: `200 OK` with tokens

### Test 4: Frontend Production
```
1. Open: https://focusify-XXXXX.vercel.app
2. Register new account
3. Login
4. Create session
5. Logout
6. Login again → Verify data persisted
```

### Test 5: Cross-Device Sync
```
Device A:
1. Register account
2. Create session
3. Note session details

Device B:
1. Login with same account
2. Check if session appears
3. Verify data synced
```

---

## 🆘 QUICK TROUBLESHOOTING

### Backend Health Check Returns Error
```bash
# Check deployment logs
vercel logs --prod

# Or redeploy
vercel --prod --force
```

### "Cannot connect to MongoDB" in logs
```
1. Check: Vercel env vars have MONGO_URI
2. Check: MongoDB whitelist includes 0.0.0.0/0
3. Check: Password doesn't have special chars needing URL encoding
```

### "CORS Error" in frontend console
```
1. Check: FRONTEND_URL in backend env vars matches production domain
2. Check: VITE_API_URL in frontend points to correct backend
3. Redeploy both backend and frontend
```

### "Rate Limited" on login attempt
```
This is normal - rate limiting is working!
Wait 15 minutes and try again
Or adjust: src/middleware/rateLimiter.js → max: 5
```

---

## ✅ FINAL CHECKLIST

```
MongoDB Atlas:
☐ Account created
☐ Cluster created
☐ Database user created
☐ Connection string obtained
☐ IP whitelist configured

Backend:
☐ Deployed to Vercel
☐ Environment variables added (JWT_SECRET, MONGO_URI, NODE_ENV, FRONTEND_URL)
☐ Redeployed with env vars
☐ Health check responds

Frontend:
☐ .env.production created with correct VITE_API_URL
☐ Deployed to Vercel
☐ Can access production URL

Testing:
☐ Backend health check works
☐ Can register user
☐ Can login user
☐ Can create session
☐ Frontend loads correctly
☐ Cross-device sync works

Security:
☐ JWT_SECRET is strong random string
☐ MONGO_URI has strong password
☐ NODE_ENV = production
☐ HTTPS working (auto on Vercel)
☐ CORS configured correctly
```

---

## 📞 NEED HELP?

Check files:
- `SECURITY_AND_DEPLOYMENT.md` - Detailed deployment guide
- `SECURITY_ASSESSMENT.md` - Security analysis
- `PRE_DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist
- `DEPLOYMENT_CREDENTIALS.md` - Your configuration reference

---

**Time estimate:** 30-60 minutes total
- MongoDB setup: 10-15 min
- Backend deploy: 5-10 min
- Frontend deploy: 5-10 min
- Testing: 10-20 min

Good luck! 🚀
