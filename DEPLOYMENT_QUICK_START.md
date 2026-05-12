# 🚀 PRODUCTION DEPLOYMENT - COPY PASTE VALUES

## ✅ Copy-Paste Ready for Vercel

### VERCEL ENVIRONMENT VARIABLES - Backend

```
MONGO_URI=mongodb+srv://rafzdfizet_db_user:L3ZAjNyZGCshsxt0@focusify.lh7ipm1.mongodb.net/focusify?retryWrites=true&w=majority

JWT_SECRET=5b4b9bd79f77d4453a8abbc4db321603ce03983389dfe1a2ef54ce9ea40a0ad9

NODE_ENV=production

FRONTEND_URL=https://focusify.vercel.app

LOG_LEVEL=info
```

---

## 🔐 MongoDB Atlas Info

```
Connection String:
mongodb+srv://rafzdfizet_db_user:L3ZAjNyZGCshsxt0@focusify.lh7ipm1.mongodb.net/focusify?retryWrites=true&w=majority

Username: rafzdfizet_db_user
Password: L3ZAjNyZGCshsxt0
```

---

## 📊 Deployment Checklist

### 1️⃣ Backend to Vercel
```bash
cd focusify-backend
git add .
git commit -m "Production deployment"
git push origin main
vercel --prod
```

Wait for deployment URL, then note it:
```
Backend URL: https://focusify-backend-XXXXX.vercel.app
```

### 2️⃣ Add Vercel Environment Variables
- MONGO_URI (from above)
- JWT_SECRET (from above)
- NODE_ENV = production
- FRONTEND_URL = https://focusify.vercel.app
- LOG_LEVEL = info

Then Redeploy

### 3️⃣ Test Backend
```bash
curl https://focusify-backend-XXXXX.vercel.app/api/health
```

Should return:
```
{"status":"Backend is running! 🚀"}
```

### 4️⃣ Update Frontend .env.production
```
VITE_API_URL=https://focusify-backend-XXXXX.vercel.app
VITE_ENVIRONMENT=production
```

### 5️⃣ Deploy Frontend
```bash
cd focusify-improve
git add .
git commit -m "Update API URL"
git push origin main
vercel --prod
```

Wait for frontend URL:
```
Frontend URL: https://focusify-XXXXX.vercel.app
```

### 6️⃣ Update Backend FRONTEND_URL

Go to Vercel Dashboard:
- focusify-backend → Settings → Environment Variables
- Edit FRONTEND_URL = https://focusify-XXXXX.vercel.app
- Redeploy

### 7️⃣ Test Production
1. Open https://focusify-XXXXX.vercel.app
2. Register account
3. Login
4. Create session
5. Test from another device → same account → data syncs ✅

---

## 🔐 IMPORTANT - DO NOT SHARE

❌ Never share these publicly:
- JWT_SECRET
- MongoDB password
- Any .env file with credentials

✅ Always:
- Use Vercel Environment Variables (not in code)
- Keep git .gitignore has .env files
- Rotate secrets if ever exposed

---

## ⏱️ Time Estimate

- Backend deployment: ~5 minutes
- Frontend deployment: ~5 minutes
- Testing: ~10 minutes
- **Total: 20 minutes** ✅

---

## 📞 If Stuck

Check in this order:
1. Backend health: https://focusify-backend-XXXXX.vercel.app/api/health
2. Vercel logs (Deployments tab)
3. CORS error? → Check FRONTEND_URL matches exactly
4. Cannot connect DB? → Check MONGO_URI copied exactly
5. Invalid token? → Check JWT_SECRET has no extra spaces

---

**Ready? Start with:** `cd focusify-backend && git push origin main`
